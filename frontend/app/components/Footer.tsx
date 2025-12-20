'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--linkvesta-dark-blue)',
      color: 'var(--linkvesta-white)',
      padding: '3rem 2rem 1.5rem',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '3rem',
      justifyContent: 'space-between',
      width: '100%'
    }}>
      <div style={{ flex: '1', minWidth: '200px' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          LINKVESTA
        </div>
        <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '1rem', lineHeight: '1.6' }}>
          Bridging high-growth African businesses with global and local capital.
        </div>
        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
          © 2024 Linkvesta. Built in Ghana 🇬🇭
        </div>
      </div>

      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '1rem', fontSize: '0.875rem' }}>
            COMPANY
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/about" style={{ color: 'var(--linkvesta-white)', textDecoration: 'none', fontSize: '0.875rem', opacity: 0.9 }}>
              About Us
            </Link>
            <Link href="/pricing" style={{ color: 'var(--linkvesta-white)', textDecoration: 'none', fontSize: '0.875rem', opacity: 0.9 }}>
              Pricing
            </Link>
            <Link href="/contact" style={{ color: 'var(--linkvesta-white)', textDecoration: 'none', fontSize: '0.875rem', opacity: 0.9 }}>
              Contact
            </Link>
            <Link href="/resources" style={{ color: 'var(--linkvesta-white)', textDecoration: 'none', fontSize: '0.875rem', opacity: 0.9 }}>
              Resources
            </Link>
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '1rem', fontSize: '0.875rem' }}>
            LEGAL
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/terms" style={{ color: 'var(--linkvesta-white)', textDecoration: 'none', fontSize: '0.875rem', opacity: 0.9 }}>
              Terms of Service
            </Link>
            <Link href="/privacy" style={{ color: 'var(--linkvesta-white)', textDecoration: 'none', fontSize: '0.875rem', opacity: 0.9 }}>
              Privacy Policy
            </Link>
            <Link href="/cookies" style={{ color: 'var(--linkvesta-white)', textDecoration: 'none', fontSize: '0.875rem', opacity: 0.9 }}>
              Cookies
            </Link>
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '1rem', fontSize: '0.875rem' }}>
            CONNECT
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a 
              href="https://linkedin.com/company/linkvesta" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--linkvesta-dark-blue)',
                border: '1px solid rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--linkvesta-white)',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}
            >
              in
            </a>
            <a 
              href="https://twitter.com/linkvesta" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--linkvesta-dark-blue)',
                border: '1px solid rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--linkvesta-white)',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}
            >
              X
            </a>
            <a 
              href="https://facebook.com/linkvesta" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--linkvesta-dark-blue)',
                border: '1px solid rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--linkvesta-white)',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}
            >
              f
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

