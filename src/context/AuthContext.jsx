import { createContext, useState, useEffect, useContext } from "react";
import { useLoading } from "./LoadingContext";
import { loginUser, logoutUser, getMe, registerUser } from "../api/user/auth";
import { getProfile } from "../api/user/user";
import { attachToken } from "../api/user/axios";
import { attachAdminToken } from "../api/admin/adminAxios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [authError, setAuthError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const { startLoading, stopLoading } = useLoading();

    /* =========================
       REHYDRATE ON APP LOAD
    ========================= */
    useEffect(() => {
        const savedToken = localStorage.getItem("accessToken");
        const savedUser = localStorage.getItem("user");

        const initializeAuth = async () => {
            if (savedToken) {
                attachToken(savedToken);
                attachAdminToken(savedToken);
                setAccessToken(savedToken);

                // ✅ verify user from backend
                await fetchMe();
            }

            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
            setIsInitializing(false);
        };

        initializeAuth();
    }, []);

    /* =========================
       LOGIN
    ========================= */
    const login = async (credentials) => {
        setLoading(true);
        setAuthError(null);

        try {
            const { data } = await loginUser(credentials);

            attachToken(data.access);
            attachAdminToken(data.access);
            setAccessToken(data.access);
            localStorage.setItem("accessToken", data.access);

            await fetchMe();
            return data.user; // ✅ REQUIRED
        } catch (err) {
            const message =
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Invalid email or password";

            setAuthError(message);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /* =========================
       REGISTER
    ========================= */
    const register = async (credentials) => {
        setLoading(true);
        setAuthError(null);

        try {
            const { data } = await registerUser(credentials);

            attachToken(data.access);
            setAccessToken(data.access);
            localStorage.setItem("accessToken", data.access);

            await fetchMe();
            return data.user; // ✅ REQUIRED
        } catch (err) {
            const message =
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Registration failed";

            setAuthError(message);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /* =========================
       LOGOUT
    ========================= */
    const logout = async () => {
        setLoading(true);
        setAuthError(null);

        try {
            await logoutUser();
        } catch (err) {
            console.warn("Logout API failed, clearing local state anyway", err);
        } finally {
            setUser(null);
            setAccessToken(null);
            attachToken(null);
            attachAdminToken(null);

            // ✅ EXHAUSTIVE CLEAR (Ensures admin and user side are both clean)
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            localStorage.removeItem("userId");
            localStorage.removeItem("admin_access_token");
            localStorage.removeItem("admin_refresh_token");

            setLoading(false);
        }
    };

    /* =========================
       FETCH CURRENT USER
    ========================= */
    const fetchMe = async () => {
        try {
            const [userRes, profileRes] = await Promise.all([
                getMe(),
                getProfile().catch(() => ({ image: null })) // fallback if profile fails
            ]);

            const userData = { ...userRes.data, ...profileRes };
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            localStorage.setItem("userId", userData.id);
        } catch {
            // token invalid → logout silently
            logout();
        }
    };

    const isAdmin = user?.is_superuser || user?.is_staff || false;

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                authError,
                loading,
                isInitializing,
                isAdmin,
                login,
                register,
                logout,
                fetchMe,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
