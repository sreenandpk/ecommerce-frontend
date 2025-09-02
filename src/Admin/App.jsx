import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { OrdersLengthProvider } from "./Context/OrdersContext";
import { AdminAuthProvider } from "./Context/AdminAuthContext";
import ProtectedRoute from "./Components/ProtectedRoute";

const Dashboard = lazy(() => import("./Pages/Dashboard"));
const Orders = lazy(() => import("./Pages/Orders"));
const Users = lazy(() => import("./Pages/Users"));
const Products = lazy(() => import("./Pages/Products"));
import AdminLogin from "./Pages/AdminLogin"; // normal import

function AdminLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </div>
    </div>
  );
}

function AdminApp() {
  return (
    <AdminAuthProvider>
      <OrdersLengthProvider>
        <Suspense fallback={<p>Loading...</p>}>
          <Routes>
            {/* Redirect /admin to /admin-login */}
            <Route path="admin" element={<Navigate to="admin-login" replace />} />

            {/* Login route with normal import */}
            <Route path="admin-login" element={<AdminLogin />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<Orders />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="admin-login" replace />} />
          </Routes>
        </Suspense>
      </OrdersLengthProvider>
    </AdminAuthProvider>
  );
}

export default AdminApp;
