import axios from "axios";
import { useEffect, useState, useContext } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from "../../Navbar/Navbar";
import { SearchContext } from "../SearchContext/SearchContext";
import BackButton from "../BackWardButtton/BackButton";
import { fetchUser, updateUser } from "../Fetch/FetchUser";
export default function Wishlist() {
  const [likedProducts, setLikedProducts] = useState([]);
  const { setWishlistIds, setWishlistCount } = useContext(SearchContext);
 
  useEffect(() => {
    async function fetchLikedProducts() {
      const savedUser = JSON.parse(localStorage.getItem("existingUser"));
     
      if (!savedUser) return;

      try {
        const userResponse = await fetchUser(savedUser.id)
        const wishlist = userResponse.wishlist.reverse();
        setLikedProducts(wishlist);
        setWishlistIds(wishlist.map(item => item.id)); // update context IDs
        setWishlistCount(wishlist.length); // update Navbar count
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

      const userResponse = await fetchUser(savedUser.id)
      const filteredWishlist = userResponse.wishlist.filter(i => i.id !== item.id);

      await updateUser(savedUser.id, {
        wishlist: filteredWishlist,
      });

      localStorage.setItem("existingUser", JSON.stringify({
        ...userResponse,
        wishlist: filteredWishlist,
      }));

      setLikedProducts(filteredWishlist); // update UI
      setWishlistIds(filteredWishlist.map(i => i.id)); // update context IDs
      setWishlistCount(filteredWishlist.length); // update Navbar count
      alert(`${item.name} removed from wishlist`);
    } catch (err) {
      console.log("Error removing item from wishlist", err);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{height:'50px'}}></div>
      <BackButton />

      <h4 className="mx-5 mt-5">My Wishlist</h4>
      <div className="container mt-4">
        <div className="row g-3">
          {likedProducts.length > 0 ? likedProducts.map((item, index) => (
            <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div
                className="card h-100 text-center shadow-sm border-0"
                style={{
                  borderRadius: "20px",
                  overflow: "hidden",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.08)";
                }}
              >
                <div className="card-body d-flex flex-column justify-content-between border-0 p-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="img-fluid mb-3"
                    style={{ height: "150px", objectFit: "contain" }}
                  />
                  <h5 className="card-title">{item.name}</h5>
                  <p className="text-muted small mb-1">Offer: {item.offer}</p>
                  <p className="text-muted small mb-1">Category: {item.category}</p>
                  <p className="card-text">Ratings: {item.rating}</p>
                  <p className="card-text fw-bold">Price: ₹{item.price}</p>

                  <button className="btn btn-secondary rounded-pill w-100 mb-2">
                    Add to Cart
                  </button>
                  <button
                    className="btn btn-danger rounded-pill w-100"
                    onClick={() => removeFromWishlist(item)}
                  >
                    Discard
                  </button>
                </div>
              </div>
            </div>
          )) : <p className="text-center">Your wishlist is empty.</p>}
        </div>
      </div>
    </>
  );
}
