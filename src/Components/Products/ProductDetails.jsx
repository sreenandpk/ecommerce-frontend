import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchProductById,
  fetchProducts,
  fetchUser,
  updateUser,
  BASE_URL,
} from "../Fetch/FetchUser";
import Navbar from "../../Navbar/Navbar";
import Footer from "../Home/Footer";
import ScrollToTop from "../ScrollTop";
import { FaStar } from "react-icons/fa";
import profile from "../../../homeImages/profileDD.jpeg";
import axios from "axios";
import { Heart } from "lucide-react";
import { SearchContext } from "../SearchContext/SearchContext";
export default function ProductDetails({ toastRef }) {
  const {
     recentlyViewedProduct,
    setCartCount,
    setRecentlyViewedProducts,
    setWishlistIds,
    setWishlistCount,
    wishlistIds
  } = useContext(SearchContext);

  const [product, setProduct] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [recommended, setRecommended] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  const [showReviewModal, setShowReviewModal] = useState(false); // "view" | "write"
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        const user = await fetchUser(userId);
        setCurrentUser(user);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch product and recommended
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetchProductById(id);
        setProduct(response);

        const userId = localStorage.getItem("userId");
        if (userId) {
          const user = await fetchUser(userId);
          const recentlyViewed = user.recentlyViewed || [];
          if (!recentlyViewed.some((p) => p.id === response.id)) {
            recentlyViewed.push(response);
            setRecentlyViewedProducts(recentlyViewed);
            await updateUser(userId, { recentlyViewed });
          }
          setInWishlist(user.wishlist?.some((p) => p.id === response.id));
        }

        const allProducts = await fetchProducts();
        setRecommended(
          allProducts.filter(
            (p) => p.id !== response.id && p.category === response.category
          )
        );
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
  }, [id, setRecentlyViewedProducts]);

  const addToCart = async (item) => {
    if (!currentUser) return navigate("/login");

    const exists = currentUser.cart?.some(p => p.id === item.id);
    const updatedCart = exists
      ? currentUser.cart.filter(p => p.id !== item.id)
      : [...(currentUser.cart || []), item];

    await updateUser(currentUser.id, { cart: updatedCart });
    setCurrentUser({ ...currentUser, cart: updatedCart });
    setCartCount(updatedCart.length);

    toastRef?.current?.showToast(
      `${item.name} ${exists ? "removed from" : "added to"} cart ✅`
    );
  };

  const toggleWishlist = async (item) => {
    const userId = localStorage.getItem("userId");
    if (!userId) return navigate("/login");
    const user = await fetchUser(userId);
    let wishlist = user.wishlist || [];
    const exists = wishlist.some((p) => p.id === item.id);
    wishlist = exists
      ? wishlist.filter((p) => p.id !== item.id)
      : [...wishlist, item];
    await updateUser(userId, { wishlist });
    setInWishlist(!exists);
    setWishlistIds(wishlist.map((p) => p.id));
    setWishlistCount(wishlist.length);
    toastRef?.current?.showToast(
      `${item.name} ${exists ? "removed from" : "added to"} wishlist`
    );
  };

  const handleSubmitReview = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toastRef?.current?.showToast("Login first", {
          label: "Login",
          onClick: () => navigate("/login"),
        });
        return;
      }
      const res = await fetchUser(userId);

      const newReview = {
        text: reviewText,
        rating: reviewRating,
        id: Date.now(),
        image: res.image,
      };

      setProduct((prev) => ({
        ...prev,
        reviews: [...(prev.reviews || []), newReview],
      }));

      setReviewRating(0);
      setReviewText("");
      setShowReviewModal(false);

      toastRef?.current?.showToast("Review submitted ✅");

      await axios.patch(`${BASE_URL}/products/${id}`, {
        reviews: [...(product.reviews || []), newReview],
      });
    } catch (e) {
      console.error(e);
      toastRef?.current?.showToast("Error submitting review ❌");
    }
  };

  return (
    <>
      <Navbar />
      {product && (
        <div
          className="container my-5"
          style={{ background: "#fff8f0", padding: "20px", borderRadius: "15px" }}
        >
          <div className="row g-4">
            {/* Left: Product Image */}
            <div className="col-md-6 text-center">
              <div className="card shadow-sm p-3 rounded-4" style={{ background: "#fff8f0" }}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="img-fluid rounded-4"
                  style={{ maxHeight: "400px", objectFit: "contain" }}
                />
              </div>
            </div>

            {/* Right: Product Details */}
            <div className="col-md-6">
              <h2 className="fw-bold">{product.name}</h2>
              <p className="fs-4 text-dark">₹{product.price}</p>

              <div className="d-flex gap-2 mb-3 flex-wrap">
                <span className="badge bg-primary">{product.category}</span>
                <span className="badge bg-success">{product.rating || "⭐ 0"}</span>
                {product.bestseller && <span className="badge bg-warning text-dark">Bestseller</span>}
                {product.hot && <span className="badge bg-danger">Hot</span>}
              </div>

              <div className="mb-4 d-flex gap-3 flex-wrap">
                <button
                  className="btn btn-dark rounded-pill px-4 py-2"
                  onClick={() => addToCart(product)}
                >
                  {currentUser?.cart?.some(p => p.id === product.id) ? "Remove" : "Add to Cart"}
                </button>

                <Heart
                  onClick={() => toggleWishlist(product)}
                  color={wishlistIds.includes(product.id) ? "#111" : "gray"}
                  fill={wishlistIds.includes(product.id) ? "#111" : "none"}
                  size={wishlistIds.includes(product.id) ? 28 : 30}
                  className="wishlist-icon mt-1"
                />
              </div>

              {product.story && (
                <div className="mb-3">
                  <h5 className="fw-bold">Story</h5>
                  <p className="text-muted">{product.story}</p>
                </div>
              )}

              <div className="row g-3 mb-3">
                {product.ingredients && (
                  <div className="col-6">
                    <div className="card p-3 shadow-sm rounded-4" style={{ background: '#fff8f0' }}>
                      <h6 className="fw-bold">Ingredients</h6>
                      <ul className="list-unstyled mb-0">
                        {product.ingredients.map((ing, i) => (
                          <li key={i}>• {ing}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {product.allergens && (
                  <div className="col-6">
                    <div className="card p-3 shadow-sm rounded-4 bg-danger text-white">
                      <h6 className="fw-bold">Allergens</h6>
                      <ul className="list-unstyled mb-0">
                        {product.allergens.map((all, i) => (
                          <li key={i}>• {all}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {product.nutrition && (
                <div className="card p-3 shadow-sm rounded-4 mb-3" style={{ background: '#fff8f0' }}>
                  <h6 className="fw-bold">Nutrition Facts</h6>
                  <ul className="list-unstyled mb-0">
                    <li>Calories: {product.nutrition.calories}</li>
                    <li>Protein: {product.nutrition.protein}</li>
                    <li>Fat: {product.nutrition.fat}</li>
                    <li>Carbs: {product.nutrition.carbs}</li>
                    <li>Sugar: {product.nutrition.sugar}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Recommended */}
          {recommended.length > 0 && (
            <div className="mt-5">
              <h4>Recommended Flavors</h4>
              <div className="d-flex overflow-auto gap-3 py-2">
                {recommended.map((item) => (
                  <div
                    key={item.id}
                    className="card p-2 shadow-sm rounded-4"
                    style={{ minWidth: "180px", flexShrink: 0, background: '#fff8f0' }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="img-fluid rounded-4 mb-2"
                      style={{ height: "120px", objectFit: "contain" }}
                    />
                    <h6 className="fw-bold mb-1">{item.name}</h6>
                    <p className="mb-2 text-dark">₹{item.price}</p>
                    <button
                      className="btn btn-dark rounded-pill px-4 py-2"
                      onClick={() => addToCart(item)}
                    >
                      {currentUser?.cart?.some(p => p.id === item.id) ? "Remove" : "Add to Cart"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/*recently viewed products*/}
          <div>{recentlyViewedProduct.map((element)=>{
            return <div key={element.id}><p>{element.name}</p></div>
          })}</div>

          {/* Reviews Section */}
          <div className="mt-4">
            <button
              className="btn btn-outline-dark me-2"
              onClick={() => setShowReviewModal("view")}
            >
              View Reviews ({product.reviews?.length || 0})
            </button>
            <button
              className="btn btn-dark"
              onClick={() => setShowReviewModal("write")}
            >
              Write a Review
            </button>

            {/* Modals */}
            {showReviewModal && (
              <div
                className="modal-backdrop"
                onClick={() => setShowReviewModal(false)} // Click outside closes
              >
                <div
                  className="modal-content p-4 rounded-4 shadow-sm"
                  onClick={(e) => e.stopPropagation()} // Prevent closing inside
                >
                  {showReviewModal === "view" ? (
                    <>
                      <h5 className="fw-bold mb-3">Customer Reviews</h5>
                      {product.reviews?.length > 0 ? (
                        product.reviews.map((element, index) => (
                          <div
                            key={index}
                            className="border-bottom py-2 d-flex gap-3 align-items-start"
                          >
                            <img
                              src={element.image || profile}
                              alt="user"
                              className="rounded-circle"
                              style={{ width: "40px", height: "40px", objectFit: "cover" }}
                            />
                            <div>
                              <div className="d-flex align-items-center mb-1">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar
                                    key={i}
                                    size={16}
                                    color={i < element.rating ? "#ffc107" : "#e4e5e9"}
                                  />
                                ))}
                              </div>
                              <p className="mb-1">{element.text}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted">No reviews yet.</p>
                      )}
                    </>
                  ) : (
                    <>
                      <h5 className="fw-bold mb-3">Add Your Review</h5>
                      <div className="d-flex align-items-center mb-3">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            size={25}
                            className="me-2 cursor-pointer"
                            color={i < reviewRating ? "#ffc107" : "#e4e5e9"}
                            onClick={() => setReviewRating(i + 1)}
                          />
                        ))}
                      </div>
                      <textarea
                        style={{ backgroundColor: '#fff8f0' }}
                        className="form-control mb-3"
                        placeholder="Share your experience..."
                        rows={3}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                      />
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-secondary"
                          onClick={() => setShowReviewModal(false)}
                        >
                          Cancel
                        </button>
                        <button className="btn btn-dark" onClick={handleSubmitReview}>
                          Submit
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(245, 242, 238, 0.95);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1050;
          animation: fadeIn 0.3s ease-in;
        }
        .modal-content {
          background: #fff8f0;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          border-radius: 25px;
          padding: 30px 25px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.1);
          border: 1px solid #ffe5d6;
          animation: slideUp 0.4s ease-out;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .modal-content:hover { transform: scale(1.02); box-shadow: 0 30px 60px rgba(0,0,0,0.12);}
        .modal-content h5 { color: #ff6f61; font-weight: 700; margin-bottom: 20px; }
        .modal-content .fa-star { transition: transform 0.2s, color 0.2s; color: #ffc107; }
        .modal-content .fa-star:hover { transform: scale(1.3); color: #ffb700; }
        .btn-dark { background: #000; border: none; color: #fff; font-weight: 600; transition: all 0.3s; }
        .btn-dark:hover { background: #222; transform: scale(1.05); }
        .btn-secondary { background: #fff8f0; color: #000; border: 1px solid #ccc; font-weight: 600; transition: all 0.3s; }
        .btn-secondary:hover { transform: scale(1.05); }
        @keyframes fadeIn { from {opacity:0;} to {opacity:1;} }
        @keyframes slideUp { from {transform:translateY(50px);opacity:0;} to {transform:translateY(0);opacity:1;} }
        .cursor-pointer { cursor: pointer; }
      `}</style>

      <Footer />
      <ScrollToTop />
    </>
  );
}
