import { useContext, useEffect, useState } from "react";
import { useLoading } from "../../context/LoadingContext";
import Navbar from "../../components/Layout/Navbar";
import { SearchContext } from "../../context/SearchContext";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Layout/Footer";
import ScrollToTop from "../../components/Common/ScrollToTop";
import Lottie from "lottie-react";
import emptyCartAnimation from "../../../jsonAnimation/emptyCart.json";
import ConfirmationModal from "../../components/Common/ConfirmationModal";
import { getCart, removeFromCart, updateCartQuantity } from "../../api/user/cart";
import { motion, AnimatePresence } from "framer-motion";
import { LuTrash2, LuPlus, LuMinus, LuShoppingBag, LuArrowRight, LuCreditCard } from "react-icons/lu";

export default function Cart() {
  const [addedProducts, setAddedProducts] = useState([]);
  const [cartTotalItems, setCartTotalItems] = useState(0);
  const [cartTotalPrice, setCartTotalPrice] = useState(0);
  const { setCartCount, setBookingProducts } = useContext(SearchContext);
  const [isLogin, setIsLogin] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { stopLoading } = useLoading();

  useEffect(() => {
    async function loadCart() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLogin(false);
        setAddedProducts([]);
        setCartCount(0);
        setCartTotalItems(0);
        setCartTotalPrice(0);
        setLoading(false);
        return;
      }

      try {
        setIsLogin(true);
        const cartItems = await getCart();
        const items = Array.isArray(cartItems) ? cartItems : [];
        updateState(items);
      } catch (err) {
        console.error("Failed to load cart:", err);
        setAddedProducts([]);
      } finally {
        setLoading(false);
        stopLoading();
      }
    }
    loadCart();
  }, [setCartCount]);

  const incrementQuantity = async (item) => {
    try {
      const newQuantity = (item.quantity || 1) + 1;
      await updateCartQuantity(item.id, newQuantity);
      const updatedCart = await getCart();
      updateState(updatedCart);
    } catch (err) {
      console.error("Failed to increment quantity:", err);
    }
  };

  const decrementQuantity = async (item) => {
    try {
      const newQuantity = (item.quantity || 1) - 1;
      if (newQuantity > 0) {
        await updateCartQuantity(item.id, newQuantity);
      } else {
        handleRemoveClick(item);
        return;
      }
      const updatedCart = await getCart();
      updateState(updatedCart);
    } catch (err) {
      console.error("Failed to decrement quantity:", err);
    }
  };

  const confirmRemove = async () => {
    try {
      await removeFromCart(confirmDialog.item.id);
      const updatedCart = await getCart();
      updateState(updatedCart);
      setConfirmDialog({ open: false, item: null });
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  const handleRemoveClick = (item) => setConfirmDialog({ open: true, item });

  const handleBuyAll = async () => {
    if (addedProducts.length <= 0) return;
    setBookingProducts(addedProducts);
    navigate("/booking");
  };

  const updateState = (cart) => {
    const items = Array.isArray(cart) ? cart : [];
    setAddedProducts(items);
    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.product?.price || item.price || 0) * (item.quantity || 1), 0);
    setCartCount(totalItems);
    setCartTotalItems(totalItems);
    setCartTotalPrice(totalPrice);
  };

  return (
    <>
      <Navbar />
      <style>{`
        .cart-page {
          background: #fff8f0;
          min-height: 100vh;
          padding-top: 40px;
          padding-bottom: 80px;
        }
        .cart-header-title {
          font-family: 'Playfair Display', serif;
          font-weight: 800;
          color: #5D372B;
          font-size: clamp(2rem, 5vw, 3rem);
          margin-bottom: 8px;
        }
        .cart-header-stats {
          font-family: 'Poppins', sans-serif;
          color: #8d6e63;
          font-size: 1rem;
          margin-bottom: 40px;
        }

        /* --- Cart Item Card --- */
        .cart-item-card {
          background: linear-gradient(135deg, rgba(255, 248, 240, 0.7) 0%, rgba(255, 248, 240, 0.4) 100%);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 1px solid rgba(93, 55, 43, 0.1);
          border-radius: 24px;
          padding: 30px;
          display: flex;
          align-items: center;
          gap: 30px;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          box-shadow: 0 4px 20px rgba(93, 55, 43, 0.03);
          margin-bottom: 20px;
        }
        .cart-item-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 248, 240, 0.85);
          box-shadow: 0 20px 40px rgba(93, 55, 43, 0.08);
          border-color: rgba(93, 55, 43, 0.2);
        }

        .cart-item-img-wrapper {
          width: 150px;
          height: 150px;
          background: transparent;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: none;
        }
        .cart-item-img {
          width: 80%;
          height: 80%;
          object-fit: contain;
          transition: transform 0.5s ease;
        }
        .cart-item-card:hover .cart-item-img {
          transform: scale(1.1) rotate(5deg);
        }

        .cart-item-info h5 {
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          color: #2d3436;
          margin-bottom: 4px;
          font-size: 1.1rem;
        }
        .cart-item-info .price {
          font-weight: 700;
          color: #5D372B;
          font-size: 1.2rem;
        }
        .cart-item-info .category {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #8d6e63;
          letter-spacing: 1px;
          font-weight: 600;
          background: rgba(93, 55, 43, 0.05);
          padding: 3px 10px;
          border-radius: 10px;
          display: inline-block;
          margin-bottom: 10px;
        }

        /* --- Quantity Controls --- */
        .qty-box {
          display: flex;
          align-items: center;
          gap: 15px;
          background: rgba(93, 55, 43, 0.04);
          padding: 5px 12px;
          border-radius: 50px;
          border: 1px solid rgba(93, 55, 43, 0.08);
        }
        .qty-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: rgba(93, 55, 43, 0.08);
          color: #5D372B;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .qty-btn:hover {
          transform: scale(1.1);
        }
        .qty-val {
          font-weight: 700;
          font-size: 1.1rem;
          color: #2d3436;
          min-width: 25px;
          text-align: center;
        }

        .remove-btn {
          background: rgba(255, 77, 109, 0.05);
          color: #ff4d6d;
          border: none;
          padding: 8px 16px;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
        }
        .remove-btn:hover {
          background: #ff4d6d;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 77, 109, 0.2);
        }
        .remove-btn:active {
          transform: translateY(0);
        }

        .item-subtotal-box {
          text-align: right;
          margin-left: 20px;
        }
        .item-subtotal-label {
          font-size: 0.7rem;
          color: #8d6e63;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 2px;
          font-weight: 600;
        }
        .item-subtotal-value {
          font-size: 1.1rem;
          font-weight: 750;
          color: #5D372B;
        }

        /* --- Summary Panel --- */
        .summary-card {
          background: rgba(255, 248, 240, 0.85);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          color: #5D372B;
          border-radius: 30px;
          padding: 35px;
          position: sticky;
          top: 120px;
          box-shadow: 0 20px 50px rgba(93, 55, 43, 0.1);
          border: 1px solid rgba(93, 55, 43, 0.1);
        }
        .summary-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 30px;
          letter-spacing: -0.5px;
          color: #5D372B;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 18px;
          font-size: 1rem;
          color: #8d6e63;
        }
        .summary-row.total {
          margin-top: 25px;
          padding-top: 25px;
          border-top: 1px solid rgba(93, 55, 43, 0.1);
          color: #5D372B;
          font-weight: 800;
          font-size: 1.5rem;
        }
        .checkout-btn {
          width: 100%;
          padding: 18px;
          border-radius: 50px;
          background: #5D372B;
          color: #fff8f0;
          font-weight: 700;
          font-size: 1.1rem;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 30px;
          transition: all 0.3s;
        }
        .checkout-btn:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 30px rgba(93, 55, 43, 0.2);
          background: #3e241c;
        }

        /* --- Empty State --- */
        .empty-cart-container {
           background: white;
           padding: 60px;
           border-radius: 40px;
           box-shadow: 0 20px 40px rgba(93, 55, 43, 0.05);
        }
        .continue-shopping-btn {
          background: #5D372B;
          color: white;
          padding: 12px 30px;
          border-radius: 50px;
          border: none;
          font-weight: 600;
          transition: all 0.3s;
          margin-top: 20px;
        }
        .continue-shopping-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 20px rgba(93, 55, 43, 0.2);
        }

        @media (max-width: 991px) {
          .summary-card {
            position: relative;
            top: 0;
            margin-top: 40px;
          }
          .cart-item-card {
            flex-direction: row;
            padding: 15px;
          }
          .cart-item-img-wrapper {
            width: 80px;
            height: 80px;
          }
        }
        @media (max-width: 576px) {
          .cart-item-card {
            gap: 12px;
          }
          .cart-item-info h5 { font-size: 0.95rem; }
          .cart-item-info .price { font-size: 1rem; }
          .qty-box { gap: 8px; padding: 3px 8px; }
          .qty-btn { width: 28px; height: 28px; font-size: 0.9rem; }
        }
      `}</style>

      <div className="cart-page">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="cart-header-title">Your Cart</h1>
            <p className="cart-header-stats">
              {cartTotalItems} items ready for checkout
            </p>
          </motion.div>

          <div className="row g-4">
            {isLogin && addedProducts.length > 0 ? (
              <>
                {/* Left Side: Items */}
                <div className="col-lg-8">
                  <AnimatePresence mode="popLayout">
                    {addedProducts.map((item, index) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        transition={{ delay: index * 0.05 }}
                        className="cart-item-card"
                      >
                        <div className="cart-item-img-wrapper">
                          <img
                            src={item.product?.image || item.image}
                            alt={item.product?.name || item.name}
                            className="cart-item-img"
                          />
                        </div>

                        <div className="cart-item-info flex-grow-1">
                          {(item.product?.category || item.category) && (
                            <span className="category">
                              {typeof (item.product?.category || item.category) === 'object'
                                ? (item.product?.category?.name || item.category?.name)
                                : (item.product?.category || item.category)}
                            </span>
                          )}
                          <h5>{item.product?.name || item.name}</h5>
                          <p className="price">₹{item.product?.price || item.price}</p>
                        </div>

                        <div className="d-flex align-items-center gap-3 gap-md-5">
                          <div className="qty-box">
                            <motion.button
                              whileTap={{ scale: 0.8 }}
                              onClick={() => decrementQuantity(item)}
                              className="qty-btn"
                            >
                              <LuMinus size={16} />
                            </motion.button>
                            <span className="qty-val">{item.quantity || 1}</span>
                            <motion.button
                              whileTap={{ scale: 0.8 }}
                              onClick={() => incrementQuantity(item)}
                              className="qty-btn"
                            >
                              <LuPlus size={16} />
                            </motion.button>
                          </div>

                          <div className="item-subtotal-box d-none d-md-block">
                            <span className="item-subtotal-label">Subtotal</span>
                            <span className="item-subtotal-value">₹{(item.product?.price || item.price) * (item.quantity || 1)}</span>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRemoveClick(item)}
                            className="remove-btn"
                          >
                            <LuTrash2 size={18} />
                            <span>Remove</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Right Side: Summary */}
                <div className="col-lg-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="summary-card"
                  >
                    <h3 className="summary-title">Summary</h3>

                    <div className="summary-row">
                      <span>Subtotal ({cartTotalItems} items)</span>
                      <span>₹{cartTotalPrice}</span>
                    </div>
                    <div className="summary-row">
                      <span>Delivery Fee</span>
                      <span className="text-success">FREE</span>
                    </div>
                    <div className="summary-row">
                      <span>Tax (GST)</span>
                      <span>₹0</span>
                    </div>

                    <div className="summary-row total">
                      <span>Total</span>
                      <span>₹{cartTotalPrice}</span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBuyAll}
                      className="checkout-btn"
                    >
                      Check out <LuArrowRight size={20} />
                    </motion.button>

                  </motion.div>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-12"
              >
                <div className="empty-cart-container text-center">
                  <div className="d-flex justify-content-center mb-4">
                    <Lottie animationData={emptyCartAnimation} loop={true} style={{ height: 280 }} />
                  </div>
                  <h2 className="fw-bold mb-3" style={{ color: '#5D372B' }}>
                    {isLogin ? "Your cart is still empty" : "Experience Excellence"}
                  </h2>
                  <p className="text-muted mx-auto" style={{ maxWidth: '400px' }}>
                    {isLogin
                      ? "Browse our exclusive collections and treat yourself to something extraordinary today."
                      : "Login to your account to view your carefully curated shopping bag."}
                  </p>

                  {isLogin ? (
                    <button
                      className="continue-shopping-btn"
                      onClick={() => navigate("/")}
                    >
                      Explore Products
                    </button>
                  ) : (
                    <button
                      className="continue-shopping-btn"
                      onClick={() => navigate("/login")}
                    >
                      Login to continue
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, item: null })}
        onConfirm={confirmRemove}
        title="Remove Item?"
        message={
          <>
            Do you want to remove <strong>{confirmDialog.item?.product?.name || confirmDialog.item?.name}</strong> from your cart?
          </>
        }
        confirmLabel="Yes, Remove"
        confirmColor="#ff4d6d"
      />

      <Footer />
      <ScrollToTop />
    </>
  );
}



