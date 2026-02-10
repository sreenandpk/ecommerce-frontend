import api from "./axios";

// GET all categories (public)
export const getCategories = async () => {
    const res = await api.get("/categories/");
    return res.data;
};
