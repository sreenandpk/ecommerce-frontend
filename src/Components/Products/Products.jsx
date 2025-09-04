import { useEffect, useState, useContext } from "react";
import { Heart } from "lucide-react";
import { SearchContext } from "../SearchContext/SearchContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Navbar/Navbar";

import { fetchUser, updateUser, fetchProducts } from "../Fetch/FetchUser";
import Footer from "../Home/Footer";
import { infoToast } from "../toast";
import ScrollToTop from "../ScrollTop";
import icecreamGGG from "../../../homeImages/iceCreamVideo.mp4";
import { fetchAllProducts } from "../../Admin/fetch";
export default function Products() {
  const [products, setProducts] = useState([]);
    const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const { wishlistIds = [], setWishlistIds, setCartCount } = useContext(SearchContext);
  const [active, setActive] = useState("");
  const [filtered, setFilterd] = useState([]);
  const [hotProducts,setHotProducts]=useState([]);
  
  const navigate = useNavigate();
  // Fetch bestseller products
  useEffect(() => {
    async function fetchBestseller() {
      const products = await fetchProducts();
      
      const bestSeller = products.filter((p) => p.bestseller === "true");
      if (bestSeller) setBestSellerProducts(bestSeller);
    }
    fetchBestseller();
  }, []);
  // Fetch products
  useEffect(() => {
    async function fetchProductsFromFetch() {
      try {
        const res = await fetchProducts();
        setProducts(res);
         // filter only hot items
      const hotRes = res.filter((p) => p.hot === "true");
      setHotProducts(hotRes);
    
      } catch {
        console.log("failed to fetch");
      }
    }
    fetchProductsFromFetch();
  }, []);

  const vanila = async () => {
    const productVanila = await fetchProducts();
    setFilterd(productVanila.filter((p) => p.category === "vanila"));
  };
  const strawberry = async () => {
    const productStrawberry = await fetchProducts();
    setFilterd(productStrawberry.filter((p) => p.category === "strawberry"));
  };
  const choclate = async () => {
    const productChoclates = await fetchProducts();
    setFilterd(productChoclates.filter((p) => p.category === "chocolate"));
  };
  const showAll = async () => {
    const productAll = await fetchProducts();
    setFilterd(productAll);
  };

  const addtoCart = async (item) => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("existingUser"));
      if (!savedUser) {
        infoToast("Login first");
        navigate("/login");
        return;
      }
      const user = await fetchUser(savedUser.id);
      let removeItemFromCart = user.cart.some((product) => product.id === item.id);
      let updatedCart = removeItemFromCart
        ? user.cart.filter((product) => product.id !== item.id)
        : [...user.cart, item];
      if (!removeItemFromCart) infoToast(`${item.name} added to cart `);
       if (removeItemFromCart) infoToast(`${item.name} removed from cart `);
      await updateUser(savedUser.id, { cart: updatedCart });
      const updatedUser = { ...user, cart: updatedCart };
      localStorage.setItem("existingUser", JSON.stringify(updatedUser));
      localStorage.setItem("cartTotalLength", updatedUser.cart.length);
      setCartCount(updatedUser.cart.length);
    } catch (err) {
      console.log("error in cart update", err);
    }
  };

  const wishListFn = async (item) => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("existingUser"));
      if (!savedUser) {
        infoToast("Login first");
        navigate("/login");
        return;
      }
      const user = await fetchUser(savedUser.id);
      const newUserWishlist = [...user.wishlist];
      const alreadyAdded = newUserWishlist.some((element) => element.id === item.id);
      if (alreadyAdded) {
        const newWishlist = newUserWishlist.filter((i) => i.id !== item.id);
        await updateUser(savedUser.id, { wishlist: newWishlist });
        infoToast(`${item.name} removed from wishlist`);
        setWishlistIds((prev) => prev.filter((id) => id !== item.id));
        localStorage.setItem("existingUser", JSON.stringify({ ...user, wishlist: newWishlist }));
      } else {
        infoToast(`${item.name} added to wishlist`);
        setWishlistIds((prev) => [...prev, item.id]);
        newUserWishlist.push(item);
        await updateUser(savedUser.id, { wishlist: newUserWishlist });
        localStorage.setItem("existingUser", JSON.stringify({ ...user, wishlist: newUserWishlist }));
      }
    } catch {
      console.log("error in wishlist toggle");
    }
  };

  return (
    <>
      <Navbar />
      <div style={{height:'20px'}}></div>
     <h2
  style={{
    textAlign: "center",
    fontFamily: "'Pacifico', cursive", // playful script font
    fontSize: "2.3rem",
    color: "#ff4d6d", // nice accent color
    textShadow: "2px 2px 6px rgba(0,0,0,0.15)",
    margin: "30px 0",
  }}data-aos="fade-up"
>
  Discover Our Flavors
</h2>
<div className="container my-4 text-center">
  <div
    style={{
      position: "relative",
      maxWidth: "800px", // smaller max width (adjust as needed)
      margin: "0 auto",
      borderRadius: "20px",
      overflow: "hidden",
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    }}
    className="videoContainer"data-aos="fade-up"
  >
    <video
      src={icecreamGGG}
      autoPlay
      loop
      muted
      style={{
        width: "100%",
        height: "auto",
        display: "block",
        borderRadius: "20px",
      }}
    />
  </div>
</div>

<style>{`
  @media (max-width: 576px) {
    .videoContainer {
      max-width: 100% !important; /* allow full width on small devices */
    }
  }
`}</style>


<div className="container my-5">
  <h2
    className="text-center mb-4 fw-bold"
    style={{ fontFamily: "Poppins, sans-serif", color: "#1e3253" }}data-aos="fade-up"
  >
    Hot Products
  </h2>

  <div className="row g-4 justify-content-center">
    {hotProducts.length > 0 &&
      hotProducts.map((item) => (
        <div
          key={item.id}
          className="col-6 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center"data-aos="fade-up"
        >
          <div
            className="card shadow-lg position-relative overflow-hidden"
            style={{
              width: "100%",
              borderRadius: "20px",
              cursor: "pointer",
              transition: "transform 0.3s, box-shadow 0.3s",
              backgroundColor: "#fff8f0"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 25px 50px rgba(0,0,0,0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
            }}
          >
            {/* Product Image */}
            <div
              style={{
                position: "relative",
                height: "180px", // reduced height
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#fff8f0",
              }} onClick={() => navigate(`/productDetails/${item.id}`)}
            >
              <img
                src={item.image}
                alt={item.name}
                style={{
                  maxHeight: "100%",
                  width: "auto",
                  objectFit: "contain",
                }}
              />
              <span className="badge bg-danger position-absolute top-0 start-0 m-2">
                Hot Deal
              </span>

              {/* Hover overlay */}
              <div
                className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center"
                style={{
                  background: "rgba(0,0,0,0.4)",
                  opacity: 0,
                  transition: "opacity 0.3s",
                }}
              >
                <button
                  className="btn btn-sm btn-primary mb-2"
                  style={{ borderRadius: "20px", padding: "5px 15px" }}
                >
                  Add to Cart
                </button>
                <button
                  className="btn btn-sm btn-outline-light"
                  style={{ borderRadius: "20px", padding: "5px 15px" }}
                >
                  <i className="bi bi-heart"></i> Wishlist
                </button>
              </div>
            </div>

            {/* Card Body */}
            <div className="card-body text-center p-3">
              <h6
                className="card-title mb-2"
                style={{ fontWeight: 600, fontSize: "1rem", color: "#1e3253" }}
              >
                {item.name}
              </h6>
              <p
                style={{ fontWeight: 700, fontSize: "1.1rem", color: "#111", marginBottom: "0" }}
              >
                ₹{item.price}
              </p>
            </div>
          </div>
        </div>
      ))}
  </div>
</div>

{/* CSS for hover overlay */}
<style>
{`
  .card:hover .position-absolute div {
    opacity: 1 !important;
    
  }
`}
</style>


         {/* Best Sellers */}
<h2
  className="text-center mb-4 mt-3 fw-bold text-dark"
  style={{ fontFamily: "Poppins, sans-serif", color: "#1e3253" }}    data-aos="fade-up"
>
  Best Sellers
</h2>

<div className="container"    >
  <div className="row g-4 justify-content-center">
    {bestSellerProducts.map((item, index) => (
      <div key={index} className="col-6 col-sm-4 col-md-3 col-lg-2"data-aos="fade-up">
        <div
          onClick={() => navigate(`/productDetails/${item.id}`)}
          className="card shadow-sm h-100 border-0"
          style={{
            borderRadius: "20px",
            cursor: "pointer",
            overflow: "hidden",
            backgroundColor: "#fff8f0", // matches your website theme
            transition: "all 0.3s ease",
          }}
        >
          <img
            src={item.image}
            className="card-img-top"
            alt={item.name}
            style={{
              height: "130px",
              objectFit: "contain",
              padding: "10px",
              transition: "transform 0.3s ease",
            }}
          />
          <div className="card-body text-center p-2">
            <h6
              className="card-title mb-4"
              style={{
                textAlign: "center",
                fontFamily: "revert-layer",
                fontSize: "13px",
                color: "#0a2141",
                transition: "color 0.3s ease",
              }}
            >
              {item.name}
            </h6>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
  <style>{`
        @media (max-width: 992px) {
          .carousel-inner img { height: 300px !important; }
        }
        @media (max-width: 768px) {
          .carousel-inner img { height: 250px !important; }
        }
        @media (max-width: 576px) {
          .carousel-inner img { height: 200px !important; }
        }
          .card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 1);
  }

  .card:hover .card-title {
    color: #e63946;
  }  
      `}</style>
  <div style={{ height: "30px" }}></div>
  {/* Flavor Filters */}
  <div className="container my-3 d-flex flex-wrap justify-content-center gap-2" data-aos="fade-up">
    {[
      { label: "Vanilla", key: "vanilla", fn: vanila },
      { label: "Strawberry", key: "strawberry", fn: strawberry },
      { label: "Chocolate", key: "chocolate", fn: choclate },
      { label: "Show All", key: "", fn: showAll },
    ].map((btn) => (
      <button
        key={btn.key}
        onClick={() => {
          setActive(btn.key);
          btn.fn();
        }}
        className={`btn rounded-pill  px-4 py-2 ${
          active === btn.key ? "btn-dark" : "btn-outline-secondary"
        }`}
        style={{
          fontWeight: 500,
          fontFamily: "SF Pro, -apple-system, sans-serif",
        }}
      >
        {btn.label}
      </button>
    ))}
  </div>
{/* Products Grid */}
<div className="container mt-4">
  <div className="row justify-content-center g-4">
    {(filtered.length > 0 ? filtered : products).map((item, index) => (
      <div
        key={index}
        className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center"data-aos="fade-up"
      >
        <div
          className="card shadow-sm border-0"
          style={{
            width: "260px", // bigger card
            borderRadius: "20px",
            overflow: "hidden",
            backgroundColor: "#fff",
            transition: "transform 0.2s, box-shadow 0.2s",
            cursor: "pointer",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.15)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
          }}
        >
          <div className="d-flex justify-content-center align-items-center p-3"style={{background:' #fff8f0'}}>
            <img
              onClick={() => navigate(`/productDetails/${item.id}`)}
              src={item.image}
              alt={item.name}
              style={{
                width: "200px",
                height: "200px",
                objectFit: "contain",
                background:' #fff8f0'
              }}
            />
          </div>

          <div className="card-body text-center p-3"style={{background:' #fff8f0'}}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5
                style={{
                  fontFamily: "SF Pro, -apple-system, sans-serif",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  margin: 0,
                  color: "#111",
                  
                }}className="mx-4"
              >
                {item.name}
              </h5>
              <Heart
                onClick={() => wishListFn(item)}
                color={wishlistIds.includes(item.id) ? "#111" : "gray"}
                fill={wishlistIds.includes(item.id) ? "#111" : "none"}
                size={20}
                style={{ cursor: "pointer" }}
              />
            </div>

          

            <p
              onClick={() => navigate(`/productDetails/${item.id}`)}
              style={{
                color: "#6e6e73",
                fontSize: "0.85rem",
                margin: "3px 0",
                cursor: "pointer",
              }}
            >
              Product Details  →
            </p>

            <p
              style={{
                fontWeight: "600",
                fontSize: "1.3rem",
                color: "#1e3253",
                margin: "8px 0",
              }}
            >
              ₹{item.price}
            </p>

            <button
              onClick={() => addtoCart(item)}
              className="btn w-100 mt-2"
              style={{
                backgroundColor: "#111",
                color: "#fff",
                borderRadius: "20px",
                padding: "10px 0",
                fontSize: "0.95rem",
                fontWeight: 500,
              }}
            >
              {JSON.parse(localStorage.getItem("existingUser"))?.cart?.some(
                (p) => p.id === item.id
              )
                ? "Remove"
                : "Add"}
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
  
</div>

<div style={{height:'40px'}}></div>

      <Footer />
      <ScrollToTop />
    </>
  );
}
