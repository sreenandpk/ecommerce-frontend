import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { fetchUser, updateUser } from "../Fetch/FetchUser";
import Navbar from "../../Navbar/Navbar";
import Footer from "../Home/Footer";
import ScrollToTop from "../ScrollTop";
import { AiOutlineCheckCircle } from "react-icons/ai";

export default function Orders() {
  const [productBooked, setProductBooked] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});
  const [deliveryTimeLeft, setDeliveryTimeLeft] = useState({});

  useEffect(() => {
    async function fetchBookedUser() {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const bookedUser = await fetchUser(userId);
        setProductBooked(bookedUser.payment || []);
      } catch (error) {
        console.error("Error fetching user orders:", error);
      }
    }
    fetchBookedUser();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const updatedCancelTimes = {};
      const updatedDeliveryTimes = {};

      productBooked.forEach((order) => {
        const orderTime = new Date(order.createdAt).getTime();
        const cancelWindow = 10 * 60 * 1000;
        const deliveryWindow = 30 * 60 * 1000;

        updatedCancelTimes[order.razorpayId] = Math.max(cancelWindow - (now - orderTime), 0);
        updatedDeliveryTimes[order.razorpayId] = Math.max(deliveryWindow - (now - orderTime), 0);
      });

      setTimeLeft(updatedCancelTimes);
      setDeliveryTimeLeft(updatedDeliveryTimes);
    }, 1000);

    return () => clearInterval(interval);
  }, [productBooked]);

  const handleCancel = async (razorpayId) => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const userData = await fetchUser(userId);
    const updatedPayments = userData.payment.filter((p) => p.razorpayId !== razorpayId);

    await updateUser(userId, { payment: updatedPayments });
    setProductBooked(updatedPayments);
  };

  return (
    <>
      {/* Google Font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
        rel="stylesheet"
      />
      <Navbar />
      <div style={{ height: "30px" }}></div>

      <h4 className="page-title text-center mt-4">My Orders</h4>
      <p className="text-center mb-3">
        Your Orders({productBooked.length})
      </p>

      <div className="orders-container d-flex flex-column align-items-center mb-5">
        {productBooked.length > 0 ? (
          productBooked.slice().reverse().map((order, index) => {
            const remainingCancelMs = timeLeft[order.razorpayId] || 0;
            const remainingDeliveryMs = deliveryTimeLeft[order.razorpayId] || 0;

            const cancelMinutes = Math.floor(remainingCancelMs / 60000);
            const cancelSeconds = Math.floor((remainingCancelMs % 60000) / 1000);

            const deliveryMinutes = Math.floor(remainingDeliveryMs / 60000);
            const deliverySeconds = Math.floor((remainingDeliveryMs % 60000) / 1000);

            const canCancel = remainingCancelMs > 0 && order.status === "paid";

            return (
              <div key={index} className="d-flex justify-content-center w-100 mb-3">
                <div className="wishlist-card order-card">
                  {/* Order Header */}
                  <div className="order-header">
                    <div className="order-left">
                      <span>{order.status?.toUpperCase() || "PENDING"}</span>
                      <span>₹{order.amount}</span>
                    </div>
                    <div className="order-right">
                      Delivery in: {Math.max(deliveryMinutes, 0)}:
                      {Math.max(deliverySeconds, 0).toString().padStart(2, "0")} min
                    </div>
                  </div>

                  {/* Overlapping Product Images */}
                  <div className="order-products mt-2">
                    {order.products?.map((item, idx) => (
                      <div key={idx} className="product-card">
                        <img src={item.image} alt={item.name} className="wishlist-image" />
                        {item.quantity > 1 && <span className="qty-badge">x{item.quantity}</span>}
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="order-footer d-flex justify-content-end align-items-center mt-2">
                    {remainingDeliveryMs <= 0 ? (
                     <span className="delivered-icon ">
      <AiOutlineCheckCircle size={20} /> Delivered 
    </span>
                    ) : (
                      canCancel && (
                        <>
                          <button
                            className="wishlist-add-btn"
                            onClick={() => handleCancel(order.razorpayId)}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor = "#d32f2f")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor = "rgba(50,30,20,0.85)")
                            }
                          >
                            Cancel
                          </button>
                          <span className="cancel-timer fw-bold mx-2">
                            {cancelMinutes}:{cancelSeconds.toString().padStart(2, "0")}
                          </span>
                        </>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center mt-5 text-muted">No orders found</p>
        )}
      </div>

      <style>{`
        body {
          background: #fff8f0;
          font-family: 'Roboto', sans-serif;
        }
        .orders-container {
          width: 100%;
          padding: 0 15px;
          background: #fff8f0;
        }
        .wishlist-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          background: #fff8f0;
          border-radius: 18px;
          width: 100%;
          max-width: 600px;
          padding: 15px;
          position: relative;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          flex-wrap: nowrap;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .wishlist-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .order-header {
          display: flex;
          justify-content: space-between;
          width: 100%;
          padding-bottom: 0.5rem;
          font-weight: 500;
          font-size: 0.95rem;
          color: #1c1c1e;
        }
        .order-left span {
          margin-right: 10px;
        }
        .order-products {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 5px 0;
        }
        .product-card {
          position: relative;
          width: 130px;
          height: 130px;
          border-radius: 50%;
          overflow: hidden;
          margin-left: -30px;
          flex-shrink: 0;
        }
        .product-card:first-child {
          margin-left: 0;
        }
        .wishlist-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .qty-badge {
          position: absolute;
          bottom: -5px;
          right: -5px;
          background: #d32f2f;
          color: #fff;
          font-size: 0.65rem;
          padding: 2px 5px;
          border-radius: 12px;
          font-weight: 600;
        }
        .order-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          width: 100%;
          padding-top: 0.5rem;
        }
        .wishlist-add-btn {
          background: rgba(50, 30, 20, 0.85) !important;
          color: #fff !important;
          border-radius: 25px;
          border: none;
          padding: 6px 25px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        .wishlist-add-btn:hover {
          transform: scale(1.05);
        }
        .cancel-timer {
          font-size: 0.75rem;
          color: #ff3b30;
        }
        .delivered-text {
          font-size: 0.85rem;
          color: #28a745;
        }
        @media (max-width: 576px) {
          .wishlist-card {
            flex-wrap: nowrap;
          }
          .product-card {
            width: 55px;
            height: 55px;
          }
        }
      `}</style>

      <Footer />
      <ScrollToTop />
    </>
  );
}
