import { useContext, useEffect } from "react";
import { SearchContext } from "./SearchContext";

import { useNavigate } from "react-router-dom";

export default function ProductDetails(){


    const navigator=useNavigate();
  const {productDetails}=useContext(SearchContext);



    useEffect(function(){
        if(productDetails.length===0||!productDetails){
            navigator("/products")
        }
    },[productDetails])


    return(


        <>
        
       
<div className="container mt-4">
  <div className="row g-3">
    {productDetails&&
      <div className="col-6 col-sm-4 col-md-3" >
        <div className="card text-center h-100">
          <div className="card-body">
            <h5 className="card-title"> {productDetails.name}</h5>
            <p className="card-text">Price: {productDetails.price}</p>
            <p className="card-text">ML: {productDetails.ml}</p>
          </div>
        </div>
      </div>
    }
  </div>
</div>

        </>


    )
}