import { useContext, useEffect, useState } from "react";
import { SearchContext } from "../SearchContext/SearchContext";
import Navbar from "../../Navbar/Navbar";
import { updateUser, fetchUser } from "../Fetch/FetchUser";
import { useNavigate } from "react-router-dom";
import ScrollToTop from "../ScrollTop";
import Footer from "../Home/Footer";

export default function RecentlyViewed() {
  const { recentlyViewedProduct, setRecentlyViewedProducts } = useContext(SearchContext);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // get userId from localStorage
    const id = localStorage.getItem("userId");
    setUserId(id);
  }, []);

  const handleClearAll = async () => {
    if (!userId) return;

    try {
      const user = await fetchUser(userId);
      await updateUser(userId, { recentlyViewed: [] });
      localStorage.setItem(
        "existingUser",
        JSON.stringify({ ...user, recentlyViewed: [] })
      );
      setRecentlyViewedProducts([]);
    } catch (err) {
      console.log("Error clearing recently viewed", err);
    }
  };

  if (!recentlyViewedProduct || recentlyViewedProduct.length === 0) {
    return (
      <>
        <Navbar />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <p className="text-center mt-3">No recently viewed products</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ height: "40px" }}></div>

      <div className="container my-4">
        <h4 className="mb-4 fw-bold text-center">Recently Viewed</h4>
        <div className="d-flex justify-content-end mb-3">
          <button
            onClick={handleClearAll}
            className="btn btn-outline-danger btn-sm px-3 py-2 shadow-sm"
            style={{
              borderRadius: "50px",
              transition: "all 0.3s ease",
              fontWeight: "500",
              borderColor: "#dc3545",
              color: "#dc3545",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#dc3545";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#dc3545";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Clear All
          </button>
        </div>

        {/* Responsive grid for all screens */}
        <div className="row g-3">
          {recentlyViewedProduct.map((item, index) => (
            <div key={index} className="col-6 col-sm-4 col-md-3 col-lg-2">
              <div
                className="card h-100 shadow-sm border-0 text-center"
                style={{
                  borderRadius: "15px",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  cursor: "pointer",
                  background: "#fff7f2", // website warm tone
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 20px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 6px rgba(0,0,0,0.1)";
                }}
                onClick={() => navigate(`/productDetails/${item.id}`)}
              >
                <img
                  src={item.image}
                  className="card-img-top p-3"
                  alt={item.name}
                  style={{ objectFit: "contain", height: "150px" }}
                />
                <div className="card-body p-2">
                  <h6
                    className="card-title text-truncate"
                    style={{ color: "#5a3e2b", fontWeight: "600" }}
                  >
                    {item.name}
                  </h6>
                  <p
                    className="card-text fw-bold"
                    style={{  color: "#2c2c2c", fontSize: "1rem" }}
                  >
                    ₹{item.price}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
      <ScrollToTop />
    </>
  );
}
