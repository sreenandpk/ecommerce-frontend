// src/api/wishlist.js
import api from "./axios";

export const getWishlist = async () => {
    const res = await api.get("/wishlist/");
    return res.data.results || res.data;
};

export const addToWishlist = async (productId) => {
    await api.post("/wishlist/", { product_id: productId });
};

export const removeFromWishlist = async (wishlistItemId) => {
    await api.delete(`/wishlist/${wishlistItemId}/`);
};
