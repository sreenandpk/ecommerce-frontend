import { useEffect, useState, useContext } from "react";
import { Heart } from "lucide-react";
import { SearchContext } from "../SearchContext/SearchContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Navbar/Navbar";
import { toast } from "react-toastify";
import { fetchUser, updateUser, fetchProducts } from "../Fetch/FetchUser";
import Footer from "../Home/Footer";
import { infoToast } from "../toast";
export default function Products() {
  const [products, setProducts] = useState([]);
  const { wishlistIds = [], setWishlistIds, setCartCount } = useContext(SearchContext);
  const [active, setActive] = useState("");
  const [filtered, setFilterd] = useState([]);
  const navigate = useNavigate();

  // Fetch products
  useEffect(() => {
    async function fetchProductsFromFetch() {
      try {
        const res = await fetchProducts();
        setProducts(res);
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
    setFilterd(productChoclates.filter((p) => p.category === "choclate"));
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
      <div style={{ height: "30px" }}></div>
  {/* Flavor Filters */}
  <div className="container my-3 d-flex flex-wrap justify-content-center gap-2">
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
    </>
  );
}
