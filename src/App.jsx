import { Routes, Route } from "react-router-dom";
import { lazy, Suspense, useState, useEffect, useRef, useLayoutEffect } from "react";
import { SearchProvider } from "./context/SearchContext";
import loaderAnimation from "./jsonAnimation/loading.json";
import ErrorAnimation from "./jsonAnimation/error.json";
import Lottie from "lottie-react";
import AppToast from "./components/Common/AppToast.jsx";

import AOS from "aos";
import "aos/dist/aos.css";


// 🔐 ROUTE GUARD
import UserProtectedRoute from "./routes/UserProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import Navbar from "./components/Layout/Navbar";

// ================== LAZY IMPORTS ==================
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const Account = lazy(() => import("./pages/Account/Account"));
const Products = lazy(() => import("./pages/Products/Products"));
const Category = lazy(() => import("./pages/Products/Category"));
const FilteredSearchProducts = lazy(() =>
    import("./pages/Products/FilteredSearchProducts")
);
const Cart = lazy(() => import("./pages/Cart/Cart"));
const Wishlist = lazy(() => import("./pages/Wishlist/Wishlist"));
const ProductDetails = lazy(() =>
    import("./pages/Products/ProductDetails")
);
const Home = lazy(() => import("./pages/Home/Home"));
const MyOrders = lazy(() => import("./pages/Orders/MyOrders"));
const Booking = lazy(() => import("./pages/Orders/Booking"));
const PaymentPage = lazy(() =>
    import("./pages/Orders/Payment")
);
const About = lazy(() => import("./pages/About/About"));
const RecentlyViewed = lazy(() => import("./pages/Products/RecentlyViewed"));
const Admin = lazy(() => import("./Admin/App"));

import { useLoading } from "./context/LoadingContext";
import { useLocation } from "react-router-dom";

import { AnimatePresence } from "framer-motion";
import PremiumLoader from "./components/Common/PremiumLoader";

function RouteWatcher() {
    const location = useLocation();
    const { startLoading, isLoading } = useLoading();
    const isFirstMt = useRef(true);

    useLayoutEffect(() => { // ⚡ FIX: useLayoutEffect prevents flash before loader
        // Skip the very first mount after the initial 2.7s app loader
        if (isFirstMt.current) {
            isFirstMt.current = false;
            return;
        }

        // 🚫 SKIP LOADING FOR ADMIN, RECENTLY VIEWED & AUTH (fixes infinite loop)
        if (location.pathname.startsWith("/admin") ||
            location.pathname === "/recentlyViewed" ||
            location.pathname === "/login" ||
            location.pathname === "/register") return;

        // Trigger modern spinner on every subsequent navigation
        startLoading();
    }, [location.pathname]);

    return (
        <AnimatePresence>
            {isLoading && <PremiumLoader />}
        </AnimatePresence>
    );
}

function App() {
    const [showApp, setShowApp] = useState(false);
    const loaderRef = useRef();
    const toastRef = useRef();
    const location = useLocation(); // Hook must be at top level
    const { isLoading } = useLoading(); // Get global loading state

    useEffect(() => {
        AOS.init({ duration: 2000, once: false });
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setShowApp(true), 2700);
        return () => clearTimeout(timer);
    }, []);

    if (!showApp) {
        return (
            <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#fff8f0" }}>
                <Lottie animationData={loaderAnimation} loop={false} autoplay style={{ width: 300 }} />
            </div>
        );
    }

    const showNavbar = !["/login", "/register", "/admin"].some(path => location.pathname.startsWith(path));

    return (
        <SearchProvider>
            <RouteWatcher />
            <AppToast ref={toastRef} />

            {/* 🔽 CHANGE: Hide content while loading, then fade in */}
            <div
                style={{
                    opacity: isLoading ? 0 : 1,
                    transition: "opacity 0.6s ease-in-out",
                    minHeight: "100vh" // Prevent layout collapse
                }}
            >
                {showNavbar && <Navbar />}

                <Suspense fallback={null}>
                    <Routes>
                        {/* PUBLIC */}
                        <Route path="/" element={<Home />} />
                        <Route
                            path="/login"
                            element={
                                <PublicRoute>
                                    <Login toastRef={toastRef} />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <PublicRoute>
                                    <Register toastRef={toastRef} />
                                </PublicRoute>
                            }
                        />
                        <Route path="/products" element={<Products toastRef={toastRef} />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/search" element={<FilteredSearchProducts toastRef={toastRef} />} />
                        <Route path="/recentlyViewed" element={<RecentlyViewed toastRef={toastRef} />} />
                        <Route path="/category/:slug" element={<Category />} />
                        <Route
                            path="/productDetails/:slug"
                            element={<ProductDetails toastRef={toastRef} />}
                        />

                        {/* USER PROTECTED */}
                        <Route
                            path="/account"
                            element={
                                <UserProtectedRoute>
                                    <Account toastRef={toastRef} />
                                </UserProtectedRoute>
                            }
                        />
                        <Route
                            path="/cart"
                            element={
                                <UserProtectedRoute>
                                    <Cart />
                                </UserProtectedRoute>
                            }
                        />
                        <Route
                            path="/wishlist"
                            element={
                                <UserProtectedRoute>
                                    <Wishlist />
                                </UserProtectedRoute>
                            }
                        />
                        <Route
                            path="/myOrders"
                            element={
                                <UserProtectedRoute>
                                    <MyOrders />
                                </UserProtectedRoute>
                            }
                        />
                        <Route
                            path="/booking"
                            element={
                                <UserProtectedRoute>
                                    <Booking toastRef={toastRef} />
                                </UserProtectedRoute>
                            }
                        />
                        <Route
                            path="/payment/:bookingId"
                            element={
                                <UserProtectedRoute>
                                    <PaymentPage toastRef={toastRef} />
                                </UserProtectedRoute>
                            }
                        />

                        {/* ADMIN */}
                        <Route path="/admin/*" element={<Admin />} />

                        {/* 404 */}
                        <Route
                            path="*"
                            element={
                                <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <Lottie animationData={ErrorAnimation} loop style={{ maxWidth: 400 }} />
                                </div>
                            }
                        />
                    </Routes>
                </Suspense>
            </div>
        </SearchProvider>
    );
}

export default App;
