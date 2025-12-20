'use client';

export default function FAQPage() {
  const faqs = [
    {
      question: 'How does LinkVesta work?',
      answer: 'LinkVesta connects high-growth African businesses with investors. Businesses can list their opportunities, and investors can browse and join waitlists to access detailed information about investment opportunities.'
    },
    {
      question: 'How do I join a waitlist?',
      answer: 'Simply click the "Join Waitlist to View" button on any business listing. You\'ll need to provide your email address. Once you\'re on the waitlist, you\'ll receive updates and early access to view detailed business information.'
    },
    {
      question: 'What information will I receive?',
      answer: 'Once you join a waitlist, you\'ll receive access to detailed business information including financials, growth metrics, market analysis, and investment terms. You\'ll also be notified about updates and opportunities.'
    },
    {
      question: 'Is there a fee to join the waitlist?',
      answer: 'No, joining the waitlist is completely free. There are no fees for investors to browse businesses and join waitlists.'
    },
    {
      question: 'How do I invest in a business?',
      answer: 'After joining a waitlist and reviewing the business details, you can contact the business directly through LinkVesta to discuss investment opportunities and terms.'
    },
    {
      question: 'What types of businesses are listed?',
      answer: 'LinkVesta focuses on high-growth African businesses across various sectors including Energy, Ed-Tech, Logistics, FinTech, Healthcare, and more. All businesses are vetted for growth potential and investment readiness.'
    },
    {
      question: 'How do I list my business?',
      answer: 'Businesses can get started by contacting us through the "Get in Touch" button. Our team will guide you through the listing process and help you prepare your business profile for investors.'
    },
    {
      question: 'Is my information secure?',
      answer: 'Yes, we take data security seriously. Your email and personal information are protected and will only be used to communicate about waitlist updates and investment opportunities.'
    }
  ];

  return (
    <main style={{
      minHeight: 'calc(100vh - 200px)',
      backgroundColor: 'var(--linkvesta-white)',
      padding: '3rem 2rem'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{
          color: 'var(--linkvesta-dark-blue)',
          fontSize: '2.5rem',
          marginBottom: '1rem',
          fontWeight: 'bold'
        }}>
          FAQ for Investors
        </h1>
        <p style={{
          color: 'var(--linkvesta-dark-blue)',
          fontSize: '1.125rem',
          marginBottom: '3rem',
          opacity: 0.8
        }}>
          Frequently asked questions about investing through LinkVesta
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {faqs.map((faq, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1.5rem',
                backgroundColor: 'var(--linkvesta-white)'
              }}
            >
              <h3 style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem'
              }}>
                {faq.question}
              </h3>
              <p style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1rem',
                lineHeight: '1.6',
                opacity: 0.8,
                margin: 0
              }}>
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '3rem',
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
            Still have questions?
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
            Get in Touch
          </a>
        </div>
      </div>
    </main>
  );
}

