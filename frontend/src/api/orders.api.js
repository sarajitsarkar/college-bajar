import api from './axiosInstance';

export const placeOrder = (data) => api.post('/orders', data);
export const getMyOrders = (params) => api.get('/orders', { params });
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const cancelOrder = (id, data) => api.put(`/orders/${id}/cancel`, data);
export const getIncomingOrders = (params) => api.get('/orders/incoming', { params });
export const updateOrderStatus = (id, data) => api.put(`/orders/${id}/status`, data);
