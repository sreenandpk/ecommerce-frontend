import api from "./axios";

/* =========================
   GET CART ITEMS
   ========================= */
export const getCart = async () => {
    try {
        const res = await api.get("/cart/");
        console.log("Cart API Response:", res.data);

        // Handle different response formats
        if (Array.isArray(res.data)) {
            return res.data;
        }
        if (res.data.results && Array.isArray(res.data.results)) {
            return res.data.results;
        }
        if (res.data && typeof res.data === 'object') {
            return res.data;
        }
        return [];
    } catch (err) {
        console.error("Failed to fetch cart:", err);
        return [];
    }
};

/* =========================
   ADD TO CART (TOGGLE ADD)
   ========================= */
export const addToCart = async (productId, quantity = 1) => {
    try {
        console.log("Adding to cart - productId:", productId, "quantity:", quantity);
        const res = await api.post("/cart/", {
            product_id: productId,
            quantity,
        });
        console.log("Add to cart response:", res.data);
        return res.data;
    } catch (err) {
        console.error("Failed to add to cart:", err);
        throw err;
    }
};

/* =========================
   REMOVE FROM CART (TOGGLE REMOVE)
   ========================= */
export const removeFromCart = async (cartItemId) => {
    await api.delete(`/cart/${cartItemId}/`);
};

/* =========================
   UPDATE QUANTITY (OPTIONAL)
   ========================= */
export const updateCartQuantity = async (cartItemId, quantity) => {
    const res = await api.patch(`/cart/${cartItemId}/`, { quantity });
    return res.data;
};

/* =========================
   CLEAR CART
   ========================= */
export const clearCart = async () => {
    await api.delete("/cart/clear/");
};
