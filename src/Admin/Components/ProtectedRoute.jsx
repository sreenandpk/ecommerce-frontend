// Admin/Components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../Context/AdminAuthContext";
export default function ProtectedRoute({ children }) {
  const { isAdmin } = useAdminAuth();
  if (!isAdmin) return <Navigate to="admin-login" replace />;
  return children;
};
