import { useEffect, useState } from "react";
import { fetchUser } from "../Fetch/FetchUser";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function PaymentPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const { bookingId } = useParams();
  const [Products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchBookingDetails() {
      const savedUser = JSON.parse(localStorage.getItem("existingUser"));
      const bookingDetails = await fetchUser(savedUser.id);
      const currentBooking = bookingDetails.booking.find((b) => b.id === bookingId);

      if (currentBooking) {
        setName(currentBooking.name);
        setProducts(currentBooking.products);
        setAddress(currentBooking.addr);
        setPhoneNumber(currentBooking.ph);
      }
    }
    fetchBookingDetails();
  }, [bookingId]);

  // Calculate total
  const totalAmount = Products.reduce(
    (sum, item) => sum + (item.quantity || 1) * item.price,
    0
  );






const handlePayOnline = async () => {
  const options = {
    key: "rzp_test_edrzdb8Gbx5U5M", 
    amount: totalAmount * 100, // amount in paise
    currency: "INR",
    name: "Diary",
    description: "Payment for your order",
    handler: async function (response) {
      try {
        // Fetch user from localStorage
        const savedUser = JSON.parse(localStorage.getItem("existingUser"));

        // Find user in your JSON or DB
        const userIndex = users.findIndex(u => u.id === savedUser.id);
        if (userIndex === -1) return alert("User not found");

        const bookingIndex = users[userIndex].booking.findIndex(b => b.id === bookingId);
        if (bookingIndex === -1) return alert("Booking not found");

        // Update payment info
        users[userIndex].booking[bookingIndex].payment = {
          method: "Online",
          razorpayId: response.razorpay_payment_id,
          status: "Paid",
        };

        // Update localStorage
        localStorage.setItem("existingUser", JSON.stringify(users[userIndex]));

        alert("Payment successful and booking updated!");
      } catch (err) {
        console.error(err);
        alert("Payment succeeded but failed to update booking.");
      }
    },
    prefill: {
      name: name,
      contact: phoneNumber,
    },
    theme: { color: "#343a40" },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};








  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-4 p-md-5">
              <h3 className="card-title mb-4 text-center fw-bold text-dark">
                Checkout
              </h3>

              {/* Shipping Address */}
              <div className="mb-4 p-3 rounded-3" style={{ backgroundColor: "#f8f9fa" }}>
                <h5 className="fw-bold mb-3">Shipping Address</h5>
                <p className="mb-1"><strong>Name:</strong> {name}</p>
                <p className="mb-1"><strong>Address:</strong> {address}</p>
                <p className="mb-0"><strong>Phone:</strong> {phoneNumber}</p>
              </div>

              {/* Products */}
              <div className="mb-4">
                <h5 className="fw-bold mb-3">Products</h5>
                {Products.map((item) => (
                  <div
                    key={item.id}
                    className="d-flex justify-content-between align-items-center mb-2 p-2 rounded-2"
                    style={{ backgroundColor: "#f1f3f5" }}
                  >
                    <div className="d-flex align-items-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="me-3"
                        style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }}
                      />
                      <span>{item.name} x {item.quantity}</span>
                    </div>
                    <span className="fw-semibold">₹{(item.quantity || 1) * item.price}</span>
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5 mt-2">
                  <span>Total:</span>
                  <span className="text-success">₹{totalAmount}</span>
                </div>
              </div>

              {/* Payment Buttons */}
              <div className="d-flex flex-column flex-md-row justify-content-between gap-2">
                <button className="btn btn-outline-dark w-100 rounded-pill">
                  Cash on Delivery
                </button>
                <button className="btn btn-dark w-100 rounded-pill"  onClick={handlePayOnline}>
                  Pay Online
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
