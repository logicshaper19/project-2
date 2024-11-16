import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDeals = async (params = {}) => {
  const response = await api.get('/deals', { params });
  return response.data;
};

export const getDealsByCategory = async (category) => {
  const response = await api.get('/deals', { params: { category } });
  return response.data;
};

export const refreshDeals = async () => {
  const response = await api.post('/deals/refresh');
  return response.data;
};