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

function AdminLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AdminNavbar />
        <main style={{ padding: "20px", flex: 1, background: "#ffffff", overflowY: "auto" }}>
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
