import { Routes, Route } from "react-router-dom";
import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { SearchProvider } from "./Pages/Components/SearchContext/SearchContext";
import loaderAnimation from "../jsonAnimation/loading.json";
import ErrorAnimation from "../jsonAnimation/error.json";
import Lottie from "lottie-react";
const Login = lazy(() => import("./Pages/Auth/Login"));
const Register = lazy(() => import("./Pages/Auth/Register"));
const Account = lazy(() => import("./Pages/Components/Account/Account"));
const Products = lazy(() => import("./Pages/Components/Products/Products"));
const FilteredSearchProducts = lazy(() =>
  import("./Pages/Components/Products/FilteredSearchProducts")
);
const Cart = lazy(() => import("./Pages/Components/Cart/CartItems"));
const Wishlist = lazy(() => import("./Pages/Components/Wishlist/Wishlist"));
const ProductDetails = lazy(() =>
  import("./Pages/Components/Products/ProductDetails")
);
const Home = lazy(() =>
  import("./Pages/Components/Home/Home")
);

const Recent = lazy(() =>
  import("./Pages/Components/Products/recentlyViewed")
);

const MyOrders = lazy(() =>
  import("./Pages/Components/Order/MyOrder")
);
const Booking = lazy(() =>
  import("./Pages/Components/Order/Booking")
);
const PaymentPage = lazy(() =>
  import("./Pages/Components/Order/Payment")
);
function App() {
  const [showApp, setShowApp] = useState(false);
  const loaderRef = useRef();

  useEffect(() => {
    if (!loaderRef.current) return;
    const timer = setTimeout(() => {
      setShowApp(true);
    }, 800);

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
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />
          <Route path="/products" element={<Products />} />
          <Route path="/search" element={<FilteredSearchProducts />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/productDetails/:id" element={<ProductDetails />} />
          <Route path="/" element={<Home />} />
          <Route path="/recentlyViewed" element={<Recent />} />
    <Route path="/myOrders" element={<MyOrders />} />
       <Route path="/booking" element={<Booking />} />
        <Route path="/payment/:bookingId" element={<PaymentPage />}/>
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
