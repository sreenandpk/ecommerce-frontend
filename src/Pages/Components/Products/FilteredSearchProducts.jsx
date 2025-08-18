import { useContext, useEffect, useState } from "react"
import { SearchContext } from "./SearchContext";
import axios from "axios";
export default function FilteredSearchProducts(){


     const {searchValue}=useContext(SearchContext);

     const [products,setProducts]=useState([]);
     
    useEffect(function(){
        async function FetchFilterdProducts() {
            

            try{
if (!searchValue.trim()) return;

const product = await axios.get(
  `http://localhost:5000/products?name=${searchValue.toLowerCase()}`
);

console.log(product.data);

                setProducts(product.data)
                

            }catch{

                console.log("failed to fetch")
            }


        }

        FetchFilterdProducts();
    },[searchValue])

  
    return(

<>

     <div className="container mt-4">
  <div className="row g-3">
    {products.length>0?products.map((item, index) => (
      <div key={index} className="col-6 col-sm-4 col-md-3">
        <div className="card text-center h-100">
          <div className="card-body">
            <h5 className="card-title">{item.name}</h5>
            <p className="card-text">Price: {item.price}</p>
            <p className="card-text">ML: {item.ml}</p>
            <button className="btn btn-primary m-1" onClick={function(){
                const savedUser=JSON.parse(localStorage.getItem("existingUser"));
                if(!savedUser){
                    console.log("login first")
                }
                else{
                    console.log("order success")
                }
            }}>Buy</button>
            <button className="btn btn-secondary m-1">Add to Cart</button>
          </div>
        </div>
      </div>
    )):<p>not found</p>}
  </div>
</div>
</>

    )


}