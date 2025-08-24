import { useContext, useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import Navbar from "../../Navbar/Navbar";
import { SearchContext } from "../SearchContext/SearchContext";
import { useNavigate } from "react-router-dom";
import BackButton from "../BackWardButtton/BackButton";
export default function Cart() {
 
  
  
  



  const [addedProducts, setAddedProducts] = useState([]);
  const [cartTotalItems, setCartTotalItems] = useState(0);
  const { setCartCount } = useContext(SearchContext);
  const [isLogin, setIsLogin] = useState(false);
 














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

      // Update backend
      await axios.patch(`http://localhost:5000/users/${savedUser.id}`, {
        cart: result
      });

      // Update local storage
      const newSavedUser = { ...savedUser, cart: result };
      localStorage.setItem("existingUser", JSON.stringify(newSavedUser));

      // Update state
      setAddedProducts(result);
      setCartTotalItems(result.length);
      setCartCount(result.length);  // ✅ update navbar count immediately

      console.log("Successfully removed from cart");
    } catch (err) {
      console.error(err);
      console.log("Failed to remove item from cart");
    }
  };















  return (
    <>
      <Navbar />
       <div style={{height:'50px'}}></div>
      <BackButton />
      <h4 className="mx-5 mt-5">My Cart</h4>

      <p style={{ display: 'flex', justifyContent: 'center', fontFamily: 'revert', gap: '3px' }}>
        <span>Total</span> ({cartTotalItems}) <span>items in cart</span>
      </p>

      <div className="container mt-4">
        <div className="row g-4">
          {isLogin && addedProducts.map((item, index) => (
            <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div
                className="card h-100 shadow-sm border-0 text-center"
                style={{
                  borderRadius: '20px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                }}
              >
                <div className="card-body d-flex flex-column justify-content-between">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="img-fluid mb-3"
                    style={{ height: '150px', objectFit: 'contain' }}
                  />
                  <h6 className="fw-bold mb-2">{item.name}</h6>
                  <p className="text-muted small mb-1">Offer: {item.offer}</p>
                  <p className="text-muted small mb-1">Category: {item.category}</p>
                  <p className="text-muted small mb-1">Ratings: ⭐ {item.rating}</p>
                  <p className="fw-semibold mb-1">Price: ₹{item.price}</p>
                  <p className="text-muted small mb-3">{item.ml} ML</p>

                  <button className="btn btn-warning rounded-pill w-100 mb-2">
                    Confirm Order
                  </button>

                  <button
                    className="btn btn-danger rounded-pill w-100"
                    onClick={() => handleRemove(item)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
