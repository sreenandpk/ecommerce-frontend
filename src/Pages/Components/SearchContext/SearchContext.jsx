import { createContext, useState } from "react";

export const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [searchValue, setSearchValue] = useState("");
  const [cartCount, setCartCount] = useState(
    JSON.parse(localStorage.getItem("existingUser"))?.cart?.length || 0
  );
  const [wishlistIds, setWishlistIds] = useState(
    JSON.parse(localStorage.getItem("existingUser"))?.wishlist?.map(i => i.id) || []
  );
  return (
    <SearchContext.Provider value={{ searchValue, setSearchValue,cartCount, setCartCount, wishlistIds, setWishlistIds }}>
      {children}
    </SearchContext.Provider>
  );
}
