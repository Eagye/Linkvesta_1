'use client';

export default function PricingPage() {
  return (
    <main style={{
      minHeight: 'calc(100vh - 200px)',
      backgroundColor: 'var(--linkvesta-white)',
      padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
      }}>
        {/* Title Section */}
        <h1 style={{
          color: 'var(--linkvesta-dark-blue)',
          fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
          marginBottom: '1rem',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          Transparent Pricing
        </h1>
        <p style={{
          color: 'var(--linkvesta-dark-blue)',
          fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
          marginBottom: 'clamp(2rem, 5vw, 3rem)',
          textAlign: 'center',
          opacity: 0.8
        }}>
          No hidden fees. We only win when you win.
        </p>

        {/* Pricing Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 'clamp(1.5rem, 4vw, 2rem)',
          width: '100%',
          maxWidth: '900px'
        }}>
          {/* For Businesses Card */}
          <div style={{
            backgroundColor: 'var(--linkvesta-white)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderTop: '4px solid var(--linkvesta-dark-blue)',
            width: '100%'
          }}>
            <h2 style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1.75rem',
              marginBottom: '0.5rem',
              fontWeight: 'bold'
            }}>
              For Businesses
            </h2>
            <p style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1rem',
              marginBottom: '2rem',
              opacity: 0.8
            }}>
              Access capital and mentorship.
            </p>

            {/* Listing Fee */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem'
              }}>
                LISTING FEE
              </div>
              <div style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '0.25rem'
              }}>
                GHS 200 - 500
              </div>
              <div style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '0.875rem',
                opacity: 0.7
              }}>
                One-time vetting & processing fee.
              </div>
            </div>

            {/* Success Fee */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem'
              }}>
                SUCCESS FEE
              </div>
              <div style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '0.25rem'
              }}>
                2% - 5%
              </div>
              <div style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '0.875rem',
                opacity: 0.7
              }}>
                Charged only upon successful close.
              </div>
            </div>

            {/* Features */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" fill="var(--linkvesta-dark-blue)"/>
                </svg>
                <span style={{
                  color: 'var(--linkvesta-dark-blue)',
                  fontSize: '1rem'
                }}>
                  Investment Readiness Assessment
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" fill="var(--linkvesta-dark-blue)"/>
                </svg>
                <span style={{
                  color: 'var(--linkvesta-dark-blue)',
                  fontSize: '1rem'
                }}>
                  Profile on Investor Dashboard
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" fill="var(--linkvesta-dark-blue)"/>
                </svg>
                <span style={{
                  color: 'var(--linkvesta-dark-blue)',
                  fontSize: '1rem'
                }}>
                  Legal Document Templates
                </span>
              </div>
            </div>
          </div>

          {/* For Investors Card */}
          <div style={{
            backgroundColor: 'var(--linkvesta-white)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderTop: '4px solid var(--linkvesta-gold)',
            width: '100%'
          }}>
            <h2 style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1.75rem',
              marginBottom: '0.5rem',
              fontWeight: 'bold'
            }}>
              For Investors
            </h2>
            <p style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1rem',
              marginBottom: '2rem',
              opacity: 0.8
            }}>
              Deal flow and due diligence.
            </p>

            {/* Basic Access */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem'
              }}>
                BASIC ACCESS
              </div>
              <div style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '0.25rem'
              }}>
                Free
              </div>
              <div style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '0.875rem',
                opacity: 0.7
              }}>
                Browse basic business profiles.
              </div>
            </div>

            {/* Premium Access */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem'
              }}>
                PREMIUM ACCESS
              </div>
              <div style={{
                color: '#6b7280',
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '0.25rem'
              }}>
                Coming Soon
              </div>
              <div style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '0.875rem',
                opacity: 0.7
              }}>
                Advanced analytics & deep dive reports.
              </div>
            </div>

            {/* Features */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" fill="var(--linkvesta-dark-blue)"/>
                </svg>
                <span style={{
                  color: 'var(--linkvesta-dark-blue)',
                  fontSize: '1rem'
                }}>
                  Verified Deal Flow
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" fill="var(--linkvesta-dark-blue)"/>
                </svg>
                <span style={{
                  color: 'var(--linkvesta-dark-blue)',
                  fontSize: '1rem'
                }}>
                  Quarterly Sector Reports
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" fill="var(--linkvesta-dark-blue)"/>
                </svg>
                <span style={{
                  color: 'var(--linkvesta-dark-blue)',
                  fontSize: '1rem'
                }}>
                  Direct Founder Intros
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

