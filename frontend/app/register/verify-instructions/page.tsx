'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Toast from '@/app/components/Toast';

export default function VerifyInstructionsPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleResendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      showToast('Please enter your email address.', 'error');
      return;
    }

    setIsResending(true);
    try {
      const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3002';
      const response = await fetch(`${authUrl}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(data.message || 'Verification email has been sent. Please check your inbox.', 'success');
      } else {
        showToast(data.error || 'Failed to resend verification email. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      showToast('We encountered an issue while sending the verification email. Please try again.', 'error');
    } finally {
      setIsResending(false);
    }
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
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
        duration={toast.type === 'success' ? 4000 : 6000}
      />

      <div style={{
        maxWidth: '600px',
        width: '100%',
        backgroundColor: 'var(--linkvesta-white)',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 2rem',
          backgroundColor: '#eff6ff',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </div>

        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'var(--linkvesta-dark-blue)',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          Check Your Email
        </h1>

        <p style={{
          color: '#6b7280',
          fontSize: '1rem',
          lineHeight: '1.6',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          We&apos;ve sent a verification email to your inbox. Please click the link in the email to verify your account and complete your registration.
        </p>

        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: 'var(--linkvesta-dark-blue)',
            marginBottom: '0.75rem'
          }}>
            What to do next:
          </h3>
          <ol style={{
            margin: 0,
            paddingLeft: '1.5rem',
            color: '#6b7280',
            fontSize: '0.9375rem',
            lineHeight: '1.8'
          }}>
            <li>Check your email inbox (and spam folder if needed)</li>
            <li>Click the &quot;Verify Email Address&quot; button in the email</li>
            <li>You&apos;ll be redirected to confirm your email is verified</li>
            <li>Then you can log in to your account</li>
          </ol>
        </div>

        <div style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: '2rem',
          marginTop: '2rem'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: 'var(--linkvesta-dark-blue)',
            marginBottom: '1rem'
          }}>
            Didn&apos;t receive the email?
          </h3>
          <form onSubmit={handleResendEmail}>
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                style={{
                  flex: 1,
                  padding: '0.875rem 1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  color: 'var(--linkvesta-dark-blue)',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="submit"
                disabled={isResending}
                style={{
                  padding: '0.875rem 1.5rem',
                  backgroundColor: isResending ? '#9ca3af' : 'var(--linkvesta-gold)',
                  color: 'var(--linkvesta-dark-blue)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isResending ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {isResending ? 'Sending...' : 'Resend Email'}
              </button>
            </div>
          </form>
          <p style={{
            color: '#9ca3af',
            fontSize: '0.875rem',
            margin: 0
          }}>
            The verification link will expire in 24 hours. If you still don&apos;t see the email, check your spam folder or try resending.
          </p>
        </div>

        <div style={{
          marginTop: '2rem',
          textAlign: 'center'
        }}>
          <Link
            href="/"
            style={{
              color: 'var(--linkvesta-dark-blue)',
              textDecoration: 'none',
              fontSize: '0.9375rem',
              fontWeight: '500'
            }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
