
import { useContext, useEffect, useState } from "react";
import { useLoading } from "../../context/LoadingContext";
import { SearchContext } from "../../context/SearchContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchProductBySlug,
  fetchProducts,
  fetchUser,
  updateUser,
  fetchReviews,
  addReview,
  checkReviewEligibility,
  BASE_URL,
} from "../../components/Fetch/FetchUser";
import { Heart, Star, StarHalf, X } from "lucide-react";
import { FaStar } from "react-icons/fa";
import ConfirmationModal from "../../components/Common/ConfirmationModal";
import ShareButton from "../../components/Products/ShareButton";
import Footer from "../../components/Layout/Footer";
import { getCart, addToCart, removeFromCart } from "../../api/user/cart";
import { getWishlist, addToWishlist, removeFromWishlist } from "../../api/user/wishlist";
import profile from "../../homeImages/profileDD.jpeg";
export default function ProductDetails({ toastRef }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isLoading, stopLoading } = useLoading();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const { wishlistIds = [], refreshCart, refreshWishlist } = useContext(SearchContext);
  const [RecentlyViewedProduct, setRecentlyViewedProducts] = useState([]);
  const [inWishlist, setInWishlist] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null, type: "" });
  const [showImageModal, setShowImageModal] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });


  // Initial fetch for cart and wishlist
  useEffect(() => {
    async function loadInitialData() {
      const items = await refreshCart();
      setCartItems(Array.isArray(items) ? items : []);
      await refreshWishlist();
    }
    loadInitialData();
  }, [refreshCart, refreshWishlist]);

  // Fetch product and recommended
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetchProductBySlug(slug);
        setProduct(response);

        // ✅ Fetch Reviews
        try {
          const productReviews = await fetchReviews(response.id);
          setReviews(Array.isArray(productReviews) ? productReviews : productReviews.results || []);

          // ✅ Check Review Eligibility
          const userId = localStorage.getItem("userId");
          if (userId) {
            const eligibility = await checkReviewEligibility(response.id);
            console.log("Review Eligibility for product", response.id, ":", eligibility);
            setIsEligible(eligibility.eligible);
          } else {
            console.log("User not logged in, skipping eligibility check.");
          }
        } catch (error) {
          console.error("Failed to fetch reviews/eligibility", error);
        }

        const userId = localStorage.getItem("userId");
        if (userId) {
          const user = await fetchUser(userId);
          let recentlyViewed = user.recently_viewed || [];

          // Remove if already exists to re-add at the end (makes it the most recent)
          recentlyViewed = recentlyViewed.filter((p) => p.id !== response.id);

          // Add current product to the end
          recentlyViewed.push(response);

          // Keep only the last 10 items (most recent)
          if (recentlyViewed.length > 10) {
            recentlyViewed = recentlyViewed.slice(-10);
          }

          setRecentlyViewedProducts(recentlyViewed);
          const recently_viewed_ids = recentlyViewed.map((p) => p.id);
          await updateUser(userId, { recently_viewed_ids });

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
      } finally {
        stopLoading();
      }
    }
    fetchData();
  }, [slug, setRecentlyViewedProducts, stopLoading]);

  // Trigger wishlist toggle
  const handleToggleWishlist = (item) => {
    const exists = wishlistIds.includes(item.id);

    if (exists) {
      // Ask confirmation before removing
      setConfirmDialog({ open: true, item, type: "wishlist" });
    } else {
      toggleWishlist(item); // directly add
    }
  };
  const confirmRemove = async () => {
    if (!confirmDialog.item) return;

    try {
      if (confirmDialog.type === "cart") {
        const cartItems = await getCart();
        const items = Array.isArray(cartItems) ? cartItems : [];
        const existingItem = items.find(ci => ci.product?.id === confirmDialog.item.id || ci.id === confirmDialog.item.id);

        if (existingItem) {
          await removeFromCart(existingItem.id);
          await refreshCart();
          const updatedCart = await getCart();
          const updatedItems = Array.isArray(updatedCart) ? updatedCart : [];
          setCartItems(updatedItems); // ✅ Update local state
          toastRef?.current?.showToast(`${confirmDialog.item.name} removed from cart`);
        }
      }

      if (confirmDialog.type === "wishlist") {
        const wishlistItems = await getWishlist();
        const items = Array.isArray(wishlistItems) ? wishlistItems : [];
        const existingItem = items.find(wi => wi.product?.id === confirmDialog.item.id || wi.id === confirmDialog.item.id);

        if (existingItem) {
          await removeFromWishlist(existingItem.id);
          await refreshWishlist();
          setInWishlist(false);
          toastRef?.current?.showToast(`${confirmDialog.item.name} removed from wishlist`);
        }
      }

      setConfirmDialog({ open: false, item: null, type: "" });
    } catch (err) {
      console.error("Remove operation failed:", err);
      toastRef?.current?.showToast("Failed to remove item");
    }
  };


  const handleAddToCart = async (item) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toastRef.current.showToast("Login first", { label: "Login", onClick: () => navigate("/login") });
      return;
    }

    const exists = cartItems.some((p) => (p.product?.id || p.id) === item.id);

    if (exists) {
      // ✅ confirmation only for remove
      setConfirmDialog({ open: true, item, type: "cart" });
    } else {
      // ✅ add immediately
      try {
        await addToCart(item.id, 1);

        // Update cart count and local state
        await refreshCart();
        const items = await getCart();
        setCartItems(Array.isArray(items) ? items : []);

        toastRef.current.showToast(
          `${item.name} added to cart`,
          { label: "View Cart", onClick: () => navigate("/cart") }
        );

        if (navigator.vibrate) navigator.vibrate(50);
      } catch (err) {
        console.error("Cart add failed:", err);
        toastRef.current.showToast("Failed to add to cart");
      }
    }
  };

  const toggleWishlist = async (item) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toastRef.current.showToast("Login first", { label: "Login", onClick: () => navigate("/login") });
        return;
      }

      // Get current wishlist to check if item exists
      const wishlistItems = await getWishlist();
      const items = Array.isArray(wishlistItems) ? wishlistItems : [];
      const existingItem = items.find(wi => wi.product?.id === item.id || wi.id === item.id);

      if (existingItem) {
        // Remove from wishlist
        await removeFromWishlist(existingItem.id);
        setInWishlist(false);
        toastRef?.current?.showToast(`${item.name} removed from wishlist`);
      } else {
        // Add to wishlist
        await addToWishlist(item.id);
        setInWishlist(true);
        toastRef?.current?.showToast(`${item.name} added to wishlist`);
      }

      // Update wishlist count
      await refreshWishlist();

      // Vibration feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    } catch (err) {
      console.error("Wishlist operation failed:", err);
      toastRef?.current?.showToast("Failed to update wishlist");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;
    try {
      await addReview(product.id, newReview);
      toastRef?.current?.showToast("Review submitted successfully! Thank you.", { variant: "success" });
      setShowReviewModal(false);
      setIsEligible(false); // Hide button after submission

      // Refresh reviews and product stats
      const productReviews = await fetchReviews(product.id);
      setReviews(Array.isArray(productReviews) ? productReviews : productReviews.results || []);

      const updatedProduct = await fetchProductBySlug(slug);
      setProduct(updatedProduct);
    } catch (error) {
      console.error("Failed to submit review", error);
      const detail = error.response?.data?.detail || "Failed to submit review. Please try again.";
      toastRef?.current?.showToast(detail, { variant: "error" });
    }
  };

  return (
    <>
      <div style={{ height: "80px" }} className="d-none d-md-block"></div>
      <div style={{ height: "120px" }} className="d-md-none d-block"></div>

      <style>{`
        @media (max-width: 768px) {
          .product-detail-container { padding: 10px !important; margin-top: 20px !important; }
          .product-detail-container h2 { font-size: 1.5rem !important; }
          .product-detail-container p.fw-bold { font-size: 1.4rem !important; }
          .product-img-main { max-height: 280px !important; }
          .recommended-img { height: 90px !important; }
          .recently-viewed-img { max-width: 80px !important; max-height: 80px !important; }
          .review-card { padding: 12px !important; }
          .review-user-img { width: 35px !important; height: 35px !important; }
          .review-card h6 { font-size: 0.9rem !important; }
          .review-card p { font-size: 0.85rem !important; }
          .ingredients-card, .allergens-card { padding: 12px !important; }
          .ingredients-card h6, .allergens-card h6 { font-size: 0.9rem !important; }
          .ingredients-card li, .allergens-card li { font-size: 0.8rem !important; }
          .add-review-btn { 
            padding: 8px 16px !important; 
            font-size: 0.8rem !important;
            border-radius: 30px !important;
          }
        }
      `}</style>

      {product && (
        <div
          className="container my-5 product-detail-container"
          style={{ background: "#fff8f0", padding: "20px", borderRadius: "15px" }}
        >
          <div className="row g-4">
            {/* Left: Product Image */}
            <div className="col-md-6 text-center">
              <div className="card shadow-sm rounded-4" style={{ background: "#fff8f0", position: "relative" }}>
                {/* Wishlist Icon Top Right */}
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    display: "flex",
                    gap: 15, // spacing between icons
                    zIndex: 10,
                  }}
                >
                  {/* Wishlist Heart */}
                  <Heart
                    className="mt-1"
                    onClick={() => product.stock > 0 && handleToggleWishlist(product)}
                    color={product.stock === 0 ? "#cbd5e1" : (wishlistIds.includes(product.id) ? "#111" : "gray")}
                    fill={product.stock === 0 ? "none" : (wishlistIds.includes(product.id) ? "#111" : "none")}
                    size={wishlistIds.includes(product.id) ? 28 : 30}
                    style={{
                      cursor: product.stock === 0 ? "default" : "pointer",
                      opacity: product.stock === 0 ? 0.6 : 1,
                      pointerEvents: product.stock === 0 ? "none" : "auto"
                    }}
                  />

                  {/* Share Button */}
                  <ShareButton
                    url={`${window.location.origin}/productDetails/${product.slug}`}
                    title={product.name}
                  />
                </div>

                {/* SOLD OUT OVERLAY */}
                {product.stock === 0 && (
                  <div
                    className="position-absolute d-flex align-items-center justify-content-center"
                    style={{
                      inset: 0,
                      background: "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(4px)",
                      zIndex: 3,
                      borderRadius: "15px"
                    }}
                  >
                    <span
                      className="sold-out-badge"
                      style={{
                        background: "rgba(0, 0, 0, 0.75)",
                        color: "#fff",
                        padding: "10px 24px",
                        borderRadius: "50px",
                        fontSize: "1rem",
                        fontWeight: "700",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        boxShadow: "0 8px 25px rgba(0,0,0,0.3)"
                      }}
                    >
                      Sold Out
                    </span>
                  </div>
                )}

                {/* Clickable Image */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="img-fluid rounded-4 product-img-main"
                  style={{
                    maxHeight: "400px",
                    objectFit: "contain",
                    cursor: product.stock === 0 ? "default" : "pointer",
                    minHeight: "200px",
                    filter: product.stock === 0 ? "grayscale(1) opacity(0.6)" : "none",
                    transition: "all 0.5s ease"
                  }}
                  onClick={() => product.stock > 0 && setShowImageModal(true)}
                />

                {/* Bottom Overlay */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    width: "100%",
                    padding: "25px 15px",
                    background: "rgba(0,0,0,0.05)",
                    borderBottomLeftRadius: "15px",
                    borderBottomRightRadius: "15px",
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    zIndex: 4
                  }}
                >
                  <button
                    className="btn rounded-pill px-4 py-2"
                    onClick={() => product.stock > 0 && handleAddToCart(product)}
                    disabled={product.stock === 0}
                    style={{
                      fontSize: "0.95rem",
                      background: product.stock === 0 ? "rgba(0,0,0,0.1)" : "rgba(50, 30, 20, 0.85)",
                      color: product.stock === 0 ? "#888" : "#fff",
                      fontWeight: 600,
                      border: "none",
                      cursor: product.stock === 0 ? "not-allowed" : "pointer",
                      boxShadow: product.stock === 0 ? "none" : "0 4px 15px rgba(0,0,0,0.2)"
                    }}
                  >
                    {product.stock === 0 ? "Out of Stock" : (cartItems.some(p => (p.product?.id || p.id) === product.id) ? "Remove from Cart" : "Add to Cart")}
                  </button>

                </div>
              </div>

              {/* Image Modal - Modern Lightbox */}
              {showImageModal && (
                <div
                  className="image-modal-backdrop"
                  onClick={() => setShowImageModal(false)}
                >
                  <button
                    className="image-modal-close"
                    onClick={() => setShowImageModal(false)}
                  >
                    <X size={32} />
                  </button>

                  <div
                    className="image-modal-content"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="image-modal-img"
                    />
                  </div>
                </div>
              )}





            </div>
            {/* Right: Product Details */}
            <div className="col-md-6">
              <h2 className="fw-bold">{product.name}</h2>
              <p
                className="fw-bold mb-2"
                style={{
                  fontSize: "clamp(1.5rem, 4vw, 2.5rem)", // responsive size
                  color: "#2c2c2c", // dark premium shade
                }}
              >
                ₹{product.price}
              </p>

              {product.story && (
                <div className="mb-3">
                  <h5 className="fw-bold">Story</h5>
                  <p className="text-muted">{product.story}</p>
                </div>
              )}

              {/* Average Rating Stars */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="d-flex">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      size={18}
                      color={i < Math.round(product.average_rating || 0) ? "#ffc107" : "#e4e5e9"}
                    />
                  ))}
                </div>
                <span className="fw-bold" style={{ color: "#2d3436", fontSize: "1.1rem" }}>
                  {product.average_rating ? Number(product.average_rating).toFixed(1) : "0.0"}
                </span>
                <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                  ({product.review_count || 0} reviews)
                </span>
              </div>

              <div className="row g-3 mb-3">
                {product.ingredients && (
                  <div className="col-6">
                    <div className="card p-3 shadow-sm rounded-4 ingredients-card" style={{ background: '#fff8f0' }}>
                      <h6 className="fw-bold">Ingredients</h6>
                      <ul className="list-unstyled mb-0">
                        {product.ingredients.map((ing, i) => (
                          <li key={i}>• {ing.name || ing}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {product.allergens && (
                  <div className="col-6">
                    <div className="card p-3 shadow-sm rounded-4 bg-danger text-white allergens-card">
                      <h6 className="fw-bold">Allergens</h6>
                      <ul className="list-unstyled mb-0">
                        {product.allergens.map((all, i) => (
                          <li key={i}>• {all.name || all}</li>
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
                    <img onClick={() => navigate(`/productDetails/${item.slug}`)}
                      src={item.image}
                      alt={item.name}
                      className="img-fluid rounded-4 mb-2 recommended-img"
                      style={{ height: "120px", objectFit: "contain" }}
                    />
                    <h6 className="fw-bold mb-1">{item.name}</h6>
                    <p
                      className="mb-2"
                      style={{
                        fontSize: "1.2rem",              // bigger than normal
                        fontWeight: "600",               // bold but not too heavy
                        color: "#2c2c2c",                // deep royal purple (premium feel)
                        letterSpacing: "0.5px",          // slight spacing for elegance
                      }}
                    >
                      ₹{item.price}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="btn mt-2 product-btn"
                        style={{
                          background: "rgba(50, 30, 20, 0.85)", // deep muted brown with transparency
                          color: "#fff",
                          borderRadius: "20px",
                          padding: "9px 0",
                          width: "clamp(120px, 50%, 180px)", // responsive width
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {cartItems.some((p) => (p.product?.id || p.id) === item.id) ? "Remove from Cart" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Recently Viewed */}
          {RecentlyViewedProduct?.length > 0 && (
            <div className="mt-5">
              <h4 className="fw-bold text-center mb-4">Recently Viewed</h4>
              <div className="row justify-content-center g-4">
                {RecentlyViewedProduct.map((item) => (
                  <div key={item.id} className="col-6 col-md-4 col-lg-3 d-flex justify-content-center">
                    <div
                      className="card border-0 w-100 product-card-hover"
                      style={{
                        maxWidth: "250px",
                        borderRadius: "22px",
                        overflow: "hidden",
                        backgroundColor: "#fff8f0",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
                        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                        cursor: "pointer",
                        position: "relative"
                      }}
                    >
                      <div className="d-flex justify-content-center align-items-center p-3 position-relative" style={{ background: "transparent", minHeight: "165px", borderRadius: "22px 22px 0 0" }}>
                        {item.stock < 10 && item.stock > 0 && (
                          <div
                            className="position-absolute top-0 start-0 m-3 badge rounded-pill"
                            style={{
                              background: "rgba(255, 77, 109, 0.95)",
                              color: "white",
                              fontSize: "0.7rem",
                              fontWeight: "600",
                              padding: "4px 8px",
                              zIndex: 2,
                              boxShadow: "0 4px 15px rgba(255, 77, 109, 0.4)",
                              animation: "pulse 2s infinite"
                            }}
                          >
                            Only {item.stock} left!
                          </div>
                        )}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid product-image recently-viewed-img"
                          style={{ maxWidth: "110px", maxHeight: "110px", objectFit: "contain", transition: "transform 0.5s ease" }}
                          onClick={() => {
                            navigate(`/productDetails/${item.slug}`);
                            window.scrollTo(0, 0);
                          }}
                        />
                        <div
                          className="wishlist-btn"
                          onClick={() => handleToggleWishlist(item)}
                          style={{
                            position: "absolute",
                            top: "12px",
                            right: "12px",
                            background: "rgba(255,255,255,0.9)",
                            backdropFilter: "blur(4px)",
                            borderRadius: "50%",
                            width: "38px",
                            height: "38px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "transform 0.2s",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
                          }}
                        >
                          <Heart
                            color={wishlistIds.includes(item.id) ? "#ff6b81" : "#a4b0be"}
                            fill={wishlistIds.includes(item.id) ? "#ff6b81" : "none"}
                            size={20}
                          />
                        </div>
                      </div>
                      <div className="card-body text-center p-3 pt-3" style={{ background: "linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 248, 240, 0.95) 100%)", backdropFilter: "blur(5px)" }}>
                        <h5
                          className="text-truncate px-2"
                          onClick={() => {
                            setProductDetails(item);
                            navigate(`/productDetails/${item.slug}`);
                            window.scrollTo(0, 0);
                          }}
                          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#2d3436", marginBottom: "6px" }}
                        >
                          {item.name}
                        </h5>

                        {/* Star Rating */}
                        <div className="d-flex justify-content-center align-items-center mb-2 gap-1">
                          {[...Array(5)].map((_, i) => {
                            const ratingValue = i + 1;
                            const rating = item.average_rating || 0;

                            return (
                              <span key={i}>
                                {rating >= ratingValue ? (
                                  <Star size={14} fill="#fbbf24" color="#fbbf24" />
                                ) : rating >= ratingValue - 0.5 ? (
                                  <StarHalf size={14} fill="#fbbf24" color="#fbbf24" />
                                ) : (
                                  <Star size={14} color="#e5e7eb" />
                                )}
                              </span>
                            );
                          })}
                          <span style={{ fontSize: "0.75rem", color: "#6b7280", marginLeft: "4px" }}>
                            ({item.review_count || 0})
                          </span>
                        </div>

                        <p className="mb-3" style={{ fontSize: "1.1rem", fontWeight: "700", color: "#5D372B", letterSpacing: "0px" }}>
                          ₹{item.price}
                        </p>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="btn py-2 mx-auto d-block cart-btn"
                          style={{
                            width: "85%",
                            background: "linear-gradient(135deg, #7B4B3A 0%, #4E342E 100%)",
                            color: "#fff",
                            borderRadius: "50px",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            border: "none",
                            boxShadow: "0 4px 12px rgba(93, 55, 43, 0.4)",
                            transition: "transform 0.2s, box-shadow 0.2s",
                          }}
                        >
                          {cartItems.some((p) => (p.product?.id || p.id) === item.id) ? "Remove" : "Add"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section - Modernized */}
          <div className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0" style={{ color: "#5D372B" }}>
                Customer Reviews ({reviews.length})
              </h4>
              {isEligible && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="btn px-4 py-2 shadow-sm add-review-btn"
                  style={{
                    borderRadius: "50px",
                    background: "linear-gradient(135deg, #7B4B3A 0%, #4E342E 100%)",
                    color: "#fff",
                    fontWeight: 600,
                    border: "none",
                    fontSize: "0.9rem",
                    transition: "all 0.3s ease"
                  }}
                >
                  Add Review
                </button>
              )}
            </div>

            {reviews.length > 0 ? (
              <div className="row g-3">
                {reviews.map((review) => (
                  <div key={review.id} className="col-md-6">
                    <div
                      className="p-3 rounded-4 review-card"
                      style={{
                        background: "#fff8f0",
                        backdropFilter: "blur(10px)",
                        border: "none",
                        boxShadow: "0 10px 30px rgba(93, 55, 43, 0.05)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      }}
                    >
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <img
                          src={review.user_image || profile}
                          alt={review.user_name}
                          className="rounded-circle review-user-img"
                          style={{ width: "45px", height: "45px", objectFit: "cover", border: "2px solid #fff", transition: "transform 0.3s ease" }}
                          onError={(e) => { e.target.onerror = null; e.target.src = profile; }}
                        />
                        <div>
                          <h6 className="mb-0 fw-bold" style={{ color: "#2d3436" }}>{review.user_name || "Anonymous"}</h6>
                          <div className="d-flex">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                size={14}
                                color={i < review.rating ? "#ffc107" : "#e4e5e9"}
                              />
                            ))}
                          </div>
                        </div>
                        <small className="ms-auto text-muted" style={{ fontSize: "0.8rem" }}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </small>
                      </div>
                      <p className="mb-0 text-muted" style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
                        {review.comment || review.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="text-center py-5 rounded-4"
                style={{
                  background: "#fff8f0",
                  border: "1px dashed rgba(93, 55, 43, 0.2)",
                  backdropFilter: "blur(5px)"
                }}
              >
                <p className="mb-0 text-muted fst-italic">No reviews yet. Be the first to taste and tell!</p>
              </div>
            )}
          </div>

          {!product && !isLoading && (
            <div className="container text-center my-5 py-5">
              <div className="card shadow-sm p-5 rounded-4" style={{ background: "#fff8f0" }}>
                <h2 className="fw-bold text-muted mb-3">Product Not Found</h2>
                <p className="text-secondary mb-4">We couldn't find the treat you're looking for. It might have been devoured or moved!</p>
                <button className="btn rounded-pill px-4 py-2" onClick={() => navigate("/products")} style={{ background: "#5D372B", color: "#fff", fontWeight: 600 }}>
                  Back to Store
                </button>
              </div>
            </div>
          )}

          {/* Confirmation Modal for Cart/Wishlist */}
          <ConfirmationModal
            open={confirmDialog.open}
            onClose={() => setConfirmDialog({ open: false, item: null, type: "" })}
            onConfirm={confirmRemove}
            title="Are you sure?"
            message={
              <>
                Do you want to remove <strong>{confirmDialog.item?.name}</strong> from {confirmDialog.type}?
              </>
            }
            confirmLabel="Yes, Remove"
            confirmColor="#ff4d6d"
          />

          {/* Review Submission Modal */}
          {showReviewModal && (
            <div
              className="image-modal-backdrop"
              style={{ zIndex: 11000, background: "rgba(0,0,0,0.6)" }}
              onClick={() => setShowReviewModal(false)}
            >
              <div
                className="confirm-modal-content p-4"
                style={{
                  maxWidth: "500px",
                  borderRadius: "24px",
                  background: "#ffffff",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  border: "1px solid rgba(255, 255, 255, 0.2)"
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h4 className="mb-1 fw-bold" style={{ color: "#3d2b1f", letterSpacing: "-0.5px" }}>Write a Review</h4>
                    <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>Share your thoughts with the community</p>
                  </div>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="btn-close-custom"
                    style={{
                      background: "rgba(93, 55, 43, 0.05)",
                      border: "none",
                      borderRadius: "50%",
                      padding: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s"
                    }}
                  >
                    <X size={20} style={{ color: "#5D372B" }} />
                  </button>
                </div>

                <form onSubmit={handleReviewSubmit}>
                  <div className="mb-4 p-3 rounded-4" style={{ background: "rgba(93, 55, 43, 0.03)", border: "1px solid rgba(93, 55, 43, 0.05)" }}>
                    <label className="d-block mb-3 fw-bold text-uppercase" style={{ color: "#5D372B", fontSize: "0.75rem", letterSpacing: "1px" }}>Overall Rating</label>
                    <div className="d-flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div
                          key={star}
                          className="star-container"
                          style={{ transition: "transform 0.2s ease" }}
                        >
                          <FaStar
                            size={32}
                            style={{ cursor: "pointer", transition: "all 0.2s" }}
                            color={star <= newReview.rating ? "#ffc107" : "#e2e8f0"}
                            className={star <= newReview.rating ? "star-active" : "star-inactive"}
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4 text-start">
                    <label className="d-block mb-2 fw-bold text-uppercase" style={{ color: "#5D372B", fontSize: "0.75rem", letterSpacing: "1px" }}>Your Experience</label>
                    <textarea
                      className="form-control review-textarea"
                      rows="4"
                      placeholder="What did you like or dislike about this product? Your feedback helps others make better choices."
                      required
                      style={{
                        borderRadius: "16px",
                        border: "2px solid #f1f3f5",
                        background: "#ffffff",
                        padding: "16px",
                        fontSize: "1rem",
                        color: "#2d3436",
                        transition: "all 0.2s",
                        resize: "none"
                      }}
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 py-3 mt-2 shadow-lg review-submit-btn"
                    style={{
                      borderRadius: "16px",
                      background: "linear-gradient(135deg, #7B4B3A 0%, #4E342E 100%)",
                      color: "#fff",
                      fontWeight: 700,
                      border: "none",
                      fontSize: "1.1rem",
                      transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                    }}
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            </div>
          )}


        </div>

      )}

      <style>{`

  `}</style>

      <style>{`
        @media (max-width: 576px) {
    .card { max-width: 100% !important; }
    .wishlist-icon { width: 24px !important; height: 24px !important; }
    .product-btn { font-size: 0.9rem !important; padding: 10px 0 !important; }
  }

  /* Product card hover effect */
  .product-card-hover:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.12) !important;
  }
  
  .product-card-hover:hover .product-image {
    transform: scale(1.1) rotate(5deg); /* Tilt image */
  }

  .wishlist-btn:hover {
    transform: scale(1.15) rotate(12deg); /* Tilt heart - Same direction */
    background: #fff !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .cart-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.2) !important;
  }
  
  .cart-btn:active {
    transform: scale(0.98);
  }

  @keyframes pulse {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 65, 108, 0.7); }
    70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 65, 108, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 65, 108, 0); }
  }

  .review-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 45px rgba(93, 55, 43, 0.15) !important;
  }

  .review-card:hover .review-user-img {
    transform: scale(1.1);
  }

  .add-review-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(93, 55, 43, 0.25) !important;
  }
  
  .add-review-btn:active {
    transform: scale(0.98);
  }

  /* Modern Image Modal Styles */
  .image-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(12px);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .image-modal-content {
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: zoomIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* Review Modal Enhancements */
  .review-textarea:focus {
    border-color: #5D372B !important;
    box-shadow: 0 0 0 4px rgba(93, 55, 43, 0.1) !important;
    outline: none;
  }

  .star-container:hover {
    transform: scale(1.2);
  }

  .star-active {
    filter: drop-shadow(0 0 8px rgba(255, 193, 7, 0.4));
  }

  .review-submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(93, 55, 43, 0.3) !important;
    filter: brightness(1.1);
  }

  .btn-close-custom:hover {
    background: rgba(93, 55, 43, 0.1) !important;
    transform: rotate(90deg);
  }

  .image-modal-img {
    max-width: 100%;
    max-height: 85vh;
    object-fit: contain;
    border-radius: 20px;
    border: none;
    transition: transform 0.3s ease;
  }

  .image-modal-img:hover {
    transform: scale(1.02);
  }

  .image-modal-close {
    position: absolute;
    top: 40px;
    right: 40px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(8px);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    width: 55px;
    height: 55px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 10000;
  }

  .image-modal-close:hover {
    background: #ff4d6d;
    transform: rotate(90deg) scale(1.1);
    border-color: transparent;
    box-shadow: 0 0 20px rgba(255, 77, 109, 0.5);
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes zoomIn {
    from { opacity: 0; transform: scale(0.85); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes soldOutPulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }

  .sold-out-badge {
    animation: soldOutPulse 2s infinite ease-in-out;
    display: inline-block;
  }
      `}</style>

      <Footer />

    </>
  );
}



