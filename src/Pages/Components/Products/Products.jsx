import axios from "axios"
import { useEffect, useState } from "react"
import 'bootstrap/dist/css/bootstrap.min.css';

import { useContext } from "react";
import { SearchContext } from "./SearchContext";
import { useNavigate } from "react-router-dom";
export default function Products(){

    const [products,setProducts]=useState([]);
    
    const [inputValue,setinputValue]=useState("");
        const {setSearchValue}=useContext(SearchContext);

        const navigate=useNavigate();

        const [updatedQuantity,setUpdatedQuantity]=useState(null)

        const [filtered,setFilterd]=useState([]);
      
            useEffect(function(){
              async function quantity(){

                const cartQuantity=localStorage.getItem("cartTotalLength");

                setUpdatedQuantity(cartQuantity);

              }
              quantity()
            },[])

    useEffect(function(){

    
    async  function fetchProducts(){
    try{let response=await axios.get("http://localhost:5000/products");
    
   setProducts(response.data)
  
  }catch{
    console.log("failed to fetch")
   }
    
    }
fetchProducts();
},[])

const milk=async function(){

  try{
  const productMilk= await axios.get("http://localhost:5000/products?name=milk");

  setFilterd(productMilk.data)
  console.log(productMilk.data)

  }catch{

    console.log("failed to fetch")

  }

}



const pepsi=async function(){

  try{
  const productMilk= await axios.get("http://localhost:5000/products?name=pepsi");

  setFilterd(productMilk.data)
  console.log(productMilk.data)

  }catch{

    console.log("failed to fetch")

  }

}


return(

<>

<p>products page__ items added to cart {updatedQuantity}</p>



<form onSubmit={function(event){
  event.preventDefault();
  if(inputValue.toLowerCase().trim()){
     setSearchValue(inputValue);
     navigate("/search");
   }
   else return;
}}>
    <input placeholder="Search"onChange={function(event){
setinputValue(event.target.value);
}}></input><button type="submit">search</button>
</form>


  <div><span>filter</span><button onClick={milk}>Milk</button><button onClick={pepsi}>pepsi</button>
  
  <button onClick={function(){
    setFilterd([])
  }}>Show all</button>
  </div>









<div className="container mt-4">
  <div className="row g-3">
    {(filtered.length>0?filtered:products).map((item, index) => (
      <div key={index} className="col-6 col-sm-4 col-md-3">
        <div className="card text-center h-100">
          <div className="card-body">
            <h5 className="card-title">{item.name}</h5>
            <p className="card-text">Price: {item.price}</p>
            <p className="card-text">ML: {item.ml}</p>
            <button className="btn btn-primary m-1"onClick={function(){
                const savedUser=JSON.parse(localStorage.getItem("existingUser"));
                if(!savedUser){
                    alert("login first")
                    navigate("/login")
                }
                else{
                    alert("order success")
                }
            }}>Buy</button>
           <button 
  className="btn btn-secondary m-1"
  onClick={async function(){
    try {
      const savedUser = JSON.parse(localStorage.getItem("existingUser"));

      if (!savedUser) {
        alert("Login first");
        navigate("/login");
        return;
      }

      // 1. Fetch the latest user from db.json
      const response = await axios.get(`http://localhost:5000/users/${savedUser.id}`);
      let user = response.data;

      // 2. Append new product to cart
      let updatedCart = [...user.cart, item];

      // 3. Update user in db.json
      await axios.patch(`http://localhost:5000/users/${savedUser.id}`, {
        cart: updatedCart
      });

      let updatedUser={...user,cart:updatedCart};

      localStorage.setItem("existingUser",JSON.stringify(updatedUser))

      alert(`${item.name} added to cart ✅`);
    
     
       localStorage.setItem("cartTotalLength",updatedUser.cart.length);

       const newUpdatedQuantity= localStorage.getItem("cartTotalLength");

       setUpdatedQuantity(newUpdatedQuantity)

    } catch (err) {
      console.log("error in fetch cart data", err);
    }
  }}
>
  Add to Cart
</button>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>




</>


)



}