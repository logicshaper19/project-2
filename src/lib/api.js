import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDeals = async () => {
  const response = await api.get('/deals');
  return response.data;
};

export const filterDeals = async (preferences) => {
  const response = await api.post('/deals/filter', preferences);
  return response.data;
};

export const getReport = async () => {
  const response = await api.get('/report');
  return response.data;
};