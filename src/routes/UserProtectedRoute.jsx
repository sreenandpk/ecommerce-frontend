import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
export default function UserProtectedRoute({ children }) {
    const { user, isInitializing } = useContext(AuthContext);

    if (isInitializing) return null;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
