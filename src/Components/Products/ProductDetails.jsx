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
import { FaStar, FaShareAlt } from "react-icons/fa";
import { Heart } from "lucide-react";
import axios from "axios";
import profile from "../../../homeImages/profileDD.jpeg";
import { SearchContext } from "../SearchContext/SearchContext";

export default function ProductDetails({ toastRef }) {
  const {
    recentlyViewedProduct,
    setCartCount,
    setRecentlyViewedProducts,
    setWishlistIds,
    setWishlistCount,
    wishlistIds,
  } = useContext(SearchContext);

  const [product, setProduct] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);

  const { id } = useParams();
  const navigate = useNavigate();

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

  // Fetch product & recommended
  useEffect(() => {
    async function fetchData() {
      try {
        const prod = await fetchProductById(id);
        setProduct(prod);

        const allProducts = await fetchProducts();
        setRecommended(
          allProducts.filter(
            (p) => p.id !== prod.id && p.category === prod.category
          )
        );

        const userId = localStorage.getItem("userId");
        if (userId) {
          const user = await fetchUser(userId);
          const recentlyViewed = user.recentlyViewed || [];
          if (!recentlyViewed.some((p) => p.id === prod.id)) {
            recentlyViewed.push(prod);
            setRecentlyViewedProducts(recentlyViewed);
            await updateUser(userId, { recentlyViewed });
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
  }, [id, setRecentlyViewedProducts]);

  // Add to cart
  const addToCart = async (item) => {
    if (!currentUser) return navigate("/login");
    const exists = currentUser.cart?.some((p) => p.id === item.id);
    const updatedCart = exists
      ? currentUser.cart.filter((p) => p.id !== item.id)
      : [...(currentUser.cart || []), item];

    await updateUser(currentUser.id, { cart: updatedCart });
    setCurrentUser({ ...currentUser, cart: updatedCart });
    setCartCount(updatedCart.length);
    toastRef?.current?.showToast(
      `${item.name} ${exists ? "removed from" : "added to"} cart ✅`
    );
  };

  // Toggle wishlist
  const toggleWishlist = async (item) => {
    const userId = localStorage.getItem("userId");
    if (!userId) return navigate("/login");
    const user = await fetchUser(userId);
    let wishlist = user.wishlist || [];
    const exists = wishlist.some((p) => p.id === item.id);
    wishlist = exists ? wishlist.filter((p) => p.id !== item.id) : [...wishlist, item];
    await updateUser(userId, { wishlist });
    setWishlistIds(wishlist.map((p) => p.id));
    setWishlistCount(wishlist.length);
    toastRef?.current?.showToast(
      `${item.name} ${exists ? "removed from" : "added to"} wishlist`
    );
  };

  // Submit review
  const handleSubmitReview = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return navigate("/login");

      const user = await fetchUser(userId);
      const newReview = {
        text: reviewText,
        rating: reviewRating,
        id: Date.now(),
        image: user.image,
      };

      setProduct((prev) => ({
        ...prev,
        reviews: [...(prev.reviews || []), newReview],
      }));

      await axios.patch(`${BASE_URL}/products/${id}`, {
        reviews: [...(product.reviews || []), newReview],
      });

      setReviewText("");
      setReviewRating(0);
      setShowReviewModal(false);
      toastRef?.current?.showToast("Review submitted ✅");
    } catch (err) {
      console.log(err);
      toastRef?.current?.showToast("Error submitting review ❌");
    }
  };

  // Share product
  const shareProduct = (prod) => {
    if (navigator.share) {
      navigator.share({
        title: prod.name,
        text: `Check out this product: ${prod.name} - ₹${prod.price}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toastRef?.current?.showToast("Link copied to clipboard 📋");
    }
  };

  return (
    <>
      <Navbar />
      {product && (
        <div className="container my-5 product-details">
          <div className="row g-4 align-items-center">
            {/* Product Image */}
            <div className="col-md-6 text-center">
              <div className="card shadow-sm p-3 rounded-4 product-image-card">
                <img
                  src={product.image}
                  alt={product.name}
                  className="img-fluid product-image"
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="col-md-6">
              <h2 className="fw-bold product-title">{product.name}</h2>
              <p className="fs-4 text-dark product-price">₹{product.price}</p>

              <div className="d-flex gap-2 mb-3 flex-wrap">
  <span className="badge category-badge">{product.category}</span>
  <span className="badge rating-badge">{product.rating || "⭐ 0"}</span>
  {product.bestseller && <span className="badge bestseller-badge">Bestseller</span>}
  {product.hot && <span className="badge hot-badge">Hot</span>}
</div>

<style>{`
  .category-badge {
    background-color: #ffd699; /* soft orange */
    color: #111;
    font-weight: 500;
    padding: 0.5rem 0.8rem;
    border-radius: 12px;
  }

  .rating-badge {
    background-color: #fff199; /* soft yellow */
    color: #111;
    font-weight: 500;
    padding: 0.5rem 0.8rem;
    border-radius: 12px;
  }

  .bestseller-badge {
    background-color: #ff9999; /* soft red/pink */
    color: #111;
    font-weight: 500;
    padding: 0.5rem 0.8rem;
    border-radius: 12px;
  }

  .hot-badge {
    background-color: #ffcc99; /* soft coral */
    color: #111;
    font-weight: 500;
    padding: 0.5rem 0.8rem;
    border-radius: 12px;
  }
`}</style>


              <div className="mb-4 d-flex gap-3 flex-wrap align-items-center">
                <button className="btn btn-dark rounded-pill px-4 py-2" onClick={() => addToCart(product)}>
                  {currentUser?.cart?.some((p) => p.id === product.id) ? "Remove" : "Add to Cart"}
                </button>

                <Heart
                  onClick={() => toggleWishlist(product)}
                  color={wishlistIds.includes(product.id) ? "#111" : "gray"}
                  fill={wishlistIds.includes(product.id) ? "#111" : "none"}
                  size={wishlistIds.includes(product.id) ? 28 : 30}
                  className="wishlist-icon mt-1"
                />

                <button className="btn btn-outline-dark rounded-circle p-2 share-btn" onClick={() => shareProduct(product)}>
                  <FaShareAlt />
                </button>
              </div>

              {product.story && (
                <div className="mb-3">
                  <h5 className="fw-bold">Story</h5>
                  <p className="text-muted">{product.story}</p>
                </div>
              )}

              {/* Ingredients & Allergens */}
              <div className="row g-3 mb-3">
                {product.ingredients && (
                  <div className="col-6">
                    <div className="card p-3 shadow-sm rounded-4 bg-light">
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

              {/* Nutrition */}
              {product.nutrition && (
                <div className="card p-3 shadow-sm rounded-4 mb-3 bg-light">
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
                  <div key={item.id} className="card p-2 shadow-sm rounded-4 recommended-card">
                    <img src={item.image} alt={item.name} className="img-fluid recommended-image mb-2" />
                    <h6 className="fw-bold mb-1">{item.name}</h6>
                    <p className="mb-2 text-dark">₹{item.price}</p>
                    <button className="btn btn-dark rounded-pill px-6 py-2" onClick={() => addToCart(item)}>
                      {currentUser?.cart?.some((p) => p.id === item.id) ? "Remove" : "Add to Cart"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recently Viewed */}
          {recentlyViewedProduct && recentlyViewedProduct.length > 0 && (
            <div className="mt-5">
              <h4>Recently Viewed</h4>
              <div className="d-flex overflow-auto gap-3 py-2">
                {recentlyViewedProduct.map((item) => (
                  <div key={item.id} className="card p-2 shadow-sm rounded-4 recommended-card">
                    <img src={item.image} alt={item.name} className="img-fluid recommended-image mb-2" />
                    <h6 className="fw-bold mb-1">{item.name}</h6>
                    <p className="mb-2 text-dark">₹{item.price}</p>
                    <button className="btn btn-dark rounded-pill px-6 py-2" onClick={() => addToCart(item)}>
                      {currentUser?.cart?.some((p) => p.id === item.id) ? "Remove " : "Add to Cart"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="mt-4">
            <button className="btn btn-outline-dark me-2" onClick={() => setShowReviewModal("view")}>
              View Reviews ({product.reviews?.length || 0})
            </button>
            <button className="btn btn-dark" onClick={() => setShowReviewModal("write")}>
              Write a Review
            </button>

            {showReviewModal && (
              <div className="modal-backdrop" onClick={() => setShowReviewModal(false)}>
                <div className="modal-content p-4 rounded-4 shadow-sm" onClick={(e) => e.stopPropagation()}>
                  {showReviewModal === "view" ? (
                    <>
                      <h5 className="fw-bold mb-3">Customer Reviews</h5>
                      {product.reviews?.length > 0 ? (
                        product.reviews.map((rev, i) => (
                          <div key={i} className="border-bottom py-2 d-flex gap-3 align-items-start">
                            <img src={rev.image || profile} alt="user" className="rounded-circle" style={{ width: "40px", height: "40px", objectFit: "cover" }} />
                            <div>
                              <div className="d-flex align-items-center mb-1">
                                {[...Array(5)].map((_, j) => (
                                  <FaStar key={j} size={16} color={j < rev.rating ? "#ffc107" : "#e4e5e9"} />
                                ))}
                              </div>
                              <p className="mb-1">{rev.text}</p>
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
                          <FaStar key={i} size={25} className="me-2 cursor-pointer" color={i < reviewRating ? "#ffc107" : "#e4e5e9"} onClick={() => setReviewRating(i + 1)} />
                        ))}
                      </div>
                      <textarea className="form-control mb-3" placeholder="Share your experience..." rows={3} value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
                      <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-secondary" onClick={() => setShowReviewModal(false)}>Cancel</button>
                        <button className="btn btn-dark" onClick={handleSubmitReview}>Submit</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
      <ScrollToTop />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        * { font-family: 'Roboto', sans-serif !important; }
        .product-details { background: #fff8f0; padding: 20px; border-radius: 15px; }
        .product-image { width: 90%; max-height: 300px; object-fit: contain; }
        .recommended-image { width: 100%; height: 120px; object-fit: contain; }
        .share-btn { font-size: 1.1rem; }
        .btn-dark, .btn-outline-dark, .btn-secondary { transition: none !important; }
        .modal-backdrop { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(245,242,238,0.95); display:flex; justify-content:center; align-items:center; z-index:1050; }
        .modal-content { background:#fff8f0; max-width:500px; width:90%; max-height:80vh; overflow-y:auto; border-radius:25px; padding:30px 25px; box-shadow:0 25px 50px rgba(0,0,0,0.1); border:1px solid #ffe5d6; }
        .cursor-pointer { cursor:pointer; }
        @media(max-width:768px){
          .product-image { max-height:250px; }
          .recommended-image { height:100px; }
        }
      `}</style>
    </>
  );
}
