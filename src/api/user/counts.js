import api from "./axios";

export const getCartCount = async () => {
    const res = await api.get("/cart/");
    const data = res.data.results || res.data;
    return data.reduce((sum, item) => sum + item.quantity, 0);
};

export const getWishlistCount = async () => {
    const res = await api.get("/wishlist/");
    const data = res.data.results || res.data;
    return data.length;
};
