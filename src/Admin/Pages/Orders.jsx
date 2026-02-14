import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminOrders,
  updateOrderStatus,
} from "../../api/admin/orders";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { LuPackage, LuMail, LuPhone, LuMapPin, LuCalendar, LuChevronDown } from "react-icons/lu";
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggeredChildren: 0.1 }
  }
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /*  HARD ADMIN GUARD */
  if (authLoading) return null;
  if (!isAdmin) {
    navigate("/login", { replace: true });
    return null;
  }

  /* ================= FETCH ORDERS ================= */
  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getAdminOrders();
        setOrders(data?.results ?? data ?? []);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, { status });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status } : o
        )
      );
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status. " + (err.response?.data?.status || err.response?.data?.detail || ""));
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" variant="danger" />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="admin-orders-container custom-scrollbar"
    >
      <div className="admin-content-wrapper">
        <div className="admin-header-glass d-flex flex-column flex-md-row justify-content-between mb-4 mb-md-5 align-items-md-center gap-3">
          <div>
            <h2 className="admin-main-title">Order Stream</h2>
            <p className="admin-subtitle text-muted small">Monitoring real-time transactions and logistics</p>
          </div>
          <div className="admin-order-stats d-flex gap-2">
            <div className="order-stat-pill">
              <span className="label">Total Vol</span>
              <span className="value">₹{orders.reduce((acc, o) => acc + (parseFloat(o.total_amount) || 0), 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="row g-3 g-md-4">
          <AnimatePresence>
            {orders.length ? (
              orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  className="col-12 col-md-6 col-xl-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="admin-order-card">
                    {/* Header: ID & Price */}
                    <div className="order-card-header d-flex justify-content-between align-items-center bg-light px-3 py-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className="order-id-badge">#{order.id}</span>
                        <span className="order-date small text-muted"><LuCalendar size={12} className="me-1" /> {new Date(order.created_at || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <div className="order-price-bold h6 mb-0 text-bronze fw-bold">₹{order.total_amount}</div>
                    </div>

                    <div className="order-card-body p-3">
                      {/* Customer Identity */}
                      <div className="d-flex align-items-start justify-content-between mb-3">
                        <div className="overflow-hidden">
                          <h6 className="customer-name text-truncate mb-1">{order.full_name}</h6>
                          <div className={`payment-status small fw-bold ${order.is_paid ? 'text-success' : 'text-warning'}`}>
                            {order.is_paid ? 'Paid' : 'Pending Payment'}
                          </div>
                        </div>
                        <div className={`order-status-badge small px-2 py-1 rounded-pill ${order.status?.toLowerCase()}`}>
                          {order.status}
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="order-contact-stack mb-3">
                        <div className="contact-item d-flex align-items-center gap-2 small text-muted mb-1 text-truncate">
                          <LuMail size={12} /> <span>{order.user_email}</span>
                        </div>
                        <div className="contact-item d-flex align-items-center gap-2 small text-muted mb-1">
                          <LuPhone size={12} /> <span>{order.phone}</span>
                        </div>
                        <div className="contact-item d-flex align-items-center gap-2 small text-muted text-truncate">
                          <LuMapPin size={12} /> <span>{order.address}, {order.city}</span>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="order-items-preview bg-white border rounded-3 p-2 mb-3 custom-scrollbar" style={{ maxHeight: '100px', overflowY: 'auto' }}>
                        {(order.items ?? []).map((item) => (
                          <div key={item.id} className="preview-item d-flex align-items-center gap-2 mb-2 p-1 rounded-2 hover-bg-light">
                            <div className="item-img-mini rounded-2 bg-light" style={{ width: '32px', height: '32px', backgroundImage: `url(${item.product_image})`, backgroundSize: 'cover' }} />
                            <div className="item-info flex-grow-1 overflow-hidden">
                              <div className="name small fw-bold text-truncate">{item.product_name}</div>
                              <div className="qty smaller text-muted">Qty: {item.quantity}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Status Control */}
                      <div className="status-control-wrapper mt-auto">
                        <div className="select-container position-relative">
                          <select
                            className="admin-status-select w-100 border rounded-2 p-2 small fw-bold"
                            value={order.status}
                            disabled={["delivered", "cancelled"].includes(order.status)}
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                            style={{ appearance: 'none', background: '#fff' }}
                          >
                            <option value={order.status}>{order.status} (Current)</option>
                            {order.status === "pending" && order.is_paid && <option value="shipped">Dispatch Order</option>}
                            {order.status === "shipped" && <option value="delivered">Complete Delivery</option>}
                          </select>
                          <LuChevronDown className="position-absolute end-0 me-2 pointer-events-none opacity-50" size={14} style={{ top: '50%', transform: 'translateY(-50%)' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <LuPackage size={40} className="text-muted opacity-50 mb-2" />
                <p className="text-muted small">No orders found in the system</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .admin-orders-container {
          background: #fff8f0;
          min-height: 100vh;
          padding: 20px 15px;
          font-family: 'Poppins', sans-serif;
        }
        @media (min-width: 768px) {
          .admin-orders-container { padding: 40px; }
        }

        .admin-header-glass {
          background: linear-gradient(135deg, rgba(93, 55, 43, 0.05) 0%, rgba(93, 55, 43, 0.02) 100%);
          backdrop-filter: blur(10px);
          padding: 20px;
          border-radius: 20px;
          border: 1px solid rgba(93, 55, 43, 0.1);
        }
        @media (min-width: 768px) {
          .admin-header-glass { padding: 30px; border-radius: 30px; }
        }

        .admin-main-title {
          font-family: 'Playfair Display', serif;
          font-weight: 800;
          color: #5D372B;
          margin: 0;
          font-size: 1.6rem;
        }
        @media (min-width: 768px) {
          .admin-main-title { font-size: 2.2rem; }
        }

        .order-stat-pill {
          background: white;
          padding: 8px 15px;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(93, 55, 43, 0.05);
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(93, 55, 43, 0.05);
        }
        .order-stat-pill .label { font-size: 0.6rem; text-transform: uppercase; font-weight: 700; color: #8d6e63; }
        .order-stat-pill .value { font-size: 1rem; font-weight: 800; color: #5D372B; }

        .admin-order-card {
          background: white;
          border-radius: 20px;
          border: 1px solid rgba(93, 55, 43, 0.08);
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .admin-order-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(93, 55, 43, 0.08); }

        .order-id-badge {
          background: #5D372B;
          color: white;
          padding: 2px 10px;
          border-radius: 50px;
          font-size: 0.65rem;
          font-weight: 700;
        }

        .order-status-badge.pending { background: rgba(243, 156, 18, 0.1); color: #e67e22; }
        .order-status-badge.shipped { background: rgba(52, 152, 219, 0.1); color: #2980b9; }
        .order-status-badge.delivered { background: rgba(46, 204, 113, 0.1); color: #27ae60; }
        .order-status-badge.cancelled { background: rgba(231, 76, 60, 0.1); color: #c0392b; }

        .admin-status-select:hover:not(:disabled) { border-color: #5D372B; box-shadow: 0 0 0 2px rgba(93, 55, 43, 0.1); background: #fdfdfd; }
        
        .text-bronze { color: #5D372B; }
        .hover-bg-light:hover { background-color: #f8f9fa; }
        .smaller { font-size: 0.7rem; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(93, 55, 43, 0.1); border-radius: 10px; }
      `}</style>
    </motion.div>
  );
}
