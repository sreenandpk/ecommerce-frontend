

import { useContext } from "react"
import { SearchContext } from "../SearchContext/SearchContext"
export default function RecentlyViewed(){


const {recentlyViewedProduct}=useContext(SearchContext);

console.log(recentlyViewedProduct)
return(
<>

{recentlyViewedProduct&&recentlyViewedProduct.map(function(item,index){
    return <div key={index}><p>{item.name}</p><p>{item.price}</p></div>
})}

</>




)



}