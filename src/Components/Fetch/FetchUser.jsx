import api from "../../api/user/axios";

/**
 * Compatibility layer for legacy FetchUser calls.
 * Redirects to the new unified API endpoints.
 */

export const BASE_URL = "http://13.53.193.159/api";

export const fetchUser = async (userId) => {
    const res = await api.get("/accounts/profile/");
    return res.data;
};

export const updateUser = async (userId, data) => {
    const res = await api.patch("/accounts/profile/", data);
    return res.data;
};

export const fetchProducts = async () => {
    const res = await api.get("/products/");
    return res.data.results || res.data;
};

export const fetchProductsPage = async (url) => {
    const res = await api.get(url || "/products/");
    return res.data; // Returns { count, next, previous, results }
};

export const fetchProductBySlug = async (slug) => {
    const res = await api.get(`/products/${slug}/`);
    return res.data;
};

export const fetchProductByName = async (name) => {
    const res = await api.get(`/products/?search=${name}`);
    return res.data.results || res.data;
};

export const fetchReviews = async (productId) => {
    const res = await api.get(`/products/${productId}/reviews/`);
    return res.data;
};

export const addReview = async (productId, data) => {
    const res = await api.post(`/products/${productId}/reviews/`, data);
    return res.data;
};

export const checkReviewEligibility = async (productId) => {
    const res = await api.get(`/products/${productId}/review-eligibility/`);
    return res.data;
};

export const fetchByCategory = async (categorySlug) => {
    try {
        // 1. Fetch all categories to find the ID for this slug
        const catRes = await api.get("/categories/");
        const categories = catRes.data.results || catRes.data;
        const targetCategory = Array.isArray(categories)
            ? categories.find(c => c.slug === categorySlug || c.name.toLowerCase() === categorySlug.toLowerCase())
            : null;

        // 2. Attempt server-side filtering by ID (more reliable in DRF) or Slug
        const params = targetCategory ? { category: targetCategory.id } : { category_slug: categorySlug };
        const res = await api.get("/products/", { params });
        const products = res.data.results || res.data;

        // 3. Fallback: Double check filtering on client side 
        if (Array.isArray(products)) {
            // If the server ignored the filter, we'll see products from other categories
            const isFiltered = products.every(p =>
                (p.category?.id === targetCategory?.id) ||
                (p.category?.slug === categorySlug)
            );

            if (!isFiltered) {
                return products.filter(p =>
                    p.category?.slug === categorySlug ||
                    p.category?.id === targetCategory?.id ||
                    (p.category?.name && p.category.name.toLowerCase() === categorySlug.toLowerCase())
                );
            }
        }
        return products;
    } catch (err) {
        console.error("fetchByCategory error:", err);
        // Fallback to searching all products if something goes wrong
        const res = await api.get("/products/");
        const products = res.data.results || res.data;
        return Array.isArray(products)
            ? products.filter(p => p.category?.slug === categorySlug || p.category?.name?.toLowerCase() === categorySlug.toLowerCase())
            : [];
    }
};
