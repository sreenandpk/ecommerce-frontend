import {  useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { fetchProductById, updateUser} from "../Fetch/FetchUser";
import { SearchContext } from "../SearchContext/SearchContext";
import { fetchUser } from "../Fetch/FetchUser";
import { infoToast } from "../toast";
import Navbar from "../../Navbar/Navbar";
import Footer from "../Home/Footer";

export default function ProductDetails(){
  const {setCartCount}=useContext(SearchContext);
   const [product, setProduct] = useState(null);
   const {id}=useParams();
   const {setRecentlyViewedProducts}=useContext(SearchContext);
   const navigate=useNavigate();
   console.log(id)


   
    useEffect(()=>{
      async function fetchproduct() {
        try{
            const response=await fetchProductById(id)
            setProduct(response)
            const savedUser=JSON.parse(localStorage.getItem("existingUser"));
            console.log(savedUser)

            const recentlyViewedItem=savedUser.recentlyViewed ||[];

          const alreadyExist=recentlyViewedItem.some((p)=>p.id===response.id)

          if(!alreadyExist){
            recentlyViewedItem.push(response)
          
            const updatedUserRec={...savedUser,recentlyViewed:recentlyViewedItem}
            setRecentlyViewedProducts(recentlyViewedItem)
            await updateUser(savedUser.id,
              {
                recentlyViewed:recentlyViewedItem
              }
            )
          localStorage.setItem("existingUser",JSON.stringify(updatedUserRec));
          }
            
            
            else return;
        }catch{
          console.log("something happend")
        }
      }
      fetchproduct()
    },[id])




const addtoCart=async function (item) {
                  try {
                    const savedUser = JSON.parse(
                      localStorage.getItem("existingUser")
                    );
                    if (!savedUser) {
                      infoToast("Login first");
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
                      infoToast(`${item.name} removed from cart`);
                   
                    } else {
                      infoToast(`${item.name} added to cart ✅`);
                     
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
                    const newUpdatedQuantity =
                      localStorage.getItem("cartTotalLength");
                    setCartCount(newUpdatedQuantity);
                  } catch (err) {
                    console.log("error in cart update", err);
                  }
                }




    return(
        <>
        <Navbar />
{/*will run when user click product image*/}
<div className="container mt-4"style={{background:' #fff8f0'}}>
  {product && (
    <div className="row g-3 align-items-start">
      <div className="col-12 col-md-5">
        <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: "20px", overflow: "hidden",background:' #fff8f0' }}>
          <img
            src={product.image}
            alt={product.name}
            className="img-fluid"
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "500px",
              objectFit: "contain",
            }}
          />
        </div>
      </div>
      <div className="col-12 col-md-7">
        <div className="card h-100 border-0 shadow-sm p-3" style={{ borderRadius: "20px" ,background:' #fff8f0'}}>
       <h2
  style={{
    fontFamily: "'Fredoka One', 'Cooper Black', cursive",
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#5b1111",
  }} className="mb-5"
>
  {product.name}
</h2>


          <p className="mb-4 "><strong style={{ fontFamily: "'Fredoka One', 'Cooper Black', cursive", fontSize: "1.5rem",}}>Price:</strong> <span style={{color:'black',fontSize: "1.5rem",fontWeight:'bold'}}>₹{product.price}</span></p>
          <p className="mb-2"><strong>ML:</strong> <span style={{
    fontSize: "1.2rem",}}><strong>{product.ml}</strong>  </span></p> 
            <p className=" small mb-3"><strong>Category:</strong> <span style={{
    fontSize: "1.2rem",}}><strong>{product.category}</strong></span></p>
            <p className=" small mb-1"> <strong> ⭐</strong> <span style={{ 
    fontSize: "1.2rem",}}><strong>{product.rating}</strong></span></p>
            
              <button
                className="btn text-white mt-4"
                style={{
                  flex: "1",
                  backgroundColor: "black",
                  borderRadius: "20px",
                  height: "50px",
                }}
                onClick={()=>addtoCart(product)}
              >
                {JSON.parse(localStorage.getItem("existingUser"))?.cart?.some(
                  function (p) {
                    return p.id === product.id;
                  }
                )
                  ? "Remove"
                  : "Add"}
              </button>
          <hr />

          
          <p className="text-muted mb-1"style={{
    fontSize: "1.2rem"}}><strong>Captions:</strong> {product.captions || "No captions available"}</p>
          <p className="text-muted"style={{
    fontSize: "1.2rem"}}><strong>Reviews:</strong> {product.reviews || "No reviews yet"}</p>
        </div>
      </div>
    </div>
  )}
</div>
<div style={{height:'20px'}}></div>
<Footer />
        </>
    )
}