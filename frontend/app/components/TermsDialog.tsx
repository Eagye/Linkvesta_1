'use client';

import { useState, useRef, useEffect } from 'react';

interface TermsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

export default function TermsDialog({ isOpen, onClose, onAgree }: TermsDialogProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
      // Reset scroll position when dialog opens
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [isOpen]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      // Check if user has scrolled to bottom (with 50px threshold)
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        setHasScrolledToBottom(true);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--linkvesta-white)',
          borderRadius: '12px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: 'var(--linkvesta-dark-blue)',
          color: 'var(--linkvesta-white)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            margin: 0,
            marginBottom: '0.25rem'
          }}>
            Terms and Conditions
          </h2>
          <p style={{
            fontSize: '0.875rem',
            opacity: 0.9,
            margin: 0
          }}>
            Linkvesta Platform • Last Updated: 6th January 2026
          </p>
        </div>

        {/* Scrollable Content */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '2rem',
            backgroundColor: 'var(--linkvesta-white)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Section 1 */}
            <section>
              <h3 style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem'
              }}>
                1. Introduction
              </h3>
              <p style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '0.9375rem',
                lineHeight: '1.7',
                opacity: 0.9
              }}>
                Welcome to Linkvesta (&quot;Platform&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). Linkvesta is a digital platform designed to connect vetted startups and small-to-medium enterprises (SMEs) with potential investors. By accessing or using the Linkvesta website, services, or any related applications (collectively, the &quot;Services&quot;), you agree to be bound by these Terms and Conditions (&quot;Terms&quot;). If you do not agree to these Terms, you must not use the Platform. These Terms are governed by the laws of the Republic of Ghana.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h3 style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem'
              }}>
                2. Definitions
              </h3>
              <div style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '0.9375rem',
                lineHeight: '1.7',
                opacity: 0.9
              }}>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>User</strong> refers to any individual or entity that registers on or accesses the Platform.
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Investor</strong> refers to any user who uses the Platform to discover, evaluate, or engage with businesses for investment purposes.
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Startup / SME</strong> refers to any business entity that registers on the Platform seeking funding or investor engagement.
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Admin</strong> refers to authorized personnel managing and vetting Platform activities.
                </p>
                <p>
                  <strong>Content</strong> includes all data, documents, pitch decks, profiles, text, and materials uploaded to the Platform.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h3 style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem'
              }}>
                3. Eligibility
              </h3>
              <p style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '0.9375rem',
                lineHeight: '1.7',
                opacity: 0.9
              }}>
                To use Linkvesta, you must be at least 18 years old, have the legal capacity to enter into binding agreements, and businesses must have authority to represent the entity they register. Linkvesta reserves the right to refuse access or terminate accounts at its discretion.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h3 style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem'
              }}>
                4. Account Registration and Responsibilities
              </h3>
              <p style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '0.9375rem',
                lineHeight: '1.7',
                opacity: 0.9
              }}>
                Users must provide accurate and up-to-date information during registration. Users are responsible for maintaining the confidentiality of login credentials and all activities conducted under their account. Linkvesta is not liable for losses arising from unauthorized access.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h3 style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem'
              }}>
                5. Platform Role and Disclaimer
              </h3>
              <p style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '0.9375rem',
                lineHeight: '1.7',
                opacity: 0.9
              }}>
                Linkvesta acts solely as a facilitator connecting investors and businesses. Linkvesta does not provide investment advice and does not guarantee funding or business performance. All investment decisions are made at the sole discretion and risk of users.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h3 style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem'
              }}>
                6. Business Vetting and Listings
              </h3>
              <p style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '0.9375rem',
                lineHeight: '1.7',
                opacity: 0.9
              }}>
                All Startup/SME submissions are subject to a vetting process. Approval does not constitute endorsement or guarantee. Linkvesta may approve, reject, or request additional information at its discretion.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h3 style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem'
              }}>
                7. Investor Obligations
              </h3>
              <p style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '0.9375rem',
                lineHeight: '1.7',
                opacity: 0.9
              }}>
                Investors agree to conduct independent due diligence, comply with applicable financial and tax obligations, and respect confidentiality of business information accessed via the Platform.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h3 style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem'
              }}>
                8. Fees and Payments
              </h3>
              <p style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '0.9375rem',
                lineHeight: '1.7',
                opacity: 0.9
              }}>
                Certain services may be subject to fees. Fees are non-refundable unless expressly stated otherwise. Linkvesta reserves the right to modify pricing with prior notice.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h3 style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem'
              }}>
                9. User Content and Intellectual Property
              </h3>
              <p style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '0.9375rem',
                lineHeight: '1.7',
                opacity: 0.9
              }}>
                Users retain ownership of content uploaded but grant Linkvesta a non-exclusive, royalty-free license to host and display content for platform operations. Prohibited content includes misleading or unlawful material.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h3 style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem'
              }}>
                10. Confidentiality
              </h3>
              <p style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '0.9375rem',
                lineHeight: '1.7',
                opacity: 0.9
              }}>
                Users agree to treat non-public information as confidential. This obligation survives account termination.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h3 style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem'
              }}>
                11. Data Protection and Privacy
              </h3>
              <p style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '0.9375rem',
                lineHeight: '1.7',
                opacity: 0.9
              }}>
                Linkvesta processes personal data in accordance with the Ghana Data Protection Act, 2012 (Act 843).
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h3 style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem'
              }}>
                12. Prohibited Activities
              </h3>
              <p style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '0.9375rem',
                lineHeight: '1.7',
                opacity: 0.9
              }}>
                Users must not use the Platform for unlawful purposes, bypass security features, or defraud other users.
              </p>
            </section>

            {/* Section 13 */}
            <section>
              <h3 style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem'
              }}>
                13. Suspension and Termination
              </h3>
              <p style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '0.9375rem',
                lineHeight: '1.7',
                opacity: 0.9
              }}>
                Linkvesta may suspend or terminate accounts for breach of these Terms, suspected fraud, or legal requirements. Users may deactivate accounts through dashboard settings.
              </p>
            </section>

            {/* Section 14 */}
            <section>
              <h3 style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem'
              }}>
                14. Limitation of Liability
              </h3>
              <p style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '0.9375rem',
                lineHeight: '1.7',
                opacity: 0.9
              }}>
                Linkvesta is not liable for indirect, incidental, or consequential damages, including investment losses, to the fullest extent permitted under Ghanaian law.
              </p>
            </section>

            {/* Section 15 */}
            <section>
              <h3 style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem'
              }}>
                15. Indemnification
              </h3>
              <p style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '0.9375rem',
                lineHeight: '1.7',
                opacity: 0.9
              }}>
                Users agree to indemnify and hold harmless Linkvesta from claims arising from use of the Platform or violation of these Terms.
              </p>
            </section>

            {/* Section 16 */}
            <section>
              <h3 style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem'
              }}>
                16. Modifications to Terms
              </h3>
              <p style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '0.9375rem',
                lineHeight: '1.7',
                opacity: 0.9
              }}>
                Linkvesta may update these Terms from time to time. Continued use of the Platform constitutes acceptance of updated Terms.
              </p>
            </section>

            {/* Section 17 */}
            <section>
              <h3 style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem'
              }}>
                17. Governing Law and Jurisdiction
              </h3>
              <p style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '0.9375rem',
                lineHeight: '1.7',
                opacity: 0.9
              }}>
                These Terms are governed by the laws of the Republic of Ghana. Disputes shall be resolved exclusively in the courts of Ghana.
              </p>
            </section>

            {/* Section 18 */}
            <section>
              <h3 style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem'
              }}>
                18. Contact Information
              </h3>
              <div style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '0.9375rem',
                lineHeight: '1.7',
                opacity: 0.9
              }}>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Linkvesta</strong>
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                  Email: <a href="mailto:Linkvestagh@gmail.com" style={{ color: 'var(--linkvesta-gold)', textDecoration: 'none' }}>Linkvestagh@gmail.com</a>
                </p>
                <p>
                  Address: Accra, Ghana
                </p>
              </div>
            </section>

            {/* Scroll indicator */}
            {!hasScrolledToBottom && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#92400e',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                ⬇️ Please scroll to the bottom to continue
              </div>
            )}
          </div>
        </div>

        {/* Footer with buttons */}
        <div style={{
          padding: '1.5rem 2rem',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              color: 'var(--linkvesta-dark-blue)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Cancel
          </button>
          <button
            onClick={onAgree}
            disabled={!hasScrolledToBottom}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: hasScrolledToBottom ? 'var(--linkvesta-gold)' : '#d1d5db',
              color: hasScrolledToBottom ? 'var(--linkvesta-dark-blue)' : '#9ca3af',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              fontWeight: '600',
              cursor: hasScrolledToBottom ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (hasScrolledToBottom) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (hasScrolledToBottom) {
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
}
