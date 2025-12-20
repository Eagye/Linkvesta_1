import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ 
      padding: '4rem 2rem', 
      minHeight: 'calc(100vh - 200px)',
      backgroundColor: 'var(--linkvesta-white)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }}>
      <h1 style={{ 
        color: 'var(--linkvesta-dark-blue)', 
        fontSize: '3rem',
        marginBottom: '1rem',
        fontWeight: 'bold'
      }}>
        Welcome to LinkVesta
      </h1>
      <p style={{ 
        color: 'var(--linkvesta-dark-blue)', 
        fontSize: '1.25rem',
        marginBottom: '2rem',
        opacity: 0.8
      }}>
        Bridging high-growth African businesses with global and local capital.
      </p>
      <Link 
        href="/contact"
        style={{
          backgroundColor: 'var(--linkvesta-gold)',
          color: 'var(--linkvesta-dark-blue)',
          padding: '1rem 2rem',
          borderRadius: '4px',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '1.1rem',
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
      >
        Get Started
      </Link>
    </main>
  );
}

