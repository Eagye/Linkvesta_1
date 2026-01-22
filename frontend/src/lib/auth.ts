import axios from 'axios';
import { getAuthUrl } from './config';

const AUTH_URL = getAuthUrl();

export const authClient = axios.create({
  baseURL: AUTH_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Auth Service methods
export const authService = {
  async register(
    email: string, 
    password: string, 
    name?: string, 
    phoneNumber?: string, 
    country?: string, 
    accountType?: string | null,
    businessDescription?: string,
    tin?: string,
    businessRegistrationDocument?: File
  ) {
    // If there's a file, use FormData; otherwise use JSON
    if (businessRegistrationDocument) {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      if (name) formData.append('name', name);
      if (phoneNumber) formData.append('phoneNumber', phoneNumber);
      if (country) formData.append('country', country);
      if (accountType) formData.append('accountType', accountType);
      if (businessDescription) formData.append('businessDescription', businessDescription);
      if (tin) formData.append('tin', tin);
      formData.append('businessRegistrationDocument', businessRegistrationDocument);

      const response = await authClient.post('/api/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      const response = await authClient.post('/api/auth/register', {
        email,
        password,
        name,
        phoneNumber,
        country,
        accountType,
        businessDescription,
        tin,
      });
      return response.data;
    }
  },
  
  async login(email: string, password: string) {
    const response = await authClient.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async verifySession() {
    const response = await authClient.post('/api/auth/verify', {});
    return response.data;
  },

  // Admin-specific authentication methods
  async adminLogin(email: string, password: string) {
    const response = await authClient.post('/api/auth/admin/login', {
      email,
      password,
    });
    return response.data;
  },

  // Create admin (requires authentication token)
  async createAdmin(email: string, password: string, name?: string, token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await authClient.post('/api/auth/admin/create', {
      email,
      password,
      name,
    }, {
      headers,
    });
    return response.data;
  },

  async logout() {
    const response = await authClient.post('/api/auth/logout');
    return response.data;
  },
};

