import api from "./axios"; // ✅ correct

// 🔹 GET BEST SELLERS (BASED ON RATING)
export const getBestSellers = async () => {
    // We order by -average_rating and -review_count, and limit to 4
    const res = await api.get("/products/?ordering=-average_rating,-review_count");
    const products = res.data.results || res.data;
    return products.slice(0, 4);
};

// 🔹 GET ALL PRODUCTS
export const getProducts = async (params = {}) => {
    const res = await api.get("/products/", { params });
    return res.data;
};

// 🔹 GET PRODUCT BY SLUG
export const getProductDetail = async (slug) => {
    const res = await api.get(`/products/${slug}/`);
    return res.data;
};

// 🔹 CREATE PRODUCT (ADMIN)
export const createProduct = async (formData) => {
    const res = await api.post("/products/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

// 🔹 UPDATE PRODUCT
export const updateProduct = async (slug, formData) => {
    const res = await api.put(`/products/${slug}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

// 🔹 DELETE PRODUCT
export const deleteProduct = async (slug) => {
    const res = await api.delete(`/products/${slug}/`);
    return res.data;
};