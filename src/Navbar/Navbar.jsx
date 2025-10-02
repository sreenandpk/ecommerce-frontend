import { useState, useContext, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { SearchContext } from "../Components/SearchContext/SearchContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Search } from "@mui/icons-material";
import Dprofile from "../../homeImages/profileDD.jpeg";
import { FaHeart, FaShoppingCart, FaSearch } from "react-icons/fa";
import { useSpring, animated } from "@react-spring/web";
import { Dropdown } from "react-bootstrap";
import { fetchUser } from "../Components/Fetch/FetchUser";

export default function Navbar() {
  const [visible, setVisible] = useState(true);
  const [mobileVisible, setMobileVisible] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const {
    setSearchValue,
    cartCount = 0,
    wishlistIds = [],
    setWishlistIds,
    setRecentlyViewedProducts,
    setCartCount,
    setWishlistCount,
  } = useContext(SearchContext);

  const navigate = useNavigate();
  const location = useLocation();
  const [profileImage, setProfileImage] = useState("");

  const [savedUserId, setSavedUserId] = useState(
    JSON.parse(localStorage.getItem("userId"))
  );

  const lastScrollY = useRef(0);

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

  const handleScroll = () => {
    if (window.scrollY === 0) {
      setVisible(true);
      setMobileVisible(true);
    } else if (window.scrollY > lastScrollY.current) {
      setVisible(false);
      setMobileVisible(false);
    } else {
      setVisible(true);
      setMobileVisible(true);
    }
    lastScrollY.current = window.scrollY;
  };

  useEffect(() => {
    if (!mobileSearchOpen) return;
    const closeOnScroll = () => setMobileSearchOpen(false);
    window.addEventListener("scroll", closeOnScroll);
    return () => window.removeEventListener("scroll", closeOnScroll);
  }, [mobileSearchOpen]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const desktopStyles = useSpring({
    transform: visible ? "translateY(0%)" : "translateY(-100%)",
    opacity: visible ? 1 : 0,
    config: { tension: 220, friction: 25 },
  });

  const mobileStyles = useSpring({
    transform: mobileVisible ? "translateY(0%)" : "translateY(-100%)",
    opacity: mobileVisible ? 1 : 0,
    config: { tension: 220, friction: 25 },
  });

  useEffect(() => {
    async function loadUserData() {
      if (!savedUserId) return;
      try {
        const res = await fetchUser(savedUserId);
        setProfileImage(res.image);
        setWishlistIds(res.wishlist?.map((item) => item.id) || []);
        setCartCount(res.cart?.length || 0);
        setWishlistCount(res.wishlist?.length || 0);
      } catch (e) {
        console.log(e);
      }
    }

    loadUserData();

    const handleProfileUpdate = () => {
      const newId = JSON.parse(localStorage.getItem("userId"));
      setSavedUserId(newId);
      if (newId) loadUserData();
      else {
        setProfileImage("");
        setWishlistIds([]);
        setCartCount(0);
        setWishlistCount(0);
        setRecentlyViewedProducts([]);
      }
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, [savedUserId]);

  return (
    <>
      {/* Desktop Navbar */}
      <animated.div
        style={{
          ...desktopStyles,
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 1000,
        }}
      >
        <div
          className="d-none d-md-flex justify-content-between align-items-center container-fluid mt-3"
          style={{
            backgroundColor: "#fff8f0",
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "17px 15px",
            borderRadius: "50px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          <div
            className="fw-bold fs-4"
            style={{ fontFamily: "Montserrat, sans-serif", color: "black", cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
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
              className="form-control rounded-pill ps-3 pe-5"
              style={{ height: "35px", fontSize: "16px", background: "none" }}
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
              className="btn rounded-pill px-4 position-relative"
              style={{ border: "none" }}
            >
              <FaHeart
                style={{ color: wishlistIds.length > 0 ? "#111" : "gray", marginBottom: "3px" }}
              />{" "}
              Wishlist
              {wishlistIds.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate("/cart")}
              className="btn rounded-pill px-3 position-relative"
              style={{ border: "none" }}
            >
              <FaShoppingCart style={{ color: cartCount > 0 ? "#111" : "gray" }} /> Cart
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartCount}
                </span>
              )}
            </button>

            <Dropdown align="end">
              <Dropdown.Toggle
                style={{ border: "none", background: "transparent", padding: 0 }}
              >
                <img
                  src={profileImage || Dprofile}
                  style={{
                    height: "45px",
                    width: "45px",
                    borderRadius: "50%",
                    border: "1px solid gray",
                  }}
                />
              </Dropdown.Toggle>

              <Dropdown.Menu style={{ background: "#fff8f0" }}>
                <Dropdown.Item onClick={() => navigate("/account")}>Profile</Dropdown.Item>
                <Dropdown.Item onClick={() => navigate("/myOrders")}>My Orders</Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    if (!savedUserId) navigate("/login");
                    else {
                      localStorage.removeItem("userId");
                      localStorage.removeItem("cartTotalLength");
                      setSavedUserId(null);
                      setWishlistIds([]);
                      setRecentlyViewedProducts([]);
                      setWishlistCount(0);
                      setCartCount(0);
                      navigate("/login");
                      window.dispatchEvent(new Event("profileUpdated"));
                    }
                  }}
                >
                  {savedUserId ? "Logout" : "Login"}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </animated.div>

      {/* Mobile Navbar */}
<animated.div
  style={{
    ...mobileStyles,
    position: "fixed",
    top: 0,
    width: "100%",
    zIndex: 1000,
  }}
>
  <div
    className="d-flex d-md-none justify-content-between align-items-center container-fluid "
    style={{
      backgroundColor: "#fff8f0",
      padding: "10px 15px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
     
      
      flexDirection: "column",
    }}
  >
    {/* Top row: logo + icons */}
    <div className="d-flex justify-content-between align-items-center w-100">
      <div
        className="fw-bold fs-4"
        style={{ color: "black", cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        Diary
      </div>

      <div className="d-flex align-items-center gap-3">
        <button
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          className="btn p-1"
          style={{ border: "none" }}
        >
          <FaSearch />
        </button>
        <button
          onClick={() => navigate("/wishlist")}
          className="btn p-1 position-relative"
          style={{ border: "none" }}
        >
          <FaHeart style={{ color: wishlistIds.length > 0 ? "#111" : "gray" }} />
          {wishlistIds.length > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {wishlistIds.length}
            </span>
          )}
        </button>
        <button
          onClick={() => navigate("/cart")}
          className="btn p-1 position-relative"
          style={{ border: "none" }}
        >
          <FaShoppingCart style={{ color: cartCount > 0 ? "#111" : "gray" }} />
          {cartCount > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {cartCount}
            </span>
          )}
        </button>

        <Dropdown align="end">
          <Dropdown.Toggle style={{ border: "none", background: "transparent", padding: 0 }}>
            <img
              src={profileImage || Dprofile}
              style={{
                height: "40px",
                width: "40px",
                borderRadius: "50%",
                border: "1px solid gray",
              }}
            />
          </Dropdown.Toggle>
          <Dropdown.Menu style={{ background: "#fff8f0" }}>
            <Dropdown.Item onClick={() => navigate("/account")}>Profile</Dropdown.Item>
            <Dropdown.Item onClick={() => navigate("/myOrders")}>My Orders</Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                if (!savedUserId) navigate("/login");
                else {
                  localStorage.removeItem("userId");
                  localStorage.removeItem("cartTotalLength");
                  setSavedUserId(null);
                  setWishlistIds([]);
                  setRecentlyViewedProducts([]);
                  setWishlistCount(0);
                  setCartCount(0);
                  navigate("/login");
                  window.dispatchEvent(new Event("profileUpdated"));
                }
              }}
            >
              {savedUserId ? "Logout" : "Login"}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>

    {/* Navigation Links Row */}
    <div className="d-flex justify-content-center gap-3 mt-2 w-100">
      <span
        onClick={() => navigate("/")}
        className={`px-2 py-1 rounded ${active === "/" ? "bg-secondary text-white" : ""}`}
        style={{ cursor: "pointer", fontSize: "14px" }}
      >
        Home
      </span>
      <span
        onClick={() => navigate("/products")}
        className={`px-2 py-1 rounded ${active === "products" ? "bg-secondary text-white" : ""}`}
        style={{ cursor: "pointer", fontSize: "14px" }}
      >
        Products
      </span>
      <span
        onClick={() => navigate("/about")}
        className={`px-2 py-1 rounded ${active === "about" ? "bg-secondary text-white" : ""}`}
        style={{ cursor: "pointer", fontSize: "14px" }}
      >
        About
      </span>
    </div>

    {/* Mobile Search Input */}
    {mobileSearchOpen && (
      <form onSubmit={handleSearchSubmit} className="w-100 mt-2">
        <input
          placeholder="Search"
          onChange={(event) => setInputValue(event.target.value)}
          className="form-control rounded-pill ps-3 pe-5"
          style={{ height: "35px", fontSize: "16px", background: "#fff8f0" }}
        />
      </form>
    )}
  </div>
</animated.div>


      <div style={{ height: mobileSearchOpen ? "140px" : "80px" }}></div>
    </>
  );
}
