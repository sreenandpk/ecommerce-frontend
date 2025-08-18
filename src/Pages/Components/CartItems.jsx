
import { useContext, useEffect, useState } from "react"
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
export default function Cart(){

const [isLogin,setIsLogin]=useState(false);
const [addedProducts,setAddedProducts]=useState([]);
const [cartTotalItems,setCartTotalItems]=useState(null);


 useEffect(function(){

    async function fetchUser() {
        
    
    const savedUser=JSON.parse(localStorage.getItem("existingUser"));

    if(savedUser){
        setIsLogin(true);
          setAddedProducts(savedUser.cart.reverse());
          localStorage.setItem("cartTotalLength",savedUser.cart.length);
          const updatedCartLength=localStorage.getItem("cartTotalLength");

          setCartTotalItems(updatedCartLength)

    }

       
    else{
        setIsLogin(false)
    }
    }
    fetchUser();

 },[])


 

    return(

<>
<h1>cart items {cartTotalItems}</h1>





<div className="container mt-4">
  <div className="row g-3">
    {isLogin?addedProducts.map((item, index) => (
      <div key={index} className="col-6 col-sm-4 col-md-3">
        <div className="card text-center h-100">
          <div className="card-body">
            <h5 className="card-title">{item.name}</h5>
            <p className="card-text">Price: {item.price}</p>
            <p className="card-text">ML: {item.ml}</p>
            <button onClick={async function(){
                try{

                const result=addedProducts.filter(function(items){
                        return items!==item
                    })

                    const savedUser=JSON.parse(localStorage.getItem("existingUser"));
                    await axios.patch(`http://localhost:5000/users/${savedUser.id}`,{
                        cart:result
                    })


                    

                    
                     const  newSavedUser={...savedUser,cart:result};
                        localStorage.setItem("existingUser",JSON.stringify(newSavedUser))



                    setAddedProducts(result)
                     localStorage.setItem("cartTotalLength",newSavedUser.cart.length);
          const updatedCartLength=localStorage.getItem("cartTotalLength");

          setCartTotalItems(updatedCartLength)


                    alert("successfully removed from cart");
                 
                  
                    
                    
                }catch{
                    alert("failed to update RemovedProducts")
                }
            }}>remove</button>
           
          </div>
        </div>
      </div>
    )):""}
  </div>
</div>




</>



    )


}  