import { useEffect, useState } from "react";
import { fetchUser, updateUser } from "../Fetch/FetchUser";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../../Navbar/Navbar";
import { FaMapMarkerAlt } from "react-icons/fa";
import Footer from "../Home/Footer";

export default function PaymentPage({ toastRef }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const { bookingId } = useParams();
  const navigate = useNavigate();

  /** Fetch Booking Details */
  const fetchBookingDetails = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        navigate("/login");
        return;
      }

      const userData = await fetchUser(userId);
      const booking = userData?.booking?.find((b) => b.id === bookingId);

      if (!booking) {
        navigate("/");
        return;
      }

      setName(booking.name);
      setAddress(booking.addr);
      setPhoneNumber(booking.ph);
      setPin(booking.pin);
    } catch (err) {
      console.error(err);
      toastRef?.current?.showToast("Failed to fetch booking details");
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

      const userData = await fetchUser(userId);
      const booking = userData?.booking?.find((b) => b.id === bookingId);
      if (!booking) {
        toastRef?.current?.showToast("Booking not found");
        return;
      }

      const totalAmount = booking.products?.reduce(
        (sum, item) => sum + (item.quantity || 1) * item.price,
        0
      );

      const options = {
        key: "rzp_test_edrzdb8Gbx5U5M",
        amount: totalAmount * 100,
        currency: "INR",
        name: "Your Website Name",
        description: "Payment for your booking",
        handler: async function (response) {
          toastRef?.current?.showToast("Payment Successful!");

          const istTime = new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Kolkata",
            hour12: true,
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date());

          const paymentData = {
            status: "paid",
            razorpayId: response.razorpay_payment_id,
            amount: totalAmount,
            time: istTime,
            bookingId,
            products: booking.products,
            address,
            pin,
            ph: phoneNumber,
            name,
            deliveryTimeDefault: 30 * 60,
            createdAt: new Date().toISOString(),
            userId,
          };

          const updatedPayment = userData.payment
            ? [...userData.payment, paymentData]
            : [paymentData];

          // Clear cart and update payment
          await updateUser(userId, { payment: updatedPayment, cart: [] });
          navigate("/myOrders");
        },
        prefill: { name, contact: phoneNumber },
        theme: { color: "#343a40" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toastRef?.current?.showToast("Payment failed. Try again!");
    }
  };

  /** Handle Cash on Delivery */
  const handleCOD =() => {
    
      toastRef?.current?.showToast("Booking not found");
        
  };

  useEffect(() => {
    fetchBookingDetails();
  }, []);

  return (
    <>
      <Navbar />

      <div className="payment-page d-flex justify-content-center my-5">
        <div className="payment-card shadow-lg p-4">
          <div className="address-section mb-4 p-4 rounded-4">
            <h5 className="gradient-text mb-3">
              <FaMapMarkerAlt className="me-2" />
              Shipping Address
            </h5>
            <p className="mb-1"><strong>Name:</strong> {name}</p>
            <p className="mb-1"><strong>Pin:</strong> {pin}</p>
            <p className="mb-1"><strong>Address:</strong> {address}</p>
            <p className="mb-0"><strong>Phone:</strong> {phoneNumber}</p>
          </div>

          <div className="d-flex flex-column flex-md-row gap-3 mt-4">
            <button
              className="btn btn-outline-dark w-100 rounded-pill py-2 fw-semibold shadow-sm"
              onClick={handleCOD}
            >
              Cash on Delivery
            </button>
            <button
              className="btn btn-dark w-100 rounded-pill py-2 fw-semibold shadow-sm"
              onClick={handlePayOnline}
            >
              Pay Online
            </button>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        .payment-page { padding: 20px; background: #fff8f0; width: 100%; box-sizing: border-box; }
        .payment-card { width: 100%; max-width: 500px; background: #fff8f0; border-radius: 25px; padding: 2rem; box-shadow: 0 8px 25px rgba(0,0,0,0.15); margin-bottom: 20px; }
        .gradient-text { background: linear-gradient(135deg, #ff7eb3, #ff758c, #ff6a88); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: bold; }
        .address-section p { font-size: 16px; }
        .btn { transition: 0.3s; }
        .btn:hover { transform: scale(1.05); }
        @media (max-width: 576px) { .payment-card { padding: 1.5rem; } }
      `}</style>
    </>
  );
}
