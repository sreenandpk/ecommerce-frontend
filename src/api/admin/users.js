import adminAxios from "./adminAxios";

/**
 * =========================
 * ADMIN USERS API
 * =========================
 */

/**
 * GET ALL USERS (ADMIN)
 * Endpoint: GET /api/accounts/admin/users/
 */
export const getAdminUsers = async () => {
    try {
        const response = await adminAxios.get("/accounts/admin/users/");
        return response.data;
    } catch (error) {
        console.error("❌ getAdminUsers failed", error);
        throw error;
    }
};

/**
 * GET SINGLE USER (ADMIN)
 * Endpoint: GET /api/accounts/admin/users/:id/
 */
export const getAdminUserById = async (id) => {
    try {
        const response = await adminAxios.get(
            `/accounts/admin/users/${id}/`
        );
        return response.data;
    } catch (error) {
        console.error("❌ getAdminUserById failed", error);
        throw error;
    }
};

/**
 * UPDATE USER (BLOCK / UNBLOCK)
 * Endpoint: PATCH /api/accounts/admin/users/:id/
 * Example payload:
 * { is_active: false }
 */
export const updateAdminUser = async (id, data) => {
    try {
        const response = await adminAxios.patch(
            `/accounts/admin/users/${id}/`,
            data
        );
        return response.data;
    } catch (error) {
        console.error("❌ updateAdminUser failed", error);
        throw error;
    }
};
