import { useContext, useEffect, useState } from "react";
import Navbar from "../../Navbar/Navbar";
import { SearchContext } from "../SearchContext/SearchContext";
import { fetchUser, updateUser } from "../Fetch/FetchUser";
import { useNavigate } from "react-router-dom";
import Footer from "../Home/Footer";
import ScrollToTop from "../ScrollTop";
import * as Dialog from "@radix-ui/react-dialog";
import Lottie from "lottie-react";   // ✅ Import Lottie
import emptyCartAnimation from "../../../jsonAnimation/emptyCart.json"; // ✅ Your JSON animation

export default function Cart() {
  const [addedProducts, setAddedProducts] = useState([]);
  const [cartTotalItems, setCartTotalItems] = useState(0);
  const [cartTotalPrice, setCartTotalPrice] = useState(0);
  const { setCartCount, setBookingProducts } = useContext(SearchContext);
  const [isLogin, setIsLogin] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null });
  const navigate = useNavigate();

  // Load cart
  useEffect(() => {
    async function loadCart() {
      const userId = localStorage.getItem("userId");
      if (userId) {
        setIsLogin(true);
        const user = await fetchUser(userId);
        const cart = user.cart || [];
        setAddedProducts(cart.reverse());
        const totalItems = cart.reduce((sum, p) => sum + (p.quantity || 1), 0);
        const totalPrice = cart.reduce((sum, p) => sum + p.price * (p.quantity || 1), 0);
        setCartCount(totalItems);
        setCartTotalItems(totalItems);
        setCartTotalPrice(totalPrice);
      } else {
        setIsLogin(false);
        setAddedProducts([]);
        setCartCount(0);
        setCartTotalItems(0);
        setCartTotalPrice(0);
      }
    }
    loadCart();
  }, [setCartCount]);

  // Increment quantity
  const incrementQuantity = async (item) => {
    const userId = localStorage.getItem("userId");
    const user = await fetchUser(userId);
    const updatedCart = user.cart.map((p) => {
      if (p.id === item.id) return { ...p, quantity: (p.quantity || 1) + 1 };
      return p;
    });
    await updateUser(userId, { cart: updatedCart });
    updateState(updatedCart);
  };

  // Decrement quantity
  const decrementQuantity = async (item) => {
    const userId = localStorage.getItem("userId");
    const user = await fetchUser(userId);
    const updatedCart = user.cart.map((p) => {
      if (p.id === item.id) {
        const newQty = (p.quantity || 1) - 1;
        return { ...p, quantity: newQty > 0 ? newQty : 1 };
      }
      return p;
    });
    await updateUser(userId, { cart: updatedCart });
    updateState(updatedCart);
  };

  // Remove item
  const confirmRemove = async () => {
    const userId = localStorage.getItem("userId");
    const user = await fetchUser(userId);
    const updatedCart = user.cart.filter((p) => p.id !== confirmDialog.item.id);
    await updateUser(userId, { cart: updatedCart });
    updateState(updatedCart);
    setConfirmDialog({ open: false, item: null });
  };

  const handleRemoveClick = (item) => setConfirmDialog({ open: true, item });

  // Buy all
  const handleBuyAll = async () => {
    const userId = localStorage.getItem("userId");
    const user = await fetchUser(userId);
    if (user.cart.length <= 0) return;
    setBookingProducts(user.cart);
    navigate("/booking");
  };

  // Helper to update state
  const updateState = (cart) => {
    setAddedProducts(cart.reverse());
    const totalItems = cart.reduce((sum, p) => sum + (p.quantity || 1), 0);
    const totalPrice = cart.reduce((sum, p) => sum + p.price * (p.quantity || 1), 0);
    setCartCount(totalItems);
    setCartTotalItems(totalItems);
    setCartTotalPrice(totalPrice);
  };

  return (
    <>
      <Navbar />
      <div className="container my-5">
        <h4 className="text-center mb-2">My Cart</h4>
        <p className="text-center mb-4" style={{ fontFamily: "revert" }}>
          Total ({cartTotalItems}) items | Total Price: ₹{cartTotalPrice}
        </p>

        <div className="row justify-content-center g-4">
          {isLogin && addedProducts.length > 0 ? (
            addedProducts.map((item, index) => (
              <div key={index} className="col-12 col-sm-10 col-md-8 col-lg-7">
                <div
                  className="d-flex shadow-sm rounded-3"
                  style={{
                    backgroundColor: "#fff8f0",
                    padding: "15px",
                    alignItems: "center",
                    gap: "15px",
                  }}
                >
                  {/* Product Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "contain",
                      borderRadius: "12px",
                    }}
                  />

                  {/* Product Details */}
                  <div className="flex-grow-1">
                    <h6 className="fw-bold mb-1">{item.name}</h6>
                    <p className="fw-semibold mb-1">Price: ₹{item.price}</p>
                    {item.category && (
                      <p className="text-muted small mb-1">
                        Category: {item.category}
                      </p>
                    )}
                  </div>

                  {/* Quantity Controls */}
            <div className="d-flex flex-column align-items-center gap-2">
  {/* Quantity Controls */}
  <div className="d-flex align-items-center gap-2 mb-2">
    {/* Decrement Button */}
    <button
      onClick={() => decrementQuantity(item)}
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        backgroundColor: "#e2f3f1", // soft background color
        color: "#009688",           // your website theme color
        border: "none",
        fontSize: "1.2rem",
        fontWeight: "600",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      −
    </button>

    {/* Quantity Display */}
    <span
      style={{
        minWidth: "30px",
        textAlign: "center",
        fontWeight: "600",
        fontSize: "1rem",
      }}
    >
      {item.quantity || 1}
    </span>

    {/* Increment Button */}
    <button
      onClick={() => incrementQuantity(item)}
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        backgroundColor: "#e2f3f1",
        color: "#009688",
        border: "none",
        fontSize: "1.2rem",
        fontWeight: "600",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      +
    </button>
  </div>

  {/* Remove Button */}
  <button
    onClick={() => handleRemoveClick(item)}
    style={{
      backgroundColor: "#ff6b6b", // soft red matching your website
      color: "#fff",
      border: "none",
      borderRadius: "20px",
      padding: "6px 18px",
      fontSize: "0.9rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
  >
    Remove
  </button>
</div>

                </div>
              </div>
            ))
          ) : (
            // Show when not logged in OR empty cart
            <div className="text-center my-5">
              <Lottie animationData={emptyCartAnimation} loop={true} style={{ height: 250 }} />
              <h5>Your cart is empty</h5>
              <p className="text-muted">
                {isLogin ? "Add items to your cart to continue shopping." : "Please log in to view and manage your cart."}
              </p>
              {!isLogin && (
  <button
    className="btn"
    style={{
      background: "rgba(50, 30, 20, 0.85)", // matches your checkout button
      color: "#fff",
      padding: "9px 22px",
      borderRadius: "30px",
      fontWeight: "600",
      fontSize: "0.95rem",
      border: "none",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      transition: "all 0.3s ease",
      minWidth: "140px",
    }}
    onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
    onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
    onClick={() => navigate("/login")}
  >
    Login
  </button>
)}

            </div>
          )}
        </div>

        {/* Checkout button - show only if logged in and cart has items */}
        {isLogin && addedProducts.length > 0 && (
          <div className="d-flex justify-content-center my-4">
           <button
  onClick={handleBuyAll}
  style={{
    backgroundColor: "rgba(50,30,20,0.85)", // soft teal, replace with your exact site color
    color: "#fff",
    padding: "10px 25px",
    borderRadius: "30px",
    fontWeight: "700",
    fontSize: "0.8rem",
    boxShadow: "0 6px 15px rgba(0,0,0,0.10)",
    transition: "all 0.3s ease",
    minWidth: "200px",
    border: "none",
    cursor: "pointer",
   
    letterSpacing: "0.5px",
  }}
 
>
  Proceed to Checkout
</button>

          </div>
        )}
      </div>

      {/* Radix Dialog */}
      <Dialog.Root
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      >
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
          }}
        >
          <Dialog.Title
            style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "12px" }}
          >
            Are you sure?
          </Dialog.Title>
          <Dialog.Description
            style={{ fontSize: "0.95rem", marginBottom: "22px" }}
          >
            Do you want to remove{" "}
            <strong>{confirmDialog.item?.name}</strong> from cart?
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
              onClick={() => setConfirmDialog({ open: false, item: null })}
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

      <Footer />
      <ScrollToTop />
    </>
  );
}
