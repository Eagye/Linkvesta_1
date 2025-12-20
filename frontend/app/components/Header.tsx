'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <Link href="/how-it-works" style={{ color: 'var(--linkvesta-white)', textDecoration: 'none' }}>
          How It Works
        </Link>
        <Link href="/pricing" style={{ color: 'var(--linkvesta-white)', textDecoration: 'none' }}>
          Pricing
        </Link>
        <Link href="/browse" style={{ color: 'var(--linkvesta-white)', textDecoration: 'none' }}>
          Browse Businesses
        </Link>
        
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

