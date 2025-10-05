import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { fetchUser, updateUser } from "../Fetch/FetchUser";
import Navbar from "../../Navbar/Navbar";
import Footer from "../Home/Footer";
import ScrollToTop from "../ScrollTop";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";

export default function Orders() {
  const [productBooked, setProductBooked] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});
  const [deliveryTimeLeft, setDeliveryTimeLeft] = useState({});
  const [cancelOrder, setCancelOrder] = useState(null);
  const navigate = useNavigate();

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

        updatedCancelTimes[order.razorpayId] = Math.max(
          cancelWindow - (now - orderTime),
          0
        );
        updatedDeliveryTimes[order.razorpayId] = Math.max(
          deliveryWindow - (now - orderTime),
          0
        );
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
    const updatedPayments = userData.payment.filter(
      (p) => p.razorpayId !== razorpayId
    );

    await updateUser(userId, { payment: updatedPayments });
    setProductBooked(updatedPayments);
    setCancelOrder(null);
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
        rel="stylesheet"
      />
      <Navbar />
      <div style={{ height: "30px" }}></div>

      <h4 className="page-title text-center mt-4">My Orders</h4>
      <p className="text-center mb-3">Your Orders ({productBooked.length})</p>

      <div className="orders-container d-flex flex-column align-items-center mb-5">
        {productBooked.length > 0 ? (
          productBooked
            .slice()
            .reverse()
            .map((order, index) => {
              const remainingCancelMs = timeLeft[order.razorpayId] || 0;
              const remainingDeliveryMs =
                deliveryTimeLeft[order.razorpayId] || 0;

              const cancelMinutes = Math.floor(remainingCancelMs / 60000);
              const cancelSeconds = Math.floor(
                (remainingCancelMs % 60000) / 1000
              );

              const deliveryMinutes = Math.floor(remainingDeliveryMs / 60000);
              const deliverySeconds = Math.floor(
                (remainingDeliveryMs % 60000) / 1000
              );

              const canCancel =
                remainingCancelMs > 0 && order.status === "paid";

              return (
                <div
                  key={index}
                  className="d-flex justify-content-center w-100 mb-3"
                >
                  <div className="wishlist-card order-card">
                    {/* Order Header */}
                    <div className="order-header">
                      <div className="order-left">
                        <span>{order.status?.toUpperCase() || "PENDING"}</span>
                        <span>₹{order.amount}</span>
                      </div>
                      <div className="order-right">
                        Delivery in: {Math.max(deliveryMinutes, 0)}:
                        {Math.max(deliverySeconds, 0)
                          .toString()
                          .padStart(2, "0")}{" "}
                        min
                      </div>
                    </div>

                    {/* Product Images */}
                    <div className="order-products mt-2">
                      {order.products?.map((item, idx) => (
                        <div key={idx} className="product-card">
                          <img
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              navigate(`/productDetails/${item.id}`, {
                                replace: true,
                              })
                            }
                            src={item.image}
                            alt={item.name}
                            className="wishlist-image"
                          />
                          <div className="product-info">
                            <span className="product-name mx-1">{item.name}</span>
                            <span className="product-qty">x{item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="order-footer d-flex justify-content-end align-items-center mt-2">
                      {remainingDeliveryMs <= 0 ? (
                        <span className="delivered-icon">
                          <AiOutlineCheckCircle size={25} /> 
                        </span>
                      ) : (
                        canCancel && (
                          <>
                            <button
                              className="wishlist-add-btn"
                              onClick={() => setCancelOrder(order)}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = "#d32f2f")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "rgba(50,30,20,0.85)")
                              }
                            >
                              Cancel
                            </button>
                            <span className="cancel-timer fw-bold mx-2">
                              {cancelMinutes}:
                              {cancelSeconds.toString().padStart(2, "0")}
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

  {/* Radix Confirmation Dialog (Updated Style) */}
{cancelOrder && (
  <Dialog.Root open={true} onOpenChange={() => setCancelOrder(null)}>
    <Dialog.Overlay
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        position: "fixed",
        inset: 0,
        zIndex: 1000,
      }}
    />
    <Dialog.Content
      style={{
        backgroundColor: "#fff8f0",
        borderRadius: "15px",
        padding: "25px 20px",
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "90%",
        maxWidth: "360px",
        textAlign: "center",
        zIndex: 1001,
        boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
        transition: "all 0.3s ease",
      }}
    >
      <Dialog.Title
        style={{
          fontSize: "1.4rem",
          fontWeight: 700,
          marginBottom: "12px",
          color: "#0a2141",
          textShadow: "1px 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        Confirm Cancellation
      </Dialog.Title>
      <Dialog.Description
        style={{
          fontSize: "0.95rem",
          marginBottom: "22px",
          color: "#555",
        }}
      >
        Are you sure you want to cancel{" "}
        <strong>
          {cancelOrder.products.map((p) => p.name).join(", ")}
        </strong>
        ? This action cannot be undone.
      </Dialog.Description>

      <div className="d-flex flex-column flex-md-row justify-content-center gap-2">
        <button
          className="btn"
          style={{
            backgroundColor: "#e0e0e0",
            color: "#111",
            padding: "10px 0",
            fontSize: "0.95rem",
            borderRadius: "12px",
            flex: 1,
            transition: "all 0.2s",
          }}
          onClick={() => setCancelOrder(null)}
        >
          Cancel
        </button>
        <button
          className="btn"
          style={{
            background: "linear-gradient(135deg, #ff4d6d, #ff6f91)",
            color: "#fff",
            padding: "10px 0",
            fontSize: "0.95rem",
            borderRadius: "12px",
            flex: 1,
            transition: "all 0.2s",
          }}
          onClick={() => handleCancel(cancelOrder.razorpayId)}
        >
          Yes, Cancel
        </button>
      </div>
    </Dialog.Content>
  </Dialog.Root>
)}

      {/* STYLES */}
      <style>{`
        body {
          background: #fff8f0;
          font-family: 'Roboto', sans-serif;
        }

        .radix-overlay {
          background-color: rgba(0,0,0,0.5);
          position: fixed;
          inset: 0;
          z-index: 50;
        }

        .radix-content {
          background: #fff;
          border-radius: 10px;
          padding: 20px;
          width: 90%;
          max-width: 400px;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 100;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
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
          max-width: 850px;
          padding: 12px;
          position: relative;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }

        .wishlist-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          width: 100%;
          padding-bottom: 0.4rem;
          font-weight: 500;
          font-size: 0.9rem;
          color: #1c1c1e;
        }

        .order-left span {
          margin-right: 8px;
        }

        .order-products {
          display: flex;
          align-items: flex-start;
          width: 100%;
          padding: 5px 0;
          overflow-x: auto;
          gap: 12px;
        }

        .product-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 130px;
          min-width: 130px;
          flex-shrink: 0;
        }

        .wishlist-image {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 10px;
        }

        .product-info {
          display: flex;
          justify-content: start;
          width: 100%;
          margin-top: 4px;
          white-space: nowrap;
          font-size: 0.80rem;
        }

        .product-name {
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-qty {
          color: gray;
          font-weight: 500;
        }

        .order-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          width: 100%;
          padding-top: 0.5rem;
          font-size: 0.8rem;
        }

        .wishlist-add-btn {
          background: rgba(50,30,20,0.85) !important;
          color: #fff !important;
          border-radius: 25px;
          border: none;
          padding: 8px 30px;
          font-size: 0.80rem;
          cursor: pointer;
          transition: transform 0.3s ease, background-color 0.3s ease;
        }

        .wishlist-add-btn:hover {
          transform: scale(1.03);
        }

        .cancel-timer {
          font-size: 0.9rem;
          color: #ff3b30;
        }

        .delivered-icon {
          font-size: 2rem;
          color: #28a745;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        @media (max-width: 576px) {
          .wishlist-card {
            padding: 15px;
          }
          .product-card {
            width: 100px;
            min-width: 100px;
          }
          .wishlist-image {
            height: 140px;
          }
          .product-info {
            font-size: 0.8rem;
          }
          .order-header {
            font-size: 0.8rem;
          }
        }
      `}</style>

      <Footer />
      
    </>
  );
}
