

import { Routes, Route } from "react-router-dom";
import { lazy, Suspense, useState } from "react";
import { SearchProvider } from "./Pages/Components/Products/SearchContext";

function App() {



  const Home=lazy(function(){
   return import("./Pages/Components/Home")
  })

 const Login=lazy(function(){
  return  import("./Pages/Auth/Login")
  })

   const Register=lazy(function(){
   return import("./Pages/Auth/Register")
  })

const Account=lazy(function(){
 return import("./Pages/Components/Account")
})

const Products=lazy(function(){
 return import("./Pages/Components/Products/Products")
})


  const FilteredSearchProducts = lazy(() => import("./Pages/Components/Products/FilteredSearchProducts"));


const Cart=lazy(function(){
 return import("./Pages/Components/CartItems")
})


  return (
    <>
  <SearchProvider>

 <Suspense fallback={<div style={{height:'100vh',width:'100vw',display:'flex',justifyContent:'center',alignItems:'center'}}><span>loading</span></div>}>


      <Routes>

      <Route path="/"element={<Home />}/>
       <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
       <Route path="/account" element={<Account />} />
        <Route path="/products" element={<Products />} />
          <Route path="/search" element={<FilteredSearchProducts  />}></Route>
           <Route path="/cart" element={<Cart  />}></Route>


      </Routes>


    </Suspense>
     


  </SearchProvider>

   
    </>
  )
}

export default App
