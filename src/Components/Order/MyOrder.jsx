import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { fetchUser } from "../Fetch/FetchUser";
import Navbar from "../../Navbar/Navbar";

export default function Orders() {
  const [productBooked, setProductBooked] = useState([]);

  useEffect(() => {
    async function fetchBookedUser() {
      const savedUser = JSON.parse(localStorage.getItem("existingUser"));
      if (!savedUser) return;

      const bookedUser = await fetchUser(savedUser.id);
      setProductBooked(bookedUser.payment || []);
    }
    fetchBookedUser();
  }, []);

  return (
    <>
      <Navbar />
      <div style={{ height: '50px' }}></div>
      <div style={{ maxWidth: "1200px", margin: "auto", padding: "1rem" }}>
        <h2 style={{
          textAlign: "center",
          fontWeight: 700,
          fontSize: "2rem",
          marginBottom: "2rem",
          color: "#111",
          fontFamily: "SF Pro Display, sans-serif",
          letterSpacing: "-0.5px"
        }}>
          My Orders
        </h2>

        {productBooked && productBooked.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}>
            {productBooked.reverse().map((order, index) => (
              <div key={index} className="order-card" style={{
                display: "flex",
                flexDirection: "column",
                background: "#fff8f0",
                borderRadius: "22px",
                overflow: "hidden",
                boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                transition: "transform 0.4s ease, box-shadow 0.4s ease",
                cursor: "pointer",
              }}>
                {/* Header */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.6rem 1rem",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: "#fff",
                  background: order.status === "paid"
                    ? "linear-gradient(90deg, #1c1c1e, #3a3a3c)"
                    : "linear-gradient(90deg, #8e2de2, #4a00e0)"
                }}>
                  <span>{order.status.toUpperCase()}</span>
                  <span>{order.time}</span>
                </div>

                {/* Products Vertical Stack */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "1rem",
                  gap: "0.75rem"
                }}>
                  {order.products.map((item) => (
                    <div key={item.id} style={{
                      display: "flex",
                      alignItems: "center",
                      background:"#fff8f0",
                      borderRadius: "15px",
                      padding: "0.5rem",
                     
                      transition: "transform 0.3s, box-shadow 0.3s"
                    }} className="product-card">
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "12px",
                          marginRight: "0.8rem"
                        }}
                      />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "#111" }}>
                          {item.name} x{item.quantity}
                        </p>
                        
                        
                      </div>
                      
                    </div>
                    
                  ))}<p style={{ margin: 0, fontSize: "0.7rem", color: "#666" }}>
                        delivered  {order.deliveryTime ? order.deliveryTime : "within 30 min"}
                        </p>
                </div>

                {/* Footer */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.6rem 1rem",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  background: "#fff8f0",
                  borderTop: "1px solid #e5e5e5"
                }}>
                  <span>ID: {order.razorpayId || "N/A"}</span>
                  <span style={{ color: "#1c1c1e" }}>Paid ₹{order.amount}</span>
                  <button
                    style={{
                      backgroundColor: "#ff3b30",
                      border: "none",
                      color: "#fff",
                      padding: "0.3rem 0.7rem",
                      borderRadius: "25px",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#d32f2f"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#ff3b30"}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{
            textAlign: "center",
            fontSize: "0.9rem",
            marginTop: "2rem",
            color: "#888"
          }}>
            No orders found
          </p>
        )}
      </div>

      {/* CSS for smooth Apple-like hover effects */}
      <style jsx>{`
        .order-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 18px 40px rgba(0,0,0,0.12);
        }
       
        @media (max-width: 576px) {
          .order-card {
            margin-bottom: 1rem;
          }
          .product-card {
            flex-direction: row;
            gap: 0.5rem;
          }
        }
      `}</style>
    </>
  );
}
