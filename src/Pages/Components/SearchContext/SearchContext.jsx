import { createContext, useState } from "react";

export const SearchContext = createContext();

export function SearchProvider({ children }) {
  const savedUser = JSON.parse(localStorage.getItem("existingUser"));
  const [searchValue, setSearchValue] = useState("");
  const [cartCount, setCartCount] = useState(
    JSON.parse(localStorage.getItem("existingUser"))?.cart?.length || 0
  );
  const [wishlistIds, setWishlistIds] = useState(
    JSON.parse(localStorage.getItem("existingUser"))?.wishlist?.map(i => i.id) || []
  );
  const [wishlistCount, setWishlistCount] = useState(
    JSON.parse(localStorage.getItem("existingUser"))?.wishlist?.length || 0
  );
  const [recentlyViewedProduct,setRecentlyViewedProducts]=useState(savedUser?.recentlyViewed || []);
  const [productDetails, setProductDetails] = useState(null);
  const [bookingProducts,setBookingProducts]=useState([])
  return (
    <SearchContext.Provider value={{ searchValue, setSearchValue,cartCount, setCartCount, wishlistIds, setWishlistIds ,wishlistCount,
      setWishlistCount,recentlyViewedProduct,setRecentlyViewedProducts, productDetails,          // ✅ added
        setProductDetails,bookingProducts,setBookingProducts }}>
      {children}
    </SearchContext.Provider>
  );
}
