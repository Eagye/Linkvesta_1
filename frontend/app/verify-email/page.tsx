'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Toast from '@/app/components/Toast';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired' | 'already-verified'>('verifying');
  const [message, setMessage] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided. Please check your email and use the link provided.');
      return;
    }

    verifyEmail(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3002';
      const response = await fetch(`${authUrl}/api/auth/verify-email?token=${verificationToken}`);

      const data = await response.json();

      if (response.ok) {
        if (data.alreadyVerified) {
          setStatus('already-verified');
          setMessage(data.message || 'Your email has already been verified.');
        } else {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
          showToast(data.message || 'Email verified successfully!', 'success');
        }
      } else {
        if (data.expired) {
          setStatus('expired');
          setMessage(data.error || 'This verification link has expired.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to verify email. Please try again.');
        }
        showToast(data.error || 'Failed to verify email.', 'error');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setStatus('error');
      const errorMessage = error.message || 'We encountered an issue while verifying your email.';
      
      // Check if it's a network error
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        setMessage('Unable to connect to the server. Please check your internet connection and try again. If you\'re using the verification link from email, make sure the application is running.');
      } else {
        setMessage(errorMessage + ' Please try again.');
      }
      showToast(errorMessage, 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleResendEmail = async () => {
    // We need the email, but we don't have it from the token
    // Redirect to a page where user can enter their email
    router.push('/resend-verification');
  };

  const handleManualVerify = () => {
    if (manualToken.trim()) {
      verifyEmail(manualToken.trim());
      setShowManualEntry(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(1rem, 4vw, 2rem)',
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
        maxWidth: '500px',
        width: '100%',
        backgroundColor: 'var(--linkvesta-white)',
        padding: 'clamp(1.5rem, 5vw, 3rem)',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        {status === 'verifying' && (
          <>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 2rem',
              border: '4px solid #e5e7eb',
              borderTopColor: 'var(--linkvesta-gold)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <h1 style={{
              fontSize: 'clamp(1.5rem, 4vw, 1.75rem)',
              fontWeight: 'bold',
              color: 'var(--linkvesta-dark-blue)',
              marginBottom: '1rem'
            }}>
              Verifying Your Email
            </h1>
            <p style={{
              color: '#6b7280',
              fontSize: '1rem',
              lineHeight: '1.6'
            }}>
              Please wait while we verify your email address...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 2rem',
              backgroundColor: '#f0fdf4',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h1 style={{
              fontSize: 'clamp(1.5rem, 4vw, 1.75rem)',
              fontWeight: 'bold',
              color: 'var(--linkvesta-dark-blue)',
              marginBottom: '1rem'
            }}>
              Email Verified!
            </h1>
            <p style={{
              color: '#6b7280',
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '2rem'
            }}>
              {message}
            </p>
            <Link
              href="/"
              style={{
                display: 'inline-block',
                padding: '0.875rem 2rem',
                backgroundColor: 'var(--linkvesta-gold)',
                color: 'var(--linkvesta-dark-blue)',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '1rem',
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
              Go to Home
            </Link>
          </>
        )}

        {status === 'already-verified' && (
          <>
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
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h1 style={{
              fontSize: 'clamp(1.5rem, 4vw, 1.75rem)',
              fontWeight: 'bold',
              color: 'var(--linkvesta-dark-blue)',
              marginBottom: '1rem'
            }}>
              Already Verified
            </h1>
            <p style={{
              color: '#6b7280',
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '2rem'
            }}>
              {message}
            </p>
            <Link
              href="/"
              style={{
                display: 'inline-block',
                padding: '0.875rem 2rem',
                backgroundColor: 'var(--linkvesta-gold)',
                color: 'var(--linkvesta-dark-blue)',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              Go to Home
            </Link>
          </>
        )}

        {(status === 'error' || status === 'expired') && (
          <>
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
              fontSize: 'clamp(1.5rem, 4vw, 1.75rem)',
              fontWeight: 'bold',
              color: 'var(--linkvesta-dark-blue)',
              marginBottom: '1rem'
            }}>
              {status === 'expired' ? 'Link Expired' : 'Verification Failed'}
            </h1>
            <p style={{
              color: '#6b7280',
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '2rem'
            }}>
              {message}
            </p>
            {!showManualEntry ? (
              <>
                <div style={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fbbf24',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <p style={{
                    color: '#92400e',
                    fontSize: '0.875rem',
                    margin: 0,
                    marginBottom: '0.5rem',
                    fontWeight: '600'
                  }}>
                    Can't access the link?
                  </p>
                  <p style={{
                    color: '#78350f',
                    fontSize: '0.875rem',
                    margin: 0
                  }}>
                    If the verification link doesn't work, make sure:
                  </p>
                  <ul style={{
                    color: '#78350f',
                    fontSize: '0.875rem',
                    margin: '0.5rem 0 0 1.5rem',
                    padding: 0
                  }}>
                    <li>The application is running on your computer</li>
                    <li>You're accessing from the same device where the app is running</li>
                    <li>Or use the manual verification option below</li>
                  </ul>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  flexDirection: 'column',
                  alignItems: 'stretch'
                }}>
                  <button
                    onClick={() => setShowManualEntry(true)}
                    style={{
                      padding: '0.875rem 2rem',
                      backgroundColor: 'transparent',
                      color: 'var(--linkvesta-dark-blue)',
                      border: '2px solid var(--linkvesta-dark-blue)',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Enter Token Manually
                  </button>
                  <button
                    onClick={handleResendEmail}
                    style={{
                      padding: '0.875rem 2rem',
                      backgroundColor: 'var(--linkvesta-gold)',
                      color: 'var(--linkvesta-dark-blue)',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      width: '100%'
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
                    Resend Verification Email
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
                      width: '100%',
                      textAlign: 'center'
                    }}
                  >
                    Go to Home
                  </Link>
                </div>
              </>
            ) : (
              <div style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: 'var(--linkvesta-dark-blue)',
                  marginBottom: '0.75rem'
                }}>
                  Manual Verification
                </h3>
                <p style={{
                  color: '#6b7280',
                  fontSize: '0.875rem',
                  marginBottom: '1rem'
                }}>
                  Copy the verification token from your email link (the part after "token=") and paste it below:
                </p>
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                  flexDirection: 'column'
                }}>
                  <input
                    type="text"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Paste verification token here"
                    style={{
                      flex: 1,
                      padding: '0.875rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      color: 'var(--linkvesta-dark-blue)',
                      fontFamily: 'monospace'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleManualVerify();
                      }
                    }}
                  />
                  <button
                    onClick={handleManualVerify}
                    disabled={!manualToken.trim()}
                    style={{
                      padding: '0.875rem 1.5rem',
                      backgroundColor: manualToken.trim() ? 'var(--linkvesta-gold)' : '#9ca3af',
                      color: 'var(--linkvesta-dark-blue)',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '1rem',
                      cursor: manualToken.trim() ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s'
                    }}
                  >
                    Verify
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowManualEntry(false);
                    setManualToken('');
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    color: '#6b7280',
                    border: 'none',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        )}

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e5e7eb',
          borderTopColor: 'var(--linkvesta-gold)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
