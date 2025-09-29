import { useEffect, useState, useContext } from "react";
import { Heart } from "lucide-react";
import { SearchContext } from "../SearchContext/SearchContext";
import { useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import Navbar from "../../Navbar/Navbar";
import { fetchUser, updateUser, fetchProducts } from "../Fetch/FetchUser";
import Footer from "../Home/Footer";
import ScrollToTop from "../ScrollTop";
import icecreamGGG from "../../../homeImages/iceCreamVideo.mp4";

export default function Products({ toastRef }) {
  const [products, setProducts] = useState([]);
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const [filtered, setFilterd] = useState([]);
  const { wishlistIds = [], setWishlistIds, setCartCount } = useContext(SearchContext);
  const [active, setActive] = useState("");
  const [cartItems, setCartItems] = useState(
    JSON.parse(localStorage.getItem("existingUser"))?.cart || []
  );
  const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null, type: "" });
  const navigate = useNavigate();

  // Fetch Best Sellers
  useEffect(() => {
    async function fetchBestseller() {
      const products = await fetchProducts();
      const bestSeller = products.filter((p) => p.bestseller === "true");
      if (bestSeller) setBestSellerProducts(bestSeller);
    }
    fetchBestseller();
  }, []);

  // Fetch All Products
  useEffect(() => {
    async function fetchProductsFromFetch() {
      try {
        const res = await fetchProducts();
        setProducts(res);
      } catch {
        console.log("failed to fetch");
      }
    }
    fetchProductsFromFetch();
  }, []);

  // Filter functions
  const vanila = async () => {
    const productVanila = await fetchProducts();
    setFilterd(productVanila.filter((p) => p.category === "vanila"));
  };
  const strawberry = async () => {
    const productStrawberry = await fetchProducts();
    setFilterd(productStrawberry.filter((p) => p.category === "strawberry"));
  };
  const choclate = async () => {
    const productChoclates = await fetchProducts();
    setFilterd(productChoclates.filter((p) => p.category === "chocolate"));
  };
  const showAll = async () => {
    const productAll = await fetchProducts();
    setFilterd(productAll);
  };

  // Add / Remove Cart
  const handleCartClick = (item) => {
    const exists = cartItems.some((p) => p.id === item.id);
    if (exists) {
      setConfirmDialog({ open: true, item, type: "cart" });
    } else {
      addtoCart(item);
    }
  };

  const addtoCart = async (item) => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("existingUser"));
      if (!savedUser) {
        toastRef.current.showToast("Login first");
        navigate("/login");
        return;
      }
      const user = await fetchUser(savedUser.id);
      const exists = user.cart.some((p) => p.id === item.id);
      const updatedCart = exists ? user.cart.filter((p) => p.id !== item.id) : [...user.cart, item];

      await updateUser(savedUser.id, { cart: updatedCart });
      const updatedUser = { ...user, cart: updatedCart };
      localStorage.setItem("existingUser", JSON.stringify(updatedUser));
      localStorage.setItem("cartTotalLength", updatedUser.cart.length);

      setCartCount(updatedUser.cart.length);
      setCartItems(updatedCart);
      toastRef.current.showToast(`${item.name} ${exists ? "removed from" : "added to"} cart`);
    } catch (err) {
      console.log("error in cart update", err);
    }
  };

  // Wishlist toggle
  const handleWishlistClick = (item) => {
    if (wishlistIds.includes(item.id)) {
      setConfirmDialog({ open: true, item, type: "wishlist" });
    } else {
      wishListFn(item);
    }
  };

  const wishListFn = async (item) => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("existingUser"));
      if (!savedUser) {
        toastRef.current.showToast("Login first");
        navigate("/login");
        return;
      }
      const user = await fetchUser(savedUser.id);
      const newUserWishlist = [...user.wishlist];
      const alreadyAdded = newUserWishlist.some((element) => element.id === item.id);

      if (alreadyAdded) {
        const newWishlist = newUserWishlist.filter((i) => i.id !== item.id);
        await updateUser(savedUser.id, { wishlist: newWishlist });
        setWishlistIds((prev) => prev.filter((id) => id !== item.id));
        localStorage.setItem("existingUser", JSON.stringify({ ...user, wishlist: newWishlist }));
        toastRef.current.showToast(`${item.name} removed from wishlist`);
      } else {
        newUserWishlist.push(item);
        await updateUser(savedUser.id, { wishlist: newUserWishlist });
        setWishlistIds((prev) => [...prev, item.id]);
        localStorage.setItem("existingUser", JSON.stringify({ ...user, wishlist: newUserWishlist }));
        toastRef.current.showToast(`${item.name} added to wishlist`);
      }
    } catch {
      console.log("error in wishlist toggle");
    }
  };

  const confirmRemove = () => {
    if (confirmDialog.type === "cart") addtoCart(confirmDialog.item);
    if (confirmDialog.type === "wishlist") wishListFn(confirmDialog.item);
    setConfirmDialog({ open: false, item: null, type: "" });
  };

  return (
    <>
      <Navbar />
      <div style={{ height: "20px" }}></div>

      {/* Banner */}
      <h2
        style={{
          textAlign: "center",
          fontFamily: "'Pacifico', cursive",
          fontSize: "1.2rem",
          color: "#ff4d6d",
          textShadow: "2px 2px 6px rgba(0,0,0,0.15)",
          margin: "40px 0",
        }}
      >
        Discover Our Flavors
      </h2>

      {/* Video */}
      <div className="container text-center">
        <div
          className="videoContainer"
          style={{
            position: "relative",
            maxWidth: "800px",
            margin: "0 auto",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            pointerEvents: "none",
          }}
        >
          <video
            src={icecreamGGG}
            autoPlay
            loop
            muted
            playsInline
            style={{ width: "100%", height: "auto", display: "block", borderRadius: "20px" }}
          />
        </div>
      </div>

      {/* Best Sellers */}
      <h2
        className="text-center mb-4 mt-3 fw-bold text-dark"
        style={{ fontFamily: "Poppins, sans-serif", color: "#1e3253" }}
      >
        Best Sellers
      </h2>

      <div className="container">
        <div className="row g-4 justify-content-center">
          {bestSellerProducts.map((item, index) => (
            <div key={index} className="col-6 col-sm-4 col-md-3 col-lg-2">
              <div
                 onClick={() => navigate(`/productDetails/${item.id}`)}
  className="card shadow-sm h-100 border-0 best-seller-card"
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
                  style={{ height: "130px", objectFit: "contain", padding: "10px" }}
                />
                <div className="card-body text-center p-2">
                  <h6
                    className="card-title mb-4"
                    style={{
                      textAlign: "center",
                      fontFamily: "revert-layer",
                      fontSize: "13px",
                      color: "#0a2141",
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

      {/* Flavor Filters */}
      <div
        className="container d-flex flex-nowrap gap-2 mt-4"
        style={{ overflowX: "auto", paddingBottom: "5px", WebkitOverflowScrolling: "touch" }}
      >
        {[
          { label: "Show All", key: "", fn: showAll },
          { label: "Vanilla", key: "vanilla", fn: vanila },
          { label: "Strawberry", key: "strawberry", fn: strawberry },
          { label: "Chocolate", key: "chocolate", fn: choclate },
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => {
              setActive(btn.key);
              btn.fn();
            }}
            className={`btn rounded-pill ${active === btn.key ? "btn-dark" : "btn-outline-secondary"}`}
            style={{
              fontWeight: 600,
              fontFamily: "SF Pro, -apple-system, sans-serif",
              flex: "0 0 auto",
              minWidth: "120px",
              padding: "10px 0",
              fontSize: "1rem",
              textAlign: "center",
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="container mt-4">
        <div className="row justify-content-center g-2">
          {(filtered.length > 0 ? filtered : products).map((item, index) => (
            <div key={index} className="col-6 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center">
              <div
                className="card shadow-sm border-0 w-100"
                style={{
                  maxWidth: "270px",
                  borderRadius: "20px",
                  overflow: "hidden",
                  backgroundColor: "#fff",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.15)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
                }}
              >
                <div className="d-flex justify-content-center align-items-center p-3 position-relative" style={{ background: "#fff8f0" }}>
                  <img
                    onClick={() => navigate(`/productDetails/${item.id}`)}
                    src={item.image}
                    alt={item.name}
                    className="img-fluid"
                    style={{ maxWidth: "120px", maxHeight: "120px", objectFit: "contain" }}
                  />
                  <Heart
                    onClick={() => handleWishlistClick(item)}
                    color={wishlistIds.includes(item.id) ? "#111" : "gray"}
                    fill={wishlistIds.includes(item.id) ? "#111" : "none"}
                    size={wishlistIds.includes(item.id) ? 26 : 24}
                    style={{ cursor: "pointer", position: "absolute", top: "8px", right: "10px" }}
                    className="wishlist-icon"
                  />
                </div>
                <div className="card-body text-center p-3" style={{ background: "#fff8f0" }}>
                  <div className="d-flex justify-content-center align-items-center mb-2">
                    <h5
                      style={{
                        fontFamily: "SF Pro, -apple-system, sans-serif",
                        fontWeight: 500,
                        fontSize: "0.7rem",
                        margin: 0,
                        color: "#111",
                      }}
                    >
                      {item.name}
                    </h5>
                  </div>
                  <p
                    onClick={() => navigate(`/productDetails/${item.id}`)}
                    style={{ color: "#6e6e73", fontSize: "0.85rem", margin: "3px 0", cursor: "pointer" }}
                  >
                    Product Details →
                  </p>
                  <p style={{ fontWeight: "600", fontSize: "1.3rem", color: "#1e3253", margin: "8px 0" }}>
                    ₹{item.price}
                  </p>
<button
  onClick={() => handleCartClick(item)}
  className="btn mt-2 product-btn"
  style={{
    backgroundColor: "black",
    color: "#fff",
    borderRadius: "20px",
    padding: "8px 0",
    width: "clamp(120px, 50%, 180px)", // give a bit more width
    fontSize: "0.7rem",                // small but fixed font
    fontWeight: 500,
    whiteSpace: "nowrap",              // prevent text wrapping
    overflow: "hidden",
    textOverflow: "ellipsis",          // truncate if needed
  }}
>
  {cartItems.some((p) => p.id === item.id) ? "Remove" : "Add to cart"}
</button>



                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
<div style={{height:'20px'}}></div>
      <Footer />

      {/* Radix Dialog for confirmation */}
      <Dialog.Root open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <Dialog.Overlay
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            position: "fixed",
            inset: 0,
            zIndex: 1000,
          }}
        />
        <Dialog.Content
          style={{
            backgroundColor: "#fff8f0",
            borderRadius: "15px",
            padding: "25px 20px",
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "360px",
            textAlign: "center",
            zIndex: 1001,
            boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease",
          }}
        >
          <Dialog.Title
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              marginBottom: "12px",
              color: "#0a2141",
              textShadow: "1px 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            Are you sure?
          </Dialog.Title>
          <Dialog.Description style={{ fontSize: "0.95rem", marginBottom: "22px", color: "#555" }}>
            Do you want to remove <strong>{confirmDialog.item?.name}</strong> from{" "}
            {confirmDialog.type === "cart" ? "cart" : "wishlist"}?
          </Dialog.Description>
          <div className="d-flex flex-column flex-md-row justify-content-center gap-2">
            <button
              className="btn"
              style={{
                backgroundColor: "#e0e0e0",
                color: "#111",
                padding: "10px 0",
                fontSize: "0.95rem",
                borderRadius: "12px",
                flex: 1,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#cfcfcf")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}
              onClick={() => setConfirmDialog({ open: false, item: null, type: "" })}
            >
              Cancel
            </button>
            <button
              className="btn"
              style={{
                backgroundColor: "#d64b65ff",
                color: "#fff",
                padding: "10px 0",
                fontSize: "0.95rem",
                borderRadius: "12px",
                flex: 1,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e9435e")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ff4d6d")}
              onClick={confirmRemove}
            >
              Remove
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Root>

      {/* Responsive Tweaks */}
      <style>{`
        @media (max-width: 576px) {
          .card { max-width: 100% !important; }
          .wishlist-icon { width: 24px !important; height: 24px !important; }
          .product-btn { font-size: 0.9rem !important; padding: 10px 0 !important; }
        }
          .best-seller-card:hover {
  transform: scale(1.05);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}
      `}</style>
      <ScrollToTop />
    </>
  );
}
