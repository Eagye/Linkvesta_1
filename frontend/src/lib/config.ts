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

    const { protocol, hostname } = window.location;
    if (hostname) {
      return `${protocol}//${hostname}:3001`;
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

    const { protocol, hostname } = window.location;
    if (hostname) {
      return `${protocol}//${hostname}:3002`;
    }
  }
  
  return process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3002';
};
