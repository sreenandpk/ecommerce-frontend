import adminAxios from "./adminAxios";

/* ================= ORDERS ================= */

// 🔹 GET ALL ORDERS (ADMIN)
export const getAdminOrders = async (params = {}) => {
    const res = await adminAxios.get("/admin/orders/", { params });
    return res.data;
};

// 🔹 GET ORDER DETAILS
export const getAdminOrderDetail = async (id) => {
    const res = await adminAxios.get(`/admin/orders/${id}/`);
    return res.data;
};

// 🔹 ORDER STATS (TOTAL SALES, TOTAL ORDERS)
export const getAdminOrderStats = async () => {
    const res = await adminAxios.get("/admin/orders/stats/");
    return res.data;
};

// 🔹 UPDATE ORDER STATUS (optional but useful)
export const updateOrderStatus = async (id, data) => {
    const res = await adminAxios.patch(
        `/admin/orders/${id}/update/`,
        data
    );
    return res.data;
};
