import { useContext, useEffect, useState } from "react";
import Navbar from "../../Navbar/Navbar";
import { SearchContext } from "../SearchContext/SearchContext";
import { fetchUser, updateUser } from "../Fetch/FetchUser";
import { useNavigate } from "react-router-dom";
import Footer from "../Home/Footer";
import ScrollToTop from "../ScrollTop";
import * as Dialog from "@radix-ui/react-dialog";

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
        const totalPrice = cart.reduce((sum, p) => sum + (p.price * (p.quantity || 1)), 0);
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
    const totalPrice = cart.reduce((sum, p) => sum + (p.price * (p.quantity || 1)), 0);
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
          {isLogin &&
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
                   
                    {item.category && <p className="text-muted small mb-1">Category: {item.category}</p>}
                 
                    
                   
                  </div>

                  {/* Quantity Controls */}
                  <div className="d-flex flex-column align-items-center gap-2">
                    <div className="d-flex gap-2 mb-2">
                      <button
                        onClick={() => decrementQuantity(item)}
                        className="btn btn-light p-1"
                        style={{ width: "32px", height: "32px", borderRadius: "50%" }}
                      >
                        -
                      </button>
                      <span className="align-self-center">{item.quantity || 1}</span>
                      <button
                        onClick={() => incrementQuantity(item)}
                        className="btn btn-light p-1"
                        style={{ width: "32px", height: "32px", borderRadius: "50%" }}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveClick(item)}
                      className="btn btn-danger btn-sm rounded-pill px-3"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="d-flex justify-content-center my-4">
          <button
            className="btn btn-dark btn-lg rounded-pill px-5 py-3 shadow-lg fw-bold text-uppercase"
            onClick={handleBuyAll}
          >
            🛒 Buy All
          </button>
        </div>
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
          <Dialog.Title style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "12px" }}>
            Are you sure?
          </Dialog.Title>
          <Dialog.Description style={{ fontSize: "0.95rem", marginBottom: "22px" }}>
            Do you want to remove <strong>{confirmDialog.item?.name}</strong> from cart?
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
