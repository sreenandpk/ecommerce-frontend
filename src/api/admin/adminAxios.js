import axios from "axios";

/* ---------------- PLAIN AXIOS (REFRESH) ---------------- */
const plainAdminAxios = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
    withCredentials: true,
});

/* ---------------- ADMIN AXIOS ---------------- */
const adminApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
    withCredentials: true,
});

/* ---------------- ATTACH TOKEN ---------------- */
export const attachAdminToken = (token) => {
    if (token) {
        adminApi.defaults.headers.common[
            "Authorization"
        ] = `Bearer ${token}`;
    } else {
        delete adminApi.defaults.headers.common["Authorization"];
    }
};

/* ---------------- LOAD TOKEN ---------------- */
const storedToken = localStorage.getItem("accessToken");
if (storedToken) {
    attachAdminToken(storedToken);
}

/* ---------------- RESPONSE INTERCEPTOR ---------------- */
let isRefreshing = false;

adminApi.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            !error.response ||
            originalRequest._retry ||
            originalRequest.url.includes("/accounts/auth/refresh/")
        ) {
            return Promise.reject(error);
        }

        if (error.response.status === 401) {
            if (isRefreshing) {
                // Return a rejected promise to stop the loop if already refreshing
                return Promise.reject(error);
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await plainAdminAxios.post(
                    "/accounts/auth/refresh/"
                );

                const newAccessToken = data.access;
                localStorage.setItem("accessToken", newAccessToken);
                attachAdminToken(newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                isRefreshing = false;
                return adminApi(originalRequest);

            } catch (err) {
                isRefreshing = false;
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                localStorage.removeItem("userId");
                attachAdminToken(null);

                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default adminApi;
