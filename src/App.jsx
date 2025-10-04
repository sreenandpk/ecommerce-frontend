import { Routes, Route } from "react-router-dom";
import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { SearchProvider } from "./Components/SearchContext/SearchContext";
import loaderAnimation from "../jsonAnimation/loading.json";
import ErrorAnimation from "../jsonAnimation/error.json";
import loaded from "../jsonAnimation/loaded.json";
import Lottie from "lottie-react";

import AOS from "aos";
import "aos/dist/aos.css";
import AppToast from "./Components/Products/appToast";
const Login = lazy(() => import("./Pages/Auth/Login"));
const Register = lazy(() => import("./Pages/Auth/Register"));
const Account = lazy(() => import("./Components/Account/Account"));
const Products = lazy(() => import("./Components/Products/Products"));
const Category = lazy(() => import("./Components/Products/Category"));
const FilteredSearchProducts = lazy(() =>
  import("./Components/Products/FilteredSearchProducts")
);

const Cart = lazy(() => import("./Components/Cart/CartItems"));
const Wishlist = lazy(() => import("./Components/Wishlist/Wishlist"));
const ProductDetails = lazy(() =>
  import("./Components/Products/ProductDetails")
);

const Admin = lazy(() =>
  import("./Admin/App")
);
const Home = lazy(() =>
  import("./Components/Home/Home")
);

const Recent = lazy(() =>
  import("./Components/Products/recentlyViewed")
);

const MyOrders = lazy(() =>
  import("./Components/Order/MyOrder")
);
const Booking = lazy(() =>
  import("./Components/Order/Booking")
);
const PaymentPage = lazy(() =>
  import("./Components/Order/Payment")
);

const About = lazy(() =>
  import("./Components/About/about")
);


function App() {
  const [showApp, setShowApp] = useState(false);
  const loaderRef = useRef();
const toastRef = useRef();

    useEffect(() => {
    AOS.init({
      duration: 2000,  // default duration
      once: false,      // only animate once
    });
  }, []);

  useEffect(() => {
    if (!loaderRef.current) return;
    const timer = setTimeout(() => {
      setShowApp(true);
    }, 2700);

    return () => clearTimeout(timer);
  }, []);

  if (!showApp) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Lottie
          lottieRef={loaderRef}
          animationData={loaderAnimation}
          loop={false}   // 👈 play once
          autoplay={true}
          style={{ width: 300, height: 300 }}
        />
      </div>
    );
  }

  return (
    
    <SearchProvider>
         <AppToast ref={toastRef} />
      <Suspense fallback={<div  style={{
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden"   // 👈 important
  }}>  <Lottie
    animationData={loaded}
    loop={false}
    autoplay={true}
    style={{ width: "80%", maxWidth: 300, height: "auto" }} // 👈 responsive
  /></div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register  toastRef={toastRef}/>} />
          <Route path="/account" element={<Account />} />
          <Route path="/products" element={<Products toastRef={toastRef} />} />
          <Route path="/about" element={<About />} />
          <Route path="/search" element={<FilteredSearchProducts />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/productDetails/:id" element={<ProductDetails toastRef={toastRef} />} />
          <Route path="/" element={<Home />} />
          <Route path="/category" element={<Category />} />
          <Route path="/recentlyViewed" element={<Recent />} />
          <Route path="/myOrders" element={<MyOrders />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/payment/:bookingId" element={<PaymentPage />}/>
          <Route path="/admin/*" element={<Admin />}/>
          
          {/* catch unwanted routes */}
          <Route
            path="*"
            element={
              <div
                style={{
                  height: "100vh",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Lottie
                  animationData={ErrorAnimation}
                  loop
                  style={{ width: "100%", maxWidth: "400px" }}
                />
              </div>
            }
          />
        </Routes>
    
      </Suspense>
    </SearchProvider>
  );
}

export default App;
