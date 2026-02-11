import { createContext, useState, useEffect, useMemo, useCallback } from "react";
import { getCart } from "../api/user/cart";
import { getWishlist } from "../api/user/wishlist";

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

  const refreshCart = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setCartCount(0);
      return [];
    }
    try {
      const items = await getCart();
      const count = Array.isArray(items) ? items.length : (items.items?.length || 0);
      setCartCount(count);
      return items;
    } catch (err) {
      console.error("SearchContext: Error refreshing cart:", err);
      return [];
    }
  }, []);

  const refreshWishlist = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setWishlistIds([]);
      setWishlistCount(0);
      return [];
    }
    try {
      const items = await getWishlist();
      const results = Array.isArray(items) ? items : (items.results || []);
      const ids = results.map(item => item.product?.id || item.id);
      setWishlistIds(ids);
      setWishlistCount(ids.length);
      return results;
    } catch (err) {
      console.error("SearchContext: Error refreshing wishlist:", err);
      return [];
    }
  }, []);

  // Sync on mount if logged in
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      refreshCart();
      refreshWishlist();
    }
  }, [refreshCart, refreshWishlist]);

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
    refreshCart,
    refreshWishlist,
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
    refreshCart,
    refreshWishlist,
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
