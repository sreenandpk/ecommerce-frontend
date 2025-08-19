import { createContext, useState } from "react";

export const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [searchValue, setSearchValue] = useState("");
  const [productDetails,setProductDetails]=useState([]);

  return (
    <SearchContext.Provider value={{ searchValue, setSearchValue,productDetails,setProductDetails}}>
      {children}
    </SearchContext.Provider>
  );
}
