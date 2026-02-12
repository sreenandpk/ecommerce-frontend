import "bootstrap/dist/css/bootstrap.min.css";
import { useLoading } from "../../context/LoadingContext";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import Icecream1 from "../../homeImages/iceCreamTopHome6.png";
import Icecream3 from "../../homeImages/icecream3.jpg";
import Icecream4 from "../../homeImages/iceCreamHomeTop7.png";
import Icecream2 from "../../homeImages/iceCreamHomeTop8.png";

import icecreamHome5 from "../../homeImages/icecreamHome55.jpg";
import icecreamGG from "../../homeImages/milkHome.jpg";
import icecreamG from "../../homeImages/MoodHome.jpg";

import strawBerryHome from "../../homeImages/strawberryHome.jpg";
import pistaaHome from "../../homeImages/pistaaHome.jpg";
import blueberryHome from "../../homeImages/bluberryHome.jpg";
import chocolateHome from "../../homeImages/chocolateHome.jpg";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


import Footer from "../../components/Layout/Footer";
import ScrollToTop from "../../components/Common/ScrollToTop";
import FlavorSection from "../../components/Products/FlaverSection";

import { getCategories } from "../../api/user/category";
import { getBestSellers } from "../../api/user/products";
import { fetchUser } from "../../components/Fetch/FetchUser";
import { getCart } from "../../api/user/cart";

import CategoryGrid from "../../components/Home/CategoryGrid";
import BestSellerGrid from "../../components/Home/BestSellerGrid";
import ImageCarousel from "../../components/Home/ImageCarousel";

