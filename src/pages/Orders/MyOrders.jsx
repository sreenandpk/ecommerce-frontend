import { useEffect, useState } from "react";
import { fetchMyOrders } from "../../api/user/order";
import { useLoading } from "../../context/LoadingContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Layout/Navbar";
import Footer from "../../components/Layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Clock, CheckCircle, Truck, Info, ChevronRight, Calendar, AlertCircle } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import Lottie from "lottie-react";
import deliveredAnim from "../../jsonAnimation/delivered.json";
import deliveryAnim from "../../jsonAnimation/delivery.json";
import pendingAnim from "../../jsonAnimation/pending.json";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const { stopLoading } = useLoading();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchMyOrders();
        // Handle both paginated and direct array responses
        const results = data?.results || data || [];
        setOrders(Array.isArray(results) ? results : []);
      } catch (err) {
        console.error("Failed to fetch orders");
      } finally {
        setIsInitialLoading(false);
        stopLoading();
      }
    };

    loadOrders();
    window.scrollTo(0, 0);
  }, []);

  const getStatusBadge = (status, isPaid) => {
    const s = status?.toLowerCase();

    // Custom label for unpaid pending orders
    if (s === 'pending' && !isPaid) {
      return (
        <span className="order-badge-glass pending">
          <Clock size={14} /> Awaiting Payment
        </span>
      );
    }

    switch (s) {
      case "pending":
        return (
          <span className="order-badge-glass pending">
            <Clock size={14} /> Pending
          </span>
        );
      case "paid":
      case "confirmed":
        return (
          <span className="order-badge-glass confirmed">
            <CheckCircle size={14} /> Paid
          </span>
        );
      case "shipped":
        return (
          <span className="order-badge-glass shipped">
            <Truck size={14} /> Shipped
          </span>
        );
      case "delivered":
        return (
          <span className="order-badge-glass delivered">
            <CheckCircle size={14} /> Delivered
          </span>
        );
      case "cancelled":
        return (
          <span className="order-badge-glass cancelled">
            <AlertCircle size={14} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="order-badge-glass default">
            <Info size={14} /> {status || "Processing"}
          </span>
        );
    }
  };

  const getDeliveryTimer = (order) => {
    if (order.status?.toLowerCase() !== 'shipped') return null;

    // Use updated_at for timer start, fallback to created_at
    const shippedDate = new Date(order.updated_at || order.updatedAt || order.created_at || order.createdAt);
    const timeDiff = currentTime - shippedDate;
    const totalMinutes = 20;
    const millisecondsIn20Mins = totalMinutes * 60 * 1000;
    const remainingTime = millisecondsIn20Mins - timeDiff;

    if (remainingTime <= 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="delivery-warning-glass mt-3"
        >
          <div className="d-flex align-items-center gap-2 mb-1">
            <Info size={16} />
            <span className="fw-bold">Delivery Status Update</span>
          </div>
          <p className="mb-0">
            Our team is taking extra care to ensure your order arrives in perfect condition.
            Thank you for your patience! We're nearly there.
          </p>
        </motion.div>
      );
    }

    const minutes = Math.floor(remainingTime / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);

    return (
      <div className="delivery-timer-box mt-3 d-flex align-items-center gap-3">
        <div className="timer-icon-pulse">
          <Clock size={18} className="text-chocolate" />
        </div>
        <div className="d-flex flex-column">
          <span className="timer-label">Est. Arrival</span>
          <span className="timer-value">{minutes}m {seconds.toString().padStart(2, '0')}s</span>
        </div>
      </div>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 25, stiffness: 120 }
    }
  };

  return (
    <div className="my-orders-page">
      <div style={{ height: "80px" }} className="d-none d-md-block"></div>
      <div style={{ height: "120px" }} className="d-md-none d-block"></div>
      <Navbar />

      <main className="container py-3">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-5 mt-4"
        >
          <h1 className="page-title mb-2">My Legacy</h1>
          <p className="quote-text text-muted">A curated collection of your premium choices</p>
          <div className="title-underline mx-auto"></div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="orders-grid row justify-content-center g-5"
        >
          {orders.length > 0 ? (
            orders
              .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
              .map((order) => (
                <motion.div
                  key={order.id}
                  variants={cardVariants}
                  whileHover={{
                    y: -10,
                    scale: 1.02,
                    rotateX: 1,
                    rotateY: -1,
                    transition: { duration: 0.3 }
                  }}
                  className="col-12 col-lg-9 col-xl-8"
                  style={{ perspective: "1000px" }}
                >
                  <div className="order-card-glass shimmer-effect">
                    {/* Card Header */}
                    <div className="order-card-header d-flex flex-wrap justify-content-between align-items-center gap-4">
                      <div className="d-flex align-items-center gap-4">
                        <div className="order-icon-box">
                          <Package size={22} strokeWidth={1.5} />
                        </div>
                        <div className="header-text-group">
                          <h5 className="mb-0 fw-bold order-id">Order ID: #{String(order.id || order.razorpayId || "").slice(-8)}</h5>
                          <p className="mb-0 text-muted small date-text">
                            <Calendar size={12} className="me-1 inline-icon" />
                            {new Date(order.created_at || order.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="header-status-group d-flex align-items-center gap-4">
                        <div className="order-total-box">
                          <span className="label">Total</span>
                          <span className="value">₹{Number(order.total_amount || order.amount || 0).toLocaleString()}</span>
                        </div>
                        <div className="badge-wrapper">
                          {getStatusBadge(String(order.status || ""), order.is_paid)}
                        </div>
                        <div className="animation-wrapper-right ms-2 me-5">
                          {order.status?.toLowerCase() === 'delivered' ? (
                            <Lottie animationData={deliveredAnim} loop={true} style={{ width: 130, height: 130 }} />
                          ) : order.status?.toLowerCase() === 'shipped' ? (
                            <Lottie animationData={deliveryAnim} loop={true} style={{ width: 130, height: 130 }} />
                          ) : order.status?.toLowerCase() === 'pending' ? (
                            <Lottie animationData={pendingAnim} loop={true} style={{ width: 90, height: 90 }} />
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Shipping Info Badge - "More Information" */}
                    <div className="shipping-info-strip mt-2 d-flex align-items-center gap-3">
                      <div className="info-pill">
                        <span className="text-muted small text-uppercase fw-bold" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>Shipping To</span>
                        <span className="fw-bold d-block text-truncate" style={{ maxWidth: '180px', fontSize: '0.8rem' }}>{order.full_name || "Valued Customer"}</span>
                      </div>
                      <div className="vr opacity-25"></div>
                      <div className="info-pill">
                        <span className="text-muted small text-uppercase fw-bold" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>Address</span>
                        <span className="fw-bold d-block text-truncate" style={{ maxWidth: '220px', fontSize: '0.8rem' }}>{order.city}, {order.address?.slice(0, 20)}...</span>
                      </div>
                      <div className="vr opacity-25"></div>
                      <div className="info-pill">
                        <span className="text-muted small text-uppercase fw-bold" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>Contact</span>
                        <span className="fw-bold d-block" style={{ fontSize: '0.8rem' }}>{order.phone}</span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="card-divider my-2"></div>

                    {/* Product Scrollable List */}
                    <div className="order-products-container mt-1">
                      <div className="order-products-scroll custom-scrollbar">
                        {(order.items || order.products || [])?.map((item, idx) => {
                          const productName = item.product?.name || item.product_name || item.name || "Savoring Flavors";
                          const productImage = item.product?.image || item.product_image || item.image;
                          const productSlug = item.product?.slug || item.product_slug || item.id || "#";

                          return (
                            <div key={idx} className="order-product-item">
                              <motion.div
                                whileHover={{ scale: 0.95 }}
                                className="product-img-wrapper"
                              >
                                <img
                                  src={productImage}
                                  alt={productName}
                                  onClick={() => navigate(`/productDetails/${productSlug}`)}
                                />
                              </motion.div>
                              <div className="product-info">
                                <h6 className="product-name" title={String(productName)}>{String(productName)}</h6>
                                <span className="qty-pill">Qty: {item.quantity}</span>
                                <span className="price-text">₹{Number(item.subtotal || item.product_price || item.total_price || ((item.price || item.product?.price || 0) * (item.quantity || 1)) || (item.amount || 0)).toLocaleString()}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {getDeliveryTimer(order)}

                    {/* Card Actions */}
                    <div className="order-card-footer mt-2 d-flex justify-content-between align-items-center">
                      <div className="order-footer-info">
                        <span className="text-muted small" style={{ fontSize: '0.75rem' }}>Items: {(order.items || order.products)?.length}</span>
                      </div>
                      <div className="d-flex gap-3">
                        {(!order.is_paid && !['cancelled', 'delivered'].includes(order.status?.toLowerCase())) && (
                          <button
                            className="btn-modern-elite"
                            onClick={() => navigate(`/payment/${order.id}`)}
                          >
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
          ) : !isInitialLoading ? (
            <div className="text-center py-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="empty-orders-premium p-5 rounded-5"
              >
                <div className="empty-lottie-wrapper mb-4">
                  <Lottie animationData={pendingAnim} loop={true} style={{ width: 200, height: 200, margin: '0 auto', opacity: 0.6 }} />
                </div>
                <h2 className="premium-empty-title mb-3">Your Journey Awaits</h2>
                <p className="premium-empty-text mb-4">You haven't placed any orders yet. Start your premium experience with our curated collections.</p>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(93, 55, 43, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-elite-action"
                  onClick={() => navigate("/products")}
                >
                  Explore Collections
                </motion.button>
              </motion.div>
            </div>
          ) : null}
        </motion.div>
      </main>

      <Footer />

      <style>{`
        .my-orders-page {
          background: #fff8f0;
          min-height: 100vh;
          font-family: 'Poppins', sans-serif;
          color: #2d3436;
        }

        .page-title {
          font-family: 'Playfair Display', serif;
          color: #5D372B;
          letter-spacing: -1px;
          font-size: 2.5rem;
        }

        .quote-text {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          opacity: 0.8;
          font-size: 1rem !important;
        }

        .title-underline {
          width: 60px;
          height: 3px;
          background: #5D372B;
          border-radius: 2px;
          margin-top: 10px;
          opacity: 0.3;
        }

        .order-card-glass {
          background: rgba(255, 248, 240, 0.65);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid rgba(93, 55, 43, 0.1);
          border-radius: 25px;
          padding: 20px;
          box-shadow: 0 15px 40px rgba(93, 55, 43, 0.04);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }

        .order-card-glass:hover {
          box-shadow: 0 40px 80px rgba(93, 55, 43, 0.12);
          background: rgba(255, 248, 240, 0.92);
          border-color: rgba(93, 55, 43, 0.3);
        }

        .shimmer-effect::after {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to bottom right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.05) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: rotate(45deg);
          animation: shimmer 10s infinite;
          pointer-events: none;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }

        .order-icon-box {
          width: 45px;
          height: 45px;
          background: linear-gradient(135deg, rgba(93, 55, 43, 0.1), rgba(93, 55, 43, 0.02));
          color: #5D372B;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          border: 1px solid rgba(93, 55, 43, 0.05);
        }

        .order-id {
          font-family: 'Playfair Display', serif;
          font-size: 1rem;
          color: #5D372B;
        }

        .date-text {
          font-weight: 500;
          letter-spacing: 0.5px;
          font-size: 0.75rem !important;
        }

        .order-total-box {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          text-align: right;
        }

        .order-total-box .label {
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #8d6e63;
          font-weight: 700;
          margin-bottom: 2px;
        }

        .order-total-box .value {
          font-size: 1.1rem;
          font-weight: 800;
          color: #5D372B;
        }

        /* Status Badges */
        .order-badge-glass {
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          backdrop-filter: blur(10px);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .order-badge-glass.pending {
          background: rgba(217, 160, 4, 0.15);
          color: #9d7402;
          border: 1px solid rgba(217, 160, 4, 0.25);
          box-shadow: 0 0 15px rgba(217, 160, 4, 0.1);
        }

        .order-badge-glass.confirmed {
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.15);
        }

        .order-badge-glass.shipped {
          background: rgba(59, 130, 246, 0.12);
          color: #1d4ed8;
          border: 1px solid rgba(59, 130, 246, 0.15);
        }

        .order-badge-glass.delivered {
          background: rgba(5, 150, 105, 0.15);
          color: #047857;
          border: 1px solid rgba(5, 150, 105, 0.2);
        }

        .order-badge-glass.cancelled {
          background: rgba(239, 68, 68, 0.12);
          color: #dc2626;
          border: 1px solid rgba(239, 68, 68, 0.15);
        }

        .card-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(93, 55, 43, 0.1), transparent);
        }

        /* Product List */
        .order-products-scroll {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-bottom: 10px;
          padding-top: 5px;
        }

        .order-product-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          padding: 6px 0;
          border-radius: 0;
          border-bottom: 1px solid rgba(93, 55, 43, 0.05);
          min-width: 100%;
        }
        .order-product-item:last-child {
          border-bottom: none;
        }

        .product-img-wrapper {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          overflow: hidden;
          background: transparent;
          border: none;
          flex-shrink: 0;
          position: relative;
        }

        .product-img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 2px;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .product-info {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 10px;
        }

        .product-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: #3d4547;
          margin-bottom: 0;
          flex-grow: 1;
        }

        .qty-pill {
          background: rgba(93, 55, 43, 0.06);
          padding: 2px 8px;
          border-radius: 100px;
          font-size: 0.65rem;
          font-weight: 700;
          color: #5D372B;
          white-space: nowrap;
        }

        .price-text {
          font-weight: 800;
          color: #5D372B;
          font-size: 0.85rem;
          white-space: nowrap;
        }

        /* Footer Actions */
        .btn-glass-text {
          background: rgba(93, 55, 43, 0.05);
          border: 1px solid rgba(93, 55, 43, 0.1);
          color: #5D372B;
          font-weight: 700;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 100px;
          transition: all 0.3s ease;
        }

        .btn-glass-text:hover {
          background: rgba(93, 55, 43, 0.1);
          transform: translateX(3px);
        }

        .btn-glass-text:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          filter: grayscale(1);
        }

        .btn-modern-elite {
          background: #5D372B;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          box-shadow: 0 10px 20px rgba(93, 55, 43, 0.2);
          transition: all 0.3s ease;
        }

        .btn-modern-elite:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(93, 55, 43, 0.3);
          background: #4a2c22;
        }

        /* Empty State */
        .empty-orders-glass {
          background: rgba(255, 248, 240, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(93, 55, 43, 0.1);
          box-shadow: 0 30px 60px rgba(93, 55, 43, 0.05);
          max-width: 600px;
          margin: 0 auto;
        }

        .empty-icon-wrapper {
            opacity: 0.2;
            animation: pulse 4s infinite ease-in-out;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.1; }
            50% { transform: scale(1.1); opacity: 0.3; }
        }

        .btn-elite-action {
            background: #5D372B;
            color: white;
            border: none;
            padding: 15px 40px;
            border-radius: 100px;
            font-size: 1.1rem;
            font-weight: 800;
            box-shadow: 0 15px 30px rgba(93, 55, 43, 0.25);
            transition: all 0.3s ease;
        }

        .btn-elite-action:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(93, 55, 43, 0.4);
        }

        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(93, 55, 43, 0.03);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(93, 55, 43, 0.15);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(93, 55, 43, 0.3);
        }

        .delivery-timer-box {
          background: rgba(93, 55, 43, 0.04);
          padding: 12px 20px;
          border-radius: 20px;
          border: 1px solid rgba(93, 55, 43, 0.08);
          display: inline-flex;
          align-items: center;
        }

        .timer-icon-pulse {
          animation: timer-pulse 2s infinite ease-in-out;
          color: #5D372B;
        }

        @keyframes timer-pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }

        .timer-label {
          font-weight: 700;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #8d6e63;
          line-height: 1;
          margin-bottom: 2px;
        }

        .timer-value {
          font-weight: 800;
          font-size: 1.1rem;
          color: #5D372B;
          font-family: 'Poppins', sans-serif;
          line-height: 1;
        }

        .delivery-warning-glass {
          background: rgba(217, 160, 4, 0.06);
          border: 1px solid rgba(217, 160, 4, 0.12);
          padding: 18px 25px;
          border-radius: 25px;
          color: #9d7402;
          font-size: 0.9rem;
          font-weight: 500;
          line-height: 1.6;
          max-width: 500px;
        }

        @media (max-width: 768px) {
          .order-card-glass {
            padding: 30px 20px;
          }
          .order-id {
            font-size: 1.2rem;
          }
          .order-total-box .value {
            font-size: 1.3rem;
          }
           .header-status-group {
             width: 100%;
             justify-content: space-between;
           }
           .page-title {
             font-size: 2rem !important;
           }
           .order-card-glass {
             padding: 20px 15px !important;
             border-radius: 20px !important;
           }
           .order-icon-box {
             width: 38px !important;
             height: 38px !important;
           }
           .order-id {
             font-size: 0.9rem !important;
           }
           .header-text-group {
             max-width: 60%;
           }
           .shipping-info-strip {
             flex-direction: column;
             align-items: flex-start !important;
             gap: 8px !important;
           }
           .shipping-info-strip .vr {
             display: none;
           }
           .info-pill span {
             max-width: 100% !important;
           }
           .animation-wrapper-right {
             margin-right: 0 !important;
           }
        }

        .empty-orders-premium {
          background: rgba(255, 248, 240, 0.4);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(93, 55, 43, 0.08);
          box-shadow: 0 20px 40px rgba(93, 55, 43, 0.03);
          max-width: 700px;
          margin: 0 auto;
          border-radius: 40px;
        }

        .premium-empty-title {
          font-family: 'Playfair Display', serif;
          color: #5D372B;
          font-weight: 800;
          font-size: 2rem;
        }

        .premium-empty-text {
          font-size: 1rem;
          color: #8d6e63;
          max-width: 80%;
          margin-left: auto;
          margin-right: auto;
        }
      `}</style>
    </div>
  );
}
