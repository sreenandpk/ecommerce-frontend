import { useContext, useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../../Navbar/Navbar";
import { SearchContext } from "../SearchContext/SearchContext";
import { infoToast } from "../toast";
import { fetchUser, updateUser } from "../Fetch/FetchUser";
import { useNavigate } from "react-router-dom";
import ScrollToTop from "../ScrollTop";
import Lottie from "lottie-react";
import emptyWishlistAnim from "../../../jsonAnimation/emptyCart.json"; // 👈 add your animation file

export default function Wishlist() {
  const [likedProducts, setLikedProducts] = useState([]);
  const { setWishlistIds, setWishlistCount, setCartCount,wishlistIds } = useContext(SearchContext);
  const navigate = useNavigate();

  const addtoCart = async (item) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        infoToast("Login first");
        navigate("/login");
        return;
      }
      const user = await fetchUser(userId);
      let removeItemFromCart = user.cart.some((product) => product.id === item.id);
      let updatedCart = removeItemFromCart
        ? user.cart.filter((product) => product.id !== item.id)
        : [...user.cart, item];
      if (!removeItemFromCart) infoToast(`${item.name} added to cart`);

      await updateUser(userId, { cart: updatedCart });
      localStorage.setItem("cartTotalLength", updatedCart.length);
      setCartCount(updatedCart.length);
    } catch (err) {
      console.log("error in cart update", err);
    }
  };

  useEffect(() => {
    async function fetchLikedProducts() {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const userResponse = await fetchUser(userId);
        const wishlist = userResponse.wishlist.reverse();
        setLikedProducts(wishlist);
        setWishlistIds(wishlist.map((item) => item.id));
        setWishlistCount(wishlist.length);
      } catch (err) {
        console.log("Failed to fetch wishlist", err);
      }
    }

    fetchLikedProducts();
  }, [setWishlistIds, setWishlistCount]);

  const removeFromWishlist = async (item) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const userResponse = await fetchUser(userId);
      const filteredWishlist = userResponse.wishlist.filter((i) => i.id !== item.id);

      await updateUser(userId, { wishlist: filteredWishlist });

      setLikedProducts(filteredWishlist);
      setWishlistIds(filteredWishlist.map((i) => i.id));
      setWishlistCount(filteredWishlist.length);
      infoToast(`${item.name} removed from wishlist`);
    } catch (err) {
      console.log("Error removing item from wishlist", err);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ height: "40px" }}></div>
      <h2 style={{ textAlign: "center" }} className="mb-3 mt-4">
        My Wishlist
      </h2>
      <p className="text-center mb-3" style={{ fontFamily: "revert" }}>
         Your Saved Items({wishlistIds.length})
        </p>

      <div className="row justify-content-center g-4">
        {likedProducts.length > 0 ? (
          likedProducts.map((item, index) => (
            <div
              key={index}
              className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center"
              data-aos="fade-up"
            >
              <div
                className="card h-100 shadow-lg border-0 text-center"
                style={{
                  borderRadius: "22px",
                  width: "100%",
                  maxWidth: "280px",
                  padding: "15px",
                  background: "#fff8f0",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                }}
              >
                <div className="card-body d-flex flex-column justify-content-between p-2">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="img-fluid mb-3"
                    style={{ height: "180px", objectFit: "contain", maxWidth: "100%" }}
                    onClick={() => navigate(`/productDetails/${item.id}`)}
                  />
                  <h5 className="card-title fw-semibold mb-3" style={{ fontSize: "0.95rem" }}>
                    {item.name}
                  </h5>

                  <button
                    className="btn w-100 mb-2"
                    style={{
                      background: "rgba(50, 30, 20, 0.85)",
                      color: "#fff",
                      padding: "8px 0",
                      fontSize: "0.85rem",
                      borderRadius: "30px",
                      border: "none",
                    }}
                    onClick={() => addtoCart(item)}
                  >
                    Add to Cart
                  </button>
                  <button
                    className="btn w-100"
                    style={{
                      background: "#e63946",
                      color: "#fff",
                      padding: "8px 0",
                      fontSize: "0.85rem",
                      borderRadius: "30px",
                      border: "none",
                    }}
                    onClick={() => removeFromWishlist(item)}
                  >
                    Discard
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center my-5">
            <Lottie animationData={emptyWishlistAnim} style={{ height: 250, margin: "0 auto" }} />
            <h5 style={{ color: "rgba(50,30,20,0.85)", fontWeight: "600", marginTop: "10px" }}>
              Your wishlist is empty
            </h5>
            <p className="text-muted mb-4">Start exploring and add items you love!</p>
            <button
              className="btn"
              style={{
                background: "rgba(50, 30, 20, 0.85)",
                color: "#fff",
                padding: "9px 22px",
                borderRadius: "30px",
                fontWeight: "600",
                fontSize: "0.95rem",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                transition: "all 0.3s ease",
                minWidth: "160px",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
              onClick={() => navigate("/products")} // 👈 go back to products page
            >
              Browse Products
            </button>
          </div>
        )}
      </div>

      <ScrollToTop />
    </>
  );
}
