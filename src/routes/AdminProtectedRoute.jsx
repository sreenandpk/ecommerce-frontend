// src/routes/AdminProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminProtectedRoute({ children }) {
    const { user, isAdmin, isInitializing } = useAuth();

    if (isInitializing) return null;

    if (!user || !isAdmin) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
