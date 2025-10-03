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
import { AiOutlineDelete } from "react-icons/ai";

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
      <h4 style={{ textAlign: "center" }} className="mt-4">
        My Wishlist
      </h4>
      <p className="text-center mb-3" style={{ fontFamily: "revert" }}>
        Your Saved Items({wishlistIds.length})
      </p>

      <div className="row justify-content-center g-3">
        {likedProducts.length > 0 ? (
          likedProducts.map((item, index) => (
            <div
              key={index}
              className="col-12 d-flex justify-content-center"
              data-aos="fade-up"
              style={{ position: "relative" }} // for absolute delete button
            >
              <div className="wishlist-card">
                {/* Modern Checkbox */}
                <label className="modern-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                  />
                  <span className="checkmark"></span>
                </label>

                {/* Modern Delete Button */}
                {selectedItems.includes(item.id) && (
                  <button
                    className="modern-delete-btn"
                    onClick={() => removeFromWishlist([item.id])}
                  >
                    <AiOutlineDelete size={20} color="#fff" />
                  </button>
                )}

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
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .wishlist-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
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
          border: 2px solid rgba(50, 30, 20, 0.85);
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

        /* Modern Delete Button */
        .modern-delete-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #dc2626 !important; /* Keep red */
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s ease, box-shadow 0.2s ease,
            background-color 0.2s ease !important;
          z-index: 10;
        }
        .modern-delete-btn:hover {
          background-color: #dc2626 !important; /* Keep red on hover */
          transform: scale(1.1);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
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

        /* Browse Products Button */
        .browse-products-btn {
          background: rgba(50, 30, 20, 0.85) !important;
          color: #fff !important;
          padding: 8px 20px;
          border-radius: 30px;
          font-weight: 600;
          font-size: 0.9rem;
          border: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
            font-size: 1.2rem;
          }

          .wishlist-story {
            font-size: 0.80rem;
          }

          .wishlist-price {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}
