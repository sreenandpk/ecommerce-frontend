import api from "./axios";

// Get reviews of a product
export const getProductReviews = (productId) =>
    api.get(`/products/${productId}/reviews/`);

// Create or update review (backend handles logic)
export const submitReview = (productId, data) =>
    api.post(`/products/${productId}/reviews/`, data);

// Delete user's review
export const deleteReview = (reviewId) =>
    api.delete(`/reviews/${reviewId}/`);
