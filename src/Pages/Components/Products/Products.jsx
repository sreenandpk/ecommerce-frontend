import axios from "axios"
import { useEffect, useState } from "react"
import 'bootstrap/dist/css/bootstrap.min.css';
import { Heart } from "lucide-react";
import Lottie from "lottie-react";
import addToCartAnimation from "./addtocart.json";



import { useContext } from "react";
import { SearchContext } from "./SearchContext";
import { useNavigate } from "react-router-dom";


export default function Products(){

    const [products,setProducts]=useState([]);
    
    const [inputValue,setinputValue]=useState("");
        const {setSearchValue}=useContext(SearchContext);

        const {setProductDetails}=useContext(SearchContext);
        

        const navigate=useNavigate();

        const [updatedQuantity,setUpdatedQuantity]=useState(null)

        const [filtered,setFilterd]=useState([]);
  
        const [wishlistIds, setWishlistIds] = useState([]);

        const [divForBuy,setDivForBuy]=useState(false);

        const [latestProductForBuy,setLatestProductForBuy]=useState([]);

        const [cartAnimation,setCartAnimation]=useState(false);
        

        useEffect(() => {
  async function fetchWishlist() {
    const savedUser = JSON.parse(localStorage.getItem("existingUser"));
    if (savedUser) {
      try {
        const response = await axios.get(`http://localhost:5000/users/${savedUser.id}`);
        setWishlistIds(response.data.wishlist.map((item) => item.id));
  

      } catch (err) {
        console.log("error fetching wishlist", err);
      }
    }
  }
  fetchWishlist();
}, []);

      
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

<p>length of wish list {wishlistIds.length}</p>

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
      <div key={index} className="col-6 col-sm-4 col-md-3" >
        <div className="card text-center h-100">
          <div className="card-body">
            <p onClick={function(){
        setProductDetails(item);
        navigate("/ProductDetails")
      }}>product details</p>
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
                    setLatestProductForBuy(item)
                    setDivForBuy(true)
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


      let removeItemFromCart=false;

      for(let product of user.cart){

        if(product.id===item.id){
          removeItemFromCart=true;
          break;
        }
        
      }
       let updatedCart;
      if(removeItemFromCart){
         updatedCart = user.cart.filter(function(product){
          
         
          return product.id!==item.id;

         })
      alert(" item removed from cart")
      setCartAnimation(false)
      }
      else{
        
      // 2. Append new product to cart
      alert(`${item.name} added to cart ✅`);
          setCartAnimation(true)
           setTimeout(() => setCartAnimation(false), 2000);
         updatedCart = [...user.cart, item];
        
      }


      

      // 3. Update user in db.json
      await axios.patch(`http://localhost:5000/users/${savedUser.id}`, {
        cart: updatedCart
      });

      let updatedUser={...user,cart:updatedCart};

      localStorage.setItem("existingUser",JSON.stringify(updatedUser))

    
     
       localStorage.setItem("cartTotalLength",updatedUser.cart.length);

       const newUpdatedQuantity= localStorage.getItem("cartTotalLength");

       setUpdatedQuantity(newUpdatedQuantity);

       

    } catch (err) {
      console.log("error in fetch cart data", err);
    }
  }}
>
{JSON.parse(localStorage.getItem("existingUser"))?.cart?.some(function(p){
  return p.id===item.id
})
    ? "Remove "
    : "Add to Cart"}
</button> 


  <span
 
  onClick={ async function(){

try{
    const savedUser=JSON.parse(localStorage.getItem("existingUser"));
    if(!savedUser) {

      alert("login first");
      navigate("/login")
      return;
    }
    
    if(savedUser){
   

    const user=  await axios.get(`http://localhost:5000/users/${savedUser.id}`);

    

    const  newUserWishlist=[...user.data.wishlist]
      

        const alreadyAdded=newUserWishlist.some(function(element){
      return element.id===item.id;
    });
 if(alreadyAdded){
      const newWishlist=newUserWishlist.filter(function(i){
        return i.id!==item.id;
      })

        await axios.patch(`http://localhost:5000/users/${savedUser.id}`,{
      wishlist:newWishlist
     })
     alert(`${item.name} item remved from wishlist`);
      setWishlistIds((prev) => prev.filter((id) => id !== item.id));

     localStorage.setItem("existingUser",JSON.stringify({...user.data,wishlist:newWishlist}));
    
    }else{

        alert(`${item.name} added to wishlist`)
        setWishlistIds((prev) => [...prev, item.id]);
       
    newUserWishlist.push(item);



     await axios.patch(`http://localhost:5000/users/${savedUser.id}`,{
      wishlist:newUserWishlist
     })
  localStorage.setItem("existingUser",JSON.stringify({...user.data,wishlist:newUserWishlist}));
  
    }


    

  }
  }catch{

    console.log("cant add or remove something happend in try block")

  }
  }} > <Heart
    color={wishlistIds.includes(item.id) ? "red" : "gray"}
    fill={wishlistIds.includes(item.id) ? "red" : "none"}
  /> </span>



          </div>
        </div>
      </div>
    ))}
  </div>
</div>
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
    
<div className="container mb-4">
  <div className="row justify-content-center">
    <div className="col-12 col-md-6">
      <div className="card border-0 shadow-lg rounded-4" style={{   backgroundColor: "#ffffffff"}}>
        <div className="card-body text-center">
          <h5 className="card-title fw-bold text-dark">{latestProductForBuy.name}</h5>
          <p className="card-text fs-4 text-primary mb-1">₹{latestProductForBuy.price}</p>
          <p className="card-text text-muted">ML: {latestProductForBuy.ml}</p>
          
        </div>
      </div>
    </div>
  </div>
</div>



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

{cartAnimation && (
  <div style={{
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "200px",
    height: "200px",
    zIndex: 2000,
    
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}>
    <Lottie animationData={addToCartAnimation} loop={false} />
  </div>
)}

</>


)



}