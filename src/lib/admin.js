import axios from 'axios';

const api = axios.create({
  baseURL: '/api/admin',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAdminStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export const getCustomers = async (params = {}) => {
  const response = await api.get('/customers', { params });
  return response.data;
};

export const getRevenueData = async (startDate, endDate) => {
  const response = await api.get('/revenue', {
    params: { start_date: startDate, end_date: endDate }
  });
  return response.data;
};

export const getDashboardData = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};