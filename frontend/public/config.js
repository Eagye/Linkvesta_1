// Runtime configuration for LinkVesta
// This file is loaded at runtime and can be updated without rebuilding
// Access via: window.__LINKVESTA_CONFIG__

(function() {
  // Get config from meta tags or use defaults
  const getConfig = () => {
    // Try to get from meta tags (set by server)
    if (typeof document !== 'undefined') {
      const apiMeta = document.querySelector('meta[name="linkvesta-api-url"]');
      const authMeta = document.querySelector('meta[name="linkvesta-auth-url"]');
      
      if (apiMeta && authMeta) {
        return {
          apiUrl: apiMeta.getAttribute('content'),
          authUrl: authMeta.getAttribute('content')
        };
      }
    }
    
    return null;
  };
  
  if (typeof window !== 'undefined') {
    (window as any).__LINKVESTA_CONFIG__ = getConfig();
  }
})();
