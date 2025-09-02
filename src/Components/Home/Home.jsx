import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import Navbar from "../../Navbar/Navbar";
import Icecream1 from "../../../homeImages/icecream5.jpg";
import Icecream3 from "../../../homeImages/icecream3.jpg";
import Icecream4 from "../../../homeImages/icecream4.jpg";
import Icecream2 from "../../../homeImages/icecream6.jpg";
import { fetchProducts } from "../Fetch/FetchUser";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUser } from "../Fetch/FetchUser";
import { toast } from "react-toastify";
import Footer from "./Footer";
import icecreamGG from "../../../homeImages/icecreamGG.jpg"
import icecreamG from "../../../homeImages/icecreamGGG.jpg"
import FlavorSection from "../FlaverSection";
export default function Home() {

  const [bestSellerProducts,setBestSellerProducts]=useState([]);

const navigate=useNavigate()
  useEffect(()=>{
    async function fetchBestseller(){
      const products=await fetchProducts();
     
     
      const bestSeller=products.filter((p)=>p.bestseller==="true");
      if(bestSeller){
        setBestSellerProducts(bestSeller)
      }
      else return;
    }
    fetchBestseller();
  },[])
  useEffect(function(){
    async function fetchUserBlocked(){
      const savedUser=JSON.parse(localStorage.getItem("existingUser"))
      const response= await fetchUser(savedUser.id);
      if(response.block===true){
        toast.info("admin blocked");
        localStorage.removeItem("existingUser");
        navigate("/login")
      }
    }
    fetchUserBlocked()
  },[])
  return (
    <>
      <Navbar />
      <div style={{ height: "50px" }}></div>
<div className="d-flex justify-content-center mt-3 mb-1">
  <h1
    className="position-relative"
    style={{
      fontFamily: "Poppins, sans-serif",
      fontWeight: "700",
      fontSize: "clamp(2rem, 5vw, 3rem)", // responsive scaling
      color: "#111",
      lineHeight: "1.2",
      textAlign: "center",
    }}
  >
    <span
      style={{
        fontFamily: "'Pacifico', cursive",
        fontSize: "clamp(1rem, 3vw, 1.6rem)", // responsive accent
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

  
     <div className="d-flex justify-content-center" style={{ background: 'transparent' }}>
  <div
    id="icecreamCarousel"
    className="carousel slide shadow-lg mb-2 rounded"
    data-bs-ride="carousel"
    data-bs-interval="2000"
    style={{
      width: "1200px",
      maxWidth: "90%",
      
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)", // box shadow
      background: "transparent",
    }}
  >
    <div className="carousel-inner">
      <div className="carousel-item active">
        <img 
          src={Icecream3}
          className="d-block w-100"
          alt="Icecream 1"
          style={{ borderRadius: "15px", height: "500px", objectFit: "cover" }}
        />
      </div>
      <div className="carousel-item">
        <img
          src={Icecream1}
          className="d-block w-100"
          alt="Icecream 2"
          style={{ borderRadius: "15px", height: "500px", objectFit: "cover" }}
        />
      </div>
      <div className="carousel-item">
        <img
          src={Icecream2}
          className="d-block w-100"
          alt="Icecream 3"
          style={{ borderRadius: "15px", height: "500px", objectFit: "cover" }}
        />
      </div>
      <div className="carousel-item">
        <img
          src={Icecream4}
          className="d-block w-100"
          alt="Icecream 4"
          style={{ borderRadius: "15px", height: "500px", objectFit: "cover" }}
        />
      </div>
    </div>

    {/* Buttons */}
    <button className="carousel-control-prev" type="button" data-bs-target="#icecreamCarousel" data-bs-slide="prev">
      <span className="carousel-control-prev-icon" aria-hidden="true" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}></span>
      <span className="visually-hidden">Previous</span>
    </button>
    <button className="carousel-control-next" type="button" data-bs-target="#icecreamCarousel" data-bs-slide="next">
      <span className="carousel-control-next-icon" aria-hidden="true" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}></span>
      <span className="visually-hidden">Next</span>
    </button>
  </div>
</div>







      <div className="my-4"></div>

      <h2 className="text-center mb-4 fw-bold text-dark">Best Sellers</h2>

 <div className="container">
  <div className="row g-4 justify-content-center">
    {bestSellerProducts.map((item, index) => (
      <div key={index} className="col-6 col-sm-4 col-md-3 col-lg-2">
        <div className="card shadow-sm h-100 border-0"style={{borderRadius:'20px'}}>
          <img onClick={()=>navigate(`/productDetails/${item.id}`)}
            src={item.image}
            className="card-img-top"
            alt={item.name}
            style={{
              height: "130px",      // fixed smaller height
              objectFit: "contain", // fit nicely inside
              padding: "10px"
            }}
          />
          <div className="card-body text-center p-2">
            <h6 className="card-title mb-1"style={{textAlign:'center',fontFamily:'revert',fontSize:'12px'}}>{item.name}</h6> 
          
          </div>
        </div>
      </div>
          ))}
        </div>
      </div>


<div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "3rem 5%",
    background: "#fff8f0",
    flexWrap: "wrap",
    paddingLeft: "12%",   // pushes text a bit to the right
  }}
  className="mx-5 my-5"
>

      <div
        style={{
          flex: "1 1 350px",
          maxWidth: "500px",
          marginBottom: "2rem",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "bold",
            color: "#0a2141",
            marginBottom: "1rem",
          }}
        >
          Find your new <br /> fave flavor.
        </h1>
        <p style={{ fontSize: "1rem", color: "#333", marginBottom: "1.5rem" }}>
          Take the quiz to see <br /> which flavor you’re feeling.
        </p>
        <button
          style={{
            padding: "0.9rem 1.8rem",
            background: "#0a2141",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            fontSize: "2rem",
            cursor: "pointer",
          }}
        >
          Take the quiz →
        </button>
      </div>

      {/* Right image */}
      <div
        style={{
          flex: "1 1 400px",
          textAlign: "center",
        }}
      >
         <FlavorSection icecream1={icecreamG} icecream2={icecreamGG} />
      </div>
    </div>


<div className="container my-4">
  <div 
    className="d-flex flex-wrap justify-content-between align-items-center p-3 shadow-sm rounded-3"
    style={{ background: "#f8f9fa" }}
  >
    {/* Title */}
    <h2 
      className="m-0 fw-bold"
      style={{
        fontFamily: "Poppins, sans-serif",
        fontSize: "clamp(1.2rem, 2vw, 1.6rem)",
        color: "#1e3253"
      }}
    >
      Recently Viewed
    </h2>

    {/* Button */}
    <button 
      className="btn btn-outline-dark rounded-pill px-4 py-2 mt-2 mt-sm-0"
      style={{
        fontWeight: "500",
        fontSize: "0.9rem",
        transition: "all 0.3s ease",
      }}
      onClick={()=>navigate("/recentlyViewed")}
    >
      See All
    </button>
  </div>
</div>


<Footer />






      {/* Responsive styling using media queries */}
      <style >{`
        @media (max-width: 992px) {
          .carousel-inner img {
            height: 300px !important;
          }
        }
        @media (max-width: 768px) {
          .carousel-inner img {
            height: 250px !important;
          }
        }
        @media (max-width: 576px) {
          .carousel-inner img {
            height: 200px !important;
          }
        }
      `}</style>
    </>
  );
}
