import { useEffect, useState } from "react";
import { useLoading } from "../../context/LoadingContext";
import { fetchOrderDetail, createRazorpayOrder, verifyRazorpayPayment } from "../../api/user/order";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../../components/Layout/Navbar";
import Footer from "../../components/Layout/Footer";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { LuMapPin, LuCreditCard, LuChevronRight, LuInfo, LuLock } from "react-icons/lu";

export default function PaymentPage({ toastRef }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { stopLoading } = useLoading();

  // 3D Card Animation Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  /** Fetch Booking Details */
  const fetchBookingDetails = async () => {
    try {
      const order = await fetchOrderDetail(bookingId);
      if (!order) {
        toastRef?.current?.showToast("Order not found");
        navigate("/");
        return;
      }

      setName(order.full_name);
      setAddress(order.address);
      setPhoneNumber(order.phone);
      setPin(order.pincode);
    } catch (err) {
      console.error(err);
      toastRef?.current?.showToast("Failed to fetch order details");
    } finally {
      stopLoading();
    }
  };

  /** Handle Razorpay Payment */
  const handlePayOnline = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        navigate("/login");
        return;
      }

      // 1. Create Razorpay Order from Backend
      const orderData = await createRazorpayOrder(bookingId);
      if (!orderData) {
        toastRef?.current?.showToast("Failed to initiate payment");
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Premium Scoops",
        description: "Payment for Order #" + bookingId,
        order_id: orderData.razorpay_order_id,
        handler: async function (response) {
          try {
            // 2. Verify Payment on Backend
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };
            await verifyRazorpayPayment(verifyPayload);

            toastRef?.current?.showToast("Payment Successful!");
            navigate("/myOrders");
          } catch (verifyErr) {
            console.error(verifyErr);
            toastRef?.current?.showToast("Payment verification failed");
          }
        },
        prefill: { name: name, contact: phoneNumber },
        theme: { color: "#5D372B" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        toastRef?.current?.showToast(response.error.description || "Payment Failed");
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      toastRef?.current?.showToast(err.response?.data?.detail || "Payment initiation failed");
    }
  };

  useEffect(() => {
    fetchBookingDetails();
    window.scrollTo(0, 0);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <>
      <Navbar />

      <main className="payment-page">
        <div className="container py-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="row justify-content-center"
          >
            <div className="col-12 col-md-10 col-lg-8">
              <motion.div variants={itemVariants} className="payment-header mb-4 text-center">
                <h1 className="display-6 fw-bold">Secure Checkout</h1>
                <p className="text-muted">Finalize your order with our encrypted payment gateway</p>
              </motion.div>

              <div className="row g-4 align-items-center">
                {/* Left: Card Visual */}
                <div className="col-lg-6 order-2 order-lg-1">
                  <motion.div
                    variants={itemVariants}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      rotateX,
                      rotateY,
                      transformStyle: "preserve-3d",
                    }}
                    className="payment-card-visual"
                  >
                    <div
                      style={{ transform: "translateZ(75px)", transformStyle: "preserve-3d" }}
                      className="card-content"
                    >
                      <div className="d-flex justify-content-between align-items-start mb-5">
                        <div className="card-chip"></div>
                        < LuLock className="text-white-50" size={24} />
                      </div>

                      <div className="card-number mb-4">
                        <span>••••</span>
                        <span>••••</span>
                        <span>••••</span>
                        <span>1234</span>
                      </div>

                      <div className="d-flex justify-content-between align-items-end">
                        <div className="card-holder">
                          <p className="label-text-small mb-0">ORDER TOTAL</p>
                          <p className="name mb-0 text-white fw-bold">PROCESSED PAY</p>
                        </div>
                        <div className="card-logo">
                          <div className="logo-circles"></div>
                        </div>
                      </div>
                    </div>
                    <div className="card-shimmer"></div>
                  </motion.div>
                </div>

                {/* Right: Address & Actions */}
                <div className="col-lg-6 order-1 order-lg-2">
                  <motion.div variants={itemVariants} className="glass-card p-4">
                    {/* Shipping Address Summary */}
                    <div className="address-section mb-4 p-3 rounded-4">
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <div className="icon-circle">
                          <LuMapPin size={20} />
                        </div>
                        <h5 className="mb-0 fw-bold text-dark">Shipping Address</h5>
                      </div>

                      <div className="address-details ms-2">
                        <p className="mb-1"><span className="label-text-muted text-muted small">Name:</span> <span className="fw-semibold">{name}</span></p>
                        <p className="mb-1"><span className="label-text-muted text-muted small">Pin:</span> <span className="fw-semibold">{pin}</span></p>
                        <p className="mb-1"><span className="label-text-muted text-muted small">Address:</span> <span className="fw-semibold">{address}</span></p>
                        <p className="mb-0"><span className="label-text-muted text-muted small">Phone:</span> <span className="fw-semibold">{phoneNumber}</span></p>
                      </div>
                    </div>

                    <div className="payment-info-box mb-4">
                      <LuInfo size={16} className="text-brown" />
                      <span>Secure payment processed via SSL encrypted channel.</span>
                    </div>

                    {/* Payment Actions */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="payment-btn primary w-100"
                      onClick={handlePayOnline}
                    >
                      <LuCreditCard size={20} />
                      <span>Pay Online Now</span>
                      <LuChevronRight size={18} className="ms-auto" />
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />

      <style>{`
        .payment-page {
          background: #fff8f0;
          min-height: calc(100vh - 150px);
          perspective: 1000px;
          font-family: 'Poppins', sans-serif;
        }

        .payment-header h1 {
          font-family: 'Playfair Display', serif;
          color: #5D372B;
          font-size: 2.2rem;
        }
        
        .payment-header p {
          font-size: 0.9rem;
        }

        .payment-card-visual {
          width: 100%;
          aspect-ratio: 1.7/1;
          background: linear-gradient(135deg, #5D372B 0%, #3d241c 100%);
          border-radius: 20px;
          padding: 24px;
          position: relative;
          box-shadow: 0 25px 50px rgba(93, 55, 43, 0.25);
          overflow: hidden;
          cursor: pointer;
        }

        .card-content {
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
          z-index: 2;
        }

        .card-chip {
          width: 40px;
          height: 30px;
          background: linear-gradient(135deg, #d4af37 0%, #f9e29c 100%);
          border-radius: 5px;
          position: relative;
        }

        .card-number {
          font-size: 1.3rem;
          color: white;
          letter-spacing: 3px;
          font-family: 'Courier New', Courier, monospace;
          display: flex;
          gap: 12px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .label-text-small {
          font-size: 0.6rem;
          color: rgba(255,255,255,0.5);
          letter-spacing: 1.5px;
          margin-bottom: 2px;
        }

        .name {
          font-size: 0.85rem;
          color: white;
          font-weight: 600;
          letter-spacing: 1px;
        }

        .logo-circles {
          width: 40px;
          height: 28px;
          position: relative;
        }

        .logo-circles::before, .logo-circles::after {
          content: '';
          position: absolute;
          width: 28px;
          height: 28px;
          border-radius: 50%;
        }

        .logo-circles::before {
          background: rgba(255, 255, 255, 0.4);
          left: 0;
        }

        .logo-circles::after {
          background: rgba(255, 255, 255, 0.2);
          right: 0;
        }

        .card-shimmer {
          position: absolute;
          top: -100%;
          left: -100%;
          width: 300%;
          height: 300%;
          background: linear-gradient(
            45deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.05) 45%,
            rgba(255,255,255,0.1) 50%,
            rgba(255,255,255,0.05) 55%,
            rgba(255,255,255,0) 100%
          );
          animation: shimmer 5s infinite;
          z-index: 1;
        }

        @keyframes shimmer {
          0% { transform: translateY(0); }
          100% { transform: translateY(33%); }
        }

        .glass-card {
          background: rgba(255, 248, 240, 0.85);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 1px solid rgba(93, 55, 43, 0.1);
          border-radius: 25px;
          box-shadow: 0 10px 40px rgba(93, 55, 43, 0.05);
        }

        .address-section {
          background: rgba(255, 248, 240, 0.6);
          border: 1px solid rgba(93, 55, 43, 0.03);
          padding: 12px;
          border-radius: 18px;
        }

        .icon-circle {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(93, 55, 43, 0.08);
          color: #5D372B;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .label-text-muted {
          display: inline-block;
          width: 70px;
        }
        
        .address-details {
          font-size: 0.9rem;
        }

        .payment-info-box {
          background: rgba(93, 55, 43, 0.05);
          padding: 10px 14px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.8rem;
          color: #5D372B;
          font-weight: 500;
        }

        .payment-btn.primary {
          background: #5D372B;
          color: white;
          border: none;
          height: 50px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 20px;
          box-shadow: 0 8px 25px rgba(93, 55, 43, 0.2);
          transition: all 0.3s ease;
        }

        .text-brown {
          color: #5D372B !important;
        }

        @media (max-width: 991px) {
          .payment-card-visual {
            margin-top: 20px;
            aspect-ratio: 1.6/1; /* Slightly taller on mobile */
          }
        }
      `}</style>
    </>
  );
}
