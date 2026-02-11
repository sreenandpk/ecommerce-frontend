import { useState, useContext, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { SearchContext } from "../../context/SearchContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Search } from "@mui/icons-material";
import Dprofile from "../../homeImages/profileDD.jpeg";
import { FaHeart, FaShoppingCart, FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Dropdown } from "react-bootstrap";
import { fetchUser, fetchProductByName } from "../Fetch/FetchUser";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { logout, isAdmin } = useAuth();
  const [visible, setVisible] = useState(true);
  const [mobileVisible, setMobileVisible] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const {
    setSearchValue,
    cartCount = 0,
    wishlistIds = [],
    refreshCart,
    refreshWishlist,
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
      setShowSuggestions(false);
      navigate("/search");
      setMobileSearchOpen(false);
    }
  };

  // Instant Search Suggestions Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (inputValue.trim().length > 1) {
        try {
          const results = await fetchProductByName(inputValue);
          setSuggestions(results.slice(0, 6)); // Limit to 6 suggestions
          setShowSuggestions(true);
        } catch (err) {
          console.error("Search error:", err);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Click Away Listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (mobileSearchOpen && mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        // Only close if not clicking the search input itself
        if (!event.target.closest('form')) setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileSearchOpen]);

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
    if (!savedUserId) {
      setCartCount(0);
      setWishlistCount(0);
      setRecentlyViewedProducts([]);
    }
  }, [savedUserId, setCartCount, setWishlistCount, setRecentlyViewedProducts]);


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

  useEffect(() => {
    async function loadUserData() {
      if (!savedUserId) return;
      try {
        const res = await fetchUser(savedUserId);
        setProfileImage(res.image);

        // Refresh global counts correctly
        await refreshCart();
        await refreshWishlist();
      } catch (e) {
        console.log("Navbar: Error loading user data:", e);
      }
    }

    loadUserData();

    const handleProfileUpdate = () => {
      const newId = JSON.parse(localStorage.getItem("userId"));
      setSavedUserId(newId);
      if (newId) loadUserData();
      else {
        setProfileImage("");
        setCartCount(0);
        setWishlistCount(0);
        setRecentlyViewedProducts([]);
      }
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, [savedUserId, refreshCart, refreshWishlist, setCartCount, setWishlistCount, setRecentlyViewedProducts]);

  return (
    <>
      {/* Desktop Navbar */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 1000,
          paddingTop: "12px"
        }}
      >
        <div
          className="d-none d-md-flex justify-content-between align-items-center container-fluid"
          style={{
            backgroundColor: "rgba(255, 248, 240, 0.95)", // Glassmorphic Cream
            backdropFilter: "blur(12px)",
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "8px 25px",
            borderRadius: "50px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            border: "1px solid rgba(255, 255, 255, 0.5)"
          }}
        >
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="fw-bold fs-4"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#5D372B",
              cursor: "pointer",
              letterSpacing: "-0.5px"
            }}
            onClick={() => navigate("/")}
          >
            Diary
          </motion.div>

          {/* Navigation Links */}
          <div className="d-flex gap-4">
            {[
              { name: "Home", path: "/" },
              { name: "Products", path: "/products" },
              { name: "About", path: "/about" }
            ].map((link) => (
              <motion.span
                key={link.name}
                onClick={() => navigate(link.path)}
                whileHover={{ scale: 1.1, color: "#5D372B" }}
                className="px-2 py-1"
                style={{
                  cursor: "pointer",
                  color: active === (link.path === "/" ? "/" : link.path.substring(1)) ? "#5D372B" : "#8d6e63",
                  fontWeight: active === (link.path === "/" ? "/" : link.path.substring(1)) ? "700" : "500",
                  position: "relative"
                }}
              >
                {link.name}
                {active === (link.path === "/" ? "/" : link.path.substring(1)) && (
                  <motion.div
                    layoutId="underline"
                    style={{
                      position: "absolute",
                      bottom: "-4px",
                      left: 0,
                      right: 0,
                      height: "2px",
                      background: "#5D372B",
                      borderRadius: "2px"
                    }}
                  />
                )}
              </motion.span>
            ))}
            {isAdmin && (
              <motion.span
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate("/admin")}
                className="px-2 py-1"
                style={{ cursor: "pointer", color: "#e63946", fontWeight: "bold" }}
              >
                Dashboard
              </motion.span>
            )}
          </div>

          {/* Search Bar */}
          <form
            ref={searchRef}
            onSubmit={handleSearchSubmit}
            className="position-relative mx-2"
            style={{ width: "250px" }}
          >
            <motion.input
              placeholder="Search flavors..."
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onFocus={() => inputValue.length > 1 && setShowSuggestions(true)}
              whileFocus={{ scale: 1.02, boxShadow: "0 0 15px rgba(93, 55, 43, 0.15)" }}
              className="form-control rounded-pill ps-4 pe-5"
              style={{
                height: "40px",
                fontSize: "0.9rem",
                background: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(93, 55, 43, 0.1)",
                color: "#5D372B",
                transition: "width 0.3s ease"
              }}
            />
            <button
              type="submit"
              className="btn position-absolute top-50 end-0 translate-middle-y p-2 me-1"
              style={{ background: "transparent", border: "none" }}
            >
              <Search style={{ color: "#7B4B3A", fontSize: "20px" }} />
            </button>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    top: "110%",
                    left: 0,
                    right: 0,
                    background: "rgba(255, 248, 240, 0.98)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "20px",
                    boxShadow: "0 20px 50px rgba(93, 55, 43, 0.2)",
                    border: "1px solid rgba(93, 55, 43, 0.1)",
                    overflow: "hidden",
                    zIndex: 1100
                  }}
                >
                  {suggestions.length > 0 ? (
                    <motion.div
                      initial="hidden"
                      animate="show"
                      variants={{
                        hidden: { opacity: 0 },
                        show: {
                          opacity: 1,
                          transition: { staggerChildren: 0.05 }
                        }
                      }}
                    >
                      {suggestions.map((item) => (
                        <motion.div
                          key={item.id}
                          variants={{
                            hidden: { opacity: 0, x: -10 },
                            show: { opacity: 1, x: 0 }
                          }}
                          whileHover={{ background: "rgba(93, 55, 43, 0.05)", x: 5 }}
                          onClick={() => {
                            navigate(`/productDetails/${item.slug}`);
                            setShowSuggestions(false);
                            setInputValue("");
                          }}
                          className="suggestion-item d-flex align-items-center p-2"
                          style={{ cursor: "pointer", transition: "background 0.2s" }}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: "40px", height: "40px", borderRadius: "10px", objectFit: "cover", marginRight: "12px" }}
                          />
                          <div className="flex-grow-1 overflow-hidden">
                            <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#5D372B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#8d6e63" }}>₹{item.price}</div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : inputValue.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 text-center"
                      style={{ fontSize: "0.85rem", color: "#8d6e63" }}
                    >
                      No flavors found...
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Icons: Wishlist, Cart, Profile */}
          <div className="d-flex gap-3 align-items-center">
            {/* Wishlist Icon */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/wishlist")}
              className="btn position-relative d-flex align-items-center justify-content-center"
              style={{
                border: "none",
                width: "45px",
                height: "45px",
                borderRadius: "50%",
                background: "transparent",
                boxShadow: "none"
              }}
            >
              <FaHeart
                size={20}
                style={{ color: wishlistIds.length > 0 ? "#ff4d6d" : "#5D372B" }}
              />
              {wishlistIds.length > 0 && (
                <span
                  className="position-absolute translate-middle border border-light rounded-circle bg-danger"
                  style={{
                    top: "10px",
                    right: "5px",
                    width: "10px",
                    height: "10px",
                    padding: 0
                  }}
                />
              )}
            </motion.button>

            {/* Cart Icon */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/cart")}
              className="btn position-relative d-flex align-items-center justify-content-center"
              style={{
                border: "none",
                width: "45px",
                height: "45px",
                borderRadius: "50%",
                background: "transparent",
                boxShadow: "none"
              }}
            >
              <FaShoppingCart size={20} style={{ color: cartCount > 0 ? "#5D372B" : "#5D372B" }} />
              {cartCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: "0.7rem", padding: "4px 6px" }}
                >
                  {cartCount}
                </span>
              )}
            </motion.button>

            {/* Profile Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle
                as={motion.div}
                whileHover={{ scale: 1.05 }}
                style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer" }}
              >
                <img
                  src={profileImage || Dprofile}
                  onError={(e) => { e.target.onerror = null; e.target.src = Dprofile; }}
                  style={{
                    height: "45px",
                    width: "45px",
                    borderRadius: "50%",
                    border: "2px solid #fff",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
                  }}
                />
              </Dropdown.Toggle>

              <Dropdown.Menu style={{ background: "#fff8f0", borderRadius: "15px", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
                <Dropdown.Item onClick={() => navigate("/account")}>Profile</Dropdown.Item>
                <Dropdown.Item onClick={() => navigate("/myOrders")}>My Orders</Dropdown.Item>
                <Dropdown.Item
                  onClick={async () => {
                    if (!savedUserId) navigate("/login");
                    else {
                      await logout(); // ✅ Use context logout
                      setSavedUserId(null);
                      setWishlistIds([]);
                      setRecentlyViewedProducts([]);
                      setWishlistCount(0);
                      setCartCount(0);
                      navigate("/login");
                      window.dispatchEvent(new Event("profileUpdated"));
                    }
                  }}
                  style={{ color: savedUserId ? "#e63946" : "inherit" }}
                >
                  {savedUserId ? "Logout" : "Login"}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </motion.div>

      {/* Mobile Navbar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: mobileVisible ? 0 : -100 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 1000,
        }}
      >
        <div
          className="d-flex d-md-none justify-content-between align-items-center container-fluid "
          style={{
            backgroundColor: "rgba(255, 248, 240, 0.98)",
            padding: "10px 20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            backdropFilter: "blur(10px)",
            flexDirection: "column",
            borderBottom: "1px solid rgba(0,0,0,0.05)"
          }}
        >
          {/* Top row: logo + icons */}
          <div className="d-flex justify-content-between align-items-center w-100">
            <div
              className="fw-bold fs-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "#5D372B", cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              Diary
            </div>

            <div className="d-flex align-items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="btn p-2 rounded-circle"
                style={{ background: "transparent", boxShadow: "none" }}
              >
                <FaSearch color="#5D372B" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate("/wishlist")}
                className="btn p-2 rounded-circle position-relative"
                style={{ background: "transparent", boxShadow: "none" }}
              >
                <FaHeart style={{ color: wishlistIds.length > 0 ? "#ff4d6d" : "#5D372B" }} />
                {wishlistIds.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                    <span className="visually-hidden">New alerts</span>
                  </span>
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate("/cart")}
                className="btn p-2 rounded-circle position-relative"
                style={{ background: "transparent", boxShadow: "none" }}
              >
                <FaShoppingCart style={{ color: cartCount > 0 ? "#5D372B" : "#5D372B" }} />
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.6rem" }}>
                    {cartCount}
                  </span>
                )}
              </motion.button>

              <Dropdown align="end">
                <Dropdown.Toggle
                  as={motion.div}
                  whileTap={{ scale: 0.9 }}
                  style={{ border: "none", background: "transparent", padding: 0 }}
                >
                  <img
                    src={profileImage || Dprofile}
                    onError={(e) => { e.target.onerror = null; e.target.src = Dprofile; }}
                    style={{
                      height: "38px",
                      width: "38px",
                      borderRadius: "50%",
                      border: "2px solid #fff",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                    }}
                  />
                </Dropdown.Toggle>
                <Dropdown.Menu style={{ background: "#fff8f0", border: 'none', boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
                  <Dropdown.Item onClick={() => navigate("/account")}>Profile</Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate("/myOrders")}>My Orders</Dropdown.Item>
                  <Dropdown.Item
                    onClick={async () => {
                      if (!savedUserId) navigate("/login");
                      else {
                        await logout();
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
          <div className="d-flex justify-content-center gap-4 mt-3 w-100" style={{ borderTop: "1px solid rgba(0,0,0,0.03)", paddingTop: "10px" }}>
            {["/", "/products", "/about"].map((path) => (
              <span
                key={path}
                onClick={() => navigate(path)}
                style={{
                  cursor: "pointer",
                  fontSize: "14px",
                  color: active === (path === "/" ? "/" : path.substring(1)) ? "#5D372B" : "#8d6e63",
                  fontWeight: active === (path === "/" ? "/" : path.substring(1)) ? "700" : "500"
                }}
              >
                {path === "/" ? "Home" : path.substring(1).charAt(0).toUpperCase() + path.substring(1).slice(1)}
              </span>
            ))}
            {isAdmin && (
              <span
                onClick={() => navigate("/admin")}
                style={{ cursor: "pointer", fontSize: "14px", color: "#e63946", fontWeight: "bold" }}
              >
                Dashboard
              </span>
            )}
          </div>

          {/* Mobile Search Input */}
          <AnimatePresence>
            {mobileSearchOpen && (
              <motion.form
                ref={mobileSearchRef}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleSearchSubmit}
                className="w-100 mt-3 position-relative"
              >
                <motion.input
                  placeholder="Search flavors..."
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onFocus={() => inputValue.length > 1 && setShowSuggestions(true)}
                  whileFocus={{ scale: 1.01 }}
                  className="form-control rounded-pill ps-4"
                  style={{ height: "40px", fontSize: "16px", background: "#fff", border: "none", boxShadow: "inset 0 2px 5px rgba(0,0,0,0.03)" }}
                />

                {/* Mobile Suggestions Dropdown */}
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        position: "absolute",
                        top: "110%",
                        left: 0,
                        right: 0,
                        background: "#fff",
                        borderRadius: "15px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                        border: "1px solid rgba(0,0,0,0.05)",
                        overflow: "hidden",
                        zIndex: 1100
                      }}
                    >
                      {suggestions.length > 0 ? (
                        <motion.div
                          initial="hidden"
                          animate="show"
                          variants={{
                            hidden: { opacity: 0 },
                            show: {
                              opacity: 1,
                              transition: { staggerChildren: 0.05 }
                            }
                          }}
                        >
                          {suggestions.map((item) => (
                            <motion.div
                              key={item.id}
                              variants={{
                                hidden: { opacity: 0, y: 10 },
                                show: { opacity: 1, y: 0 }
                              }}
                              onClick={() => {
                                navigate(`/productDetails/${item.slug}`);
                                setShowSuggestions(false);
                                setMobileSearchOpen(false);
                                setInputValue("");
                              }}
                              className="d-flex align-items-center p-3 border-bottom border-light"
                              style={{ cursor: "pointer" }}
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{ width: "45px", height: "45px", borderRadius: "10px", objectFit: "cover", marginRight: "12px" }}
                              />
                              <div>
                                <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#5D372B" }}>{item.name}</div>
                                <div style={{ fontSize: "0.8rem", color: "#8d6e63" }}>₹{item.price}</div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : inputValue.length > 1 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-3 text-center text-muted"
                          style={{ fontSize: "0.9rem" }}
                        >
                          No flavors found...
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>



      <style>{`
        .suggestion-item:hover {
          background: rgba(93, 55, 43, 0.05);
        }
      `}</style>
      <div style={{ height: mobileSearchOpen ? "115px" : "45px" }}></div>
    </>
  );
}
