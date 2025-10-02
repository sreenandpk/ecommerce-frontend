import { useEffect, useState, useContext } from "react";
import { Heart } from "lucide-react";
import { SearchContext } from "../SearchContext/SearchContext";
import { useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import Navbar from "../../Navbar/Navbar";
import { fetchUser, updateUser, fetchProducts } from "../Fetch/FetchUser";
import Footer from "../Home/Footer";
import ScrollToTop from "../ScrollTop";

export default function Products({ toastRef }) {
  const [products, setProducts] = useState([]);
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const [filtered, setFilterd] = useState([]);
  const { wishlistIds = [], setWishlistIds, setCartCount } = useContext(SearchContext);
  const [active, setActive] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null, type: "" });
  const navigate = useNavigate();

  // 🔄 Sync wishlist when user logs in
  useEffect(() => {
    async function fetchWishlist() {
      const savedUserId = JSON.parse(localStorage.getItem("userId"));
      if (savedUserId) {
        const user = await fetchUser(savedUserId);
        if (user?.wishlist) {
          setWishlistIds(user.wishlist.map((item) => item.id));
        }
      }
    }
    fetchWishlist();
  }, []);

  useEffect(()=>{
    async function fetchCart() {
      const id=JSON.parse(localStorage.getItem("userId"))
      const res=await fetchUser(id)
      setCartItems(res.cart)
    }
    fetchCart()
  },[])


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
  const [sortOrder, setSortOrder] = useState("asc"); // default ascending

const sortByPrice = async () => {
  const productAll = await fetchProducts();

  const sorted = [...productAll].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.price - b.price; // Low → High
    } else {
      return b.price - a.price; // High → Low
    }
  });

  setFilterd(sorted);

  // Toggle next sort order
  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
};


  // Add / Remove Cart
  const handleCartClick = (item) => {
    const exists = cartItems.some((p) => p.id === item.id);

    if (exists) {
      // ✅ confirmation only for remove
      setConfirmDialog({ open: true, item, type: "cart" });
    } else {
      // ✅ add immediately
      addtoCart(item);
    }
  };

  const addtoCart = async (item) => {
    try {
      const savedUserId = JSON.parse(localStorage.getItem("userId"));
      if (!savedUserId) {
        toastRef.current.showToast("Login first", { label: "Login", onClick: () => navigate("/login") });
        return;
      }
      const user = await fetchUser(savedUserId);
      const exists = user.cart.some((p) => p.id === item.id);
      const updatedCart = exists ? user.cart.filter((p) => p.id !== item.id) : [...user.cart, item];

      await updateUser(savedUserId, { cart: updatedCart });
      const updatedUser = { ...user, cart: updatedCart };

      // ✅ only save id in localStorage
      localStorage.setItem("userId", JSON.stringify(updatedUser.id));
      localStorage.setItem("cartTotalLength", updatedUser.cart.length);

      setCartCount(updatedUser.cart.length);
      setCartItems(updatedCart);

      toastRef.current.showToast(
        `${item.name} ${exists ? "removed" : "added "}`,
        { label: exists ? "Go to Cart" : "View Cart", onClick: () => navigate("/cart") }
      );
          // ✅ Vibration on click (200ms)
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
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
      const savedUserId = JSON.parse(localStorage.getItem("userId"));
      if (!savedUserId) {
        toastRef.current.showToast("Login first", { label: "Login", onClick: () => navigate("/login") });
        return;
      }
      const user = await fetchUser(savedUserId);
      const newUserWishlist = [...user.wishlist];
      const alreadyAdded = newUserWishlist.some((element) => element.id === item.id);

      if (alreadyAdded) {
        const newWishlist = newUserWishlist.filter((i) => i.id !== item.id);
        await updateUser(savedUserId, { wishlist: newWishlist });
        setWishlistIds((prev) => prev.filter((id) => id !== item.id));
        toastRef.current.showToast(`${item.name} removed from wishlist`);
      } else {
        newUserWishlist.push(item);
        await updateUser(savedUserId, { wishlist: newUserWishlist });
        setWishlistIds((prev) => [...prev, item.id]);
        toastRef.current.showToast(`${item.name} added to wishlist`);
      }
          if (navigator.vibrate) {
      navigator.vibrate(50)
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

      {/* Flavor Filters */}
      <div
        className="container d-flex flex-nowrap gap-2 mt-4"
        style={{ overflowX: "auto", paddingBottom: "5px", WebkitOverflowScrolling: "touch" }}
      >
        {[
          { label: "Show All", key: "", fn: showAll },
          { label: sortOrder === "asc" ? "Price: Low → High" : "Price: High → Low", key: "sort", fn: sortByPrice },

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
              minWidth: "130px",
              padding: "8px 0",
              fontSize: "0.8rem",
              textAlign: "center",
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="container">
        <div className="row justify-content-center g-2 ">
          {(filtered.length > 0 ? filtered : products).map((item, index) => (
            <div key={index} className="col-6 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center mt-5">
              <div
               className="card shadow-sm border-0 w-100"
  style={{
    maxWidth: "260px",
    borderRadius: "20px",
    overflow: "hidden",
    backgroundColor: "#fff",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
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
                              <p
  className="mb-2"
  style={{
    fontSize: "1.2rem",              // bigger than normal
    fontWeight: "600",               // bold but not too heavy
    color: "#2c2c2c",                // deep royal purple (premium feel)
    letterSpacing: "0.5px",          // slight spacing for elegance
  }}
>
  ₹{item.price}
</p>
                  <button
                    onClick={() => handleCartClick(item)}
                    className="btn mt-2 product-btn "
                    style={{
                         background: "rgba(50, 30, 20, 0.85)", // deep muted brown with transparency
        color: "#fff",
                      borderRadius: "20px",
                      padding: "9px 0",
                      width: "clamp(120px, 50%, 180px)",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
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

      <div style={{ height: "20px" }}></div>
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
             
              onClick={() => setConfirmDialog({ open: false, item: null, type: "" })}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              style={{
              
                color: "#fff",
                padding: "10px 0",
                fontSize: "0.95rem",
                borderRadius: "12px",
                flex: 1,
                transition: "all 0.2s",
              }}
             
              onClick={confirmRemove}
            >
              Remove
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Root>

      <style>{`
       @media (max-width: 576px) {
    .card { max-width: 100% !important; }
    .wishlist-icon { width: 24px !important; height: 24px !important; }
    .product-btn { font-size: 0.9rem !important; padding: 10px 0 !important; }
  }

  /* Product card hover effect */
  .card:hover {
    transform: scale(1.05);
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  }

  /* Optional: smooth transition */
  .card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
      `}</style>

      <ScrollToTop />
    </>
  );
}
