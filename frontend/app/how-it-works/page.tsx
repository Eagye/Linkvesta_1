'use client';

import { useState } from 'react';

export default function HowItWorksPage() {
  const [viewMode, setViewMode] = useState<'businesses' | 'investors'>('businesses');

  const businessSteps = [
    {
      number: 1,
      title: 'Submit',
      description: 'Complete our comprehensive application form detailing your business model.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H20" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 13H8" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round"/>
          <path d="M16 17H8" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round"/>
          <path d="M10 9H9H8" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      number: 2,
      title: 'Get Screened',
      description: 'Our analysts vet your financials and traction against our criteria.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="8" stroke="#ff6b35" strokeWidth="2"/>
          <path d="M21 21L16.65 16.65" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H20" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 11H14" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      number: 3,
      title: 'Visibility',
      description: 'Gain access to the exclusive Investor Dashboard.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="3" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      number: 4,
      title: 'Connect',
      description: 'Receive intro requests from interested investors.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  const investorSteps = [
    {
      number: 1,
      title: 'Browse',
      description: 'Explore verified high-growth businesses across various sectors.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="7" height="7" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="14" y="3" width="7" height="7" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="14" y="14" width="7" height="7" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="3" y="14" width="7" height="7" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      number: 2,
      title: 'Join Waitlist',
      description: 'Join the waitlist to access detailed business information and updates.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20 8V14" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M23 11H17" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      number: 3,
      title: 'Review Details',
      description: 'Access comprehensive financials, growth metrics, and market analysis.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H20" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 13H8" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round"/>
          <path d="M16 17H8" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round"/>
          <path d="M10 9H8" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      number: 4,
      title: 'Invest',
      description: 'Connect with founders and negotiate investment terms directly.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  const steps = viewMode === 'businesses' ? businessSteps : investorSteps;

  return (
    <main style={{
      minHeight: 'calc(100vh - 200px)',
      backgroundColor: 'var(--linkvesta-white)',
      padding: '4rem 2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Title Section */}
        <h1 style={{
          color: 'var(--linkvesta-dark-blue)',
          fontSize: '2.5rem',
          marginBottom: '1rem',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          How It Works
        </h1>
        <p style={{
          color: 'var(--linkvesta-dark-blue)',
          fontSize: '1.125rem',
          marginBottom: '3rem',
          textAlign: 'center',
          opacity: 0.8
        }}>
          Whether you are seeking capital or looking to deploy it, our process is streamlined for efficiency and trust.
        </p>

        {/* Toggle Buttons */}
        <div style={{
          display: 'flex',
          gap: '0',
          marginBottom: '3rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          padding: '4px'
        }}>
          <button
            onClick={() => setViewMode('businesses')}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: viewMode === 'businesses' ? 'var(--linkvesta-dark-blue)' : 'transparent',
              color: viewMode === 'businesses' ? 'var(--linkvesta-white)' : 'var(--linkvesta-dark-blue)',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            For Businesses
          </button>
          <button
            onClick={() => setViewMode('investors')}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: viewMode === 'investors' ? 'var(--linkvesta-dark-blue)' : 'transparent',
              color: viewMode === 'investors' ? 'var(--linkvesta-white)' : 'var(--linkvesta-dark-blue)',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            For Investors
          </button>
        </div>

        {/* Steps Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          width: '100%',
          maxWidth: '1000px'
        }}>
          {steps.map((step) => (
            <div
              key={step.number}
              style={{
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                border: '1px solid #e5e7eb'
              }}
            >
              {/* Icon with Number Badge */}
              <div style={{
                position: 'relative',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ff6b35'
                }}>
                  {step.icon}
                </div>
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#ff6b35',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  {step.number}
                </div>
              </div>

              {/* Step Title */}
              <h3 style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem'
              }}>
                {step.title}
              </h3>

              {/* Step Description */}
              <p style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '0.9375rem',
                opacity: 0.8,
                lineHeight: '1.5'
              }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

