import { useState, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { SearchContext } from "../Components/SearchContext/SearchContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Search } from "@mui/icons-material";
import profile from "../../homeImages/profileDD.jpeg";
export default function Navbar() {
 
  const [inputValue, setInputValue] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { setSearchValue } = useContext(SearchContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount = 0, wishlistIds = [] } = useContext(SearchContext);
  const [savedUser, setSavedUser] = useState(
    JSON.parse(localStorage.getItem("existingUser"))
  );


  const active =
    location.pathname === "/"
      ? "/"
      : location.pathname === "/products"
      ? "products"
      : location.pathname === "/about"
      ? "about"
      : "";

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (inputValue.toLowerCase().trim()) {
      setSearchValue(inputValue);
      navigate("/search");
      setMobileSearchOpen(false);
    }
  };

  return (
    <>
      {/* Desktop Navbar */}
      <div
        className="d-none d-md-flex justify-content-between align-items-center container-fluid mt-3"
        style={{
          backgroundColor: "  #fff8f0",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "10px 15px",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          borderRadius: "50px",
        }}
      >
       
<div className="fw-bold fs-4" style={{ fontFamily: "Montserrat, sans-serif", color: "black" }}>
  Diary
</div>


        <div className="d-flex gap-2">
          <span
            onClick={() => navigate("/")}
            className={`px-2 py-1 rounded ${active === "/" ? "bg-secondary text-white" : ""}`}
            style={{ cursor: "pointer" }}
          >
            Home
          </span>
          <span
            onClick={() => navigate("/products")}
            className={`px-2 py-1 rounded ${active === "products" ? "bg-secondary text-white" : ""}`}
            style={{ cursor: "pointer" }}
          >
            Products
          </span>
          <span
            onClick={() => navigate("/about")}
            className={`px-2 py-1 rounded ${active === "about" ? "bg-secondary text-white" : ""}`}
            style={{ cursor: "pointer" }}
          >
            About
          </span>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="position-relative mx-2 flex-grow-1"
          style={{ maxWidth: "250px" }}
        >
          <input
            placeholder="Search"
            onChange={(event) => setInputValue(event.target.value)}
            className="form-control rounded-pill ps-3 pe-5 "
            style={{ height: "35px", fontSize: "14px" ,color:'none',background:'none'}}
          />
          <button
            type="submit"
            className="btn position-absolute top-50 end-0 translate-middle-y p-2"
            style={{ background: "transparent", border: "none" }}
          >
            <Search style={{ color: "#555", fontSize: "18px" }} />
          </button>
        </form>

        <div className="d-flex gap-2 align-items-center">
          <button
            onClick={() => navigate("/wishlist")}
            className="btn  rounded-pill px-4 position-relative"
            style={{border:'none'}}
          >
            Wishlist
            {wishlistIds.length > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {wishlistIds.length}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate("/cart")}
            className="btn  rounded-pill px-3 position-relative"
            style={{border:'none'}}
          >
            Cart
            {cartCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cartCount}
              </span>
            )}
          </button>

          <div className="dropdown">
            <button className="btn  px-3" type="button" data-bs-toggle="dropdown"style={{border:'none'}}>
           <img 
  src={savedUser?.image || profile} 
  style={{height:'45px',width:'45px',borderRadius:'50%',border:'1px solid gray'}} 
/>

            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow"style={{background:' #fff8f0'}}>
              <li>
                <button className="dropdown-item " onClick={() => navigate("/account")}>
                  Profile
                </button>
              </li>  <li>
                <button className="dropdown-item" onClick={() => navigate("/myOrders")}>
                  My Orders
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    if (!savedUser) navigate("/login");
                    else {
                      localStorage.removeItem("existingUser");
                      setSavedUser(null);
                      
                      navigate("/login");
                     
                    }
                  }}
                >
                  {savedUser ? "Logout" : "Login"}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="d-block d-md-none container-fluid" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, backgroundColor: " #fff8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>
        {/* Top Row */}
        <div className="d-flex justify-content-between align-items-center p-2">
          
<div className="fw-bold fs-4" style={{ fontFamily: "Montserrat, sans-serif", color: "black" }}>
  Diary
</div>

          <div className="d-flex gap-2">
            <button className="btn  p-2" onClick={() => setMobileSearchOpen(!mobileSearchOpen)} style={{border:'none'}}>
              <Search />
            </button>
            <div className="dropdown">
              <button className="btn  p-2" type="button" data-bs-toggle="dropdown"style={{border:'none'}}>
               <img 
  src={savedUser?.image || profile} 
  style={{height:'45px',width:'45px',borderRadius:'50%',border:'1px solid gray'}} 
/>

              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow text-center"style={{background:'#fff8f0'}}>
                <li>
                  <button className="dropdown-item " onClick={() => navigate("/wishlist")}>
                    Wishlist {wishlistIds.length > 0 && `(${wishlistIds.length})`}
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => navigate("/cart")}>
                    Cart {cartCount > 0 && `(${cartCount})`}
                  </button>
                </li>
                <li>
                  <button className="dropdown-item " onClick={() => navigate("/account")}>
                    Profile
                  </button>
                </li>
                <li>   <button className="dropdown-item" onClick={() => navigate("/myOrders")}>
                  My Orders
                </button></li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      if (!savedUser) navigate("/login");
                      else {
                        localStorage.removeItem("existingUser");
                        setSavedUser(null);
                        navigate("/login");
                      }
                    }}
                  >
                    {savedUser ? "Logout" : "Login"}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        {mobileSearchOpen && (
          <form onSubmit={handleSearchSubmit} className="px-2 pb-2">
            <input 
              placeholder="Search"
              onChange={(e) => setInputValue(e.target.value)}
              className="form-control ps-3 pe-4"
              style={{ height: "40px", fontSize: "14px", borderRadius: "20px",background:'#fff8f0' }}
              autoFocus
            />
          </form>
        )}

        {/* Mobile Navigation */}
        <div className="d-flex justify-content-around pb-2">
          <span
            onClick={() => navigate("/")}
            className={`px-2 py-1 rounded ${active === "/" ? "bg-secondary text-white" : ""}`}
            style={{ cursor: "pointer", flex: 1, textAlign: "center" }}
          >
            Home
          </span>
          <span
            onClick={() => navigate("/products")}
            className={`px-2 py-1 rounded ${active === "products" ? "bg-secondary text-white" : ""}`}
            style={{ cursor: "pointer", flex: 1, textAlign: "center" }}
          >
            Products
          </span>
          <span
            onClick={() => navigate("/about")}
            className={`px-2 py-1 rounded ${active === "about" ? "bg-secondary text-white" : ""}`}
            style={{ cursor: "pointer", flex: 1, textAlign: "center" }}
          >
            About
          </span>
        </div>
      </div>

      {/* Spacer so page content not hidden under fixed navbar */}
      <div style={{ height: "80px" }}></div>
    </>
  );
}