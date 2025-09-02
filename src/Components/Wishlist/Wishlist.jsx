import { useContext, useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from "../../Navbar/Navbar";
import { SearchContext } from "../SearchContext/SearchContext";
import { infoToast } from "../toast";
import { fetchUser, updateUser } from "../Fetch/FetchUser";
import { useNavigate } from "react-router-dom";
export default function Wishlist() {
  const [likedProducts, setLikedProducts] = useState([]);
  const { setWishlistIds, setWishlistCount,setCartCount } = useContext(SearchContext);
  const navigate = useNavigate(); // <-- initialize navigate

  const addtoCart = async (item) => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("existingUser"));
      if (!savedUser) {
        toast.info("Login first");
        navigate("/login");
        return;
      }
      const user = await fetchUser(savedUser.id);
      let removeItemFromCart = user.cart.some((product) => product.id === item.id);
      let updatedCart = removeItemFromCart
        ? user.cart.filter((product) => product.id !== item.id)
        : [...user.cart, item];
      if (!removeItemFromCart) infoToast(`${item.name} added to cart `);

      await updateUser(savedUser.id, { cart: updatedCart });
      const updatedUser = { ...user, cart: updatedCart };
      localStorage.setItem("existingUser", JSON.stringify(updatedUser));
      localStorage.setItem("cartTotalLength", updatedUser.cart.length);
      setCartCount(updatedUser.cart.length);
    } catch (err) {
      console.log("error in cart update", err);
    }
  };

  useEffect(() => {
    async function fetchLikedProducts() {
      const savedUser = JSON.parse(localStorage.getItem("existingUser"));
      if (!savedUser) return;

      try {
        const userResponse = await fetchUser(savedUser.id);
        const wishlist = userResponse.wishlist.reverse();
        setLikedProducts(wishlist);
        setWishlistIds(wishlist.map(item => item.id));
        setWishlistCount(wishlist.length);
      } catch (err) {
        console.log("Failed to fetch wishlist", err);
      }
    }

    fetchLikedProducts();
  }, [setWishlistIds, setWishlistCount]);

  const removeFromWishlist = async (item) => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("existingUser"));
      if (!savedUser) return;

      const userResponse = await fetchUser(savedUser.id);
      const filteredWishlist = userResponse.wishlist.filter(i => i.id !== item.id);

      await updateUser(savedUser.id, {
        wishlist: filteredWishlist,
      });

      localStorage.setItem("existingUser", JSON.stringify({
        ...userResponse,
        wishlist: filteredWishlist,
      }));

      setLikedProducts(filteredWishlist);
      setWishlistIds(filteredWishlist.map(i => i.id));
      setWishlistCount(filteredWishlist.length);
      infoToast(`${item.name} removed from wishlist`);
    } catch (err) {
      console.log("Error removing item from wishlist", err);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{height:'40px'}}></div>
    <h3 style={{textAlign:'center'}}className="mb-4 mt-4">My wishlist</h3>
 <div className="row justify-content-center g-4">
  {likedProducts.length > 0 ? likedProducts.map((item, index) => (
    <div 
      key={index} 
      className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center"
    >
      <div
        className="card h-100 shadow-lg border-0 text-center"
        style={{
          borderRadius: '22px',
          width: '100%',
          maxWidth: '280px', // smaller max width
          padding: '15px',   // slightly smaller padding
         background:' #fff8f0',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-6px)';
          e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        }}
      >
        <div className="card-body d-flex flex-column justify-content-between p-2">
          <img
            src={item.image}
            alt={item.name}
            className="img-fluid mb-3"
            style={{
              height: '180px',       // smaller image height
              objectFit: 'contain',
              maxWidth: '100%',       // fit inside card
            }} onClick={()=>navigate(`/productDetails/${item.id}`)}
          />
          <h5 className="card-title fw-semibold mb-3" style={{ fontSize: '0.95rem' }}>{item.name}</h5>
          

          <button 
            className="btn btn-dark rounded-pill w-100 mb-2" 
            style={{ padding: '8px 0', fontSize: '0.85rem' }}
            onClick={() => addtoCart(item)}
          >
            {JSON.parse(localStorage.getItem("existingUser"))?.cart?.some(
              (p) => p.id === item.id
            )
              ? "Remove"
              : "Add"}
          </button>
          <button
            className="btn btn-danger rounded-pill w-100"
            style={{ padding: '8px 0', fontSize: '0.85rem' }}
            onClick={() => removeFromWishlist(item)}
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  )) : <p className="text-center text-muted">Your wishlist is empty.</p>}
</div>

    </>
  );
}
