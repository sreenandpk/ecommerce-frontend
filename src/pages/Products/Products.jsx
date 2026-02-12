import { useEffect, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, StarHalf } from "lucide-react";
import { SearchContext } from "../../context/SearchContext";
import { useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import ConfirmationModal from "../../components/Common/ConfirmationModal";

import { fetchProducts, fetchProductsPage } from "../../components/Fetch/FetchUser";
import { getCart, addToCart, removeFromCart } from "../../api/user/cart";
import { getWishlist, addToWishlist, removeFromWishlist } from "../../api/user/wishlist";
import Footer from "../../components/Layout/Footer";
import ScrollToTop from "../../components/Common/ScrollToTop";

import { useLoading } from "../../context/LoadingContext";
import PremiumLoader from "../../components/Common/PremiumLoader";

export default function Products({ toastRef }) {
    const { stopLoading } = useLoading();
    const [products, setProducts] = useState([]);
    const [nextPage, setNextPage] = useState(null); // Pagination State
    const [loading, setLoading] = useState(false);
    const [bestSellerProducts, setBestSellerProducts] = useState([]);
    const [filtered, setFilterd] = useState([]);
    const { wishlistIds = [], refreshCart, refreshWishlist } = useContext(SearchContext);
    const [active, setActive] = useState("");
    const [cartItems, setCartItems] = useState([]);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null, type: "" });
    const navigate = useNavigate();

    //  Sync wishlist when user logs in
    useEffect(() => {
        refreshWishlist();
    }, [refreshWishlist]);

    useEffect(() => {
        async function loadCart() {
            const items = await refreshCart();
            setCartItems(Array.isArray(items) ? items : []);
        }
        loadCart();
    }, [refreshCart]);


    // Fetch Best Sellers
    useEffect(() => {
        async function fetchBestseller() {
            const products = await fetchProducts();
            const bestSeller = products.filter((p) => p.bestseller === "true");
            if (bestSeller) setBestSellerProducts(bestSeller);
        }
        fetchBestseller();
    }, []);

    // Fetch All Products (Paginated)
    useEffect(() => {
        async function fetchProductsFromFetch() {
            try {
                setLoading(true);
                const res = await fetchProductsPage(); // Uses new pagination function
                if (res.results) {
                    setProducts(res.results);
                    setNextPage(res.next);
                } else {
                    // Fallback if structure is different
                    setProducts(res);
                }
            } catch {
                console.log("failed to fetch");
            } finally {
                setLoading(false);
                stopLoading(); // Dismiss global loader
            }
        }
        fetchProductsFromFetch();
    }, []);

    // Load More Handler
    const loadMore = async () => {
        if (!nextPage) return;
        try {
            setLoading(true);
            const res = await fetchProductsPage(nextPage);
            if (res.results) {
                setProducts(prev => [...prev, ...res.results]);
                setNextPage(res.next);
            }
        } catch (error) {
            console.error("Failed to load more products", error);
            toastRef.current.showToast("Failed to load more products");
        } finally {
            setLoading(false);
        }
    };

    // Filter functions
    const vanila = async () => {
        const productVanila = await fetchProducts();
        setFilterd(productVanila.filter((p) => p.category?.slug === "vanila" || p.category?.name?.toLowerCase().includes("vanila")));
    };
    const strawberry = async () => {
        const productStrawberry = await fetchProducts();
        setFilterd(productStrawberry.filter((p) => p.category?.slug === "strawberry" || p.category?.name?.toLowerCase().includes("strawberry")));
    };
    const choclate = async () => {
        const productChoclates = await fetchProducts();
        setFilterd(productChoclates.filter((p) => p.category?.slug === "chocolate" || p.category?.name?.toLowerCase().includes("chocolate")));
    };
    const showAll = async () => {
        setFilterd([]); // Reset to default paginated list
        setActive(""); // Clear active filter chip
    };
    const [sortOrder, setSortOrder] = useState("asc"); // default ascending

    const sortByPrice = async () => {
        const productAll = await fetchProducts();

        const sorted = [...productAll].sort((a, b) => {
            if (sortOrder === "asc") {
                return a.price - b.price; // Low → High
            } else {
                return b.price - a.price; // High → Low
            }
        });

        setFilterd(sorted);

        // Toggle next sort order
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    };


    const handleCartClick = (item) => {
        const exists = cartItems.some((p) => p.product?.id === item.id || p.id === item.id);

        if (exists) {
            // ✅ confirmation only for remove
            setConfirmDialog({ open: true, item, type: "cart" });
        } else {
            // ✅ add immediately
            addtoCart(item);
        }
    };

    const addtoCart = async (item) => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                toastRef.current.showToast("Login first", { label: "Login", onClick: () => navigate("/login") });
                return;
            }

            const exists = cartItems.some((p) => p.product?.id === item.id || p.id === item.id);
            console.log("Adding to cart - Item ID:", item.id, "Exists:", exists, "Current cart:", cartItems);

            if (exists) {
                // Remove from cart
                const cartItem = cartItems.find((p) => p.product?.id === item.id || p.id === item.id);
                if (cartItem?.id) {
                    console.log("Removing cart item ID:", cartItem.id);
                    await removeFromCart(cartItem.id);
                }
            } else {
                // Add to cart
                console.log("Adding product ID:", item.id, "to cart");
                const result = await addToCart(item.id, 1);
                console.log("Add to cart response:", result);
            }

            // Refresh cart
            const updatedItems = await refreshCart();
            setCartItems(Array.isArray(updatedItems) ? updatedItems : []);

            toastRef.current.showToast(
                `${item.name} ${exists ? "removed from cart" : "added to cart"}`,
                { label: exists ? "Go to Cart" : "View Cart", onClick: () => navigate("/cart") }
            );
            if (navigator.vibrate) {
                navigator.vibrate(50)
            }
        } catch (err) {
            console.log("error in cart update", err);
            toastRef.current.showToast("Failed to update cart");
        }
    };

    // Wishlist toggle
    const handleWishlistClick = (item) => {
        if (wishlistIds.includes(item.id)) {
            setConfirmDialog({ open: true, item, type: "wishlist" });
        } else {
            wishListFn(item);
        }
    };

    const wishListFn = async (item) => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                toastRef.current.showToast("Login first", { label: "Login", onClick: () => navigate("/login") });
                return;
            }

            const alreadyAdded = wishlistIds.includes(item.id);

            if (alreadyAdded) {
                // Find the wishlist item to delete
                const wishlistItems = await getWishlist();
                const results = Array.isArray(wishlistItems) ? wishlistItems : (wishlistItems.results || []);
                const wishItem = results.find((w) => w.product?.id === item.id || w.id === item.id);
                if (wishItem?.id) {
                    await removeFromWishlist(wishItem.id);
                }
                toastRef.current.showToast(`${item.name} removed from wishlist`);
            } else {
                // Add to wishlist
                await addToWishlist(item.id);
                toastRef.current.showToast(`${item.name} added to wishlist`);
            }

            await refreshWishlist();

            if (navigator.vibrate) {
                navigator.vibrate(50)
            }
        } catch (err) {
            console.log("error in wishlist toggle", err);
            toastRef.current.showToast("Failed to update wishlist");
        }
    };

    const confirmRemove = () => {
        if (confirmDialog.type === "cart") addtoCart(confirmDialog.item);
        if (confirmDialog.type === "wishlist") wishListFn(confirmDialog.item);
        setConfirmDialog({ open: false, item: null, type: "" });
    };

    return (
        <>

            <div style={{ height: "80px" }} className="d-md-block d-none"></div>
            <div style={{ height: "60px" }} className="d-md-none d-block"></div>

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="container text-center mt-2 mb-3"
                style={{ maxWidth: "1000px" }}
            >
                <h2 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    fontSize: "clamp(2rem, 5vw, 2.5rem)",
                    color: "#5D372B"
                }}>
                    Premium Scoops
                </h2>
                <p style={{ color: "#8d6e63", fontSize: "clamp(0.9rem, 3vw, 1.1rem)" }}>
                    Handcrafted with passion, served with love.
                </p>
            </motion.div>

            {/* Modern Filter Chips */}
            <div
                className="container d-flex justify-content-center flex-wrap gap-2 mb-4"
                style={{ maxWidth: "1000px" }}
            >
                {[
                    { label: "All Flavors", key: "", fn: showAll },
                    { label: "Vanilla", key: "vanilla", fn: vanila },
                    { label: "Strawberry", key: "strawberry", fn: strawberry },
                    { label: "Chocolate", key: "chocolate", fn: choclate },
                    { label: sortOrder === "asc" ? "Price: Low ↑" : "Price: High ↓", key: "sort", fn: sortByPrice },
                ].map((btn) => (
                    <motion.button
                        key={btn.key}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setActive(btn.key);
                            btn.fn();
                        }}
                        className="btn"
                        style={{
                            padding: "10px 24px",
                            borderRadius: "50px",
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            border: "1px solid rgba(93, 55, 43, 0.1)",
                            background: active === btn.key
                                ? "linear-gradient(135deg, #7B4B3A, #4E342E)"
                                : "rgba(255, 255, 255, 0.6)",
                            color: active === btn.key ? "#fff" : "#5D372B",
                            backdropFilter: "blur(10px)",
                            boxShadow: active === btn.key
                                ? "0 8px 16px rgba(123, 75, 58, 0.3)"
                                : "0 4px 12px rgba(0,0,0,0.03)",
                            transition: "all 0.3s ease"
                        }}
                    >
                        {btn.label}
                    </motion.button>
                ))}
            </div>


            {/* Products Grid with Staggered Animation */}
            <div className="container px-1 px-md-3" style={{ minHeight: "30vh", position: "relative", maxWidth: "1000px" }}> {/* Reduced padding on mobile and constrained width */}

                {/* 💫 INLINE LOADER */}
                <AnimatePresence>
                    {loading && <PremiumLoader mode="inline" />}
                </AnimatePresence>

                <motion.div
                    layout
                    className="row justify-content-center g-2 g-md-4" // Use smaller gutter on mobile
                    style={{ opacity: loading ? 0.3 : 1, transition: "opacity 0.3s" }} // Fade out grid slightly
                >
                    <AnimatePresence>
                        {!loading && (filtered.length > 0 ? filtered : products).map((item) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                key={item.id} // Use ID instead of index for correct animation
                                className="col-6 col-md-4 col-lg-3 d-flex justify-content-center"
                            >
                                {/* ... existing card content ... */}
                                <div
                                    className={`card border-0 w-100 ${item.stock > 0 ? 'product-card-hover' : ''}`}
                                    style={{
                                        maxWidth: "300px",
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
                                        className="d-flex justify-content-center align-items-center p-2 position-relative image-container"
                                        style={{ background: "transparent", minHeight: "180px", borderRadius: "22px 22px 0 0" }}
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

                                        {/* LOW STOCK BADGE */}
                                        {item.stock < 10 && item.stock > 0 && (
                                            <div
                                                className="badge rounded-pill position-absolute"
                                                style={{
                                                    bottom: "10px",
                                                    left: "10px",
                                                    background: "linear-gradient(135deg, #ff4d6d, #ff6f91)",
                                                    color: "#fff",
                                                    fontSize: "0.65rem",
                                                    fontWeight: "700",
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
                                            onClick={() => item.stock > 0 && navigate(`/productDetails/${item.slug}`)}
                                            src={item.image}
                                            alt={item.name}
                                            className="img-fluid product-image"
                                            style={{
                                                maxWidth: "120px",
                                                maxHeight: "120px",
                                                objectFit: "contain",
                                                transition: "all 0.5s ease",
                                                filter: item.stock === 0 ? "grayscale(1) opacity(0.5)" : "none"
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
                                                zIndex: 4, // Above sold out overlay
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

                                    <div className="card-body text-center p-2 pt-2" style={{ background: "linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 248, 240, 0.95) 100%)", backdropFilter: "blur(5px)" }}>
                                        <h5
                                            className="text-truncate px-2"
                                            onClick={() => item.stock > 0 && navigate(`/productDetails/${item.slug}`)}
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
                                            <span style={{ fontSize: "0.65rem", color: "#6b7280", marginLeft: "4px" }}>
                                                ({item.review_count || 0})
                                            </span>
                                        </div>

                                        <p
                                            className="mb-3"
                                            style={{
                                                fontSize: "1rem",
                                                fontWeight: "700",
                                                color: item.stock === 0 ? "#999" : "#5D372B",
                                                letterSpacing: "0px",
                                            }}
                                        >
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
                                                fontSize: "0.8rem",
                                                fontWeight: 600,
                                                border: "none",
                                                boxShadow: item.stock === 0 ? "none" : "0 4px 12px rgba(93, 55, 43, 0.4)",
                                                transition: "transform 0.2s, box-shadow 0.2s",
                                                cursor: item.stock === 0 ? "not-allowed" : "pointer"
                                            }}
                                        >
                                            {item.stock === 0 ? "Out of Stock" : (cartItems.some((p) => (p.product?.id || p.id) === item.id) ? "Remove" : "Add")}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div >


                {/* Load More Button */}
                < div className="text-center mt-5 mb-5" >
                    {
                        filtered.length === 0 && (
                            <>
                                {nextPage ? (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={loadMore}
                                        disabled={loading}
                                        className="btn px-4 py-2" // Reduced padding
                                        style={{
                                            background: "transparent",
                                            border: "1px solid #7B4B3A", // Thinner, elegant border
                                            color: "#7B4B3A",
                                            borderRadius: "50px",
                                            fontWeight: "600",
                                            fontSize: "0.85rem", // Reduced font size
                                            letterSpacing: "0.5px",
                                            opacity: loading ? 0.7 : 1,
                                            transition: "all 0.3s ease",
                                            backdropFilter: "blur(5px)"
                                        }}
                                    >
                                        {loading ? "Churning..." : " More Flavors"}
                                    </motion.button>
                                ) : (
                                    products.length > 0 && (
                                        <span
                                            style={{
                                                color: "#a1887f",
                                                fontSize: "0.9rem",
                                                fontStyle: "italic",
                                                display: "block",
                                                marginTop: "20px"
                                            }}
                                        >
                                            ~ that's all the sweetness for now ~
                                        </span>
                                    )
                                )}
                            </>
                        )
                    }
                </div >
            </div >

            <div style={{ height: "20px" }}></div>
            <Footer />


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

  @keyframes soldOutPulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }

  .sold-out-badge {
    animation: soldOutPulse 2s infinite ease-in-out;
  }
      `}</style>

            <ScrollToTop />
        </>
    );
}

