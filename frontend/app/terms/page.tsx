'use client';

export default function TermsPage() {
  return (
    <main style={{
      minHeight: 'calc(100vh - 200px)',
      backgroundColor: 'var(--linkvesta-white)',
      padding: '3rem 2rem'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{
          color: 'var(--linkvesta-dark-blue)',
          fontSize: '2.5rem',
          marginBottom: '0.5rem',
          fontWeight: 'bold'
        }}>
          TERMS AND CONDITIONS
        </h1>
        <p style={{
          color: 'var(--linkvesta-dark-blue)',
          fontSize: '1rem',
          marginBottom: '3rem',
          opacity: 0.7,
          fontStyle: 'italic'
        }}>
          Linkvesta Platform<br />
          Last Updated: 6th January 2026
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Section 1 */}
          <section>
            <h2 style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              1. Introduction
            </h2>
            <p style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1rem',
              lineHeight: '1.8',
              opacity: 0.9
            }}>
              Welcome to Linkvesta ("Platform", "we", "our", or "us"). Linkvesta is a digital platform designed to connect vetted startups and small-to-medium enterprises (SMEs) with potential investors. By accessing or using the Linkvesta website, services, or any related applications (collectively, the "Services"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, you must not use the Platform. These Terms are governed by the laws of the Republic of Ghana.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              2. Definitions
            </h2>
            <div style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1rem',
              lineHeight: '1.8',
              opacity: 0.9
            }}>
              <p style={{ marginBottom: '0.75rem' }}>
                <strong>User</strong> refers to any individual or entity that registers on or accesses the Platform.
              </p>
              <p style={{ marginBottom: '0.75rem' }}>
                <strong>Investor</strong> refers to any user who uses the Platform to discover, evaluate, or engage with businesses for investment purposes.
              </p>
              <p style={{ marginBottom: '0.75rem' }}>
                <strong>Startup / SME</strong> refers to any business entity that registers on the Platform seeking funding or investor engagement.
              </p>
              <p style={{ marginBottom: '0.75rem' }}>
                <strong>Admin</strong> refers to authorized personnel managing and vetting Platform activities.
              </p>
              <p>
                <strong>Content</strong> includes all data, documents, pitch decks, profiles, text, and materials uploaded to the Platform.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              3. Eligibility
            </h2>
            <p style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1rem',
              lineHeight: '1.8',
              opacity: 0.9
            }}>
              To use Linkvesta, you must be at least 18 years old, have the legal capacity to enter into binding agreements, and businesses must have authority to represent the entity they register. Linkvesta reserves the right to refuse access or terminate accounts at its discretion.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              4. Account Registration and Responsibilities
            </h2>
            <p style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1rem',
              lineHeight: '1.8',
              opacity: 0.9
            }}>
              Users must provide accurate and up-to-date information during registration. Users are responsible for maintaining the confidentiality of login credentials and all activities conducted under their account. Linkvesta is not liable for losses arising from unauthorized access.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              5. Platform Role and Disclaimer
            </h2>
            <p style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1rem',
              lineHeight: '1.8',
              opacity: 0.9
            }}>
              Linkvesta acts solely as a facilitator connecting investors and businesses. Linkvesta does not provide investment advice and does not guarantee funding or business performance. All investment decisions are made at the sole discretion and risk of users.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              6. Business Vetting and Listings
            </h2>
            <p style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1rem',
              lineHeight: '1.8',
              opacity: 0.9
            }}>
              All Startup/SME submissions are subject to a vetting process. Approval does not constitute endorsement or guarantee. Linkvesta may approve, reject, or request additional information at its discretion.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              7. Investor Obligations
            </h2>
            <p style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1rem',
              lineHeight: '1.8',
              opacity: 0.9
            }}>
              Investors agree to conduct independent due diligence, comply with applicable financial and tax obligations, and respect confidentiality of business information accessed via the Platform.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              8. Fees and Payments
            </h2>
            <p style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1rem',
              lineHeight: '1.8',
              opacity: 0.9
            }}>
              Certain services may be subject to fees. Fees are non-refundable unless expressly stated otherwise. Linkvesta reserves the right to modify pricing with prior notice.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              9. User Content and Intellectual Property
            </h2>
            <p style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1rem',
              lineHeight: '1.8',
              opacity: 0.9
            }}>
              Users retain ownership of content uploaded but grant Linkvesta a non-exclusive, royalty-free license to host and display content for platform operations. Prohibited content includes misleading or unlawful material.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              10. Confidentiality
            </h2>
            <p style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1rem',
              lineHeight: '1.8',
              opacity: 0.9
            }}>
              Users agree to treat non-public information as confidential. This obligation survives account termination.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              11. Data Protection and Privacy
            </h2>
            <p style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1rem',
              lineHeight: '1.8',
              opacity: 0.9
            }}>
              Linkvesta processes personal data in accordance with the Ghana Data Protection Act, 2012 (Act 843).
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              12. Prohibited Activities
            </h2>
            <p style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1rem',
              lineHeight: '1.8',
              opacity: 0.9
            }}>
              Users must not use the Platform for unlawful purposes, bypass security features, or defraud other users.
            </p>
          </section>

          {/* Section 13 */}
          <section>
            <h2 style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              13. Suspension and Termination
            </h2>
            <p style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1rem',
              lineHeight: '1.8',
              opacity: 0.9
            }}>
              Linkvesta may suspend or terminate accounts for breach of these Terms, suspected fraud, or legal requirements. Users may deactivate accounts through dashboard settings.
            </p>
          </section>

          {/* Section 14 */}
          <section>
            <h2 style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              14. Limitation of Liability
            </h2>
            <p style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1rem',
              lineHeight: '1.8',
              opacity: 0.9
            }}>
              Linkvesta is not liable for indirect, incidental, or consequential damages, including investment losses, to the fullest extent permitted under Ghanaian law.
            </p>
          </section>

          {/* Section 15 */}
          <section>
            <h2 style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              15. Indemnification
            </h2>
            <p style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1rem',
              lineHeight: '1.8',
              opacity: 0.9
            }}>
              Users agree to indemnify and hold harmless Linkvesta from claims arising from use of the Platform or violation of these Terms.
            </p>
          </section>

          {/* Section 16 */}
          <section>
            <h2 style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              16. Modifications to Terms
            </h2>
            <p style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1rem',
              lineHeight: '1.8',
              opacity: 0.9
            }}>
              Linkvesta may update these Terms from time to time. Continued use of the Platform constitutes acceptance of updated Terms.
            </p>
          </section>

          {/* Section 17 */}
          <section>
            <h2 style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              17. Governing Law and Jurisdiction
            </h2>
            <p style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1rem',
              lineHeight: '1.8',
              opacity: 0.9
            }}>
              These Terms are governed by the laws of the Republic of Ghana. Disputes shall be resolved exclusively in the courts of Ghana.
            </p>
          </section>

          {/* Section 18 */}
          <section>
            <h2 style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              18. Contact Information
            </h2>
            <div style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1rem',
              lineHeight: '1.8',
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
        </div>

        <div style={{
          marginTop: '4rem',
          padding: '2rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{
            color: 'var(--linkvesta-dark-blue)',
            fontSize: '1rem',
            marginBottom: '1rem'
          }}>
            Questions about these Terms?
          </p>
          <a
            href="/contact"
            style={{
              backgroundColor: 'var(--linkvesta-gold)',
              color: 'var(--linkvesta-dark-blue)',
              padding: '0.75rem 2rem',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: '600',
              display: 'inline-block',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Contact Us
          </a>
        </div>
      </div>
    </main>
  );
}
