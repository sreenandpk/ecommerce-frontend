import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { OrdersLengthProvider } from "./Context/OrdersContext";
import ProtectedRoute from "./Components/ProtectedRoute";

const Dashboard = lazy(() => import("./Pages/Dashboard"));
const Orders = lazy(() => import("./Pages/Orders"));
const Users = lazy(() => import("./Pages/Users"));
const Products = lazy(() => import("./Pages/Products"));

import Sidebar from "./Components/Sidebar";
import AdminNavbar from "./Components/AdminNavbar";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>
      {/* Sidebar - Positioned absolutely on mobile, relative on desktop */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 998,
              backdropFilter: "blur(2px)"
            }}
            className="d-lg-none"
          />
        )}
      </AnimatePresence>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminNavbar toggleSidebar={toggleSidebar} />
        <main style={{ padding: "20px", flex: 1, background: "#f8f9fa", overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/*  Providers ONLY for authenticated admin area */
function AdminProtectedApp() {
  return (
    <OrdersLengthProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <Outlet />
      </Suspense>
    </OrdersLengthProvider>
  );
}

export default function AdminApp() {
  return (
    <Routes>
      {/* 🔐 ALL ADMIN ROUTES PROTECTED */}
      <Route
        element={
          <ProtectedRoute>
            <AdminProtectedApp />
          </ProtectedRoute>
        }
      >
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
        </Route>
      </Route>

      {/* ❌ ANYTHING ELSE → HOME */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
