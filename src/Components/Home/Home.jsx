import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import Navbar from "../../Navbar/Navbar";
import Icecream1 from "../../../homeImages/iceCreamTopHome6.png";
import Icecream3 from "../../../homeImages/icecream3.jpg";
import Icecream4 from "../../../homeImages/iceCreamHomeTop7.png";
import Icecream2 from "../../../homeImages/iceCreamHomeTop8.png";
import strawBerryHome from "../../../homeImages/strawberryHome.jpg";
import pistaaHome from "../../../homeImages/pistaaHome.jpg";
import blueberryHome from "../../../homeImages/bluberryHome.jpg";
import chocolateHome from "../../../homeImages/chocolateHome.jpg";
import icecreamHome5 from "../../../homeImages/icecreamHome55.jpg";
import { fetchProducts, fetchUser } from "../Fetch/FetchUser";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Footer from "./Footer";
import icecreamGG from "../../../homeImages/milkHome.jpg";
import icecreamG from "../../../homeImages/MoodHome.jpg";
import FlavorSection from "../FlaverSection";
import ScrollToTop from "../ScrollTop";
import { SearchContext } from "../SearchContext/SearchContext";
import { Carousel as BootstrapCarousel } from "bootstrap";

export default function Home() {
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const navigate = useNavigate();
  const { setCategory } = useContext(SearchContext);
  const categories = ["strawberry", "pistachio", "blueberry", "chocolate"];

  // Fetch bestseller products
  useEffect(() => {
    async function fetchBestseller() {
      const products = await fetchProducts();
      const bestSeller = products.filter((p) => p.bestseller === "true");
      if (bestSeller) setBestSellerProducts(bestSeller);
    }
    fetchBestseller();
  }, []);

  // Check if user is blocked
  useEffect(() => {
    async function fetchUserBlocked() {
      const savedUserId = JSON.parse(localStorage.getItem("userId")); // <-- only store userId
      if (!savedUserId) return;

      const response = await fetchUser(savedUserId);
      if (response.block === true) {
        toast.info("Admin blocked");
        localStorage.removeItem("userId"); // <-- remove only userId
        navigate("/login");
      }
    }
    fetchUserBlocked();
  }, []);

  // Auto-scroll carousel on page load
  useEffect(() => {
    const carouselElement = document.getElementById("icecreamCarousel");
    if (carouselElement) {
      new BootstrapCarousel(carouselElement, {
        interval: 4000, // auto scroll every 4 seconds
        ride: "carousel",
      });
    }
  }, []);

  return (
    <>
      <Navbar />
      <div style={{ height: "80px" }}></div>

      {/* Hero Section */}
      <div className="text-center mb-2 position-relative" data-aos="fade-up">
        <h1
          style={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: "700",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            color: "#111",
            lineHeight: "1.2",
          }}
        >
          <span
            style={{
              fontFamily: "'Pacifico', cursive",
              fontSize: "clamp(1rem, 3vw, 1.6rem)",
              color: "#e63946",
              position: "absolute",
              top: "-25px",
              left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
            }}
          >
            Refreshing
          </span>
          Real Happiness
        </h1>
      </div>

      {/* Main Carousel */}
      <div className="d-flex justify-content-center mb-5" data-aos="fade-up">
        <div
          id="icecreamCarousel"
          className="carousel slide shadow-lg rounded"
          style={{
            width: "100%",
            maxWidth: "1100px",
          }}
        >
          <div className="carousel-inner">
            {[Icecream3, Icecream1, Icecream2, Icecream4].map((img, index) => (
              <div
                key={index}
                className={`carousel-item ${index === 0 ? "active" : ""}`}
              >
                <img
                  src={img}
                  className="d-block w-100"
                  alt={`Icecream ${index + 1}`}
                  style={{
                    borderRadius: "15px",
                    height: "clamp(550px, 50vh, 500px)",
                    objectFit: "cover",
                  }}
                />
              </div>
            ))}
          </div>
          {/* Carousel Buttons */}
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#icecreamCarousel"
            data-bs-slide="prev"
          >
            <span
              className="carousel-control-prev-icon"
              aria-hidden="true"
              style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
            ></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#icecreamCarousel"
            data-bs-slide="next"
          >
            <span
              className="carousel-control-next-icon"
              aria-hidden="true"
              style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
            ></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>

      {/* Best Sellers */}
      <h2
        className="text-center mb-4 fw-bold text-dark"
        style={{ fontFamily: "Poppins, sans-serif", color: "#1e3253" }}
        data-aos="fade-up"
      >
        Best Sellers
      </h2>

      <div className="container">
        <div className="row g-4 justify-content-center">
          {bestSellerProducts.map((item, index) => (
            <div key={index} className="col-6 col-sm-4 col-md-3 col-lg-2" data-aos="fade-up">
              <div
                onClick={() => navigate(`/productDetails/${item.id}`)}
                className="card shadow-sm h-100 border-0"
                style={{
                  borderRadius: "20px",
                  cursor: "pointer",
                  overflow: "hidden",
                  backgroundColor: "#fff8f0",
                  transition: "all 0.3s ease",
                }}
              >
                <img
                  src={item.image}
                  className="card-img-top"
                  alt={item.name}
                  style={{
                    height: "130px",
                    objectFit: "contain",
                    padding: "10px",
                    transition: "transform 0.3s ease",
                  }}
                />
                <div className="card-body text-center p-2">
                  <h6
                    className="card-title mb-4"
                    style={{
                      textAlign: "center",
                      fontFamily: "revert-layer",
                      fontSize: "13px",
                      color: "#0a2141",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {item.name}
                  </h6>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hero + Flavor Section */}
      <div
        className="d-flex flex-wrap justify-content-between align-items-center px-3 px-lg-5 py-5"
        style={{ background: " #fff8f0" }}
      >
        <div
          className="flex-grow-1 mb-4 mb-lg-0"
          style={{ minWidth: "300px", maxWidth: "500px" }}
        >
          <h1
  style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#0a2141" }}
  className="mx-5"
  data-aos="fade-up"
>
  Delicious Icecreams <br /> Just for You
</h1>
<p
  style={{ fontSize: "1.7rem", color: "#333", marginBottom: "1.2rem" }}
  className="mx-5"
  data-aos="fade-up"
>
  Explore our creamy icecreams <br /> and find your favorite flavor.
</p>

          <button
            onClick={() => navigate("/products")}
            style={{
              padding: "0.9rem 1.8rem",
              background: "#0a2141",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontSize: "1.2rem",
              cursor: "pointer",
            }}
            className="mx-5"
            data-aos="fade-up"
          >
            Explore icecreams →
          </button>
        </div>
        <div
          data-aos="fade-up"
          className="flex-grow-1 text-center mt-3"
          style={{ minWidth: "250px", maxWidth: "600px" }}
        >
          <FlavorSection
            icecream1={icecreamG}
            icecream2={icecreamGG}
            icecream3={icecreamHome5}
          />
        </div>
      </div>

      {/* Recently Viewed */}
      <div className="container my-5">
        <div
          className="d-flex flex-wrap justify-content-between align-items-center p-3 shadow-sm rounded-3"
          style={{ background: " #fff8f0" }}
        >
          <h2
            className="m-0 fw-bold"
            style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "clamp(1.2rem, 2vw, 1.6rem)",
              color: "#1e3253",
            }}
          >
            Recently Viewed
          </h2>
          <button
            className="btn btn-outline-dark rounded-pill px-4 py-2 mt-2 mt-sm-0"
            style={{
              fontWeight: "500",
              fontSize: "0.9rem",
              transition: "all 0.3s ease",
            }}
            onClick={() => navigate("/recentlyViewed")}
          >
            See All
          </button>
        </div>
      </div>

      <h4
        style={{
          textAlign: "center",
          fontFamily: "'Poppins', sans-serif",
          fontSize: "2rem",
          color: "#333",
          letterSpacing: "1px",
          margin: "20px 0",
        }}
      >
        Categories
      </h4>

      <div className="container my-4 mt-5">
        <div
          className="d-flex flex-wrap justify-content-center gap-5"
          style={{ overflow: "visible" }}
        >
          {[strawBerryHome, pistaaHome, blueberryHome, chocolateHome].map(
            (src, index) => (
              <div
                key={index}
                style={{
                  flex: "0 0 240px",
                  borderRadius: "15px",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onClick={() => {
                  setCategory(categories[index]);
                  navigate("/category");
                }}
                data-aos="fade-up"
              >
                <img
                  src={src}
                  alt={`img-${index}`}
                  style={{
                    width: "100%",
                    height: "350px",
                    objectFit: "cover",
                    display: "block",
                    transition: "transform 0.3s ease",
                  }}
                />
              </div>
            )
          )}
        </div>
      </div>

      <Footer data-aos="fade-up" />
      <ScrollToTop />

      {/* Responsive Carousel Heights */}
      <style>{`
        @media (max-width: 992px) {
          .carousel-inner img { height: 300px !important; }
        }
        @media (max-width: 768px) {
          .carousel-inner img { height: 250px !important; }
        }
        @media (max-width: 576px) {
          .carousel-inner img { height: 200px !important; }
        }
        .card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 25px rgba(0, 0, 0, 1);
        }
        .card:hover img {
          transform: scale(1.1);
        }
        .card:hover .card-title {
          color: #e63946;
        }
        div[style*="flex: 0 0"] img:hover {
          transform: scale(1.3);
        }
        div[style*="flex: 0 0"]:hover {
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
          z-index: 10;
        }
        @media (max-width: 992px) {
          div[style*="flex: 0 0"] { flex: 0 0 180px; }
        }
        @media (max-width: 768px) {
          div[style*="flex: 0 0"] { flex: 0 0 150px; }
        }
        @media (max-width: 576px) {
          div[style*="flex: 0 0"] { flex: 0 0 120px; }
        }
      `}</style>
    </>
  );
}
