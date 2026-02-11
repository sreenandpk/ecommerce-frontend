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

    // 🔐 critical flag used by route guards
    const [isInitializing, setIsInitializing] = useState(true);

    const { startLoading, stopLoading } = useLoading();

    /* =========================
       HELPERS
    ========================= */
    const clearAuth = () => {
        setUser(null);
        setAccessToken(null);
        attachToken(null);
        attachAdminToken(null);

        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
    };

    /* =========================
       INITIAL AUTH (APP LOAD)
    ========================= */
    useEffect(() => {
        const initializeAuth = async () => {
            const savedToken = localStorage.getItem("accessToken");

            if (!savedToken) {
                // If token missing but ID exists, clear it to avoid loops
                if (localStorage.getItem("userId")) clearAuth();
                setIsInitializing(false);
                return;
            }

            try {
                console.log("AuthProvider: Initializing with token...");
                attachToken(savedToken);
                attachAdminToken(savedToken);
                setAccessToken(savedToken);

                // 🔥 DO NOT trust cached user — ask backend
                await fetchMe(false);
                console.log("AuthProvider: Auth initialized successfully");
            } catch (err) {
                console.warn("Initial auth failed:", err);
                // Clear state if initial check fails (e.g. invalid stored token)
                clearAuth();
            } finally {
                // ✅ only end initialization AFTER backend check
                setIsInitializing(false);
            }
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

            try {
                await fetchMe(true);
            } catch (fetchErr) {
                console.error("Profile fetch failed after login:", fetchErr);
                setAuthError("Logged in, but failed to load user profile. Please try again.");
                clearAuth();
                throw fetchErr;
            }

            return data.user;
        } catch (err) {
            // If it's already our "Profile fetch failed" error, don't overwrite
            if (authError) throw err;

            console.error("Login attempt failed:", err.response?.data || err.message);

            const errorData = err.response?.data;
            let message = "Invalid email or password";

            if (errorData) {
                if (typeof errorData === "string") {
                    message = errorData;
                } else if (errorData.detail) {
                    // This is where our DEBUG messages from the backend live
                    message = Array.isArray(errorData.detail) ? errorData.detail[0] : errorData.detail;
                } else if (errorData.message) {
                    message = errorData.message;
                } else {
                    // Handle field-level errors
                    const fieldErrors = Object.entries(errorData)
                        .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
                        .join(" | ");
                    if (fieldErrors) message = fieldErrors;
                }
            }

            setAuthError(message);
            clearAuth();
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

            await fetchMe(true);
            return data.user;
        } catch (err) {
            const message =
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Registration failed";

            setAuthError(message);
            clearAuth();
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
            console.warn("Logout API failed, clearing local state anyway");
        } finally {
            clearAuth();
            setLoading(false);
        }
    };

    /* =========================
       FETCH CURRENT USER
    ========================= */
    const fetchMe = async (shouldLogout = true) => {
        try {
            // Optimized: We only need /me for basic auth state.
            // Profile data (with history) is fetched on demand by profile page.
            const userRes = await getMe();

            const userData = userRes.data;
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            localStorage.setItem("userId", userData.id);
        } catch (err) {
            if (shouldLogout) {
                clearAuth();
            }
            throw err;
        }
    };

    /* =========================
       ROLE CHECK
    ========================= */
    const isAdmin = !!(user?.is_superuser || user?.is_staff);

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
