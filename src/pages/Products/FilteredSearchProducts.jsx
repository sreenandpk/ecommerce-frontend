import { useEffect, useState, useContext } from "react";
import { Heart, Star, StarHalf } from "lucide-react";
import { SearchContext } from "../../context/SearchContext";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../../components/Common/ConfirmationModal";
import { useLoading } from "../../context/LoadingContext";

import Navbar from "../../components/Layout/Navbar";
import Footer from "../../components/Layout/Footer";
import ScrollToTop from "../../components/Common/ScrollToTop";
import { fetchProducts, fetchUser } from "../../components/Fetch/FetchUser";
import { getCart, addToCart, removeFromCart } from "../../api/user/cart";
import { getWishlist, addToWishlist, removeFromWishlist } from "../../api/user/wishlist";

export default function FilteredSearchProducts({ toastRef }) {
  const navigate = useNavigate();
  const { searchValue, wishlistIds = [], refreshCart, refreshWishlist, setProductDetails } = useContext(SearchContext);
  const { stopLoading } = useLoading();

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null, type: "" });

  // Fetch user & cart on mount
  useEffect(() => {
    async function initUser() {
      const savedUserId = JSON.parse(localStorage.getItem("userId"));
      if (savedUserId) {
        try {
          const u = await fetchUser(savedUserId);
          setUser(u);

          await refreshCart();
          await refreshWishlist();

          const cartData = await getCart();
          setCartItems(Array.isArray(cartData) ? cartData : []);
        } catch (err) {
          console.error("Failed to init user data", err);
        }
      }
    }
    initUser();
  }, [refreshCart, refreshWishlist]);

  // Fetch all products
  useEffect(() => {
    async function fetchAllProducts() {
      try {
        const res = await fetchProducts();
        setProducts(res);
      } catch (err) {
        console.error("Fetch products failed", err);
      } finally {
        stopLoading(); // ✅ Fix: Dismiss global loader
      }
    }
    fetchAllProducts();
  }, []);

  // Filter products by searchValue
  useEffect(() => {
    if (!searchValue.trim()) {
      setFiltered([]);
      return;
    }
    const filteredProducts = products.filter((p) =>
      p.name.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFiltered(filteredProducts);
  }, [searchValue, products]);

  // Add / remove cart
  const handleCartClick = (item) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toastRef?.current.showToast("Login first", { label: "Login", onClick: () => navigate("/login") });
      return;
    }
    const exists = cartItems.some((p) => (p.product?.id || p.id) === item.id);
    if (exists) {
      setConfirmDialog({ open: true, item, type: "cart" });
    } else {
      updateCart(item);
    }
  };

  const updateCart = async (item) => {
    try {
      const exists = cartItems.some((p) => (p.product?.id || p.id) === item.id);
      if (exists) {
        const cartItem = cartItems.find((p) => (p.product?.id || p.id) === item.id);
        if (cartItem?.id) await removeFromCart(cartItem.id);
      } else {
        await addToCart(item.id, 1);
      }

      await refreshCart();
      const updatedCart = await getCart();
      setCartItems(Array.isArray(updatedCart) ? updatedCart : []);

      toastRef?.current.showToast(
        `${item.name} ${exists ? "removed from cart" : "added to cart"}`,
        { label: "View Cart", onClick: () => navigate("/cart") }
      );

      if (navigator.vibrate) navigator.vibrate(50);
    } catch (err) {
      console.error("Cart error", err);
      toastRef?.current.showToast("Failed to update cart");
    }
  };

  // Wishlist toggle
  const handleWishlistClick = (item) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toastRef?.current.showToast("Login first", { label: "Login", onClick: () => navigate("/login") });
      return;
    }
    if (wishlistIds.includes(item.id)) {
      setConfirmDialog({ open: true, item, type: "wishlist" });
    } else {
      updateWishlist(item);
    }
  };

  const updateWishlist = async (item) => {
    try {
      const alreadyAdded = wishlistIds.includes(item.id);
      if (alreadyAdded) {
        const wishlistItems = await getWishlist();
        const wishItem = wishlistItems.find((w) => (w.product?.id === item.id) || (w.id === item.id));
        if (wishItem?.id) await removeFromWishlist(wishItem.id);
        await refreshWishlist();
        toastRef?.current.showToast(`${item.name} removed from wishlist`);
      } else {
        await addToWishlist(item.id);
        await refreshWishlist();
        toastRef?.current.showToast(`${item.name} added to wishlist`);
      }
      if (navigator.vibrate) navigator.vibrate(50);
    } catch (err) {
      console.error("Wishlist error", err);
      toastRef?.current.showToast("Failed to update wishlist");
    }
  };

  const confirmRemove = () => {
    if (confirmDialog.type === "cart") updateCart(confirmDialog.item);
    if (confirmDialog.type === "wishlist") updateWishlist(confirmDialog.item);
    setConfirmDialog({ open: false, item: null, type: "" });
  };

  const isSearching = searchValue.trim() !== "";
  const displayProducts = isSearching ? filtered : products;

  return (
    <>
      <div style={{ height: "80px" }}></div>

      <div className="container px-1 px-md-3" style={{ minHeight: "30vh", maxWidth: "1000px" }}>
        {isSearching && displayProducts.length === 0 ? (
          <div className="text-center py-5" data-aos="fade-up">
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#5D372B", marginBottom: "15px" }}>
              No scoops found for "{searchValue}"
            </h3>
            <p className="text-muted">Maybe try a different flavor?</p>
            <button
              className="btn px-4 py-2 mt-3"
              style={{ background: "#5D372B", color: "#fff", borderRadius: "50px", fontWeight: 600 }}
              onClick={() => navigate("/products")}
            >
              Browse All Flavors
            </button>
          </div>
        ) : (
          <div className="row justify-content-center g-2">
            {displayProducts.map((item, index) => (
              <div key={index} className="col-6 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center mt-4" data-aos="fade-up" data-aos-delay={index * 50}>
                <div
                  className={`card border-0 w-100 ${item.stock > 0 ? 'product-card-hover' : ''}`}
                  style={{
                    maxWidth: "250px",
                    borderRadius: "22px",
                    overflow: "hidden",
                    backgroundColor: "#fff8f0",
                    boxShadow: item.stock === 0 ? "none" : "0 10px 25px rgba(0,0,0,0.03)",
                    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    cursor: item.stock === 0 ? "default" : "pointer",
                    position: "relative",
                    opacity: item.stock === 0 ? 0.85 : 1
                  }}
                >
                  <div
                    className="d-flex justify-content-center align-items-center p-2 position-relative"
                    style={{ background: "transparent", minHeight: "150px", borderRadius: "22px 22px 0 0" }}
                  >
                    {/* SOLD OUT OVERLAY */}
                    {item.stock === 0 && (
                      <div
                        className="position-absolute d-flex align-items-center justify-content-center"
                        style={{
                          inset: 0,
                          background: "rgba(255, 255, 255, 0.2)",
                          backdropFilter: "blur(2px)",
                          zIndex: 3,
                          borderRadius: "22px 22px 0 0"
                        }}
                      >
                        <span
                          className="sold-out-badge"
                          style={{
                            background: "rgba(0, 0, 0, 0.7)",
                            color: "#fff",
                            padding: "6px 16px",
                            borderRadius: "50px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            letterSpacing: "1px",
                            textTransform: "uppercase",
                            boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
                          }}
                        >
                          Sold Out
                        </span>
                      </div>
                    )}

                    <img
                      src={item.image}
                      alt={item.name}
                      className="img-fluid product-image"
                      style={{
                        maxWidth: "100px",
                        maxHeight: "100px",
                        objectFit: "contain",
                        transition: "all 0.5s ease",
                        filter: item.stock === 0 ? "grayscale(1) opacity(0.5)" : "none"
                      }}
                      onClick={() => {
                        if (item.stock > 0) {
                          setProductDetails(item);
                          navigate(`/productDetails/${item.slug}`);
                        }
                      }}
                    />
                    <div
                      className="wishlist-btn"
                      onClick={() => item.stock > 0 && handleWishlistClick(item)}
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
                        cursor: item.stock === 0 ? "default" : "pointer",
                        transition: "transform 0.2s",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                        zIndex: 4,
                        opacity: item.stock === 0 ? 0.6 : 1,
                        pointerEvents: item.stock === 0 ? "none" : "auto"
                      }}
                    >
                      <Heart
                        color={item.stock === 0 ? "#cbd5e1" : (wishlistIds.includes(item.id) ? "#ff6b81" : "#a4b0be")}
                        fill={item.stock === 0 ? "none" : (wishlistIds.includes(item.id) ? "#ff6b81" : "none")}
                        size={20}
                      />
                    </div>
                  </div>

                  <div className="card-body text-center p-3 pt-3" style={{ background: "linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 248, 240, 0.95) 100%)", backdropFilter: "blur(5px)" }}>
                    <h5
                      className="text-truncate px-2"
                      onClick={() => {
                        if (item.stock > 0) {
                          setProductDetails(item);
                          navigate(`/productDetails/${item.slug}`);
                        }
                      }}
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        color: item.stock === 0 ? "#888" : "#2d3436",
                        marginBottom: "4px"
                      }}
                    >
                      {item.name}
                    </h5>

                    {/* Star Rating */}
                    <div className="d-flex justify-content-center align-items-center mb-2 gap-1" style={{ opacity: item.stock === 0 ? 0.5 : 1 }}>
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

                    <p className="mb-3" style={{ fontSize: "1.1rem", fontWeight: "700", color: item.stock === 0 ? "#999" : "#5D372B" }}>
                      ₹{item.price}
                    </p>

                    <button
                      onClick={() => item.stock > 0 && handleCartClick(item)}
                      disabled={item.stock === 0}
                      className="btn py-2 cart-btn mx-auto d-block"
                      style={{
                        width: "85%",
                        background: item.stock === 0 ? "rgba(0,0,0,0.1)" : "linear-gradient(135deg, #7B4B3A 0%, #4E342E 100%)",
                        color: item.stock === 0 ? "#888" : "#fff",
                        borderRadius: "50px",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        border: "none",
                        boxShadow: item.stock === 0 ? "none" : "0 4px 12px rgba(93, 55, 43, 0.4)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        cursor: item.stock === 0 ? "not-allowed" : "pointer",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.stock === 0 ? "Out of Stock" : (cartItems.some((p) => (p.product?.id || p.id) === item.id) ? "Remove" : "Add")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: "20px" }}></div>
      <Footer />

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, item: null, type: "" })}
        onConfirm={confirmRemove}
        title="Are you sure?"
        message={
          <>
            Do you want to remove <strong>{confirmDialog.item?.name}</strong> from{" "}
            {confirmDialog.type === "cart" ? "cart" : "wishlist"}?
          </>
        }
        confirmLabel="Yes, Remove"
        confirmColor="#ff4d6d"
      />

      <style>{`
        @media (max-width: 576px) {
          .card { max-width: 100% !important; }
          .wishlist-icon { width: 24px !important; height: 24px !important; }
          .product-btn { font-size: 0.9rem !important; padding: 10px 0 !important; }
        }
        .card:hover { transform: scale(1.05); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
        .card { transition: transform 0.3s ease, box-shadow 0.3s ease; }

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

      <ScrollToTop />
    </>
  );
}
