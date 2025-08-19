import axios from "axios";
import { useEffect, useState } from "react"
import 'bootstrap/dist/css/bootstrap.min.css';
export default function Wishlist(){



  const [likedProducts,setLikedProducts]=useState([]);



  useEffect(function(){
    async function fetchLikedProducts() {

      const savedUser=JSON.parse(localStorage.getItem("existingUser"))

      const products=await axios.get(`http://localhost:5000/users/${savedUser.id}`);
      
      setLikedProducts((products.data.wishlist).reverse());
      console.log(products.data.wishlist)
      
    }
    fetchLikedProducts();
  },[])


    return(
<>
<h2>wishlist</h2>
<div className="container mt-4">
  <div className="row g-3">
    {likedProducts&&likedProducts.map((item, index) => (
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


            <button onClick={async function(){
              try{


                const savedUser=JSON.parse(localStorage.getItem("existingUser"));


                if(!savedUser) return ;


                const wishlistItem=await axios.get(`http://localhost:5000/users/${savedUser.id}`);

                

                const newWishlistItem=wishlistItem.data.wishlist.some(function(element){
                  return element.id===item.id;
                })

                if(newWishlistItem){



                 const filteredWishlist=wishlistItem.data.wishlist.filter(function(i){
                  return i.id!==item.id;
                 })

                 await axios.patch(`http://localhost:5000/users/${savedUser.id}`,{
                  wishlist:filteredWishlist
                 });

                 localStorage.setItem("existingUser",JSON.stringify({...wishlistItem.data,wishlist:filteredWishlist}))

                 alert(`${item.name} removed from wishlist`);

                 setLikedProducts(filteredWishlist)

                }



              }catch{

                console.log("cant remove item somthing happend in try block")

              }
            }}>remove</button>

          </div>
        </div>
      </div>
    ))}
  </div>
</div>



</>
  


    )



}