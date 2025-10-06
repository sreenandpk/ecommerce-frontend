import { useEffect, useState, useContext } from "react";
import { Heart } from "lucide-react";
import { SearchContext } from "../SearchContext/SearchContext";
import { useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";

import Navbar from "../../Navbar/Navbar";
import Footer from "../Home/Footer";
import ScrollToTop from "../ScrollTop";
import { fetchProducts, fetchUser, updateUser } from "../Fetch/FetchUser";

export default function FilteredSearchProducts({ toastRef }) {
  const navigate = useNavigate();
  const { searchValue, wishlistIds = [], setWishlistIds, setCartCount, setProductDetails } = useContext(SearchContext);

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null, type: "" });

  // Fetch user & cart on mount
  useEffect(() => {
    const savedUserId = JSON.parse(localStorage.getItem("userId"));
    if (savedUserId) {
      fetchUser(savedUserId).then((u) => {
        setUser(u);
        setCartItems(u.cart || []);
        if (u.wishlist) setWishlistIds(u.wishlist.map((i) => i.id));
      });
    }
  }, []);

  // Fetch all products
  useEffect(() => {
    async function fetchAllProducts() {
      const res = await fetchProducts();
      setProducts(res);
    }
    fetchAllProducts();
  }, []);

  // Filter products by searchValue
  useEffect(() => {
    if (!searchValue.trim()) {
      setFiltered([]);
      return;
    }
    const filteredProducts = products.filter((p) =>
      p.name.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFiltered(filteredProducts);
  }, [searchValue, products]);

  // Add / remove cart
  const handleCartClick = async (item) => {
    if (!user) {
      toastRef?.current.showToast("Login first", { label: "Login", onClick: () => navigate("/login") });
      return;
    }
    const exists = cartItems.some((p) => p.id === item.id);
    if (exists) {
      setConfirmDialog({ open: true, item, type: "cart" });
    } else {
      await updateCart(item);
    }
  };

  const updateCart = async (item) => {
    const updatedCart = cartItems.some((p) => p.id === item.id)
      ? cartItems.filter((p) => p.id !== item.id)
      : [...cartItems, item];

    await updateUser(user.id, { cart: updatedCart });
    setCartItems(updatedCart);
    localStorage.setItem("cartTotalLength", updatedCart.length);
    setCartCount(updatedCart.length);

    toastRef?.current.showToast(
      `${item.name} ${cartItems.some((p) => p.id === item.id) ? "removed" : "added "}`,
      { label: "View Cart", onClick: () => navigate("/cart") }
    );

    if (navigator.vibrate) navigator.vibrate(50);
  };

  // Wishlist toggle
  const handleWishlistClick = async (item) => {
    if (!user) {
      toastRef?.current.showToast("Login first", { label: "Login", onClick: () => navigate("/login") });
      return;
    }
    const isInWishlist = wishlistIds.includes(item.id);
    let newWishlist;
    if (isInWishlist) {
      newWishlist = user.wishlist.filter((i) => i.id !== item.id);
      setWishlistIds((prev) => prev.filter((id) => id !== item.id));
    } else {
      newWishlist = [...(user.wishlist || []), item];
      setWishlistIds((prev) => [...prev, item.id]);
    }
    await updateUser(user.id, { wishlist: newWishlist });
    toastRef?.current.showToast(`${item.name} ${isInWishlist ? "removed from" : "added to"} wishlist`);

    if (navigator.vibrate) navigator.vibrate(50);
  };

  const confirmRemove = async () => {
    if (confirmDialog.type === "cart") await updateCart(confirmDialog.item);
    if (confirmDialog.type === "wishlist") await handleWishlistClick(confirmDialog.item);
    setConfirmDialog({ open: false, item: null, type: "" });
  };

  const displayProducts = filtered.length > 0 ? filtered : products;

  return (
    <>
      <Navbar />
      <div style={{ height: "30px" }}></div>

      {/* Products Grid */}
      <div className="container">
        <div className="row justify-content-center g-2">
          {displayProducts.map((item, index) => (
            <div key={index} className="col-6 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center mt-4">
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
                    src={item.image}
                    alt={item.name}
                    className="img-fluid"
                    style={{ maxWidth: "120px", maxHeight: "120px", objectFit: "contain" }}
                    onClick={() => {
                      setProductDetails(item);
                      navigate(`/productDetails/${item.id}`);
                    }}
                  />
                  <Heart
                    onClick={() => handleWishlistClick(item)}
                    color={wishlistIds.includes(item.id) ? "#111" : "gray"}
                    fill={wishlistIds.includes(item.id) ? "#111" : "none"}
                    size={wishlistIds.includes(item.id) ? 26 : 24}
                    style={{ cursor: "pointer", position: "absolute", top: "8px", right: "10px" }}
                  />
                </div>
                <div className="card-body text-center p-3" style={{ background: "#fff8f0" }}>
                  <h5 style={{ fontSize: "0.8rem", fontWeight: 500 }}>{item.name}</h5>
                  <p
                    onClick={() => {
                      setProductDetails(item);
                      navigate(`/productDetails/${item.id}`);
                    }}
                    style={{ color: "#6e6e73", fontSize: "0.85rem", margin: "3px 0", cursor: "pointer" }}
                  >
                    Product Details →
                  </p>
                  <p className="mb-2" style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2c2c2c" }}>
                    ₹{item.price}
                  </p>
                  <button
                    onClick={() => handleCartClick(item)}
                    className="btn mt-2 product-btn"
                    style={{
                      background: "rgba(50, 30, 20, 0.85)",
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

      {/* Radix Dialog */}
      <Dialog.Root open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <Dialog.Overlay style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", inset: 0, zIndex: 1000 }} />
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
          }}
        >
          <Dialog.Title style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "12px", color: "#0a2141" }}>
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
        .card:hover { transform: scale(1.05); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
        .card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
      `}</style>

      <ScrollToTop />
    </>
  );
}
