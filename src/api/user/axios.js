import axios from "axios";

const plainAxios = axios.create({
    baseURL: "http://localhost:8000/api",
    withCredentials: true,
});

const api = axios.create({
    baseURL: "http://localhost:8000/api",
    withCredentials: true,
});

export const attachToken = (token) => {
    if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common["Authorization"];
    }
};

const storedToken = localStorage.getItem("accessToken");
if (storedToken) {
    attachToken(storedToken);
}

let isRefreshing = false;

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        // ✅ FIXED PATH CHECK
        if (
            !error.response ||
            originalRequest._retry ||
            originalRequest.url.includes("/accounts/auth/refresh/")
        ) {
            return Promise.reject(error);
        }

        if (error.response.status === 401) {
            if (isRefreshing) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // ✅ FIXED REFRESH URL
                const { data } = await plainAxios.post(
                    "/accounts/auth/refresh/"
                );

                const newAccessToken = data.access;
                localStorage.setItem("accessToken", newAccessToken);
                attachToken(newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                isRefreshing = false;
                return api(originalRequest);

            } catch (refreshError) {
                isRefreshing = false;
                console.error(" Refresh failed:", refreshError);

                localStorage.removeItem("accessToken");
                attachToken(null);

                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