export default function Home() {
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();
  const [backendCategories, setBackendCategories] = useState([]);

  const [bestSellers, setBestSellers] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // ✅ Carousel images (reusable)
  const carouselImages = [
    Icecream3,
    Icecream1,
    Icecream2,
    Icecream4,
  ];

  useEffect(() => {
    async function init() {
      try {
        const [catData, bestData] = await Promise.all([
          getCategories(),
          getBestSellers(),
        ]);

        // Handle both paginated and direct array responses
        const categories = Array.isArray(catData) ? catData : (catData.results || []);
        console.log("Categories data:", categories);
        setBackendCategories(categories);

        setBestSellers(bestData);

        // Fetch User for Recently Viewed & Cart
        const userId = localStorage.getItem("userId");
        if (userId) {
          const user = await fetchUser(userId);
          setRecentlyViewed(user.recently_viewed || []);


        }
      } catch (err) {
        console.error("Failed to load home data", err);
      } finally {
        stopLoading();
      }
    }
    init();

  }, []);



  return (
    <>
      <div className="d-none d-md-block" style={{ height: "120px" }} />
      <div className="d-md-none" style={{ height: "150px" }} />

      {/* ================= HERO SECTION ================= */}
      <div className="text-center mb-2 position-relative">
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
              fontSize: "clamp(1.2rem, 4vw, 2rem)",
              color: "#e63946",
              position: "absolute",
              top: "-40px",
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

      {/* ================= MAIN CAROUSEL ================= */}
      <div className="d-flex justify-content-center mb-5">
        <ImageCarousel
          id="icecreamCarousel"
          images={carouselImages}
        />
      </div>

      {/* ================= BEST SELLERS ================= */}
      <div
        className="best-sellers-header text-center mb-5 px-3"
        style={{
          position: "relative",
          paddingTop: "3rem"
        }}
      >
        {/* Decorative Elements */}
        <div style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "3rem",
          opacity: 0.1,
          pointerEvents: "none"
        }}>
          ⭐
        </div>

        {/* Icon Badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "linear-gradient(135deg, #fef3c7, #fde68a)",
          padding: "8px 20px",
          borderRadius: "50px",
          marginBottom: "16px",
          border: "1px solid rgba(251, 191, 36, 0.3)"
        }}>
          <span style={{ fontSize: "1.2rem" }}>🏆</span>
          <span style={{
            fontSize: "0.85rem",
            fontWeight: "600",
            color: "#92400e",
            letterSpacing: "0.5px"
          }}>
            CUSTOMER FAVORITES
          </span>
        </div>

        {/* Main Title */}
        <h2 style={{
          fontSize: "2.5rem",
          fontWeight: "800",
          background: "linear-gradient(135deg, #7a432b, #5a3221, #3a2a24)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: "12px",
          fontFamily: "Poppins, sans-serif"
        }}>
          Best Sellers
        </h2>

        {/* Subtitle */}
        <p style={{
          fontSize: "1.1rem",
          color: "#6b7280",
          maxWidth: "500px",
          margin: "0 auto",
          lineHeight: "1.6"
        }}>
          Our most loved ice creams, handpicked by customers just like you
        </p>

        {/* Decorative Line */}
        <div style={{
          width: "80px",
          height: "4px",
          background: "linear-gradient(90deg, transparent, #7a432b, transparent)",
          margin: "24px auto 0",
          borderRadius: "2px"
        }}></div>
      </div>

      <BestSellerGrid products={bestSellers} />

      {/* ================= HERO + FLAVOR ================= */}
      <div
        className="d-flex flex-wrap justify-content-between align-items-center px-3 px-lg-5 py-5"
        style={{ background: "#fff8f0" }}
      >
        <div
          className="flex-grow-1 mb-4 mb-lg-0 text-center text-lg-start"
          style={{ minWidth: "300px", maxWidth: "600px" }}
        >
          <h1
            style={{ fontSize: "3.5rem", fontWeight: "bold", color: "#0a2141" }}
            className="mx-2 mx-md-5"
          >
            Delicious Icecreams <br /> Just for You
          </h1>

          <p
            style={{ fontSize: "1.6rem", color: "#333", marginBottom: "1.2rem" }}
            className="mx-2 mx-md-5"
          >
            Explore our creamy icecreams <br className="d-none d-sm-block" /> and find your favorite flavor.
          </p>

          <button
            onClick={() => navigate("/products")}
            style={{
              padding: "1.2rem 2.4rem",
              background: "#0a2141",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontSize: "1.4rem",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            className="mx-2 mx-md-5 hero-explore-btn"
          >
            Explore icecreams →
          </button>
        </div>

        <div
          className="flex-grow-1 text-center mt-3 flavor-container-box"
          style={{ minWidth: "250px", maxWidth: "600px" }}
        >
          <FlavorSection
            icecream1={icecreamG}
            icecream2={icecreamGG}
            icecream3={icecreamHome5}
          />
        </div>
      </div>

      {/* ================= RECENTLY VIEWED ================= */}
      {/* ================= RECENTLY VIEWED (Header Link Only) ================= */}
      {recentlyViewed.length > 0 && (
        <div className="container my-5">
          <div
            className="d-flex flex-wrap justify-content-between align-items-center p-3 border rounded-4"
            style={{ background: "#fff8f0" }}
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
              onClick={() => navigate("/recentlyViewed")}
            >
              See All
            </button>
          </div>
        </div>
      )}

      {/* ================= CATEGORIES ================= */}
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

      <CategoryGrid categories={backendCategories} />

      <Footer />
      <ScrollToTop />
      <style>{`
        .hero-explore-btn:hover {
          transform: scale(1.08) translateY(-3px);
          background-color: #0a2141 !important;
          color: #fff !important;
        }
        @media (max-width: 576px) {
          .flavor-container-box {
            max-width: 400px !important;
            margin: 0 auto !important;
          }
          #icecreamCarousel img {
            height: 210px !important;
            object-fit: cover !important;
          }
          .mx-2.mx-md-5 h1 {
             font-size: 1.8rem !important;
          }
          .mx-2.mx-md-5 p {
             font-size: 1.1rem !important;
          }
          .hero-explore-btn {
             padding: 1rem 2rem !important;
             font-size: 1.25rem !important;
          }
        }
      `}</style>
    </>
  );
}

