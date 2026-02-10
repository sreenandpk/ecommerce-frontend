import { useEffect, useState, useContext } from "react";
import { useLoading } from "../../context/LoadingContext";
import { Heart, Star, StarHalf } from "lucide-react";
import { SearchContext } from "../../context/SearchContext";
import { useNavigate, useParams } from "react-router-dom";
import { fetchByCategory } from "../../components/Fetch/FetchUser";
import { getWishlist, addToWishlist, removeFromWishlist } from "../../api/user/wishlist";
import { getCart } from "../../api/user/cart";
import Footer from "../../components/Layout/Footer";
import ScrollToTop from "../../components/Common/ScrollToTop";
import ConfirmationModal from "../../components/Common/ConfirmationModal";

export default function Category() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { stopLoading } = useLoading();
  const { wishlistIds = [], setWishlistIds } = useContext(SearchContext);

  const [products, setProducts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null, type: "" });

  useEffect(() => {
    async function init() {
      try {
        const res = await fetchByCategory(slug);
        setProducts(res);

        const token = localStorage.getItem("accessToken");
        if (token) {
          const wishlistItems = await getWishlist();
          const ids = Array.isArray(wishlistItems) ? wishlistItems.map((item) => item.product?.id || item.id) : [];
          setWishlistIds(ids);
        }
      } catch (err) {
        console.error("Failed to load category data", err);
      } finally {
        stopLoading();
      }
    }
    init();
  }, [slug, setWishlistIds]);

  const handleWishlistClick = (item) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
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
        setWishlistIds((prev) => prev.filter((id) => id !== item.id));
      } else {
        await addToWishlist(item.id);
        setWishlistIds((prev) => [...prev, item.id]);
      }
    } catch (err) {
      console.error("Wishlist error", err);
    }
  };

  const confirmRemove = () => {
    if (confirmDialog.type === "wishlist") updateWishlist(confirmDialog.item);
    setConfirmDialog({ open: false, item: null, type: "" });
  };

  return (
    <>
      <div className="container-fluid pt-4 pt-md-4 pb-4 pb-md-5 mt-1 mt-md-2" style={{ background: "linear-gradient(180deg, #fffcf9 0%, #fff8f0 100%)", minHeight: "60vh" }}>
        <div className="container px-2 px-md-0">
          {/* Header Section */}
          <div className="text-center mb-4 mb-md-5" data-aos="fade-down">
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 800,
              fontSize: "clamp(2rem, 6vw, 3rem)",
              color: "#5D372B",
              textTransform: "capitalize",
              marginBottom: "5px"
            }}>
              {slug.replace(/-/g, ' ')}
            </h1>
            <div style={{ width: "60px", height: "3px", background: "#5D372B", margin: "0 auto 15px", borderRadius: "2px" }}></div>
            <p className="text-muted fs-6 fs-md-5">Indulge in our exquisite {slug.replace(/-/g, ' ')} collection</p>
          </div>

          {/* Product Grid */}
          <div className="row justify-content-center g-2 g-md-4">
            {products && products.length > 0 ? (
              products.map((item) => (
                <div key={item.id} className="col-6 col-md-4 col-lg-3 d-flex justify-content-center">
                  <div
                    className={`card border-0 w-100 ${item.stock > 0 ? 'product-card-hover' : ''}`}
                    style={{
                      maxWidth: "310px",
                      borderRadius: "22px",
                      overflow: "hidden",
                      backgroundColor: "#fff8f0",
                      boxShadow: item.stock === 0 ? "none" : "0 10px 30px rgba(0,0,0,0.05)",
                      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      cursor: item.stock === 0 ? "default" : "pointer",
                      position: "relative",
                      opacity: item.stock === 0 ? 0.85 : 1
                    }}
                  >
                    {/* Visual Section */}
                    <div className="position-relative p-3" style={{ background: "#fff8f0", minHeight: "180px", height: "200px", mdHeight: "240px" }}>
                      {item.stock === 0 && (
                        <div className="position-absolute d-flex align-items-center justify-content-center" style={{ inset: 0, background: "rgba(255, 255, 255, 0.2)", backdropFilter: "blur(2px)", zIndex: 3 }}>
                          <span className="sold-out-badge" style={{ background: "rgba(0, 0, 0, 0.7)", color: "#fff", padding: "6px 16px", borderRadius: "50px", fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase" }}>Sold Out</span>
                        </div>
                      )}
                      {/* Wishlist Heart Icon */}
                      <div
                        className="wishlist-btn-category"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.stock > 0) handleWishlistClick(item);
                        }}
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          background: "rgba(255,255,255,0.9)",
                          backdropFilter: "blur(4px)",
                          borderRadius: "50%",
                          width: "32px",
                          height: "32px",
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
                          size={16}
                        />
                      </div>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="img-fluid w-100 h-100"
                        style={{ objectFit: "contain", filter: item.stock === 0 ? "grayscale(1) opacity(0.5)" : "none", transition: "transform 0.5s ease" }}
                        onClick={() => item.stock > 0 && navigate(`/productDetails/${item.slug}`)}
                      />
                    </div>

                    {/* Content Section */}
                    <div className="card-body text-center p-3 pt-3" style={{ background: "linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 248, 240, 0.95) 100%)", backdropFilter: "blur(5px)" }}>
                      <h5 className="text-truncate mb-2" style={{ fontWeight: 600, color: item.stock === 0 ? "#888" : "#2d3436", fontSize: "0.9rem" }}>{item.name}</h5>

                      {/* Star Rating */}
                      <div className="d-flex justify-content-center align-items-center mb-2 gap-1" style={{ opacity: item.stock === 0 ? 0.5 : 1 }}>
                        {[...Array(5)].map((_, i) => {
                          const ratingValue = i + 1;
                          const rating = item.average_rating || 0;
                          return (
                            <span key={i}>
                              {rating >= ratingValue ? (
                                <Star size={10} fill="#fbbf24" color="#fbbf24" />
                              ) : rating >= ratingValue - 0.5 ? (
                                <StarHalf size={10} fill="#fbbf24" color="#fbbf24" />
                              ) : (
                                <Star size={10} color="#e5e7eb" />
                              )}
                            </span>
                          );
                        })}
                        <span style={{ fontSize: "0.65rem", color: "#6b7280", marginLeft: "4px" }}>
                          ({item.review_count || 0})
                        </span>
                      </div>

                      {/* Price & Action */}
                      <div className="d-flex justify-content-between align-items-center mt-2 mt-md-3">
                        <span style={{ fontSize: "1rem", fontWeight: 700, color: item.stock === 0 ? "#999" : "#5D372B" }}>₹{item.price}</span>
                        <button
                          className="btn btn-sm rounded-pill px-2 px-md-3"
                          style={{
                            background: item.stock === 0 ? "#eee" : "#5D372B",
                            color: item.stock === 0 ? "#888" : "#fff",
                            fontSize: "0.7rem",
                            fontWeight: 600
                          }}
                          onClick={() => item.stock > 0 && navigate(`/productDetails/${item.slug}`)}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-5">
                <p className="text-muted fs-5">No treats found in this category yet.</p>
                <button
                  className="btn px-4 py-2 mt-3"
                  style={{ background: "#5D372B", color: "#fff", borderRadius: "50px", fontWeight: 600 }}
                  onClick={() => navigate("/products")}
                >
                  Explore All Products
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />


      {/* Confirmation Modal */}
      <ConfirmationModal
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, item: null, type: "" })}
        onConfirm={confirmRemove}
        title="Are you sure?"
        message={
          <>
            Do you want to remove <strong>{confirmDialog.item?.name}</strong> from wishlist?
          </>
        }
        confirmLabel="Yes, Remove"
        confirmColor="#ff4d6d"
      />

      <style>{`
  .product-card-hover:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(93, 55, 43, 0.12) !important;
  }
  
  .product-card-hover:hover img {
    transform: scale(1.1);
  }

  .wishlist-btn-category:hover {
    transform: scale(1.1);
    background: #fff !important;
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
    </>
  );
}



