import { useContext, useEffect, useState } from "react";
import { SearchContext } from "../SearchContext/SearchContext";
import ErrorAnimation from "../../../jsonAnimation/error.json";
import Lottie from "lottie-react";
import Navbar from "../../Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { fetchUser, updateUser, fetchProductByName } from "../Fetch/FetchUser";
import { infoToast } from "../toast";
import Footer from "../Home/Footer";
import ScrollToTop from "../ScrollTop";

export default function FilteredSearchProducts() {
  const navigate = useNavigate();
  const { setProductDetails } = useContext(SearchContext);
  const { searchValue, setCartCount } = useContext(SearchContext);
  const [products, setProducts] = useState([]);

  const [divForAlignmnt, setDivForAlignment] = useState(false);

  const detailsOfproduct = async function (item) {
    setProductDetails(item);
    navigate(`/productDetails/${item.id}`);
  };

  // this will run whenever search value changes
  useEffect(
    function () {
      async function FetchFilterdProducts() {
        try {
          if (!searchValue.trim()) return;

          const product = await fetchProductByName(searchValue.toLowerCase());
          setProducts(product);

          if (product.length > 0) {
            setDivForAlignment(true);
          } else {
            setDivForAlignment(false);
          }
        } catch {
          console.log("failed to fetch");
        }
      }
      FetchFilterdProducts();
    },
    [searchValue]
  );

  // when user click add/remove cart
  const addToCartAndRemoveFromCart = async function (item) {
    try {
      const savedUserId = localStorage.getItem("userId"); // ✅ only userId
      if (!savedUserId) {
        infoToast("Login first");
        navigate("/login");
        return;
      }

      const user = await fetchUser(savedUserId);

      let removeItemFromCart = false;
      for (let product of user.cart) {
        if (product.id === item.id) {
          removeItemFromCart = true;
          break;
        }
      }

      let updatedCart;
      if (removeItemFromCart) {
        updatedCart = user.cart.filter(function (product) {
          return product.id !== item.id;
        });
        infoToast("Item removed from cart");
      } else {
        infoToast(`${item.name} added to cart `);
        updatedCart = [...user.cart, item];
      }

      await updateUser(savedUserId, {
        cart: updatedCart,
      });

      // no need to save full user, just update count
      localStorage.setItem("cartTotalLength", updatedCart.length);
      setCartCount(updatedCart.length);
    } catch (err) {
      console.log("error in cart update", err);
    }
  };

  return (
    <>
      <Navbar />
      {divForAlignmnt ? <div style={{ height: "90px" }}></div> : ""}
      {/*container*/}
      <div className="container mt-4">
        <div className="row g-3">
          {/* map products */}
          {products.length > 0 ? (
            products.map((item, index) => (
              <div key={index} className="col-12 col-sm-12 col-md-6 col-lg-4">
                <div
                  className="card h-100 shadow-sm border-0 p-2"
                  style={{ borderRadius: "15px", background: "#fff8f0" }}
                >
                  <div
                    className="d-flex flex-column flex-md-row align-items-center"
                    style={{ background: "#fff8f0" }}
                  >
                    {/* Image */}
                    <div
                      className="flex-shrink-0 text-center p-2"
                      style={{ background: "#fff8f0" }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="img-fluid"
                        style={{
                          maxWidth: "200px",
                          maxHeight: "200px",
                          objectFit: "contain",
                          borderRadius: "10px",
                        }}
                        onClick={() => detailsOfproduct(item)}
                      />
                    </div>
                    {/* Content */}
                    <div className="flex-grow-1 ms-md-3 mt-2 mt-md-0">
                      <h5 className="card-title">{item.name}</h5>
                      <p className="card-text mb-1">Price: ₹{item.price}</p>
                      <p className="card-text mb-2">ML: {item.ml}</p>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {/*button add/remove cart*/}
                        <button
                          className="btn text-white"
                          style={{
                            flex: "1",
                            backgroundColor: "#1e3253ff",
                            borderRadius: "20px",
                            height: "40px",
                            width: "100px",
                          }}
                          onClick={() => addToCartAndRemoveFromCart(item)}
                        >
                          {/* check with backend user data */}
                          {products &&
                          JSON.parse(
                            localStorage.getItem("cartTotalLength") || "0"
                          ) > 0 &&
                          user?.cart?.some((p) => p.id === item.id)
                            ? "Remove"
                            : "Add"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // if products length is 0
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                width: "100%",
                maxWidth: "500px",
                margin: "0 auto",
              }}
            >
              {/* animation */}
              <Lottie
                animationData={ErrorAnimation}
                loop={true}
                style={{
                  width: "100%",
                  height: "100%",
                  maxWidth: "400px",
                }}
              />
            </div>
          )}
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </>
  );
}
