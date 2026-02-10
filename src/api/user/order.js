import api from "./axios";

export const createOrder = async (orderData) => {
    const res = await api.post("/orders/create/", orderData);
    return res.data;
};

export const fetchMyOrders = async () => {
    const res = await api.get("/orders/");
    return res.data;
};


export const fetchOrderDetail = async (orderId) => {
    const res = await api.get(`/orders/${orderId}/`);
    return res.data;
};

export const createRazorpayOrder = async (orderId) => {
    const res = await api.post(`/payments/razorpay/create/${orderId}/`);
    return res.data;
};

export const verifyRazorpayPayment = async (paymentData) => {
    const res = await api.post("/payments/razorpay/verify/", paymentData);
    return res.data;
};
