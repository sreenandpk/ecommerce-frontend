import adminAxios from "./adminAxios";

// LIST
export const getAdminCategories = async () => {
    const res = await adminAxios.get("/admin/categories/");
    return res.data;
};

// CREATE
export const createCategory = async (formData) => {
    const res = await adminAxios.post(
        "/admin/categories/create/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
};

// UPDATE
export const updateCategory = async (slug, formData) => {
    const res = await adminAxios.put(
        `/admin/categories/${slug}/update/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
};

// DELETE
export const deleteCategory = async (slug) => {
    const res = await adminAxios.delete(
        `/admin/categories/${slug}/delete/`
    );
    return res.data;
};
