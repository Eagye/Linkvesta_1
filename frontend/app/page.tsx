'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ 
      width: '100%',
      backgroundColor: 'var(--linkvesta-white)'
    }}>
      {/* Hero Section */}
      <section style={{
        padding: '6rem 2rem',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.02) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0'
      }}>
        <div style={{
          maxWidth: '900px',
          width: '100%',
          textAlign: 'center'
        }}>
          {/* Tagline */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--linkvesta-gold)',
            color: 'var(--linkvesta-dark-blue)',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '2rem'
          }}>
            <span>🇬🇭</span>
            <span>BUILT FOR GHANA'S FUTURE</span>
          </div>

          {/* Main Headline */}
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 'bold',
            color: 'var(--linkvesta-dark-blue)',
            margin: '0 0 1.5rem 0',
            lineHeight: '1.2',
            letterSpacing: '-0.02em'
          }}>
            Connecting Ghanaian Businesses to Investors Who Believe in Their Potential.
          </h1>

          {/* Description */}
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: '#6b7280',
            margin: '0 auto 3rem auto',
            lineHeight: '1.6',
            maxWidth: '700px'
          }}>
            A trusted digital platform bridging high-growth African businesses with global and local capital.
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link
              href="/register/form?type=investor"
              style={{
                backgroundColor: 'var(--linkvesta-gold)',
                color: 'var(--linkvesta-dark-blue)',
                padding: '1rem 2rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.2s',
                display: 'inline-block'
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
              Join as an Investor
            </Link>
            <Link
              href="/register/form?type=startup"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--linkvesta-dark-blue)',
                padding: '1rem 2rem',
                border: '2px solid var(--linkvesta-dark-blue)',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.2s',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--linkvesta-dark-blue)';
                e.currentTarget.style.color = 'var(--linkvesta-white)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--linkvesta-dark-blue)';
              }}
            >
              Join as a Business
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
