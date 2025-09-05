import { useContext, useEffect, useState } from "react";
import Navbar from "../../Navbar/Navbar";
import { SearchContext } from "../SearchContext/SearchContext";
import { infoToast } from "../toast";
import { fetchProducts, updateUser } from "../Fetch/FetchUser";
import { useNavigate } from "react-router-dom";
import Footer from "../Home/Footer";
import ScrollToTop from "../ScrollTop";

export default function Cart() {
  const [addedProducts, setAddedProducts] = useState([]);
  const [cartTotalItems, setCartTotalItems] = useState(0);
  const { setCartCount, setBookingProducts } = useContext(SearchContext);
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      const savedUser = JSON.parse(localStorage.getItem("existingUser"));
      if (savedUser) {
        setIsLogin(true);
        setAddedProducts(savedUser.cart.reverse());
        setCartCount(savedUser.cart.length);
        setCartTotalItems(savedUser.cart.length);
      } else {
        setIsLogin(false);
        setAddedProducts([]);
        setCartCount(0);
        setCartTotalItems(0);
      }
    }
    fetchUser();
  }, [setCartCount]);

  const handleRemove = async (item) => {
    try {
      const result = addedProducts.filter(i => i !== item);
      const savedUser = JSON.parse(localStorage.getItem("existingUser"));
      await updateUser(savedUser.id, { cart: result });
      const newSavedUser = { ...savedUser, cart: result };
      localStorage.setItem("existingUser", JSON.stringify(newSavedUser));
      setAddedProducts(result);
      setCartTotalItems(result.length);
      setCartCount(result.length);
      infoToast(`${item.name} removed from cart`);
    } catch (err) {
      console.error(err);
      console.log("Failed to remove item from cart");
    }
  };

  const decrementQuantity = async (item) => {
    const savedUser = JSON.parse(localStorage.getItem("existingUser"));
    const updatedCart = savedUser.cart.map(p => {
      if (p.id === item.id) {
        const newQty = (p.quantity || 1) - 1;
        return { ...p, quantity: newQty > 0 ? newQty : 1 };
      }
      return p;
    });
    await updateUser(savedUser.id, { cart: updatedCart });
    const updatedUser = { ...savedUser, cart: updatedCart };
    localStorage.setItem("existingUser", JSON.stringify(updatedUser));
    setAddedProducts(updatedCart.reverse());
    setCartTotalItems(updatedCart.reduce((sum, p) => sum + (p.quantity || 1), 0));
    setCartCount(updatedCart.reduce((sum, p) => sum + (p.quantity || 1), 0));
  };

  const incrementQuantity = async (item) => {
    const savedUser = JSON.parse(localStorage.getItem("existingUser"));
    const updatedUserWithQnty = savedUser.cart.map(p => {
      if (p.id === item.id) {
        return { ...p, quantity: (p.quantity || 1) + 1 };
      }
      return p;
    });
    await updateUser(savedUser.id, { cart: updatedUserWithQnty });
    localStorage.setItem("existingUser", JSON.stringify({ ...savedUser, cart: updatedUserWithQnty }));
    setAddedProducts(updatedUserWithQnty.reverse());
  };

  const handleBuyAll = () => {
    const savedUser = JSON.parse(localStorage.getItem("existingUser"));
    setBookingProducts(savedUser.cart);
    if (savedUser.cart.length <= 0) return;
    navigate("/booking");
  };

  return (
    <>
      <Navbar />
      <div className="container my-5">
        <h4 className="text-center mb-2"data-aos="fade-up">My Cart</h4>
        <p className="text-center mb-4" style={{ fontFamily: 'revert' }}data-aos="fade-up">
          Total ({cartTotalItems}) items in cart
        </p>

        <div className="row justify-content-center g-4">
          {isLogin && addedProducts.map((item, index) => (
            <div key={index} className="col-12 col-sm-8 col-md-6 col-lg-4 col-xl-3 d-flex justify-content-center"data-aos="fade-up">
              <div
                className="card h-100 shadow-sm border-0 text-center"
                style={{
                  borderRadius: '20px',
                  maxWidth: '280px',
                  width: '100%',
                  backgroundColor: "#fff8f0",
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer',
                  padding: '15px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="img-fluid mb-3"
                  style={{ height: '160px', objectFit: 'contain' }}
                />
                <h6 className="fw-bold mb-1">{item.name}</h6>
                <p className="fw-semibold mb-1">Price: ₹{(item.quantity || 1) * item.price}</p>
                <p className="text-muted small mb-3">{item.ml} ML</p>

                <div className="d-flex justify-content-center align-items-center gap-3 mb-3">
                  <button
                    onClick={() => decrementQuantity(item)}
                    style={{
                      width: '35px',
                      height: '35px',
                      borderRadius: "50%",
                      backgroundColor: '#fff8f0',
                      border: 'none',
                      fontSize: '18px',
                      fontWeight: 'bold',
                    }}
                  >-</button>
                  <span>qty : {item.quantity || 1}</span>
                  <button
                    onClick={() => incrementQuantity(item)}
                    style={{
                      width: '35px',
                      height: '35px',
                      borderRadius: "50%",
                      backgroundColor: '#fff8f0',
                      border: 'none',
                      fontSize: '18px',
                      fontWeight: 'bold',
                    }}
                  >+</button>
                </div>

                <button
                  className="btn btn-danger rounded-pill w-100"
                  onClick={() => handleRemove(item)}
                >
                  Remove
                </button>
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
      <div style={{height:'20px'}}></div>
      <Footer data-aos="fade-up"/>
      <ScrollToTop />
    </>
  );
}
