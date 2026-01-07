'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type AccountType = 'user' | 'investor' | 'startup' | null;

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<AccountType>(null);
  const router = useRouter();

  const handleAccountTypeSelect = (type: 'user' | 'investor' | 'startup') => {
    setAccountType(type);
    // Navigate to registration form with account type
    router.push(`/register/form?type=${type}`);
  };

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
        backgroundColor: 'var(--linkvesta-white)',
        padding: '3rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        {/* Page Title */}
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'var(--linkvesta-dark-blue)',
          marginBottom: '0.5rem',
          textAlign: 'center'
        }}>
          Create Your Linkvesta Account
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1rem',
          color: '#6b7280',
          textAlign: 'center',
          marginBottom: '3rem',
          lineHeight: '1.6'
        }}>
          Join a trusted platform connecting vetted businesses with investors.
        </p>

        {/* Account Type Selection Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Investor Card */}
          <button
            onClick={() => handleAccountTypeSelect('investor')}
            style={{
              padding: '2rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: 'var(--linkvesta-white)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--linkvesta-dark-blue)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--linkvesta-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              💼
            </div>
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: 'var(--linkvesta-dark-blue)',
                margin: '0 0 0.5rem 0'
              }}>
                Investor
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: 0
              }}>
                Connect with high-growth businesses
              </p>
            </div>
          </button>

          {/* Startup/SME Card */}
          <button
            onClick={() => handleAccountTypeSelect('startup')}
            style={{
              padding: '2rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: 'var(--linkvesta-white)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--linkvesta-dark-blue)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--linkvesta-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              🚀
            </div>
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: 'var(--linkvesta-dark-blue)',
                margin: '0 0 0.5rem 0'
              }}>
                Startup/SME
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: 0
              }}>
                Find investors for your business
              </p>
            </div>
          </button>
        </div>

        {/* Back to Home Link */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link
            href="/"
            style={{
              color: 'var(--linkvesta-dark-blue)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              opacity: 0.8
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
