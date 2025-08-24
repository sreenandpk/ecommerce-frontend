import axios from "axios"
import { useEffect, useState } from "react"
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";



import { useContext } from "react";
import { SearchContext } from "../Components/SearchContext/SearchContext";
import { useNavigate } from "react-router-dom";

import { Search } from "@mui/icons-material";
export default function Navbar(){



    
    const [inputValue,setinputValue]=useState("");
        const {setSearchValue}=useContext(SearchContext);

      
        

        const navigate=useNavigate();

      const { cartCount = 0, wishlistIds = [] } = useContext(SearchContext);


       

      
      

            const [savedUser,setSavedUser]=useState(JSON.parse(localStorage.getItem("existingUser")));
   
              

return(

 <div
        className="container-fluid"
        style={{
          backgroundColor: "white",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "10px 15px",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          marginTop: "10px",
          borderRadius: "50px",
        }}
      >
        <div className="d-flex justify-content-between align-items-center">
          
          {/* ✅ Logo only on large screens */}
          <div className="d-none d-md-block fw-bold fs-4" style={{ fontFamily: "fantasy", color: "black" }}>
            Diary
          </div>

          {/* 🔹 Search Bar */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (inputValue.toLowerCase().trim()) {
                setSearchValue(inputValue);
                navigate("/search");
              }
            }}
            className="position-relative mx-3 flex-grow-1"
            style={{ maxWidth: "350px" }}
          >
            <input
              placeholder="Search"
              onChange={(event) => setinputValue(event.target.value)}
              className="form-control rounded-pill ps-3 pe-5"
              style={{ height: "40px" }}
            />
            <button
              type="submit"
              className="btn position-absolute top-50 end-0 translate-middle-y p-2"
              style={{ background: "transparent", border: "none" }}
            >
              <Search style={{ color: "#555" }} />
            </button>
          </form>

          {/* ✅ Buttons (Desktop) */}
          <div className="d-none d-md-flex gap-2">
            <button
              onClick={() => navigate("/wishlist")}
              className="btn btn-light rounded-pill px-4 position-relative"
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
              className="btn btn-light rounded-pill px-3 position-relative"
            >
              Cart
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              className="btn btn-light rounded-pill px-3"
              onClick={() => {
                if (!savedUser) {
                  navigate("/login");
                } else {
                  localStorage.removeItem("existingUser");
                  setSavedUser(null);
                  navigate("/login");
                }
              }}
            >
              {savedUser ? "Logout" : "Login"}
            </button>
          </div>

          {/* ✅ Dropdown (Mobile) */}
          <div className="d-block d-md-none">
            <div className="dropdown">
              <button
                className="btn btn-light rounded-circle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-list fs-4"></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow">
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/wishlist")}
                  >
                    Wishlist
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/cart")}
                  >
                    Cart
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/account")}
                  >
                    Profile
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      if (!savedUser) {
                        navigate("/login");
                      } else {
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
      </div>







)



}