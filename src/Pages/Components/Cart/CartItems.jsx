import { useContext, useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from "../../Navbar/Navbar";
import { SearchContext } from "../SearchContext/SearchContext";
import BackButton from "../BackWardButtton/BackButton";
import { fetchProducts, updateUser } from "../Fetch/FetchUser";
import { useNavigate } from "react-router-dom";
export default function Cart() {
  const [addedProducts, setAddedProducts] = useState([]);
  const [cartTotalItems, setCartTotalItems] = useState(0);
  const { setCartCount } = useContext(SearchContext);
  const [isLogin, setIsLogin] = useState(false);
  const {setBookingProducts}=useContext(SearchContext);
 const navigate=useNavigate()
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
      await updateUser(savedUser.id, {
        cart: result
      });

      // Update local storage
      const newSavedUser = { ...savedUser, cart: result };
      localStorage.setItem("existingUser", JSON.stringify(newSavedUser));

      // Update state
      setAddedProducts(result);
      setCartTotalItems(result.length);
      setCartCount(result.length); //✅ update navbar count immediately

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
                  <p className="fw-semibold mb-1">Price: ₹{item.quantity*item.price}</p>
                  <p className="text-muted small mb-3">{item.ml} ML</p>

                  <div style={{display:'flex',justifyContent:'center',gap:'20px'}}className="mb-3"><button
               onClick={async function () {
                 const savedUser = JSON.parse(localStorage.getItem("existingUser"));

               const updatedCart = savedUser.cart.map(p => {
      if (p.id === item.id) {
        // 👇 Prevent going below 1
        const newQty = (p.quantity || 1) - 1;
        return { ...p, quantity: newQty > 0 ? newQty : 1 };
      }
      return p;
    });

    // Update backend
    await updateUser(savedUser.id, { cart: updatedCart });

    // Update localStorage
    const updatedUser = { ...savedUser, cart: updatedCart };
    localStorage.setItem("existingUser", JSON.stringify(updatedUser));

    // Update React state
    setAddedProducts(updatedCart.reverse());
    setCartTotalItems(updatedCart.reduce((sum, p) => sum + (p.quantity || 1), 0));
    setCartCount(updatedCart.reduce((sum, p) => sum + (p.quantity || 1), 0));
  }}
>
-
</button>
                  <h5>qnty {item.quantity}</h5> <button onClick={async function(){
                    const savedUser=JSON.parse(localStorage.getItem("existingUser"));
                  const updatedUserWithQnty=savedUser.cart.map(function(p){
                    if(p.id===item.id){
                      return {...p,quantity: (p.quantity || 1) + 1 }
                    }
                    return p;
                  })
                  localStorage.setItem("existingUser",JSON.stringify({...savedUser,cart:updatedUserWithQnty}))
                 await updateUser(savedUser.id,{cart:updatedUserWithQnty})
                 setAddedProducts(updatedUserWithQnty.reverse())
                  }}>+</button></div>
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
<div className="d-flex justify-content-center my-4">
  <button
    className="btn btn-dark btn-lg rounded-pill px-5 py-3 shadow-lg fw-bold text-uppercase"
    onClick={function(){
   const savedUser = JSON.parse(localStorage.getItem("existingUser"));
setBookingProducts(savedUser.cart);
      if(!savedUser.cart.length>0){
        return;
      }else{
      // Navigate to booking page
      navigate("/booking");
      }
    }}
  >
    🛒 Buy All
  </button>
</div>

        </div>
      </div>
    </>
  );
}
