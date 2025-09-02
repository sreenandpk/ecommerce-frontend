import {  useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { fetchProductById, updateUser} from "../Fetch/FetchUser";
import { SearchContext } from "../SearchContext/SearchContext";
import { fetchUser } from "../Fetch/FetchUser";
import { infoToast } from "../toast";

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
{/*will run when user click product image*/}
<div className="container mt-4">
  {product && (
    <div className="row g-3 align-items-start">
      <div className="col-12 col-md-5">
        <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: "20px", overflow: "hidden" }}>
          <img
            src={product.image}
            alt={product.name}
            className="img-fluid"
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "400px",
              objectFit: "contain",
            }}
          />
        </div>
      </div>
      <div className="col-12 col-md-7">
        <div className="card h-100 border-0 shadow-sm p-3" style={{ borderRadius: "20px" }}>
          <h3 className="fw-bold mb-3">{product.name}</h3>
          <p className="mb-2"><strong>Price:</strong> ₹{product.price}</p>
          <p className="mb-2"><strong>ML:</strong> {product.ml}</p> <h6 className="fw-bold mb-2">{product.name}</h6>
            <p className="text-muted small mb-1">Offer: {product.offer}</p>
            <p className="text-muted small mb-1">Category: {product.category}</p>
            <p className="text-muted small mb-1">Ratings: ⭐ {product.rating}</p>
            
              <button
                className="btn text-white"
                style={{
                  flex: "1",
                  backgroundColor: "#1e3253ff",
                  borderRadius: "20px",
                  height: "40px",
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

          
          <p className="text-muted mb-1"><strong>Captions:</strong> {product.captions || "No captions available"}</p>
          <p className="text-muted"><strong>Reviews:</strong> {product.reviews || "No reviews yet"}</p>
        </div>
      </div>
    </div>
  )}
</div>
        </>
    )
}