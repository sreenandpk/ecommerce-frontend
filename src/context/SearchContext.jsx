import { createContext, useState, useEffect, useMemo } from "react";
export const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [category, setCategory] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [cartCount, setCartCount] = useState(
    parseInt(localStorage.getItem("cartTotalLength")) || 0
  );
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [recentlyViewedProduct, setRecentlyViewedProducts] = useState([]);
  const [productDetails, setProductDetails] = useState(null);
  const [bookingProducts, setBookingProducts] = useState([]);

  // Placeholder for future wishlist sync if needed
  useEffect(() => {
    // We can fetch wishlist here using getWishlist() if needed
  }, []);

  // Memoize the value to prevent unnecessary re-renders
  const searchContextValue = useMemo(() => ({
    searchValue,
    setSearchValue,
    cartCount,
    setCartCount,
    wishlistIds,
    setWishlistIds,
    wishlistCount,
    setWishlistCount,
    recentlyViewedProduct,
    setRecentlyViewedProducts,
    productDetails,
    setProductDetails,
    bookingProducts,
    setBookingProducts,
    category,
    setCategory,
  }), [
    searchValue,
    cartCount,
    wishlistIds,
    wishlistCount,
    recentlyViewedProduct,
    productDetails,
    bookingProducts,
    category
  ]);

  return (
    <SearchContext.Provider value={searchContextValue}>
      {children}
    </SearchContext.Provider>
  );
}
