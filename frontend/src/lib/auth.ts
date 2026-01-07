import axios from 'axios';

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3002';

export const authClient = axios.create({
  baseURL: AUTH_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
    const response = await authClient.post('/api/auth/admin/create', {
      email,
      password,
      name,
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },
};

