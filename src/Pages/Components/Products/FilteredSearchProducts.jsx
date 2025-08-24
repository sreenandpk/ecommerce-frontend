import { useContext, useEffect, useState } from "react"
import { SearchContext } from "../SearchContext/SearchContext";
import ErrorAnimation from "../../../../jsonAnimation/error.json"
import Lottie from "lottie-react";
import Navbar from "../../Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { fetchUser, updateUser,fetchProducts} from "../Fetch/FetchUser"
export default function FilteredSearchProducts(){
const navigate=useNavigate();
const {setProductDetails}=useContext(SearchContext);
const {searchValue,setCartCount}=useContext(SearchContext);
const [products,setProducts]=useState([]);
const [userBuyMessage,setUserBuyMessage]=useState([]);
const [divForBuy,setDivForBuy]=useState(false);
const [divForAlignmnt,setDivForAlignment] = useState(false);
const detailsOfproduct=async function (item) {
          setProductDetails(item)
          navigate("/productDetails")
         }
{/*this will run whenever search value changes*/}
useEffect(function(){
        async function FetchFilterdProducts() {
                   try{
if (!searchValue.trim()) return;

const product = await fetchProducts(searchValue.toLowerCase());
console.log(product);
 setProducts(product)

if(product.length>0){
  setDivForAlignment(true)
}
else{
  setDivForAlignment(false)
}
 }catch{
   console.log("failed to fetch")
            }
        }
FetchFilterdProducts();
    },[searchValue])
 {/* when user click add to cart  */}
const  addToCartAndRemoveFromCart=async function (item) {
                  try {
                    const savedUser = JSON.parse(
                      localStorage.getItem("existingUser")
                    );
                    if (!savedUser) {
                      alert("Login first");
                      navigate("/login");
                      return;
                    }
                    const user = await fetchUser(savedUser.id)
                    
                    let removeItemFromCart = false;
                    for (let product of user.cart) {
                      if (product.id === item.id) {
                        removeItemFromCart = true;
                        break;
                      }
                    }
                    let updatedCart;
                    if (removeItemFromCart) {
                      updatedCart = user.cart.filter(function (product) {
                        return product.id !== item.id;
                      });
                      alert("Item removed from cart");
                      
                    } else {
                      alert(`${item.name} added to cart ✅`);
                   
                      updatedCart = [...user.cart, item];
                    }
                    await updateUser(savedUser.id,
                      {
                        cart: updatedCart,
                      }
                    );
                    let updatedUser = { ...user, cart: updatedCart };
                    localStorage.setItem(
                      "existingUser",
                      JSON.stringify(updatedUser)
                    );
                    localStorage.setItem(
                      "cartTotalLength",
                      updatedUser.cart.length
                    );
                   setCartCount(updatedCart.length)
                  } catch (err) {
                    console.log("error in cart update", err);
                  }
                }
                {/*when user click buy*/}
         const  userClickedBuy= async function (item) {
                     const savedUser = JSON.parse(
                    localStorage.getItem("existingUser")
                  );
                  if (!savedUser) {
                    alert("login first");
                    navigate("/login");
                  } else {
                    setUserBuyMessage(item);
                    setDivForBuy(true);
                  }
                }
    return(
<>
      <Navbar />
       {divForAlignmnt ? <div style={{ height: "90px" }}></div>:""}
      {/*container*/}
   <div className="container mt-4">
  <div className="row g-3">
    {/*map products when component mounts and useffect will set products asychronasily*/}
  {products.length>0?products.map((item, index) => (
  <div key={index} className="col-12 col-sm-12 col-md-6 col-lg-4">
  <div className="card h-100 shadow-sm border-0 p-2" style={{ borderRadius: "15px" }}>
    <div className="d-flex flex-column flex-md-row align-items-center">
      {/* Image */}
      <div className="flex-shrink-0 text-center p-2">
        <img 
          src={item.image} 
          alt={item.name} 
          className="img-fluid" 
          style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "contain", borderRadius: "10px" }} 
          onClick={()=>detailsOfproduct(item)}
        />
      </div>
      {/* Content */}
      <div className="flex-grow-1 ms-md-3 mt-2 mt-md-0">
        <h5 className="card-title">{item.name}</h5>
        <p className="card-text mb-1">Price: ₹{item.price}</p>
        <p className="card-text mb-2">ML: {item.ml}</p>
        <div className="d-flex flex-wrap gap-2 mt-2">
        {/*button buy*/}
          <button 
            className="btn"
                style={{
                  flex: "1",
                  background: "linear-gradient(135deg, #ffffff, #f0f0f0)",
                  border: "2px solid #333",
                  color: "#333",
                  borderRadius: "30px",
                  fontWeight: "600",
                  fontSize: "14px",
                  height: "40px",
                  width:'100px'
                }}
                onClick={()=>userClickedBuy(item)}
          >
            Buy
          </button>
                {/*butoon add to cart and remove from cart*/}
          <button
                className="btn text-white"
                style={{
                  flex: "1",
                  backgroundColor: "#1e3253ff",
                  borderRadius: "20px",
                  height: "40px",
                  width:'100px'
                }}
               onClick={()=>addToCartAndRemoveFromCart(item)}
              >
                {JSON.parse(localStorage.getItem("existingUser"))?.cart?.some(
                  function (p) {
                    return p.id === item.id;
                  }
                )
                  ? "Remove"
                  : "Add"}
              </button>
        </div>
      </div>
    </div>
  </div>
</div>
              // if products length is 0 that means no products so else block will run             
    )):  
    /*so  product length is 0 the user will see this element*/
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh", // adjust height as needed
        width: "100%",
        maxWidth: "500px", // optional max width
        margin: "0 auto",
      }}
    >
{/*its an animation for run if no product found */}
            <Lottie
        animationData={ErrorAnimation}
        loop={true}
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "400px", // keeps it responsive
        }}
      />
    </div>}
  </div>
</div>
{/*this div will only display when user click buy*/}
{divForBuy && (
<div style={{
  position: "fixed",
  bottom: "0",
  left: "50%",
  transform: "translateX(-50%)", 
  width: "100%",
  maxWidth: "800px",            
  backgroundColor: "#fdfdfdff",
  boxShadow: "0 -2px 10px rgba(0,0,0,0.2)",
  borderTopLeftRadius: "15px",
  borderTopRightRadius: "15px",
  padding: "20px",
  zIndex: 1000,
  animation: "slideUp 0.3s ease-in-out"
}}>
    {/*this will show exact product details and go to order page navigation bcz i passed item as argument when user click buy */}
<div className="container mb-4">
  <div className="row justify-content-center">
    <div className="col-12 col-md-6">
      <div className="card border-0 shadow-lg rounded-4" style={{   backgroundColor: "#ffffffff"}}>
        <div className="card-body text-center">
          <h5 className="card-title fw-bold text-dark">{userBuyMessage.name}</h5>
          <p className="card-text fs-4 text-primary mb-1">₹{userBuyMessage.price}</p>
          <p className="card-text text-muted">ML: {userBuyMessage.ml}</p>
        </div>
      </div>
    </div>
  </div>
</div>
  {/*this will take you to order page*/}
    <button className="btn btn-warning w-100 mb-2">Continue</button>
    <button 
      className="btn btn-outline-secondary w-100"
      onClick={function(){
        setDivForBuy(false)}}
    >
      Cancel
    </button>
  </div>
)}
</>

    )


}