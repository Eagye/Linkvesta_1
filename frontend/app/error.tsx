'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      backgroundColor: 'var(--linkvesta-white)'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
        padding: '3rem',
        backgroundColor: 'var(--linkvesta-white)',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 2rem',
          backgroundColor: '#fef2f2',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 'bold',
          color: 'var(--linkvesta-dark-blue)',
          marginBottom: '1rem'
        }}>
          Something went wrong!
        </h1>
        
        <p style={{
          color: '#6b7280',
          fontSize: '1rem',
          lineHeight: '1.6',
          marginBottom: '2rem'
        }}>
          We encountered an unexpected error. Please try again or return to the homepage.
        </p>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <p style={{
              fontSize: '0.875rem',
              color: '#dc2626',
              fontFamily: 'monospace',
              margin: 0,
              wordBreak: 'break-word'
            }}>
              {error.message}
            </p>
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={reset}
            style={{
              padding: '0.875rem 2rem',
              backgroundColor: 'var(--linkvesta-gold)',
              color: 'var(--linkvesta-dark-blue)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Try Again
          </button>
          
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.875rem 2rem',
              backgroundColor: 'transparent',
              color: 'var(--linkvesta-dark-blue)',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '1rem',
              border: '2px solid var(--linkvesta-dark-blue)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
