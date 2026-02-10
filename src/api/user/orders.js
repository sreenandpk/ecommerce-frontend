import api from "./axios";

/* =========================
   CREATE ORDER
   ========================= */
/**
 * Backend: POST /api/orders/create/
 */
export const createOrder = async (orderData) => {
    const res = await api.post("/orders/create/", {
        full_name: orderData.full_name,
        phone: orderData.phone,
        address: orderData.address,
        city: orderData.city,
        pincode: orderData.pincode,
    });

    return res.data;
};


/* =========================
   GET MY ORDERS (PAGINATED)
   ========================= */
/**
 * Backend: GET /api/orders/?page=1
 *
 * Response:
 * {
 *   count,
 *   next,
 *   previous,
 *   results: [...]
 * }
 */
export const getMyOrders = async (page = 1) => {
    const res = await api.get(`/orders/?page=${page}`);
    return res.data;
};


/* =========================
   GET SINGLE ORDER DETAIL
   ========================= */
/**
 * Backend: GET /api/orders/<order_id>/
 */
export const getOrderDetail = async (orderId) => {
    const res = await api.get(`/orders/${orderId}/`);
    return res.data;
};
