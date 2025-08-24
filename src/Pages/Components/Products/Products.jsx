
import { useEffect, useState } from "react"
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Heart } from "lucide-react";
import { useContext } from "react";
import { SearchContext } from "../SearchContext/SearchContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Navbar/Navbar";
import { fetchUser, updateUser,fetchProducts } from "../Fetch/FetchUser"
export default function Products(){
const [products,setProducts]=useState([]);
const { wishlistIds = [], setWishlistIds, setCartCount } = useContext(SearchContext);
const [active, setActive] = useState(""); // track active flavor
const navigate=useNavigate();
const [filtered,setFilterd]=useState([]);
const [divForBuy,setDivForBuy]=useState(false);
const [latestProductForBuy,setLatestProductForBuy]=useState([]);

  {/*this will run whenever the components mount*/}
    useEffect(function(){
    async  function fetchProductsFromFetch(){
    try{
      const res=await fetchProducts()
   setProducts(res)
  
  }catch{
    console.log("failed to fetch")
   }
    }
fetchProductsFromFetch();
},[])

const vanila=async function(){
  try{
  const productVanila= await fetchProducts();
    const vanilaProducts=productVanila.filter((p)=> p.category==="vanila")
  setFilterd(vanilaProducts)
  console.log(vanilaProducts)
  }catch{
    console.log("failed to fetch")
  }
}
const strawberry=async function(){
  try{
  const productStrawberry=await fetchProducts();
  const strawberryProducts=productStrawberry.filter((p)=>p.category==="strawberry")
  setFilterd(strawberryProducts)
  console.log(strawberryProducts)
  }catch{
    console.log("failed to fetch")
  }
}

const choclate=async function(){
  try{
  const productChoclates= await fetchProducts();
    const choclateProduct=productChoclates.filter((p)=>p.category==="choclate")
  setFilterd(choclateProduct)
  console.log(choclateProduct)

  }catch{
    console.log("failed to fetch")
  }
}
const showAll=async function(){
  try{
  const productAll= await fetchProducts()
  setFilterd(productAll)
  console.log(productAll)
  }catch{
    console.log("failed to fetch")
  }
}
const addtoCart=async function (item) {
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
                      console.log("Item removed from cart");
                   
                    } else {
                      console.log(`${item.name} added to cart ✅`);
                     
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
                const wishListFn=async function (item) {
                  try {
                    const savedUser = JSON.parse(
                      localStorage.getItem("existingUser")
                    );
                    if (!savedUser) {
                      alert("login first");
                      navigate("/login");
                      return;
                    }
                    const user = await fetchUser(savedUser.id)
                    const newUserWishlist = [...user.wishlist];
                    const alreadyAdded = newUserWishlist.some(function (
                      element
                    ) {
                      return element.id === item.id;
                    });
                    if (alreadyAdded) {
                      const newWishlist = newUserWishlist.filter(function (i) {
                        return i.id !== item.id;
                      });
                      await updateUser(savedUser.id,
                        {
                          wishlist: newWishlist,
                        }
                      );
                      alert(`${item.name} removed from wishlist`);
                      setWishlistIds((prev) =>
                        prev.filter((id) => id !== item.id)
                      );
                      localStorage.setItem(
                        "existingUser",
                        JSON.stringify({
                          ...user,
                          wishlist: newWishlist,
                        })
                      );
                    } else {
                      alert(`${item.name} added to wishlist`);
                      setWishlistIds((prev) => [...prev, item.id]);
                    
                      newUserWishlist.push(item);
                      await updateUser(savedUser.id,
                        {
                          wishlist: newUserWishlist,
                        }
                      );
                      localStorage.setItem(
                        "existingUser",
                        JSON.stringify({
                          ...user,
                          wishlist: newUserWishlist,
                        })
                      );
                    }
                  } catch {
                    console.log("error in wishlist toggle");
                  }
                }
return(

<>
    <Navbar />

      <div style={{ height: "90px" }}></div>

 <div className="container my-3">
      <div className="d-flex flex-wrap justify-content-center gap-2">
        <button
          onClick={() => { setActive("vanilla"); vanila(); }}
          className={`btn rounded-pill px-4 py-2 ${
            active === "vanilla" ? "btn-secondary" : "btn-outline-dark"
          }`}
        >
          Vanilla
        </button>

        <button
          onClick={() => { setActive("strawberry"); strawberry(); }}
          className={`btn rounded-pill px-4 py-2 ${
            active === "strawberry" ? "btn-danger" : "btn-outline-dark"
          }`}
        >
          Strawberry
        </button>

        <button
          onClick={() => { setActive("chocolate"); choclate(); }}
          className={`btn rounded-pill px-4 py-2 ${
            active === "chocolate" ? "btn-dark" : "btn-outline-dark"
          }`}
        >
          Chocolate
        </button>

        <button
          onClick={() => { setActive(""); showAll(); }}
          className={`btn rounded-pill px-4 py-2 ${
            active === "" ? "btn-dark" : "btn-outline-dark"
          }`}
        >
          Show All
        </button>
      </div>
    </div>
  <div className="container mt-4">
  <div className="row g-4">
    {(filtered.length > 0 ? filtered : products).map((item, index) => (
      <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3">
        <div
          className="card h-100 shadow-sm border-0"
          style={{
            borderRadius: "20px",
            overflow: "hidden",
            backgroundColor: "white",
            transition: "transform 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <div className="d-flex justify-content-center align-items-center p-3">
            <img onClick={function () {
               
                navigate(`/productDetails/${item.id}`);
              }}
              
              src={item.image}
              alt={item.name}
              style={{
                width: "180px",
                height: "auto",
                objectFit: "contain",
                maxWidth: "100%",
                margin: "0", color: "gray", cursor: "pointer"
              }}
            />
          </div>

          <div className="card-body">
            <h5
              style={{
                fontFamily: "cursive",
                marginBottom: "10px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{item.name}</span>
              <span
                onClick={()=>wishListFn(item)}
              >
                <Heart
                  color={wishlistIds.includes(item.id) ? "black" : "gray"}
                  fill={wishlistIds.includes(item.id) ? "black" : "none"}
                />
              </span>
            </h5>

            <p
              className="card-text text-muted"
              style={{ fontFamily: "initial", margin: "0" }}
            >
              ML: {item.ml}
            </p>

            <p
              onClick={function () {
                
                navigate(`/productDetails/${item.id}`);
              }}
              style={{ margin: "0", color: "gray", cursor: "pointer" }}
            >
              product details
            </p>

            <p
              className="card-text"
              style={{
                fontWeight: "bold",
                fontSize: "20px",
                color: "#4251b0ff",
              }}
            >
              {item.price}
            </p>

            {/* ✅ Buttons inline but responsive */}
            <div className="d-flex flex-wrap gap-2">
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
                }}
                onClick={function () {
                  const savedUser = JSON.parse(
                    localStorage.getItem("existingUser")
                  );
                  if (!savedUser) {
                    alert("login first");
                    navigate("/login");
                  } else {
                    setLatestProductForBuy(item);
                    setDivForBuy(true);
                  }
                }}
              >
                Buy
              </button>

              <button
                className="btn text-white"
                style={{
                  flex: "1",
                  backgroundColor: "#1e3253ff",
                  borderRadius: "20px",
                  height: "40px",
                }}
                onClick={()=>addtoCart(item)}
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
    ))}
  </div>
</div>
{divForBuy && (
  <div
    style={{
      position: "fixed",
      bottom: "0",
      left: "50%",
      transform: "translateX(-50%)",
      width: "95%",
      maxWidth: "500px",
      backgroundColor: "#ffffffff",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      borderTopLeftRadius: "20px",
      borderTopRightRadius: "20px",
      padding: "20px",
      zIndex: 1000,
      animation: "slideUp 0.3s ease-in-out",
    }}
  >
    <div className="container" >
      <div className="row justify-content-center">
        <div className="col-12">
          <div
            className="card border-0  rounded-4 p-3"
            
          >
            <div className="d-flex flex-column align-items-center text-center">
              {/* Product Image */}
              <img
                src={latestProductForBuy.image}
                alt={latestProductForBuy.name}
                className="img-fluid mb-3"
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "contain",
                  borderRadius: "10px",
                 
                }}
              />
              <h5 className="card-title fw-bold text-dark mb-1">
                {latestProductForBuy.name}
              </h5>
              <p className="card-text fs-4 text-primary mb-1">
                ₹{latestProductForBuy.price}
              </p>
              <p className="card-text text-muted mb-3">ML: {latestProductForBuy.ml}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="d-flex flex-column gap-2 mt-3">
      <button className="btn btn-dar w-100 fw-bold shadow-sm" style={{ fontSize: "16px" }}>
        Continue
      </button>
      <button
        className="btn btn-outline-secondary w-100 fw-bold"
        onClick={() => setDivForBuy(false)}
        style={{ fontSize: "16px" }}
      >
        Cancel
      </button>
    </div>
  </div>
)}
</>
)
}