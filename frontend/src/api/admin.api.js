import api from './axiosInstance';

// Users
export const adminGetUsers = (params) => api.get('/admin/users', { params });
export const adminGetUser = (id) => api.get(`/admin/users/${id}`);
export const adminUpdateUserStatus = (id, data) => api.put(`/admin/users/${id}/status`, data);

// Products
export const adminGetProducts = (params) => api.get('/admin/products', { params });
export const adminGetProduct = (id) => api.get(`/admin/products/${id}`);
export const adminApproveProduct = (id, data) => api.put(`/admin/products/${id}/approve`, data);
export const adminDeleteProduct = (id) => api.delete(`/admin/products/${id}`);

// Categories
export const adminGetCategories = () => api.get('/admin/categories');
export const adminCreateCategory = (data) => api.post('/admin/categories', data);
export const adminUpdateCategory = (id, data) => api.put(`/admin/categories/${id}`, data);
export const adminDeleteCategory = (id) => api.delete(`/admin/categories/${id}`);

// Orders
export const adminGetOrders = (params) => api.get('/admin/orders', { params });
export const adminGetOrder = (id) => api.get(`/admin/orders/${id}`);
export const adminUpdateOrderStatus = (id, data) => api.put(`/admin/orders/${id}/status`, data);

// Payments
export const adminGetPayments = (params) => api.get('/admin/payments', { params });
export const adminGetPayment = (id) => api.get(`/admin/payments/${id}`);

// Fee Rules
export const adminGetFeeRules = () => api.get('/admin/fee-rules');
export const adminCreateFeeRule = (data) => api.post('/admin/fee-rules', data);
export const adminUpdateFeeRule = (id, data) => api.put(`/admin/fee-rules/${id}`, data);
export const adminDeleteFeeRule = (id) => api.delete(`/admin/fee-rules/${id}`);
export const adminToggleFeeRule = (id) => api.put(`/admin/fee-rules/${id}/toggle`);

// Analytics
export const adminGetAnalytics = () => api.get('/admin/analytics');

// Categories (public)
export const getCategories = () => api.get('/categories');
