import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminOrders,
  updateOrderStatus,
} from "../../api/admin/orders";
import { useAuth } from "../../context/AuthContext";
import { Badge, Card, Spinner } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { LuPackage, LuMail, LuPhone, LuMapPin, LuCalendar, LuDollarSign, LuChevronDown } from "react-icons/lu";

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
        <div className="spinner-border text-pink" role="status" style={{ color: "#ff758c" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-orders-container custom-scrollbar">
      <div className="admin-content-wrapper">
        <div className="admin-header-glass d-flex justify-content-between mb-5 align-items-center">
          <div>
            <h2 className="admin-main-title">Order Stream</h2>
            <p className="admin-subtitle">Monitoring real-time transactions and logistics</p>
          </div>
          <div className="admin-order-stats d-flex gap-3">
            <div className="order-stat-pill">
              <span className="label">Total Volume</span>
              <span className="value">₹{orders.reduce((acc, o) => acc + (parseFloat(o.total_amount) || 0), 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <AnimatePresence>
            {orders.length ? (
              orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  className="col-xl-4 col-lg-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="admin-order-card">
                    {/* Header: ID & Price */}
                    <div className="order-card-header d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <span className="order-id-badge">#{order.id}</span>
                        <span className="order-date"><LuCalendar size={12} className="me-1" /> {new Date(order.created_at || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <div className="order-price-bold">₹{order.total_amount}</div>
                    </div>

                    <div className="order-card-body">
                      {/* Customer Identity */}
                      <div className="d-flex align-items-start justify-content-between mb-4">
                        <div>
                          <h6 className="customer-name">{order.full_name}</h6>
                          <div className={`payment-status ${order.is_paid ? 'paid' : 'pending'}`}>
                            {order.is_paid ? 'Secured Payment' : 'Awaiting Payment'}
                          </div>
                        </div>
                        <div className={`order-status-badge ${order.status?.toLowerCase()}`}>
                          {order.status}
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="order-contact-stack mb-4">
                        <div className="contact-item"><LuMail size={14} /> <span>{order.user_email}</span></div>
                        <div className="contact-item"><LuPhone size={14} /> <span>{order.phone}</span></div>
                        <div className="contact-item"><LuMapPin size={14} /> <span className="text-truncate">{order.address}, {order.city}</span></div>
                      </div>

                      {/* Items Preview */}
                      <div className="order-items-preview custom-scrollbar">
                        {(order.items ?? []).map((item) => (
                          <div key={item.id} className="preview-item d-flex align-items-center">
                            <div className="item-img-mini" style={{ backgroundImage: `url(${item.product_image})` }} />
                            <div className="item-info">
                              <span className="name">{item.product_name}</span>
                              <span className="qty">× {item.quantity}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Status Control */}
                      <div className="status-control-wrapper mt-4">
                        <div className="select-container">
                          <select
                            className="admin-status-select"
                            value={order.status}
                            disabled={["delivered", "cancelled"].includes(order.status)}
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                          >
                            <option value={order.status}>{order.status} (Current)</option>
                            {order.status === "pending" && order.is_paid && <option value="shipped">Dispatch Order</option>}
                            {order.status === "shipped" && <option value="delivered">Complete Delivery</option>}
                          </select>
                          <LuChevronDown className="select-arrow" size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <LuPackage size={50} className="text-muted opacity-20 mb-3" />
                <p className="text-muted fw-bold">No orders found in the system</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .admin-orders-container {
          background: #fff8f0;
          min-height: 100vh;
          padding: 60px 40px;
          font-family: 'Poppins', sans-serif;
        }
        .admin-content-wrapper {
          max-width: 1400px;
          margin: 0 auto;
        }
        .admin-header-glass {
          background: linear-gradient(135deg, rgba(93, 55, 43, 0.05) 0%, rgba(93, 55, 43, 0.02) 100%);
          backdrop-filter: blur(10px);
          padding: 35px;
          border-radius: 30px;
          border: 1px solid rgba(93, 55, 43, 0.08);
        }
        .admin-main-title {
          font-family: 'Playfair Display', serif;
          font-weight: 800;
          color: #5D372B;
          margin: 0;
          font-size: 2.2rem;
        }
        .admin-subtitle {
          color: #8d6e63;
          font-size: 0.95rem;
          margin: 5px 0 0 0;
          font-weight: 500;
        }
        .order-stat-pill {
          background: white;
          padding: 12px 25px;
          border-radius: 18px;
          box-shadow: 0 10px 20px rgba(93, 55, 43, 0.05);
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(93, 55, 43, 0.05);
        }
        .order-stat-pill .label { font-size: 0.65rem; text-transform: uppercase; font-weight: 700; color: #8d6e63; letter-spacing: 0.5px; }
        .order-stat-pill .value { font-size: 1.2rem; font-weight: 800; color: #5D372B; }

        /* Order Card */
        .admin-order-card {
          background: white;
          border-radius: 28px;
          border: 1px solid rgba(93, 55, 43, 0.06);
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          box-shadow: 0 4px 15px rgba(0,0,0,0.01);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .admin-order-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 25px 50px rgba(93, 55, 43, 0.08);
          border-color: rgba(93, 55, 43, 0.1);
        }

        .order-card-header {
          background: #fafafa;
          padding: 15px 25px;
          border-bottom: 1px solid rgba(0,0,0,0.03);
        }
        .order-id-badge {
          background: #5D372B;
          color: white;
          padding: 4px 12px;
          border-radius: 50px;
          font-size: 0.7rem;
          font-weight: 700;
        }
        .order-date { font-size: 0.75rem; color: #8d6e63; font-weight: 600; display: flex; align-items: center; }
        .order-price-bold { font-size: 1.2rem; font-weight: 800; color: #5D372B; }

        .order-card-body { padding: 25px; flex-grow: 1; display: flex; flex-direction: column; }
        .customer-name { font-weight: 700; color: #2d3436; font-size: 1.1rem; margin: 0; }
        .payment-status { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
        .payment-status.paid { color: #2ecc71; }
        .payment-status.pending { color: #f39c12; }

        .order-status-badge {
          padding: 6px 14px;
          border-radius: 12px;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .order-status-badge.pending { background: rgba(243, 156, 18, 0.1); color: #e67e22; }
        .order-status-badge.shipped { background: rgba(52, 152, 219, 0.1); color: #2980b9; }
        .order-status-badge.delivered { background: rgba(46, 204, 113, 0.1); color: #27ae60; }
        .order-status-badge.cancelled { background: rgba(231, 76, 60, 0.1); color: #c0392b; }

        .order-contact-stack { display: flex; flex-direction: column; gap: 8px; }
        .contact-item { display: flex; align-items: center; gap: 10px; color: #8d6e63; font-size: 0.8rem; font-weight: 500; }
        .contact-item span { opacity: 0.9; }

        .order-items-preview {
          background: #f8f9fa;
          border-radius: 18px;
          padding: 15px;
          max-height: 140px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .preview-item { gap: 12px; }
        .item-img-mini { width: 40px; height: 40px; background-size: cover; background-position: center; border-radius: 10px; border: 1px solid white; flex-shrink: 0; }
        .item-info { display: flex; flex-direction: column; line-height: 1.2; }
        .item-info .name { font-size: 0.8rem; font-weight: 700; color: #2d3436; }
        .item-info .qty { font-size: 0.7rem; color: #8d6e63; font-weight: 600; }

        .status-control-wrapper { position: relative; margin-top: auto; }
        .select-container { position: relative; display: flex; align-items: center; }
        .admin-status-select {
          width: 100%;
          border: 1px solid rgba(93, 55, 43, 0.1);
          background: white;
          padding: 12px 20px;
          border-radius: 15px;
          font-size: 0.85rem;
          font-weight: 700;
          color: #5D372B;
          appearance: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .admin-status-select:hover:not(:disabled) { background: #5D372B; color: white; border-color: #5D372B; }
        .select-arrow { position: absolute; right: 15px; pointer-events: none; opacity: 0.5; }
        .admin-status-select:hover + .select-arrow { color: white; opacity: 1; }

        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(93, 55, 43, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
