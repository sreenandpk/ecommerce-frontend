

import { Routes, Route } from "react-router-dom";
import { lazy, Suspense, useState } from "react";
import { SearchProvider } from "./Pages/Components/Products/SearchContext";
import loaderAnimation from "./assets/loading.json";
import Lottie from "lottie-react";




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


const Wishlist=lazy(function(){
 return import("./Pages/Components/Products/Wishlist")
})


const ProductDetails=lazy(function(){
 return import("./Pages/Components/Products/ProductDetails")
})

function App() {






  return (
    <>
  <SearchProvider>

 <Suspense fallback={ <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>

        <Lottie animationData={loaderAnimation} loop={true} style={{ width: 500, height: 500 }} />
    </div>}>


      <Routes>

      <Route path="/"element={<Home />}/>
       <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
       <Route path="/account" element={<Account />} />
        <Route path="/products" element={<Products />} />
          <Route path="/search" element={<FilteredSearchProducts  />}></Route>
           <Route path="/cart" element={<Cart  />}></Route>
            <Route path="/wishlist" element={<Wishlist  />}></Route>
              <Route path="/ProductDetails" element={<ProductDetails  />}></Route>



      </Routes>


    </Suspense>
     


  </SearchProvider>

   
    </>
  )
}

export default App
