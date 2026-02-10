import { useContext, useEffect, useState } from "react";
import { useLoading } from "../../context/LoadingContext";
import { SearchContext } from "../../context/SearchContext";
import Navbar from "../../components/Layout/Navbar";
import { updateUser, fetchUser } from "../../components/Fetch/FetchUser";
import { useNavigate } from "react-router-dom";
import ScrollToTop from "../../components/Common/ScrollToTop";
import Footer from "../../components/Layout/Footer";
import { getCart, addToCart, removeFromCart } from "../../api/user/cart";
import { getWishlist, addToWishlist, removeFromWishlist } from "../../api/user/wishlist";
import { LuTrash2, LuCheck, LuX, LuShoppingCart, LuEye } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "../../components/Common/ConfirmationModal";

export default function RecentlyViewed({ toastRef }) {
    const { recentlyViewedProduct, setRecentlyViewedProducts, wishlistIds = [], setWishlistIds, setProductDetails, setCartCount } = useContext(SearchContext);
    const { startLoading, stopLoading } = useLoading();
    const [userId, setUserId] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();
    const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null, type: "" });
    const [selectedIds, setSelectedIds] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    useEffect(() => {
        // get userId from localStorage
        const id = localStorage.getItem("userId");
        setUserId(id);

        if (id) {
            startLoading();
            async function loadData() {
                try {
                    const user = await fetchUser(id);
                    setRecentlyViewedProducts(user.recently_viewed || []);

                    // Fetch wishlist to sync IDs
                    const wishlistItems = await getWishlist();
                    const ids = Array.isArray(wishlistItems) ? wishlistItems.map((item) => item.product?.id || item.id) : [];
                    setWishlistIds(ids);

                    // Fetch cart to sync button state
                    const cart = await getCart();
                    const items = Array.isArray(cart) ? cart : [];
                    setCartItems(items);
                    setCartCount(items.length);
                } catch (err) {
                    console.error("Failed to fetch recently viewed", err);
                } finally {
                    stopLoading();
                }
            }
            loadData();
        } else {
            stopLoading();
        }
    }, [setWishlistIds, setCartCount, setRecentlyViewedProducts]);

    const handleClearAll = async () => {
        if (!userId) return;

        try {
            const user = await fetchUser(userId);
            await updateUser(userId, { recently_viewed_ids: [] });
            setRecentlyViewedProducts([]);
            setSelectedIds([]);
            setIsSelectionMode(false);
            toastRef?.current?.showToast("History cleared");
        } catch (err) {
            console.log("Error clearing recently viewed", err);
        }
    };

    const toggleSelection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === recentlyViewedProduct.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(recentlyViewedProduct.map(p => p.id));
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0 || !userId) return;

        try {
            const updatedList = recentlyViewedProduct.filter(p => !selectedIds.includes(p.id));
            const updatedIds = updatedList.map(p => p.id);

            await updateUser(userId, { recently_viewed_ids: updatedIds });
            setRecentlyViewedProducts(updatedList);
            setSelectedIds([]);
            setIsSelectionMode(false);
            toastRef?.current?.showToast(`${selectedIds.length} items removed`);
        } catch (err) {
            console.error("Bulk delete failed:", err);
            toastRef?.current?.showToast("Failed to delete items");
        }
    };

    if (!recentlyViewedProduct || recentlyViewedProduct.length === 0) {
        return (
            <>
                <Navbar />
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100vh",
                    }}
                >
                    <p className="text-center mt-3">No recently viewed products</p>
                </div>
            </>
        );
    }

    // Add / remove cart
    const handleCartClick = (item) => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            toastRef?.current?.showToast("Login first", { label: "Login", onClick: () => navigate("/login") });
            return;
        }
        const exists = cartItems.some((p) => p.product?.id === item.id || p.id === item.id);
        if (exists) {
            setConfirmDialog({ open: true, item, type: "cart" });
        } else {
            updateCart(item);
        }
    };

    const updateCart = async (item) => {
        const token = localStorage.getItem("accessToken");
        // Ensure userId is available or fetch it if needed, but we rely on token for API usually
        // The original code used userId for some operations, but addToCart API usually depends on token

        try {
            const currentCart = await getCart();
            const items = Array.isArray(currentCart) ? currentCart : [];
            const existingItem = items.find(ci => ci.product?.id === item.id || ci.id === item.id);

            if (existingItem) {
                await removeFromCart(existingItem.id);
            } else {
                await addToCart(item.id, 1);
            }

            // Refresh cart
            const updatedCart = await getCart();
            const updatedItems = Array.isArray(updatedCart) ? updatedCart : [];
            setCartItems(updatedItems);
            setCartCount(updatedItems.length);

            toastRef?.current?.showToast(
                `${item.name} ${existingItem ? "removed from" : "added to"} cart`,
                { label: "View Cart", onClick: () => navigate("/cart") }
            );

            if (navigator.vibrate) navigator.vibrate(50);

        } catch (err) {
            console.error("Cart operation failed:", err);
            toastRef?.current?.showToast("Failed to update cart");
        }
    };

    // Wishlist toggle
    const handleWishlistClick = (item) => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            toastRef?.current?.showToast("Login first", { label: "Login", onClick: () => navigate("/login") });
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
                toastRef?.current?.showToast(`${item.name} removed from wishlist`);
            } else {
                await addToWishlist(item.id);
                setWishlistIds((prev) => [...prev, item.id]);
                toastRef?.current?.showToast(`${item.name} added to wishlist`);
            }
            if (navigator.vibrate) navigator.vibrate(50);
        } catch (err) {
            console.error("Wishlist operation failed:", err);
            toastRef?.current?.showToast("Failed to update wishlist");
        }
    };

    const confirmRemove = () => {
        if (confirmDialog.type === "cart") updateCart(confirmDialog.item);
        if (confirmDialog.type === "wishlist") updateWishlist(confirmDialog.item);
        setConfirmDialog({ open: false, item: null, type: "" });
    };

    return (
        <>
            <Navbar />
            <div style={{ height: "40px" }}></div>

            <div className="container my-4 pb-5">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: "2rem" }}
                >
                    <h1 style={{ fontFamily: "Poppins, sans-serif", fontWeight: "700", color: "#111", textAlign: "center", fontSize: "2rem" }}>
                        Recently Viewed
                    </h1>
                    <p style={{ color: "#8d6e63", textAlign: "center", fontSize: "0.9rem" }}>
                        Flavors you've explored recently
                    </p>
                </motion.div>

                <div className="d-flex justify-content-between align-items-center mb-4 px-2">
                    <div className="d-flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setIsSelectionMode(!isSelectionMode);
                                setSelectedIds([]);
                            }}
                            className="btn px-3 d-flex align-items-center gap-2"
                            style={{
                                borderRadius: "50px",
                                background: isSelectionMode ? "#5D372B" : "rgba(93, 55, 43, 0.05)",
                                color: isSelectionMode ? "#fff" : "#5D372B",
                                border: "1px solid rgba(93, 55, 43, 0.1)",
                                fontSize: "0.85rem",
                                fontWeight: "600"
                            }}
                        >
                            {isSelectionMode ? <LuCheck size={16} /> : <LuTrash2 size={16} />}
                            {isSelectionMode ? "Done" : "Manage"}
                        </motion.button>

                        {isSelectionMode && (
                            <motion.button
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={toggleSelectAll}
                                className="btn px-3"
                                style={{
                                    borderRadius: "50px",
                                    background: "rgba(93, 55, 43, 0.05)",
                                    color: "#5D372B",
                                    border: "1px solid rgba(93, 55, 43, 0.1)",
                                    fontSize: "0.85rem",
                                    fontWeight: "600"
                                }}
                            >
                                {selectedIds.length === recentlyViewedProduct.length ? "Deselect All" : "Select All"}
                            </motion.button>
                        )}
                    </div>

                </div>

                <motion.div
                    className="row g-4"
                    layout
                >
                    <AnimatePresence>
                        {recentlyViewedProduct.map((item, index) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                transition={{ delay: index * 0.05 }}
                                className="col-6 col-md-4 col-lg-3"
                            >
                                <div
                                    className={`card border-0 h-100 position-relative ${item.stock > 0 ? 'product-card-hover' : ''}`}
                                    onClick={() => isSelectionMode ? toggleSelection(item.id) : null}
                                    style={{
                                        borderRadius: "24px",
                                        background: "rgba(255, 248, 240, 0.8)",
                                        backdropFilter: "blur(10px)",
                                        border: selectedIds.includes(item.id) ? "2px solid #5D372B" : "1px solid rgba(93, 55, 43, 0.05)",
                                        boxShadow: "0 10px 30px rgba(93, 55, 43, 0.05)",
                                        overflow: "hidden",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        transform: selectedIds.includes(item.id) ? "scale(0.98)" : "scale(1)"
                                    }}
                                >
                                    {/* SELECTION OVERLAY */}
                                    {isSelectionMode && (
                                        <div
                                            className="position-absolute d-flex align-items-center justify-content-center"
                                            style={{
                                                top: "12px",
                                                left: "12px",
                                                zIndex: 10,
                                                width: "24px",
                                                height: "24px",
                                                borderRadius: "6px",
                                                background: selectedIds.includes(item.id) ? "#5D372B" : "rgba(255,255,255,0.8)",
                                                border: "2px solid #5D372B",
                                                transition: "all 0.2s"
                                            }}
                                        >
                                            {selectedIds.includes(item.id) && <LuCheck color="#fff" size={14} />}
                                        </div>
                                    )}

                                    <div className="p-3 text-center position-relative">
                                        {item.stock === 0 && (
                                            <div
                                                className="position-absolute d-flex align-items-center justify-content-center"
                                                style={{ inset: 0, background: "rgba(255,255,255,0.4)", backdropFilter: "blur(1px)", zIndex: 5 }}
                                            >
                                                <span className="badge rounded-pill bg-dark py-2 px-3">OUT OF STOCK</span>
                                            </div>
                                        )}

                                        <motion.img
                                            src={item.image}
                                            alt={item.name}
                                            style={{
                                                width: "110px",
                                                height: "110px",
                                                objectFit: "contain",
                                                filter: item.stock === 0 ? "grayscale(1) opacity(0.5)" : "none",
                                                marginBottom: "0.5rem"
                                            }}
                                            whileHover={!isSelectionMode ? { scale: 1.1, y: -5 } : {}}
                                        />

                                        {/* Stock Badge */}
                                        {item.stock > 0 && item.stock < 10 && (
                                            <div className="mb-2">
                                                <span className="badge rounded-pill" style={{ background: "rgba(255, 77, 109, 0.1)", color: "#ff4d6d", fontSize: "0.65rem", fontWeight: "600", border: "1px solid rgba(255, 77, 109, 0.2)" }}>
                                                    Only {item.stock} left
                                                </span>
                                            </div>
                                        )}

                                        <h5 style={{ fontSize: "0.85rem", fontWeight: "700", color: "#111", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "Poppins, sans-serif" }}>
                                            {item.name}
                                        </h5>

                                        {/* Star Rating */}
                                        <div className="d-flex justify-content-center align-items-center mb-2 gap-1" style={{ opacity: item.stock === 0 ? 0.3 : 1 }}>
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} style={{ color: (item.average_rating || 0) > i ? "#fbbf24" : "#e5e7eb", fontSize: "0.8rem" }}>★</span>
                                            ))}
                                            <span style={{ fontSize: "0.6rem", color: "#888", marginLeft: "2px" }}>({item.review_count || 0})</span>
                                        </div>

                                        <p style={{ color: "#5D372B", fontWeight: "700", fontSize: "0.95rem", marginBottom: "1rem" }}>
                                            ₹{item.price}
                                        </p>

                                        {!isSelectionMode && (
                                            <div className="d-flex gap-2">
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/productDetails/${item.slug}`); }}
                                                    className="btn p-2 flex-grow-1"
                                                    style={{ borderRadius: "12px", background: "rgba(93, 55, 43, 0.05)", border: "none" }}
                                                >
                                                    <LuEye size={18} color="#5D372B" />
                                                </motion.button>
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={(e) => { e.stopPropagation(); handleCartClick(item); }}
                                                    className="btn p-2 flex-grow-1"
                                                    style={{
                                                        borderRadius: "12px",
                                                        background: cartItems.some(i => i.product?.id === item.id) ? "#5D372B" : "#7B4B3A",
                                                        color: "#fff",
                                                        border: "none"
                                                    }}
                                                >
                                                    <LuShoppingCart size={18} />
                                                </motion.button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* FLOATING ACTION BAR FOR MULTI-SELECT */}
            <AnimatePresence>
                {isSelectionMode && selectedIds.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed-bottom d-flex justify-content-center p-4"
                        style={{ zIndex: 1200 }}
                    >
                        <div
                            className="d-flex align-items-center gap-4 px-4 py-3"
                            style={{
                                background: "#111",
                                color: "#fff",
                                borderRadius: "30px",
                                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                                border: "1px solid rgba(255,255,255,0.1)"
                            }}
                        >
                            <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>
                                {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
                            </span>
                            <div style={{ height: "24px", width: "1px", background: "rgba(255,255,255,0.2)" }} />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleDeleteSelected}
                                className="btn btn-link p-0 text-decoration-none d-flex align-items-center gap-2"
                                style={{ color: "#ff4d6d", fontWeight: "700", fontSize: "0.9rem" }}
                            >
                                <LuTrash2 size={18} />
                                Delete
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
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
    display: inline-block;
  }
            `}</style>

            <Footer />
            <ScrollToTop />
        </>
    );
}
