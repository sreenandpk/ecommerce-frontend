import axios from "axios";
import { useEffect, useState, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { SearchContext } from "../Components/SearchContext/SearchContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Search } from "@mui/icons-material";

export default function Navbar() {
  const [inputValue, setInputValue] = useState("");
  const { setSearchValue } = useContext(SearchContext);
  const navigate = useNavigate();
  const location = useLocation(); // track current URL path
  const { cartCount = 0, wishlistIds = [] } = useContext(SearchContext);
  const [savedUser, setSavedUser] = useState(
    JSON.parse(localStorage.getItem("existingUser"))
  );

  // Determine active tab based on URL
  const active =
    location.pathname === "/"
      ? "/"
      : location.pathname === "/products"
      ? "products"
      : location.pathname === "/about"
      ? "about"
      : "";

  return (
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
        {/* Logo */}
        <div
          className="d-none d-md-block fw-bold fs-4"
          style={{ fontFamily: "fantasy", color: "black" }}
        >
          Diary
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: "20px" }}>
          <span
            onClick={() => navigate("/")}
            className={`px-2 py-1 rounded ${
              active === "/" ? "bg-secondary text-white" : ""
            }`}
            style={{ cursor: "pointer" }}
          >
            Home
          </span>

          <span
            onClick={() => navigate("/products")}
            className={`px-2 py-1 rounded ${
              active === "products" ? "bg-secondary text-white" : ""
            }`}
            style={{ cursor: "pointer" }}
          >
            Products
          </span>

          <span
            onClick={() => navigate("/about")}
            className={`px-2 py-1 rounded ${
              active === "about" ? "bg-secondary text-white" : ""
            }`}
            style={{ cursor: "pointer" }}
          >
            About
          </span>
        </div>

        {/* Search Bar */}
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
            onChange={(event) => setInputValue(event.target.value)}
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

        {/* Desktop Buttons */}
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

        {/* Mobile Dropdown */}
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
  );
}
