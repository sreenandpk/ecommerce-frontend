import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProductById, updateUser, fetchUser } from "../Fetch/FetchUser";
import { SearchContext } from "../SearchContext/SearchContext";
import { infoToast } from "../toast";
import Navbar from "../../Navbar/Navbar";
import Footer from "../Home/Footer";
import ScrollToTop from "../ScrollTop";
import { FaHeart } from "react-icons/fa";

export default function ProductDetails() {
  const { setCartCount, setRecentlyViewedProducts } = useContext(SearchContext);
  const [product, setProduct] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetchProductById(id);
        setProduct(response);

        const savedUser = JSON.parse(localStorage.getItem("existingUser")) || {};
        const recentlyViewed = savedUser.recentlyViewed || [];

        const alreadyExist = recentlyViewed.some((p) => p.id === response.id);
        if (!alreadyExist) {
          recentlyViewed.push(response);
          setRecentlyViewedProducts(recentlyViewed);
          const updatedUser = { ...savedUser, recentlyViewed };
          await updateUser(savedUser.id, { recentlyViewed });
          localStorage.setItem("existingUser", JSON.stringify(updatedUser));
        }
      } catch (err) {
        console.log("Error fetching product", err);
      }
    }
    fetchProduct();
  }, [id]);

  const addToCart = async (item) => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("existingUser"));
      if (!savedUser) {
        infoToast("Login first");
        navigate("/login");
        return;
      }
      const user = await fetchUser(savedUser.id);
      const exists = user.cart.some((p) => p.id === item.id);
      const updatedCart = exists ? user.cart.filter((p) => p.id !== item.id) : [...user.cart, item];
      infoToast(`${item.name} ${exists ? "removed from" : "added to"} cart ✅`);

      await updateUser(savedUser.id, { cart: updatedCart });
      const updatedUser = { ...user, cart: updatedCart };
      localStorage.setItem("existingUser", JSON.stringify(updatedUser));
      localStorage.setItem("cartTotalLength", updatedUser.cart.length);
      setCartCount(updatedUser.cart.length);
    } catch (err) {
      console.log("Error updating cart", err);
    }
  };

  const toggleWishlist = async (item) => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("existingUser"));
      if (!savedUser) {
        infoToast("Login first");
        navigate("/login");
        return;
      }
      const user = await fetchUser(savedUser.id);
      let wishlist = user.wishlist || [];
      const exists = wishlist.some((p) => p.id === item.id);

      if (exists) {
        wishlist = wishlist.filter((p) => p.id !== item.id);
        infoToast(`${item.name} removed from wishlist`);
      } else {
        wishlist.push(item);
        infoToast(`${item.name} added to wishlist`);
      }

      await updateUser(savedUser.id, { wishlist });
      localStorage.setItem("existingUser", JSON.stringify({ ...user, wishlist }));
    } catch (err) {
      console.log("Error updating wishlist", err);
    }
  };

  return (
    <>
      <Navbar />

      <div className="container my-4 mt-5">
        {product && (
          <>
            {/* Product Image */}
            <div className="text-center mb-3">
              <div className="card border-0 shadow-sm rounded-4 mx-auto product-image" style={{ background: "transparent" }}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="img-fluid p-3"
                  style={{ maxHeight: "300px", objectFit: "contain" }}
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 details-card mx-auto" style={{ background: "rgba(255,255,255,0.1)" }}>
              {/* Product Name */}
              <h2 className="fw-bold mb-3 text-center" style={{ fontSize: "2rem", letterSpacing: "0.5px" }}>
                {product.name}
              </h2>

              {/* Price */}
              <p className="mb-2 text-center" style={{ fontSize: "1.2rem" }}>
                <span className="fw-semibold">Price: </span>
                <span className="text-dark fw-bold fs-5">₹{product.price}</span>
              </p>

              {/* Product Info */}
              <div className="row text-center small-text mt-4 mb-4" style={{ fontSize: "1rem" }}>
                <div className="col">
                  <span className="fw-semibold">ML:</span> {product.ml || "-"}
                </div>
                <div className="col">
                  <span className="fw-semibold">Category:</span> {product.category}
                </div>
                <div className="col">
                  <span className="fw-semibold">Rating:</span> {product.rating || "⭐ 0"}
                </div>
              </div>

              {/* Buttons */}
              <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
                <button
                  className="btn btn-dark btn-hover-sm"
                  style={{ borderRadius: "25px", padding: "12px 45px", fontSize: "1rem" }}
                  onClick={() => addToCart(product)}
                >
                  {JSON.parse(localStorage.getItem("existingUser"))?.cart?.some((p) => p.id === product.id)
                    ? "Remove"
                    : "Add to Cart"}
                </button>

                <button
                  className="btn btn-outline-danger btn-hover-sm"
                  style={{ borderRadius: "25px", width: "45px", padding: "10px" }}
                  onClick={() => toggleWishlist(product)}
                >
                  <FaHeart />
                </button>
              </div>

              <hr />

              {/* Captions */}
              <p className="text-muted mb-2" style={{ fontSize: "1rem", lineHeight: "1.5rem" }}>
                <strong>Captions:</strong> {product.captions || "No captions available"}
              </p>

              {/* Reviews */}
              <p className="text-muted mb-0" style={{ fontSize: "1rem", lineHeight: "1.5rem" }}>
                <strong>Reviews:</strong> {product.reviews || "No reviews yet"}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Animations & Styling */}
      <style>{`
        body {
          background: transparent;
        }
        .product-image:hover {
          transform: scale(1.05);
          transition: transform 0.3s, box-shadow 0.3s;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        .details-card {
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .details-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.2);
        }
        .btn-hover-sm:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .small-text {
          font-size: 0.95rem;
        }
      `}</style>

      <div style={{ height: "30px" }}></div>
      <Footer />
     
    </>
  );
}
