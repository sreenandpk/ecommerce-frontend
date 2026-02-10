import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
export default function PublicRoute({ children }) {
    const { user, isInitializing } = useContext(AuthContext);

    if (isInitializing) {
        return null;
    }

    // 1. If Admin -> Redirect to Admin Dashboard
    if (user?.is_staff || user?.is_superuser) {
        return <Navigate to="/admin" replace />;
    }

    // 2. If Regular User -> Redirect to Account/Home
    if (user) {
        return <Navigate to="/" replace />;
    }

    return children;
}
