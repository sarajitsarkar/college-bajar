import api from './axiosInstance';

export const getProfile = () => api.get('/users/profile');
export const updateProfile = (data) => api.put('/users/profile', data);
export const getAddresses = () => api.get('/users/addresses');
export const addAddress = (data) => api.post('/users/addresses', data);
export const updateAddress = (id, data) => api.put(`/users/addresses/${id}`, data);
export const deleteAddress = (id) => api.delete(`/users/addresses/${id}`);
export const setDefaultAddress = (id) => api.put(`/users/addresses/${id}/default`);
export const getDashboard = () => api.get('/users/dashboard');
export const getEarnings = () => api.get('/users/earnings');
