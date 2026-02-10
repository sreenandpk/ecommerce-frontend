// src/api/payment.js
import api from "./axios";

/* =========================
   CREATE RAZORPAY ORDER
   ========================= */
export const createRazorpayOrder = async (orderId) => {
    const res = await api.post(
        `/payments/razorpay/create/${orderId}/`
    );
    return res.data;
};

/* =========================
   VERIFY PAYMENT
   ========================= */
export const verifyRazorpayPayment = async (data) => {
    const res = await api.post(
        "/payments/razorpay/verify/",
        data
    );
    return res.data;
};

/* =========================
   GET RAZORPAY KEY
   ========================= */
export const getRazorpayKey = async () => {
    const res = await api.get("/payments/razorpay/config/");
    return res.data.key_id;
};
