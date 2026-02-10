import { useContext, useEffect, useState } from "react";
import { useLoading } from "../../context/LoadingContext";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../../components/Layout/Navbar";
import { SearchContext } from "../../context/SearchContext";
import { infoToast } from "../../components/Common/Toast";
import { getWishlist, removeFromWishlist as removeWishlistItem } from "../../api/user/wishlist";
import { getCart, addToCart, removeFromCart } from "../../api/user/cart";
import { useNavigate } from "react-router-dom";
import ScrollToTop from "../../components/Common/ScrollToTop";
import Lottie from "lottie-react";
import emptyWishlistAnim from "../../../jsonAnimation/emptyCart.json";
// Using Lucide Icons for a more modern, standard look
import { LuEye, LuTrash2, LuCheck, LuShoppingCart, LuX } from "react-icons/lu";
import Footer from "../../components/Layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "../../components/Common/ConfirmationModal";

export default function Wishlist({ toastRef }) {
  const [likedProducts, setLikedProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const { setWishlistIds, setWishlistCount, setCartCount, wishlistIds, setProductDetails } =
    useContext(SearchContext);
  const navigate = useNavigate();
  const { stopLoading } = useLoading();
  const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null, type: "" });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) stopLoading();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        stopLoading();
        return;
      }

      try {
        const wishlistResponse = await getWishlist();
        const wishlistItems = Array.isArray(wishlistResponse) ? wishlistResponse : [];
        const products = wishlistItems.map(wi => wi.product || wi).reverse();

        setLikedProducts(products);
        setWishlistIds(wishlistItems.map(wi => wi.product?.id || wi.id));
        setWishlistCount(wishlistItems.length);

        const cartResponse = await getCart();
        const items = Array.isArray(cartResponse) ? cartResponse : [];
        setCartItems(items);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        stopLoading();
      }
    }
    fetchData();
  }, [setWishlistIds, setWishlistCount]);

  const addtoCart = async (item) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toastRef?.current?.showToast("Login first", { label: "Login", onClick: () => navigate("/login") });
        return;
      }

      const cartData = await getCart();
      const items = Array.isArray(cartData) ? cartData : [];
      const existingItem = items.find(ci => ci.product?.id === item.id || ci.id === item.id);
      if (existingItem) {
        // Intercept removal for confirmation
        setConfirmDialog({
          open: true,
          item: { ...item, cartId: existingItem.id },
          type: "cart"
        });
      } else {
        await addToCart(item.id, 1);
        toastRef?.current?.showToast(`${item.name} added to cart`, { label: "View Cart", onClick: () => navigate("/cart") });

        const updatedCart = await getCart();
        setCartItems(Array.isArray(updatedCart) ? updatedCart : []);
        setCartCount(Array.isArray(updatedCart) ? updatedCart.length : 0);
      }

      const updatedCart = await getCart();
      setCartItems(Array.isArray(updatedCart) ? updatedCart : []);
      setCartCount(Array.isArray(updatedCart) ? updatedCart.length : 0);

      if (navigator.vibrate) navigator.vibrate(50);
    } catch (err) {
      console.error("Error in cart update", err);
      toastRef?.current?.showToast("Failed to update cart");
    }
  };

  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === likedProducts.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(likedProducts.map((p) => p.id));
    }
  };

  const handleRemoveClick = (item) => {
    setConfirmDialog({ open: true, item, type: "single" });
  };

  const handleBulkDeleteClick = () => {
    setConfirmDialog({ open: true, item: "selected", type: "bulk" });
  };

  const executeDelete = async () => {
    try {
      if (confirmDialog.type === "cart") {
        await removeFromCart(confirmDialog.item.cartId);
        const updatedCart = await getCart();
        setCartItems(Array.isArray(updatedCart) ? updatedCart : []);
        setCartCount(Array.isArray(updatedCart) ? updatedCart.length : 0);
        toastRef?.current?.showToast(`${confirmDialog.item.name} removed from cart`);
      } else {
        const wishlistResponse = await getWishlist();
        const wishlistItems = Array.isArray(wishlistResponse) ? wishlistResponse : [];

        const itemsToDeleteIds = confirmDialog.type === "bulk" ? selectedItems : [confirmDialog.item.id];

        const requests = [];
        for (const prodId of itemsToDeleteIds) {
          const wishlistItem = wishlistItems.find(wi => (wi.product?.id === prodId) || (wi.id === prodId));
          if (wishlistItem) {
            requests.push(removeWishlistItem(wishlistItem.id));
          }
        }

        await Promise.all(requests);

        const updatedWishlist = await getWishlist();
        const updatedItems = Array.isArray(updatedWishlist) ? updatedWishlist : [];
        const products = updatedItems.map(wi => wi.product || wi).reverse();

        setLikedProducts(products);
        setWishlistIds(updatedItems.map(wi => wi.product?.id || wi.id));
        setWishlistCount(updatedItems.length);
        setSelectedItems([]);

        const msg = confirmDialog.type === "bulk" ? `${itemsToDeleteIds.length} items removed` : "Item removed";
        toastRef?.current?.showToast(msg);
      }

      if (navigator.vibrate) navigator.vibrate(50);
      setConfirmDialog({ open: false, item: null, type: "" });
    } catch (err) {
      console.error("Error removing:", err);
      toastRef?.current?.showToast("Failed to remove items");
    }
  };

  return (
    <>
      <div style={{ height: "30px" }}></div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mt-5 mb-5"
      >
        <motion.h4
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
            color: "#5D372B",
            letterSpacing: "-0.5px",
            marginBottom: "10px"
          }}
        >
          My Collection
        </motion.h4>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "80px" }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{ height: "4px", background: "#5D372B", margin: "0 auto", borderRadius: "2px" }}
        ></motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          style={{
            color: "#8d6e63",
            fontSize: "0.95rem",
            fontWeight: "400",
            marginTop: "10px",
            fontFamily: "'Poppins', sans-serif"
          }}
        >
          Curated Exclusively for You ({wishlistIds.length} {wishlistIds.length === 1 ? "Item" : "Items"})
        </motion.p>

        {likedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="d-flex justify-content-center align-items-center gap-3 mt-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="btn btn-select-all"
              onClick={toggleSelectAll}
            >
              {selectedItems.length === likedProducts.length ? "Deselect All" : "Select All Items"}
            </motion.button>

            <AnimatePresence>
              {selectedItems.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 20 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="btn btn-bulk-delete"
                  onClick={handleBulkDeleteClick}
                >
                  <LuTrash2 size={18} style={{ marginRight: "8px" }} />
                  Delete Selected ({selectedItems.length})
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      <div className="container pb-5" style={{ minHeight: "60vh" }}>
        <div className="row g-3 g-md-4 justify-content-center">
          <AnimatePresence>
            {likedProducts.length > 0 ? (
              likedProducts.map((item, index) => (
                <motion.div
                  key={item.id || index}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                  transition={{
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1], // Custom bounce-out ease
                    delay: index * 0.1
                  }}
                  className="col-12 col-sm-6 col-md-4 col-lg-3"
                >
                  <div className={`showcase-card ${selectedItems.includes(item.id) ? "selected" : ""}`}>
                    {/* Visual Section */}
                    <div className="card-visual">
                      <div className="visual-background"></div>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="visual-img"
                        onClick={() => {
                          setProductDetails(item);
                          navigate(`/productDetails/${item.slug}`);
                        }}
                      />

                      {/* Big Eye Hover Overlay */}
                      <div
                        className="eye-overlay"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProductDetails(item);
                          navigate(`/productDetails/${item.slug}`);
                        }}
                      >
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          whileHover={{ scale: 1.15 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="big-eye-icon"
                        >
                          <LuEye size={24} />
                        </motion.div>
                      </div>

                      {/* Checkbox */}
                      <div className="select-badge" onClick={() => toggleSelect(item.id)}>
                        <div className={`checkbox-circle ${selectedItems.includes(item.id) ? "active" : ""}`}>
                          <LuCheck size={14} color={selectedItems.includes(item.id) ? "#fff" : "transparent"} />
                        </div>
                      </div>
                    </div>

                    {/* Info Section */}
                    <div className="card-info">
                      <div className="d-flex justify-content-between align-items-start w-100">
                        <div>
                          <motion.h3
                            whileHover={{ x: 5 }}
                            className="info-title"
                            onClick={() => {
                              setProductDetails(item);
                              navigate(`/productDetails/${item.slug}`);
                            }}
                          >
                            {item.name}
                          </motion.h3>
                          <div className="info-tags mt-1">
                            {item.category && (
                              <span className="cat-tag">
                                {typeof item.category === "object" ? item.category.name : item.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="info-actions">
                        <h5 className="price-tag">₹{item.price}</h5>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`cart-action-btn ${cartItems.some((p) => (p.product?.id || p.id) === item.id) ? "remove-mode" : ""}`}
                          onClick={() => addtoCart(item)}
                        >
                          <LuShoppingCart size={16} style={{ marginRight: "6px" }} />
                          {cartItems.some((p) => (p.product?.id || p.id) === item.id) ? "Remove" : "Add to Cart"}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-center my-4 col-12 d-flex flex-column align-items-center"
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 1, -1, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Lottie
                    animationData={emptyWishlistAnim}
                    style={{ height: 180, margin: "0 auto", filter: "drop-shadow(0 15px 25px rgba(0,0,0,0.05))" }}
                  />
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    color: "#5D372B",
                    fontFamily: "'Playfair Display', serif",
                    marginTop: "20px",
                    fontSize: "1.8rem",
                    fontWeight: "700"
                  }}
                >
                  Your Favorites List is Empty
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-muted mt-1 mb-4"
                  style={{ maxWidth: "400px", fontFamily: "'Poppins', sans-serif", fontSize: "1rem" }}
                >
                  It looks like you haven't added any sweet treats to your collection yet. Start exploring our premium selections!
                </motion.p>

                <motion.button
                  whileHover={{ scale: 1.05, shadow: "0 15px 30px rgba(93, 55, 43, 0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-brown-premium"
                  style={{ padding: "12px 30px", fontSize: "1rem" }}
                  onClick={() => navigate("/products")}
                >
                  Explore Collection
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmationModal
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, item: null, type: "" })}
        onConfirm={executeDelete}
        title={
          confirmDialog.type === "bulk" ? "Clear Selection" :
            confirmDialog.type === "cart" ? "Remove from Cart" :
              "Remove Item"
        }
        message={
          confirmDialog.type === "bulk"
            ? `Are you sure you want to remove ${selectedItems.length} items from your collection?` :
            confirmDialog.type === "cart"
              ? `Remove "${confirmDialog.item?.name}" from your shopping cart?`
              : `Remove "${confirmDialog.item?.name}" from your collection?`
        }
        confirmLabel="Confirm"
        confirmColor="#d63031"
      />

      <style>{`
        /* --- Buttons --- */
        .btn-select-all {
            border: 1px solid #bcaaa4;
            color: #8d6e63;
            border-radius: 30px;
            padding: 6px 16px;
            font-weight: 500;
            font-size: 0.85rem;
            transition: all 0.2s;
            background: transparent;
        }
        .btn-select-all:hover {
            border-color: #5D372B;
            color: #5D372B;
            background: rgba(93, 55, 43, 0.05);
        }
        
        .btn-bulk-delete {
            background: #ff4757;
            color: white;
            border: none;
            border-radius: 30px;
            padding: 6px 18px;
            font-weight: 600;
            font-size: 0.85rem;
            box-shadow: 0 4px 12px rgba(255, 71, 87, 0.2);
            display: flex;
            align-items: center;
        }
        .btn-bulk-delete:hover {
            background: #ff4757 !important;
            color: white !important;
        }
        
        .btn-brown-premium {
            background: #5D372B;
            color: white;
            padding: 10px 25px;
            border-radius: 50px;
            font-size: 0.95rem;
            border: none;
        }

        /* --- Compact Showcase Card --- */
        .showcase-card {
            display: flex;
            flex-direction: column;
            background: linear-gradient(135deg, rgba(255, 248, 240, 0.6) 0%, rgba(255, 248, 240, 0.35) 100%); 
            backdrop-filter: blur(15px) saturate(160%);
            -webkit-backdrop-filter: blur(15px) saturate(160%);
            border-radius: 24px; 
            overflow: hidden; 
            transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
            border: 1px solid rgba(255, 255, 255, 0.4); 
            height: 100%;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        }
        .showcase-card:hover {
            transform: translateY(-8px) scale(1.02);
            background: rgba(255, 248, 240, 0.65);
            box-shadow: 0 25px 50px rgba(93, 55, 43, 0.12);
            border-color: rgba(93, 55, 43, 0.15);
        }
        .showcase-card.selected {
            background: rgba(93, 55, 43, 0.1);
            border-color: rgba(93, 55, 43, 0.3);
        }

        /* Visual Top */
        .card-visual {
            width: 100%;
            height: 180px;
            position: relative;
            background: rgba(255, 248, 240, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            z-index: 2;
        }
        .visual-img {
            max-width: 70%;
            max-height: 70%;
            object-fit: contain;
            transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
            cursor: pointer;
        }
        .showcase-card:hover .visual-img {
            transform: scale(1.1);
        }

        /* Hover Overlay */
        .eye-overlay {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255,248,240,0.3);
            backdrop-filter: blur(2px);
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 10;
        }
        .card-visual:hover .eye-overlay {
            opacity: 1;
        }
        
        .big-eye-icon {
            color: #5D372B;
        }
        
        .select-badge {
            position: absolute;
            top: 12px;
            left: 12px;
            z-index: 15;
            cursor: pointer;
        }
        .checkbox-circle {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 1.5px solid #bcaaa4;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255,255,255,0.8);
        }
        .checkbox-circle.active {
            background: #5D372B;
            border-color: #5D372B;
        }

        /* Info Bottom */
        .card-info {
            padding: 15px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            flex: 1;
        }
        .info-title {
            font-family: 'Poppins', sans-serif;
            font-size: 0.95rem;
            font-weight: 700;
            color: #111;
            margin: 0;
            cursor: pointer;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .cat-tag {
            background: rgba(93, 55, 43, 0.05);
            color: #8d6e63;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.65rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .info-actions {
            margin-top: auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-top: 10px;
            border-top: 1px solid rgba(93, 55, 43, 0.05);
        }
        
        .price-tag {
            font-size: 1.1rem;
            font-weight: 700;
            color: #5D372B;
            margin: 0;
        }
        
        .cart-action-btn {
            background: #2d3436;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 30px;
            font-weight: 600;
            font-size: 0.75rem;
            display: flex;
            align-items: center;
            transition: all 0.3s;
        }
        .cart-action-btn.remove-mode {
             background: transparent;
             border: 1px solid #ff4757;
             color: #ff4757;
        }
        .cart-action-btn.remove-mode:hover {
             border-color: #ff4757;
             color: #ff4757;
        }
        @media (max-width: 576px) {
            .showcase-card {
                flex-direction: row;
                height: 140px;
                background: rgba(255, 248, 240, 0.65);
                border-radius: 20px;
            }
            .card-visual {
                width: 120px;
                height: 100%;
                background: transparent;
            }
            .visual-img {
                max-width: 80%;
                max-height: 80%;
            }
            .card-info {
                padding: 12px 15px;
                justify-content: center;
                gap: 2px;
            }
            .info-title {
                font-size: 0.9rem;
                white-space: nowrap;
                margin-bottom: 2px;
                height: auto;
            }
            .price-tag {
                font-size: 1rem;
            }
            .cart-action-btn {
                padding: 6px 14px;
                font-size: 0.75rem;
                border-radius: 30px;
            }
            .cat-tag {
                font-size: 0.6rem;
            }
            .info-actions {
                padding-top: 8px;
                border: none;
            }
        }
        @media (max-width: 400px) {
            .card-visual { width: 100px; }
            .cart-action-btn span { display: none; }
            .cart-action-btn { padding: 8px; }
            .info-title { font-size: 0.85rem; }
            .price-tag { font-size: 0.95rem; }
        }
      `}</style>
      <ScrollToTop />
      <Footer />
    </>
  );
}
