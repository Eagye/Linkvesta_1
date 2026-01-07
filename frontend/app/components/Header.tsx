'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  const handleBrowseClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If already on browse page, scroll to top instead of navigating
    if (pathname === '/browse') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Otherwise, let Link handle navigation normally (no preventDefault)
  };

  const handlePricingClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If already on pricing page, scroll to top instead of navigating
    if (pathname === '/pricing') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Otherwise, let Link handle navigation normally (no preventDefault)
  };

  const handleHowItWorksClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If already on how-it-works page, scroll to top instead of navigating
    if (pathname === '/how-it-works') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Otherwise, let Link handle navigation normally (no preventDefault)
  };

  useEffect(() => {
    // Check if user is logged in
    const checkUser = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          // Invalid user data
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();

    // Listen for storage changes (e.g., login from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'token') {
        checkUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (for same-tab updates)
    const handleUserUpdate = () => {
      checkUser();
    };

    window.addEventListener('userLogin', handleUserUpdate);
    window.addEventListener('userLogout', handleUserUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserUpdate);
      window.removeEventListener('userLogout', handleUserUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    
    // Dispatch event to update header
    window.dispatchEvent(new Event('userLogout'));
    
    router.push('/');
    router.refresh();
  };

  return (
    <header style={{
      backgroundColor: 'var(--linkvesta-dark-blue)',
      color: 'var(--linkvesta-white)',
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>LINKVESTA</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>BRIDGING CAPITAL</div>
          </div>
        </Link>
      </div>

      <nav style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '2rem',
        flexWrap: 'wrap'
      }}>
        <Link href="/" style={{ color: 'var(--linkvesta-white)', textDecoration: 'none' }}>
          Home
        </Link>
        <Link href="/about" style={{ color: 'var(--linkvesta-white)', textDecoration: 'none' }}>
          About Us
        </Link>
        <Link 
          href="/how-it-works" 
          onClick={handleHowItWorksClick}
          style={{ 
            color: 'var(--linkvesta-white)', 
            textDecoration: 'none',
            transition: 'opacity 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          How It Works
        </Link>
        <Link 
          href="/pricing" 
          onClick={handlePricingClick}
          style={{ 
            color: 'var(--linkvesta-white)', 
            textDecoration: 'none',
            transition: 'opacity 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Pricing
        </Link>
        <Link 
          href="/browse" 
          onClick={handleBrowseClick}
          style={{ 
            color: 'var(--linkvesta-white)', 
            textDecoration: 'none',
            transition: 'opacity 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Browse Businesses
        </Link>
        {user ? (
          // User is logged in - show user menu
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ 
              color: 'var(--linkvesta-white)', 
              fontSize: '0.875rem',
              opacity: 0.9
            }}>
              {user.name || user.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--linkvesta-white)',
                border: '1px solid var(--linkvesta-white)',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                textDecoration: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.875rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--linkvesta-white)';
                e.currentTarget.style.color = 'var(--linkvesta-dark-blue)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--linkvesta-white)';
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          // User is not logged in - show login/signup links
          <>
            <Link 
              href="/login" 
              style={{ 
                color: 'var(--linkvesta-white)', 
                textDecoration: 'none',
                transition: 'opacity 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Login
            </Link>
            <Link 
              href="/register" 
              style={{ 
                color: 'var(--linkvesta-white)', 
                textDecoration: 'none',
                transition: 'opacity 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Sign Up
            </Link>
          </>
        )}
        
        <Link 
          href="/contact" 
          style={{ 
            backgroundColor: 'var(--linkvesta-gold)',
            color: 'var(--linkvesta-dark-blue)',
            padding: '0.5rem 1.5rem',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Get in Touch
        </Link>
      </nav>
    </header>
  );
}

