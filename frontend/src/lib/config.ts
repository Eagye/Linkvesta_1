/**
 * Configuration for API and Auth service URLs
 */

// Get API URL
export const getApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    const win = window as any;
    if (win.__LINKVESTA_CONFIG__?.apiUrl) {
      return win.__LINKVESTA_CONFIG__.apiUrl;
    }
  }
  
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

// Get Auth URL
export const getAuthUrl = (): string => {
  if (typeof window !== 'undefined') {
    const win = window as any;
    if (win.__LINKVESTA_CONFIG__?.authUrl) {
      return win.__LINKVESTA_CONFIG__.authUrl;
    }
  }
  
  return process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3002';
};
