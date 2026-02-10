import api from "./axios";
// axios instance MUST have:
// axios.create({ baseURL: "/api", withCredentials: true })

// ==============================
// AUTH APIs (ACCOUNTS APP)
// ==============================

// 🔹 REGISTER
export const registerUser = (data) => {
    return api.post("/accounts/auth/register/", data);
};

// 🔹 LOGIN
export const loginUser = (data) => {
    return api.post("/accounts/auth/login/", data);
};

// 🔹 GET CURRENT USER
export const getMe = () => {
    return api.get("/accounts/me/");
};

// 🔹 REFRESH ACCESS TOKEN
// (refresh token is sent automatically via HttpOnly cookie)
export const refreshToken = () => {
    return api.post("/accounts/auth/refresh/");
};

// 🔹 LOGOUT
export const logoutUser = () => {
    return api.post("/accounts/auth/logout/");
};
