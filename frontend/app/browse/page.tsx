'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Business {
  id: number;
  name: string;
  category: string;
  description: string;
  categoryColor: string;
}

export default function BrowsePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [joiningWaitlist, setJoiningWaitlist] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    fetchBusinesses();
    // Scroll to top when page loads
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const fetchBusinesses = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await axios.get(`${apiUrl}/api/businesses`, {
        timeout: 5000, // 5 second timeout
        validateStatus: (status) => status < 500 // Don't throw on 4xx errors
      });
      
      if (response.data && Array.isArray(response.data)) {
        setBusinesses(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Error fetching businesses:', error);
      // Fallback to default businesses if API fails
      setBusinesses([
        {
          id: 1,
          name: 'AgriFlow Tech',
          category: 'Agri-Tech',
          description: 'Digitizing farm-to-market logistics in Northern Ghana.',
          categoryColor: '#10b981'
        },
        {
          id: 2,
          name: 'PaySwift Africa',
          category: 'Fintech',
          description: 'Cross-border payments for SME intra-Africa trade.',
          categoryColor: '#3b82f6'
        },
        {
          id: 3,
          name: 'HealthConnect',
          category: 'Health-Tech',
          description: 'Telemedicine platform connecting rural clinics to specialists.',
          categoryColor: '#ef4444'
        },
        {
          id: 4,
          name: 'Solarify',
          category: 'Energy',
          description: 'Pay-as-you-go solar solutions for off-grid communities.',
          categoryColor: '#fbbf24'
        },
        {
          id: 5,
          name: 'EduLearn',
          category: 'Ed-Tech',
          description: 'AI-driven personalized learning for WASSCE students.',
          categoryColor: '#a855f7'
        },
        {
          id: 6,
          name: 'LogiTrak',
          category: 'Logistics',
          description: 'Last-mile delivery infrastructure for e-commerce.',
          categoryColor: '#6b7280'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWaitlistClick = (businessId: number) => {
    setSelectedBusiness(businessId);
    setShowModal(true);
    setEmail('');
    setName('');
  };

  const handleJoinWaitlist = async () => {
    if (!selectedBusiness || !email) {
      alert('Please enter your email');
      return;
    }

    setJoiningWaitlist(selectedBusiness);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      await axios.post(`${apiUrl}/api/waitlist`, {
        businessId: selectedBusiness,
        email,
        name: name || undefined
      });
      alert('Successfully joined the waitlist!');
      setShowModal(false);
      setEmail('');
      setName('');
      setSelectedBusiness(null);
    } catch (error: any) {
      console.error('Error joining waitlist:', error);
      if (error.response?.status === 409) {
        alert('You are already on the waitlist for this business.');
      } else {
        alert('Failed to join waitlist. Please try again.');
      }
    } finally {
      setJoiningWaitlist(null);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Agri-Tech': '#10b981',
      'Fintech': '#3b82f6',
      'Health-Tech': '#ef4444',
      'Energy': '#fbbf24',
      'Ed-Tech': '#a855f7',
      'Logistics': '#6b7280'
    };
    return colors[category] || '#6b7280';
  };

  const filteredBusinesses = filter === 'all' 
    ? businesses 
    : businesses.filter(b => b.category === filter);

  const categories = businesses.length > 0 
    ? ['all', ...Array.from(new Set(businesses.map(b => b.category)))]
    : ['all'];

  return (
    <main style={{
      minHeight: 'calc(100vh - 200px)',
      backgroundColor: 'var(--linkvesta-white)',
      padding: '3rem 2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{
          color: 'var(--linkvesta-dark-blue)',
          fontSize: '2.5rem',
          marginBottom: '1rem',
          fontWeight: 'bold'
        }}>
          Browse Businesses
        </h1>
        <p style={{
          color: 'var(--linkvesta-dark-blue)',
          fontSize: '1.125rem',
          marginBottom: '2rem',
          opacity: 0.8
        }}>
          Discover high-growth African businesses seeking investment
        </p>

        {/* Filter */}
        {!loading && businesses.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '20px',
                border: '2px solid',
                borderColor: filter === category ? 'var(--linkvesta-gold)' : '#e5e7eb',
                backgroundColor: filter === category ? 'var(--linkvesta-gold)' : 'transparent',
                color: filter === category ? 'var(--linkvesta-dark-blue)' : 'var(--linkvesta-dark-blue)',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {category}
            </button>
          ))}
        </div>
        )}

        {loading ? (
          <div style={{ color: 'var(--linkvesta-dark-blue)', fontSize: '1.25rem', textAlign: 'center', padding: '3rem' }}>
            Loading businesses...
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div style={{ color: 'var(--linkvesta-dark-blue)', fontSize: '1.25rem', textAlign: 'center', padding: '3rem' }}>
            No businesses found
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {filteredBusinesses.map((business) => (
              <div
                key={business.id}
                style={{
                  backgroundColor: 'var(--linkvesta-white)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.5rem',
                  color: '#9ca3af',
                  fontSize: '0.875rem'
                }}>
                  Logo
                </div>
                
                <h3 style={{
                  color: 'var(--linkvesta-dark-blue)',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  margin: 0
                }}>
                  {business.name}
                </h3>

                <div style={{
                  display: 'inline-block',
                  backgroundColor: business.categoryColor || getCategoryColor(business.category),
                  color: 'var(--linkvesta-white)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  width: 'fit-content'
                }}>
                  {business.category}
                </div>

                <p style={{
                  color: 'var(--linkvesta-dark-blue)',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  opacity: 0.8,
                  margin: 0,
                  flex: 1
                }}>
                  {business.description}
                </p>

                <button
                  onClick={() => handleJoinWaitlistClick(business.id)}
                  disabled={joiningWaitlist === business.id}
                  style={{
                    backgroundColor: 'var(--linkvesta-gold)',
                    color: 'var(--linkvesta-dark-blue)',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: joiningWaitlist === business.id ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.2s',
                    opacity: joiningWaitlist === business.id ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (joiningWaitlist !== business.id) {
                      e.currentTarget.style.opacity = '0.9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (joiningWaitlist !== business.id) {
                      e.currentTarget.style.opacity = '1';
                    }
                  }}
                >
                  {joiningWaitlist === business.id ? 'Joining...' : 'Join Waitlist to View'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--linkvesta-white)',
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: 0
            }}>
              Join Waitlist
            </h2>
            <p style={{
              color: 'var(--linkvesta-dark-blue)',
              opacity: 0.8,
              margin: 0
            }}>
              Enter your details to join the waitlist and get early access to view this business.
            </p>
            <input
              type="email"
              placeholder="Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                padding: '0.875rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                color: 'var(--linkvesta-dark-blue)'
              }}
            />
            <input
              type="text"
              placeholder="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                padding: '0.875rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                color: 'var(--linkvesta-dark-blue)'
              }}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  color: 'var(--linkvesta-dark-blue)',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleJoinWaitlist}
                disabled={joiningWaitlist !== null || !email}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: 'var(--linkvesta-gold)',
                  color: 'var(--linkvesta-dark-blue)',
                  cursor: joiningWaitlist !== null || !email ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  opacity: joiningWaitlist !== null || !email ? 0.6 : 1
                }}
              >
                {joiningWaitlist !== null ? 'Joining...' : 'Join Waitlist'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

