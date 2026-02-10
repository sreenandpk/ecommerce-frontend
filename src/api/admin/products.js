import adminAxios from "./adminAxios";

// LIST
export const getAdminProducts = async (page = 1) => {
    const res = await adminAxios.get(`/admin/products/?page=${page}`);
    return res.data;
};

// DETAIL
export const getAdminProductDetail = async (slug) => {
    const res = await adminAxios.get(`/admin/products/${slug}/`);
    return res.data;
};

// CREATE
export const createProduct = async (formData) => {
    const res = await adminAxios.post(
        "/admin/products/create/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
};

// UPDATE
export const updateProduct = async (slug, formData) => {
    const res = await adminAxios.patch(
        `/admin/products/${slug}/update/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
};

// DELETE
export const deleteProduct = async (slug) => {
    const res = await adminAxios.delete(
        `/admin/products/${slug}/delete/`
    );
    return res.data;
};

// AUXILIARY DATA
export const getIngredients = async () => {
    const res = await adminAxios.get("/admin/ingredients/");
    return res.data;
};

export const getAllergens = async () => {
    const res = await adminAxios.get("/admin/allergens/");
    return res.data;
};

export const getCities = async () => {
    const res = await adminAxios.get("/admin/cities/");
    return res.data;
};
