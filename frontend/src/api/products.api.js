import api from './axiosInstance';

export const getProducts = (params) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const getMyProducts = () => api.get('/products/my');
export const createProduct = (formData) =>
  api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProduct = (id, formData) =>
  api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const toggleAvailability = (id) => api.put(`/products/${id}/availability`);
export const checkAvailability = (id, params) =>
  api.get(`/products/${id}/availability-check`, { params });
