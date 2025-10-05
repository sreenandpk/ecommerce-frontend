import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useContext, useState, useEffect } from "react";
import { SearchContext } from "../SearchContext/SearchContext";
import { useNavigate } from "react-router-dom";
import { fetchAvailableCitiesFromDb, updateUser, fetchUser } from "../Fetch/FetchUser";
import Navbar from "../../Navbar/Navbar";
import Footer from "../Home/Footer";

export default function BookingPage({ toastRef }) {
  const [availableCities, setAvailableCities] = useState([]);
  const [pincode, setPincode] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNo, setPhoneNo] = useState("");

  const { bookingProducts } = useContext(SearchContext);
  const navigate = useNavigate();

  const totalPrice = bookingProducts
    ? bookingProducts.reduce((sum, item) => sum + (item.quantity || 1) * item.price, 0)
    : 0;

  useEffect(() => {
    if (!bookingProducts || bookingProducts.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [bookingProducts, navigate]);

  useEffect(() => {
    async function fetchCities() {
      try {
        const cities = await fetchAvailableCitiesFromDb();
        setAvailableCities(cities?.city || []);
      } catch (err) {
        toastRef?.current?.showToast("Failed to fetch cities");
      }
    }
    fetchCities();
  }, [toastRef]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const regex = /^[a-zA-Z0-9\s,.-]+$/;

    if (!pincode) return toastRef?.current?.showToast("Select city");
    if (!fullName) return toastRef?.current?.showToast("Enter full name");
    if (!address) return toastRef?.current?.showToast("Fill address");
    if (!phoneNo) return toastRef?.current?.showToast("Enter phone number");
    if (phoneNo.length < 10) return toastRef?.current?.showToast("Enter a valid phone number");
    if (!regex.test(address)) return toastRef?.current?.showToast("Special characters are not allowed in address");

    const userId = localStorage.getItem("userId");
    if (!userId) return toastRef?.current?.showToast("User not logged in");

    const options = { timeZone: "Asia/Kolkata", hour12: true, hour: "2-digit", minute: "2-digit" };
    const istTime = new Intl.DateTimeFormat("en-US", options).format(new Date());

    const newBooking = {
      id: Date.now().toString(),
      name: fullName,
      ph: phoneNo,
      addr: address,
      pin: pincode,
      time: istTime,
      products: bookingProducts,
    };

    try {
      // Fetch user details from DB
      const userData = await fetchUser(userId);
      const existingBookings = userData?.booking || [];

      // Update bookings in DB
      const updatedBookings = [...existingBookings, newBooking];
      await updateUser(userId, { booking: updatedBookings });

     
      navigate(`/payment/${newBooking.id}`);
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || "Failed to update booking in database";
      toastRef?.current?.showToast(errMsg);
    }
  };

  if (!bookingProducts || bookingProducts.length === 0) return null;

  return (
    <>
      <Navbar />
      <div className="container my-5" style={{ maxWidth: "900px" }}>
        <div className="row g-4">
          {/* Booking Form */}
          <div className="col-12 col-lg-6">
            <div
              className="card shadow-sm border-0 p-4 h-100"
              style={{
                borderRadius: "20px",
                backgroundColor: "#fff8f0",
                fontFamily: "SF Pro, -apple-system, sans-serif",
              }}
            >
              <h5 className="fw-bold mb-3">Customer Details</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Full Name</label>
                  <input
                    type="text"
                    className="form-control rounded-pill"
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ backgroundColor: "#fff8f0" }}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Phone</label>
                  <input
                    type="tel"
                    className="form-control rounded-pill"
                    placeholder="Enter phone number"
                    value={phoneNo}
                    maxLength={10}
                    onChange={(e) => setPhoneNo(e.target.value.replace(/\D/g, ""))}
                    style={{ backgroundColor: "#fff8f0" }}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">City</label>
                  <select
                    className="form-select rounded-pill"
                    style={{ backgroundColor: "#fff8f0" }}
                    onChange={(e) => {
                      const selectedCity = availableCities.find((city) => city.name === e.target.value);
                      setPincode(selectedCity ? selectedCity.pincode : "");
                    }}
                  >
                    <option>Select</option>
                    {availableCities.map((city) => (
                      <option key={city.id} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Pin Code</label>
                  <input
                    type="text"
                    className="form-control rounded-pill"
                    value={pincode || ""}
                    placeholder="Auto-filled pin code"
                    readOnly
                    style={{ backgroundColor: "#fff8f0" }}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Address</label>
                  <textarea
                    className="form-control rounded-3"
                    rows="2"
                    placeholder="Enter delivery address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ backgroundColor: "#fff8f0" }}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-dark w-100 rounded-pill py-2">
                  Confirm Booking
                </button>
              </form>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="col-12 col-lg-6">
            <div
              className="card shadow-sm border-0 p-4 h-100"
              style={{ borderRadius: "20px", backgroundColor: "#fff8f0" }}
            >
              <h5 className="fw-bold mb-3">Order Summary</h5>
              {bookingProducts && bookingProducts.length > 0 ? (
                <>
                  {bookingProducts.map((item, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <img src={item.image} alt={item.name} style={{ height: "90px", borderRadius: "10px" }} />
                        <span>
                          {item.name} x {item.quantity || 1}
                        </span>
                      </div>
                      <span className="fw-semibold">₹{(item.quantity || 1) * item.price}</span>
                    </div>
                  ))}
                  <hr />
                  <div className="d-flex justify-content-between">
                    <span className="fw-bold">Total</span>
                    <span className="fw-bold text-success">₹{totalPrice}</span>
                  </div>
                </>
              ) : (
                <p className="text-muted">No items in your booking.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
