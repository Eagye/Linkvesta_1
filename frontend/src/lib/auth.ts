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
  async register(email: string, password: string, name?: string) {
    const response = await authClient.post('/api/auth/register', {
      email,
      password,
      name,
    });
    return response.data;
  },
  
  async login(email: string, password: string) {
    const response = await authClient.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },
};

