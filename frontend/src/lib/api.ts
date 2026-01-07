import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Service methods
export const apiService = {
  async getHealth() {
    const response = await apiClient.get('/health');
    return response.data;
  },
  
  async getData() {
    const response = await apiClient.get('/api/data');
    return response.data;
  },
  
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getBusinesses() {
    const response = await apiClient.get('/api/businesses');
    return response.data;
  },

  async getBusiness(id: number) {
    const response = await apiClient.get(`/api/businesses/${id}`);
    return response.data;
  },

  async joinWaitlist(businessId: number, email: string, name?: string) {
    const response = await apiClient.post('/api/waitlist', {
      businessId,
      email,
      name,
    });
    return response.data;
  },

  async getWaitlist(businessId: number) {
    const response = await apiClient.get(`/api/waitlist/${businessId}`);
    return response.data;
  },

  // Admin methods (require authentication token)
  async getAllBusinesses(token: string) {
    const response = await apiClient.get('/api/admin/businesses', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  async approveBusiness(id: number, token: string) {
    const response = await apiClient.post(`/api/admin/businesses/${id}/approve`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  async rejectBusiness(id: number, token: string) {
    const response = await apiClient.post(`/api/admin/businesses/${id}/reject`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  async getAllUsers(token: string) {
    const response = await apiClient.get('/api/admin/users', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },
};

