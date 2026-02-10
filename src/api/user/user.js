import api from "./axios";

// ==============================
// GET PROFILE
// ==============================
export const getProfile = async () => {
    const res = await api.get("/accounts/profile/");
    return res.data;
};

// ==============================
// UPDATE PROFILE
// ==============================
export const updateProfile = async (formData) => {
    const res = await api.patch(
        "/accounts/profile/",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
    return res.data;
};
