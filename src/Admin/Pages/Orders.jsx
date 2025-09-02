import { useEffect, useState, useContext } from "react";
import { fetchUsers, updateUserPayment } from "../fetch";
import { Card, Badge } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { CheckCircleFill, ClockFill } from "react-bootstrap-icons";
import { OrdersLengthContext } from "../Context/OrdersContext";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [deliveryTimes, setDeliveryTimes] = useState({});
  const { setOrdersLength, setTotalOrders } = useContext(OrdersLengthContext);

  useEffect(() => {
    async function updateOrdersDb() {
      const res = await fetchUsers();
      const allOrders = res.flatMap((user) => user.payment || []);
      setOrders(allOrders);
      setTotalOrders(allOrders);
      setOrdersLength(allOrders.length);
    }
    updateOrdersDb();
  }, []);

  return (
    <div className="container-fluid py-5" style={{ background: "#f5f5f7", minHeight: "100vh" }}>
      <h2 className="text-center mb-5 fw-bold" style={{ fontFamily: "SF Pro Display, sans-serif", letterSpacing: "-0.5px", color: "#111" }}>
        🛒 Recent Orders
      </h2>

      <div className="row g-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.bookingId || order.razorpayId} className="col-xl-4 col-lg-6 col-md-6 col-sm-12">
              <Card className="order-card shadow-sm rounded-4 border-0 overflow-hidden h-100">
                {/* Header */}
                <div className="order-card-header d-flex justify-content-between align-items-center p-3">
                  <h4 className="mb-0 fw-bold text-dark">₹{order.amount}</h4>
                  <small className="text-muted">{order.time}</small>
                </div>

                {/* Body */}
                <Card.Body className="p-4">
                  {/* Customer Row */}
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3 customer-avatar">
                      {order.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h6 className="mb-0 fw-semibold">{order.name}</h6>
                      <small className="text-muted">{order.ph}</small>
                    </div>
                    <Badge bg={order.status === "paid" ? "success" : "warning"} className="ms-auto px-3 py-2 rounded-pill d-flex align-items-center">
                      {order.status === "paid" ? <CheckCircleFill size={14} className="me-1" /> : <ClockFill size={14} className="me-1" />}
                      {order.status}
                    </Badge>
                  </div>

                  {/* Delivery Info */}
                  <p className="text-muted mb-1"><strong>Address:</strong> {order.address}</p>
                  <p className="text-muted mb-1"><strong>Pin code:</strong> {order.pin}</p>
                  <p className="text-muted mb-1"><strong>Booking ID:</strong> {order.bookingId}</p>
                  <p className="text-muted mb-3"><strong>Payment ID:</strong> {order.razorpayId}</p>

                  {/* Delivery Time Dropdown */}
                  <button className="btn btn-light border rounded-3 shadow-sm px-4 py-2 dropdown-toggle mb-3 w-100 text-start" type="button" id={`deliveryDropdown-${order.bookingId}`} data-bs-toggle="dropdown" aria-expanded="false">
                    {deliveryTimes[order.bookingId] ? deliveryTimes[order.bookingId] : order.deliveryTime || "Set Delivery Time"}
                  </button>
                  <ul className="dropdown-menu shadow-sm border-0 rounded-3 w-100">
                    {["within 30 min", "within 45 min", "within 1hour min"].map((time) => (
                      <li key={time}>
                        <button className="dropdown-item py-2 px-3" onClick={async () => {
                          setDeliveryTimes(prev => ({ ...prev, [order.bookingId]: time }));
                          try { await updateUserPayment(order.userId, order.razorpayId, { deliveryTime: time }); } 
                          catch (err) { console.error("Failed to update delivery time", err); }
                        }}>
                          {time === "within 30 min" ? "30 Minutes" : time === "within 45 min" ? "45 Minutes" : "1 Hour"}
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* Products */}
                  <div>
                    <h6 className="fw-semibold mb-3">🛍️ Products</h6>
                    {order.products && order.products.map((p) => (
                      <div key={p.id} className="product-card d-flex align-items-center mb-2 border rounded p-2 shadow-sm">
                        <img src={p.image} alt={p.name} className="product-image" />
                        <div>
                          <p className="mb-0 fw-medium">{p.name}</p>
                          <small className="text-muted">Qty: {p.quantity} • ₹{p.price}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))
        ) : (
          <p className="text-center text-muted">No orders found</p>
        )}
      </div>

      {/* Premium CSS */}
      <style>{`
        .order-card {
          background: #fff;
          transition: all 0.4s ease;
          cursor: pointer;
        }
        .order-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.12);
        }
        .order-card-header {
          background: linear-gradient(90deg, #f7f7f7, #fafafa);
          border-bottom: 1px solid #eee;
        }
        .customer-avatar {
          width: 50px;
          height: 50px;
          background: #e0e0eb;
          font-weight: 600;
          font-size: 1.2rem;
          color: #333;
        }
        .product-card {
          background: #fdfdfd;
          transition: all 0.3s ease;
          border-radius: 12px;
        }
        .product-card:hover {
          background: #f3f3f3;
        }
        .product-image {
          width: 50px;
          height: 50px;
          object-fit: contain;
          border-radius: 8px;
          margin-right: 12px;
        }
        @media (max-width: 1200px) {
          .order-card {
            margin-bottom: 1rem;
          }
        }
        @media (max-width: 768px) {
          .order-card {
            margin-bottom: 1rem;
          }
        }
        @media (max-width: 576px) {
          .order-card {
            margin-bottom: 1rem;
          }
          .customer-avatar {
            width: 45px;
            height: 45px;
            font-size: 1rem;
          }
          .product-image {
            width: 45px;
            height: 45px;
          }
        }
      `}</style>
    </div>
  );
}
