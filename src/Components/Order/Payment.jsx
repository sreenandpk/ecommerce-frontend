import { useEffect, useState } from "react";
import { fetchUser, updateUser } from "../Fetch/FetchUser";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../../Navbar/Navbar";
import { FaMapMarkerAlt } from "react-icons/fa"; 
import Footer from "../Home/Footer";
export default function PaymentPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [Products, setProducts] = useState([]);
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const createdAt = new Date().toISOString();

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
        setPin(currentBooking.pin);
      } else {
        navigate("/");
      }
    }
    fetchBookingDetails();
  }, [bookingId, navigate]);

  const totalAmount = Products.reduce((sum, item) => sum + (item.quantity || 1) * item.price, 0);

  const handlePayOnline = () => {
    const options = {
      key: "rzp_test_edrzdb8Gbx5U5M",
      amount: totalAmount * 100,
      currency: "INR",
      name: "Diary",
      description: "Payment for your order",
      handler: async function (response) {
        alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
        const savedUser = JSON.parse(localStorage.getItem("existingUser"));
        const newUser = await fetchUser(savedUser.id);
        const istTime = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Kolkata",
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date());
        const newPayment = {
          status: "paid",
          razorpayId: response.razorpay_payment_id,
          amount: totalAmount,
          time: istTime,
          bookingId,
          products: Products,
          address: address,
          pin: pin,
          ph: phoneNumber,
          name: name,
          deliveryTime:"",
          userId:savedUser.id,
          createdAt
        };
        const updatedPayment = newUser.payment ? [...newUser.payment, newPayment] : [newPayment];
        await updateUser(newUser.id, { payment: updatedPayment, cart: [] });
        localStorage.setItem("existingUser", JSON.stringify({ ...savedUser, cart: [] }));
        navigate("/myOrders");
      },
      prefill: { name, contact: phoneNumber },
      theme: { color: "#343a40" },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <>
      <Navbar />

      <div className="container my-5"style={{backgroundColor:'#fff8f0'}}>
        <div className="card premium-card mx-auto shadow-lg"style={{backgroundColor:'#fff8f0'}}>
          <div className="card-body p-4"style={{backgroundColor:'#fff8f0',}}>

            {/* Shipping Address */}
            <div className="address-card mb-4 p-3 rounded-4  "style={{backgroundColor:'#fff8f0',}}>
              <h5 className="fw-bold mb-3"><FaMapMarkerAlt/><span className="mx-2 mt-5">Shipping Address </span></h5>
              <p className="mb-1"><strong>Name:</strong> {name}</p>
              <p className="mb-1"><strong>Pin:</strong> {pin}</p>
              <p className="mb-1"><strong>Address:</strong> {address}</p>
              <p className="mb-0"><strong>Phone:</strong> {phoneNumber}</p>
            </div>

            {/* Products */}
            <div className="mb-4"style={{backgroundColor:'#fff8f0'}}>
              {Products.map((item) => (
                <div key={item.id} className="product-card d-flex justify-content-between align-items-center mb-3 p-3 rounded-4 shadow-sm">
                  <div className="d-flex align-items-center">
                    <img src={item.image} alt={item.name} className="me-3" />
                    <span className="fw-semibold">{item.name} x {item.quantity}</span>
                  </div>
                  <span className="fw-bold text-success">₹{(item.quantity || 1) * item.price}</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5 mt-2">
                <span>Total:</span>
                <span className="text-success">₹{totalAmount}</span>
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mt-4">
              <button className="btn btn-outline-dark w-100 rounded-pill py-2 fw-semibold shadow-sm">
                Cash on Delivery
              </button>
              <button className="btn btn-dark w-100 rounded-pill py-2 fw-semibold shadow-sm" onClick={handlePayOnline}>
                Pay Online
              </button>
            </div>
          </div>
        </div>
      </div>

     <style>{`
  .premium-card {
    max-width: 600px;
    border-radius: 25px;
    padding: 1.5rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .premium-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.12);
  }
  .address-card {
    border: none;
    padding: 1rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
 
  .product-card {
    padding: 0.5rem 0.75rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  }
  .product-card img {
    width: 55px;
    height: 55px;
    object-fit: cover;
    border-radius: 10px;
  }
  @media (max-width: 576px) {
    .premium-card {
      max-width: 95%;
      margin: 1rem auto;
      padding: 1rem;
    }
    .product-card {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.5rem;
    }
  }
`}</style>
<Footer />
    </>
  );
}
