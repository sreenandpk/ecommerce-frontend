import { useContext, useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../../Navbar/Navbar";
import { SearchContext } from "../SearchContext/SearchContext";
import { infoToast } from "../toast";
import { fetchUser, updateUser } from "../Fetch/FetchUser";
import { useNavigate } from "react-router-dom";
import ScrollToTop from "../ScrollTop";
import Lottie from "lottie-react";
import emptyWishlistAnim from "../../../jsonAnimation/emptyCart.json";

export default function Wishlist() {
  const [likedProducts, setLikedProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const { setWishlistIds, setWishlistCount, setCartCount, wishlistIds } =
    useContext(SearchContext);
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
      let removeItemFromCart = user.cart.some(
        (product) => product.id === item.id
      );
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

  const removeFromWishlist = async (itemsToRemove) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const userResponse = await fetchUser(userId);
      const filteredWishlist = userResponse.wishlist.filter(
        (i) => !itemsToRemove.includes(i.id)
      );

      await updateUser(userId, { wishlist: filteredWishlist });

      setLikedProducts(filteredWishlist);
      setWishlistIds(filteredWishlist.map((i) => i.id));
      setWishlistCount(filteredWishlist.length);
      infoToast(`${itemsToRemove.length} item(s) removed from wishlist`);
      setSelectedItems([]);
    } catch (err) {
      console.log("Error removing from wishlist:", err);
    }
  };

  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  };

  return (
    <>
      <Navbar />
      <div style={{ height: "30px" }}></div>
      <h4 style={{ textAlign: "center" }} className=" mt-4 ">
        My Wishlist
      </h4>
      <p className="text-center mb-3" style={{ fontFamily: "revert" }}>
        Your Saved Items({wishlistIds.length})
      </p>

      {/* Delete Selected */}
      {selectedItems.length > 0 && (
        <div className="d-flex justify-content-end mb-3 pe-3 flex-wrap mx-2">
          <button
            className="btn delete-selected-btn-modern"
            onClick={() => removeFromWishlist(selectedItems)}
          >
            Delete Selected ({selectedItems.length})
          </button>
          <button
            className="btn close-selected-btn-modern  "
            onClick={() => setSelectedItems([])}
          >
            ×
          </button>
        </div>
      )}

      <div className="row justify-content-center g-3">
        {likedProducts.length > 0 ? (
          likedProducts.map((item, index) => (
            <div
              key={index}
              className="col-12 d-flex justify-content-center"
              data-aos="fade-up"
            >
              <div
                className="wishlist-card"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.08)";
                }}
              >
                {/* Modern Checkbox */}
                <label className="modern-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                  />
                  <span className="checkmark"></span>
                </label>

                {/* Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="wishlist-image"
                  onClick={() => navigate(`/productDetails/${item.id}`)}
                />

                {/* Details */}
                <div className="wishlist-details">
                  <h5 className="wishlist-name">{item.name}</h5>
                  <p className="wishlist-story">{item.story}</p>
                  <p className="wishlist-price">₹{item.price}</p>

                  <div className="d-flex gap-2 mt-auto flex-wrap">
                    <button
                      className="btn wishlist-add-btn"
                      onClick={() => addtoCart(item)}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center my-5">
            <Lottie
              animationData={emptyWishlistAnim}
              style={{ height: 200, margin: "0 auto" }}
            />
            <h5
              style={{
                color: "rgba(50,30,20,0.85)",
                fontWeight: "600",
                marginTop: "10px",
              }}
            >
              Your wishlist is empty
            </h5>
            <p className="text-muted mb-4">
              Start exploring and add items you love!
            </p>
            <button
              className="btn browse-products-btn"
              onClick={() => navigate("/products")}
            >
              Browse Products
            </button>
          </div>
        )}
      </div>

      <ScrollToTop />

      {/* CSS */}
      <style jsx="true">{`
        /* Wishlist Card */
        .wishlist-card {
          display: flex;
          align-items: center;
          background: #fff8f0;
          border-radius: 18px;
          width: 100%;
          max-width: 600px;
          padding: 15px;
          position: relative;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          flex-wrap: nowrap;
        }

        /* Modern Checkbox */
        .modern-checkbox {
          position: absolute;
          top: 15px;
          left: 15px;
          display: inline-block;
          width: 22px;
          height: 22px;
        }
        .modern-checkbox input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .modern-checkbox .checkmark {
          position: absolute;
          top: 0;
          left: 0;
          height: 19px;
          width: 19px;
          background-color: #fff;
          border: 2px solid rgba(50,30,20,0.85);
          border-radius: 6px;
          transition: all 0.3s ease;
        }
        .modern-checkbox input:checked ~ .checkmark {
          background-color: rgba(50, 30, 20, 0.85);
          border-color: rgba(50, 30, 20, 0.85);
        }
        .modern-checkbox .checkmark:after {
          content: "";
          position: absolute;
          display: none;
        }
        .modern-checkbox input:checked ~ .checkmark:after {
          display: block;
        }
        .modern-checkbox .checkmark:after {
          left: 4px;
          top: 1px;
          width: 6px;
          height: 12px;
          border: solid #fff;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        /* Wishlist Image */
        .wishlist-image {
          flex: 0 0 auto;
          width: 120px;
          height: 120px;
          object-fit: contain;
          margin-right: 12px;
          cursor: pointer;
        }

        /* Wishlist Details */
        .wishlist-details {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .wishlist-name {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .wishlist-story {
          font-size: 0.85rem;
          margin-bottom: 2px;
        }

        .wishlist-price {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 5px;
        }

        /* Wishlist Add Button */
        .wishlist-add-btn {
          background: rgba(50, 30, 20, 0.85) !important;
          color: #fff !important;
          border-radius: 25px;
          border: none;
          flex: 0 0 auto;
          padding: 6px 50px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        .wishlist-add-btn:hover {
          transform: scale(1.05);
        }

        /* Delete Selected */
        .delete-selected-btn-modern {
          background: linear-gradient(135deg, #56cfe1, #48bfe3);
          color: #fff !important;
          padding: 6px 18px;
          border-radius: 30px;
          font-weight: 600;
          font-size: 0.85rem;
          border: none;
          margin-right: 10px;
          margin-bottom: 5px;
          transition: transform 0.3s ease;
        }
        .delete-selected-btn-modern:hover,
        .delete-selected-btn-modern:focus,
        .delete-selected-btn-modern:active {
          color: #fff !important;
          transform: scale(1.05);
        }

        /* Close Selected */
        .close-selected-btn-modern {
          background: rgba(50, 30, 20, 0.85);
          color: #fff !important;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          padding: 0;
          font-weight: 700;
          font-size: 1rem;
          line-height: 1;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease, background-color 0.3s ease;
          
        }
        /* Fix hover background so it doesn't turn white */
        .close-selected-btn-modern:hover,
        .close-selected-btn-modern:focus,
        .close-selected-btn-modern:active {
          color: #fff !important;
          background-color: rgba(50, 30, 20, 0.85);
          transform: scale(1.1);
        }

        /* Browse Products Button */
        .browse-products-btn {
          background: rgba(50, 30, 20, 0.85);
          color: #fff;
          padding: 8px 20px;
          border-radius: 30px;
          font-weight: 600;
          font-size: 0.9rem;
          border: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          cursor: pointer;
          transition: transform 0.3s ease;
          min-width: 140px;
        }
        .browse-products-btn:hover {
          transform: scale(1.05);
        }

        /* Mobile responsive */
        @media (max-width: 576px) {
          .wishlist-card {
            flex-wrap: nowrap;
          }

          .wishlist-image {
            width: 80px;
            height: 80px;
            margin-right: 10px;
          }

          .wishlist-name {
            font-size: 1rem;
          }

          .wishlist-story {
            font-size: 0.75rem;
          }

          .wishlist-price {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </>
  );
}
