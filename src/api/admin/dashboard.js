import adminAxios from "./adminAxios";

export const getAdminDashboardStats = async () => {
    const res = await adminAxios.get("/admin/orders/stats/");
    return res.data;
};
