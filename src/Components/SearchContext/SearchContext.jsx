import { createContext, useState, useEffect } from "react";
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

  // fetch wishlist and recentlyViewed on mount if userId exists
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    async function fetchUserData() {
      try {
        const { fetchUser } = await import("../Fetch/FetchUser");
        const user = await fetchUser(userId);
        setWishlistIds(user.wishlist?.map((i) => i.id) || []);
        setWishlistCount(user.wishlist?.length || 0);
        setRecentlyViewedProducts(user.recentlyViewed || []);
      } catch (err) {
        console.log("Failed to fetch user data", err);
      }
    }
    fetchUserData();
  }, []);

  return (
    <SearchContext.Provider
      value={{
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
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}
