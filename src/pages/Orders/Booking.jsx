import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useContext, useState, useEffect } from "react";
import { useLoading } from "../../context/LoadingContext";
import { SearchContext } from "../../context/SearchContext";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../../api/user/order";
import { motion, AnimatePresence } from "framer-motion";
import { LuUser, LuPhone, LuMapPin, LuHash, LuChevronRight, LuShoppingBag, LuInfo } from "react-icons/lu";
import Navbar from "../../components/Layout/Navbar";
import Footer from "../../components/Layout/Footer";

export default function BookingPage({ toastRef }) {
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNo, setPhoneNo] = useState("");

  const { bookingProducts } = useContext(SearchContext);
  const navigate = useNavigate();
  const { stopLoading } = useLoading();

  useEffect(() => {
    stopLoading();
    window.scrollTo(0, 0);
  }, []);

  const totalPrice = bookingProducts
    ? bookingProducts.reduce((sum, item) => {
      const price = item.product?.price || item.price || 0;
      const quantity = item.quantity || 1;
      return sum + price * quantity;
    }, 0)
    : 0;

  useEffect(() => {
    if (!bookingProducts || bookingProducts.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [bookingProducts, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const regex = /^[a-zA-Z0-9\s,.-]+$/;

    if (!fullName) return toastRef?.current?.showToast("Enter full name");
    if (!phoneNo) return toastRef?.current?.showToast("Enter phone number");
    if (phoneNo.length < 10) return toastRef?.current?.showToast("Enter a valid phone number");
    if (!city) return toastRef?.current?.showToast("Enter city");
    if (!pincode) return toastRef?.current?.showToast("Enter pin code");
    if (!address) return toastRef?.current?.showToast("Fill address");
    if (!regex.test(address)) return toastRef?.current?.showToast("Special characters are not allowed in address");

    const userId = localStorage.getItem("userId");
    if (!userId) return toastRef?.current?.showToast("User not logged in");

    const orderPayload = {
      full_name: fullName,
      phone: phoneNo,
      address: address,
      city: city,
      pincode: pincode,
    };

    try {
      const response = await createOrder(orderPayload);
      if (response && response.order_id) {
        navigate(`/payment/${response.order_id}`);
      } else {
        toastRef?.current?.showToast("Order creation failed");
      }
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.detail || "Failed to create order";
      toastRef?.current?.showToast(errMsg);
    }
  };

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

  if (!bookingProducts || bookingProducts.length === 0) return null;

  return (
    <>
      <div style={{ height: "80px" }} className="d-none d-md-block"></div>
      <div style={{ height: "120px" }} className="d-md-none d-block"></div>
      <Navbar />

      <main className="booking-page">
        <div className="container py-2">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="row g-3"
          >
            {/* Header */}
            <div className="col-12 mb-2">
              <motion.div variants={itemVariants} className="booking-header">
                <h1 className="fw-bold">Checkout</h1>
                <p className="text-muted">Complete your order details to proceed to payment</p>
              </motion.div>
            </div>

            {/* Left Column: Form */}
            <div className="col-lg-7">
              <motion.div variants={itemVariants} className="glass-card p-3 px-md-4 h-100">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="icon-circle">
                    <LuUser size={20} />
                  </div>
                  <h4 className="mb-0 fw-bold">Customer Information</h4>
                </div>

                <form onSubmit={handleSubmit} className="booking-form">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <div className="form-group">
                        <label><LuUser size={14} className="me-1" /> Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Your complete name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="form-group">
                        <label><LuPhone size={14} className="me-1" /> Phone Number</label>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="10-digit mobile number"
                          value={phoneNo}
                          maxLength={10}
                          onChange={(e) => setPhoneNo(e.target.value.replace(/\D/g, ""))}
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-8">
                      <div className="form-group">
                        <label><LuMapPin size={14} className="me-1" /> City</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="District / City"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-4">
                      <div className="form-group">
                        <label><LuHash size={14} className="me-1" /> PIN Code</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="6-digit code"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-group">
                        <label><LuInfo size={14} className="me-1" /> Delivery Address</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          placeholder="House No, Street, Landmark..."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="confirm-btn mt-3"
                  >
                    <span>Proceed to Payment</span>
                    <LuChevronRight size={20} />
                  </motion.button>
                </form>
              </motion.div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="col-lg-5">
              <motion.div variants={itemVariants} className="glass-card p-3 px-md-4 sticky-top" style={{ top: "100px" }}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="icon-circle secondary">
                    <LuShoppingBag size={20} />
                  </div>
                  <h4 className="mb-0 fw-bold">Order Summary</h4>
                </div>

                <div className="summary-items">
                  <AnimatePresence>
                    {bookingProducts.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="summary-item"
                      >
                        <div className="item-img-container">
                          <img src={item.product?.image || item.image} alt="" />
                        </div>
                        <div className="item-details">
                          <h6>{item.product?.name || item.name}</h6>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted small">Qty: {item.quantity || 1}</span>
                            <span className="price">₹{(item.product?.price || item.price || 0) * (item.quantity || 1)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="total-breakdown mt-3 pt-3 border-top">
                  <div className="d-flex justify-content-between align-items-center mb-1 text-muted">
                    <span>Subtotal</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fw-bold h5 mb-0 text-dark">Total Amount</span>
                    <span className="fw-bold h4 mb-0 text-brown">₹{totalPrice}</span>
                  </div>

                  <div className="promo-box">
                    <LuInfo size={16} className="text-brown" />
                    <span>Free shipping included for this order</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />

      <style>{`
        .booking-page {
          background: #fff8f0;
          min-height: 100vh;
          padding-top: 5px;
          font-family: 'Poppins', sans-serif;
        }

        .booking-header h1 {
          font-family: 'Playfair Display', serif;
          color: #5D372B;
          font-size: 2.2rem;
        }

        .booking-header p {
          font-size: 0.9rem;
        }

        .glass-card {
          background: rgba(255, 248, 240, 0.85);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 1px solid rgba(93, 55, 43, 0.1);
          border-radius: 25px;
          box-shadow: 0 10px 40px rgba(93, 55, 43, 0.04);
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

        .icon-circle.secondary {
          background: rgba(141, 110, 99, 0.1);
          color: #5D372B;
        }

        .form-group {
          margin-bottom: 5px;
        }

        .form-group label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #8d6e63;
          margin-bottom: 6px;
          display: block;
        }

        .form-control {
          background: rgba(255, 248, 240, 0.5);
          border: 1px solid rgba(93, 55, 43, 0.08);
          border-radius: 12px;
          padding: 10px 14px;
          color: #2d3436;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .form-control:focus {
          background: white;
          border-color: #5D372B;
          box-shadow: 0 0 0 3px rgba(93, 55, 43, 0.05);
        }

        .confirm-btn {
          width: 100%;
          background: #5D372B;
          color: white;
          border: none;
          padding: 14px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s ease;
        }

        .confirm-btn:hover {
          background: #4a2c22;
          box-shadow: 0 8px 25px rgba(93, 55, 43, 0.25);
        }

        .summary-items {
          max-height: 300px;
          overflow-y: auto;
          padding-right: 5px;
        }

        .summary-items::-webkit-scrollbar {
          width: 3px;
        }

        .summary-items::-webkit-scrollbar-thumb {
          background: rgba(93, 55, 43, 0.1);
          border-radius: 10px;
        }

        .summary-item {
          display: flex;
          gap: 10px;
          padding: 8px;
          background: rgba(255, 248, 240, 0.6);
          border-radius: 14px;
          margin-bottom: 10px;
          border: 1px solid rgba(93, 55, 43, 0.03);
        }

        .item-img-container {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          overflow: hidden;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .item-img-container img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .item-details h6 {
          font-weight: 700;
          color: #2d3436;
          margin-bottom: 2px;
          font-size: 0.9rem;
        }
        
        .item-details .text-muted.small {
          font-size: 0.75rem;
        }

        .item-details .price {
          font-weight: 700;
          color: #5D372B;
          font-size: 0.9rem;
        }

        .text-brown {
          color: #5D372B !important;
        }

        .promo-box {
          background: rgba(93, 55, 43, 0.05);
          padding: 10px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: #5D372B;
          font-weight: 500;
        }

        .h5 { font-size: 1.1rem; }
        .h4 { font-size: 1.3rem; }

        @media (max-width: 991px) {
          .glass-card {
            border-radius: 20px;
            padding: 1.25rem !important;
          }
          .sticky-top {
            top: 0 !important;
            position: relative !important;
          }
          .booking-header h1 {
            font-size: 1.6rem !important;
          }
          .glass-card {
            padding: 1.25rem !important;
            border-radius: 20px !important;
          }
          .form-group label {
            font-size: 0.75rem !important;
          }
          .form-control {
            padding: 8px 12px !important;
            font-size: 0.85rem !important;
          }
          .confirm-btn {
            padding: 12px !important;
            font-size: 0.9rem !important;
          }
          .summary-item {
            padding: 6px !important;
            margin-bottom: 8px !important;
          }
          .item-img-container {
            width: 40px !important;
            height: 40px !important;
          }
          .item-details h6 {
            font-size: 0.8rem !important;
          }
          .total-breakdown .h5 {
            font-size: 0.95rem !important;
          }
          .total-breakdown .h4 {
            font-size: 1.1rem !important;
          }
        }
      `}</style>
    </>
  );
}



