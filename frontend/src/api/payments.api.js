import api from './axiosInstance';

export const createPaymentOrder = (data) => api.post('/payments/create-order', data);
export const verifyPayment = (data) => api.post('/payments/verify', data);
export const getPaymentDetail = (orderId) => api.get(`/payments/${orderId}`);
