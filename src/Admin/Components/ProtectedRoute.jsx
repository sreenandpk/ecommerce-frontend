// Admin/Components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();

  // ⏳ wait until auth finishes
  if (loading) return null;

  // 🚫 not logged in at all
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 logged in but not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // ✅ admin allowed
  return children;
}
