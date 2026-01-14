'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiService } from '@/src/lib/api';
import { authService } from '@/src/lib/auth';
// Toast notifications removed - all actions logged to console only

interface Business {
  id: number;
  name: string;
  category: string;
  description: string;
  categoryColor: string;
  logoUrl?: string;
  approved?: boolean;
  createdAt?: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  phoneNumber?: string;
  country?: string;
  accountType?: string;
  tin?: string;
  businessRegistrationDocument?: string;
  role: string;
  createdAt: string;
}

interface Investor {
  id: number;
  userId: number;
  email: string;
  name: string;
  phoneNumber?: string;
  country?: string;
  approved: boolean;
  approvedAt?: string;
  approvedBy?: number;
  rejectionReason?: string;
  createdAt: string;
  emailVerified: boolean;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [createAdminLoading, setCreateAdminLoading] = useState(false);
  const [createAdminError, setCreateAdminError] = useState('');
  const [createAdminSuccess, setCreateAdminSuccess] = useState('');
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [showInvestorDetails, setShowInvestorDetails] = useState(false);
  // Toast notifications removed - all actions logged to console only
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [businessToReject, setBusinessToReject] = useState<{ id: number; name: string } | null>(null);
  const [showInvestorRejectConfirm, setShowInvestorRejectConfirm] = useState(false);
  const [investorToReject, setInvestorToReject] = useState<{ id: number; name: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeSection, setActiveSection] = useState<'businesses' | 'investors' | 'users' | null>(null);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [editBusinessForm, setEditBusinessForm] = useState({
    description: '',
    category: 'Other'
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<{ id: number; name: string } | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [showBusinessWizard, setShowBusinessWizard] = useState(false);
  const [selectedBusinessForWizard, setSelectedBusinessForWizard] = useState<Business | null>(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardDescription, setWizardDescription] = useState('');
  const [wizardCategory, setWizardCategory] = useState('Other');

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // Load user info and businesses
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.menu-dropdown-container')) {
        setShowMenuDropdown(false);
      }
    };

    if (showMenuDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenuDropdown]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }
      
      // Load businesses and users separately to handle errors gracefully
      const errors: string[] = [];
      
      try {
        console.log('Fetching businesses with token:', token ? 'Token present' : 'No token');
        const businessesData = await apiService.getAllBusinesses(token);
        console.log('Businesses data received:', businessesData);
        setBusinesses(businessesData || []);
      } catch (err: any) {
        console.error('Error loading businesses:', err);
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);
        const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
        errors.push(`Businesses: ${errorMsg}`);
        setBusinesses([]);
      }

      try {
        const usersData = await apiService.getAllUsers(token);
        // Filter out empty strings and convert to undefined for optional fields
        const processedUsers = usersData.map((user: any) => ({
          ...user,
          phoneNumber: user.phoneNumber && user.phoneNumber.trim() ? user.phoneNumber : undefined,
          country: user.country && user.country.trim() ? user.country : undefined,
          tin: user.tin && user.tin.trim() ? user.tin : undefined,
          businessRegistrationDocument: user.businessRegistrationDocument && user.businessRegistrationDocument.trim() ? user.businessRegistrationDocument : undefined,
        }));
        setUsers(processedUsers);
      } catch (err: any) {
        console.error('Error loading users:', err);
        const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
        errors.push(`Users: ${errorMsg}`);
        setUsers([]);
      }

      try {
        const investorsData = await apiService.getAllInvestors(token);
        setInvestors(investorsData || []);
      } catch (err: any) {
        console.error('Error loading investors:', err);
        const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
        errors.push(`Investors: ${errorMsg}`);
        setInvestors([]);
      }
      
      // Set error message if any errors occurred
      if (errors.length > 0) {
        setError(`Failed to load data: ${errors.join('; ')}`);
      } else {
      setError('');
      }
    } catch (err: any) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Silent error handling - log to console only, no user-facing messages
  const logAction = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (type === 'error') {
      console.error(`[Admin Action] ${message}`);
    } else if (type === 'success') {
      console.log(`[Admin Action] ${message}`);
    } else {
      console.info(`[Admin Action] ${message}`);
    }
  };

  const handleUpdateBusiness = async (businessId: number) => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      if (!editBusinessForm.description.trim()) {
        logAction('Business description is required', 'error');
        return;
      }

      if (!editBusinessForm.category || editBusinessForm.category === 'Other') {
        logAction('Business category must be selected', 'error');
        return;
      }

      await apiService.updateBusiness(businessId, editBusinessForm.description.trim(), editBusinessForm.category, token);
      logAction(`Business details updated for business ID ${businessId}`, 'success');
      setEditingBusiness(null);
      setEditBusinessForm({ description: '', category: 'Other' });
      await loadDashboard();
    } catch (err: any) {
      console.error('[Business Update] Error:', err);
      logAction(`Failed to update business: ${err.response?.data?.error || 'Unknown error'}`, 'error');
    }
  };

  const handleApproveBusiness = async (businessId: number) => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }
      const response = await apiService.approveBusiness(businessId, token);
      logAction(`Business ID ${businessId} approved successfully`, 'success');
      await loadDashboard();
      setError('');
    } catch (err: any) {
      console.error('[Business Approval] Error:', err);
      logAction(`Business approval failed: ${err.response?.data?.error || 'Unknown error'}`, 'error');
      setError('');
    }
  };

  const handleRejectBusiness = (businessId: number) => {
    // Find the business to show in confirmation
    const business = businesses.find(b => b.id === businessId);
    if (business) {
      setBusinessToReject({ id: businessId, name: business.name });
      setShowRejectConfirm(true);
    }
  };

  const handleDeleteBusiness = (businessId: number) => {
    const business = businesses.find(b => b.id === businessId);
    if (business) {
      setBusinessToDelete({ id: businessId, name: business.name });
      setShowDeleteConfirm(true);
    }
  };

  const confirmDeleteBusiness = async () => {
    if (!businessToDelete) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }
      
      await apiService.deleteBusiness(businessToDelete.id, deleteReason, token);
      logAction(`Business ID ${businessToDelete.id} (${businessToDelete.name}) deleted and archived`, 'success');
      setShowDeleteConfirm(false);
      setBusinessToDelete(null);
      setDeleteReason('');
      await loadDashboard();
    } catch (err: any) {
      console.error('[Business Deletion] Error:', err);
      logAction(`Business deletion failed: ${err.response?.data?.error || 'Unknown error'}`, 'error');
    }
  };

  const handleApproveInvestor = async (investorId: number) => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }
      await apiService.approveInvestor(investorId, token);
      logAction(`Investor ID ${investorId} approved successfully`, 'success');
      await loadDashboard();
      setError('');
    } catch (err: any) {
      console.error('[Investor Approval] Error:', err);
      logAction(`Investor approval failed: ${err.response?.data?.error || 'Unknown error'}`, 'error');
      setError('');
    }
  };

  const handleRejectInvestor = (investorId: number) => {
    const investor = investors.find(i => i.id === investorId);
    if (investor) {
      setInvestorToReject({ id: investorId, name: investor.name });
      setShowInvestorRejectConfirm(true);
      setRejectionReason('');
    }
  };

  const confirmRejectInvestor = async () => {
    if (!investorToReject) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }
      await apiService.rejectInvestor(investorToReject.id, rejectionReason || 'Account rejected by administrator', token);
      logAction(`Investor ID ${investorToReject.id} rejected`, 'success');
      setShowInvestorRejectConfirm(false);
      setInvestorToReject(null);
      setRejectionReason('');
      await loadDashboard();
      setError('');
    } catch (err: any) {
      console.error('[Investor Rejection] Error:', err);
      logAction(`Investor rejection failed: ${err.response?.data?.error || 'Unknown error'}`, 'error');
      setError('');
    }
  };

  const confirmRejectBusiness = async () => {
    if (!businessToReject) return;
    
    setShowRejectConfirm(false);
    
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }
      await apiService.rejectBusiness(businessToReject.id, token);
      logAction(`Business ID ${businessToReject.id} rejected and removed`, 'success');
      await loadDashboard();
      setError('');
      setBusinessToReject(null);
    } catch (err: any) {
      console.error('[Business Rejection] Error:', err);
      logAction(`Business rejection failed: ${err.response?.data?.error || 'Unknown error'}`, 'error');
      setError('');
      setBusinessToReject(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
    router.refresh();
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateAdminError('');
    setCreateAdminSuccess('');

    if (adminForm.password !== adminForm.confirmPassword) {
      setCreateAdminError('Passwords do not match');
      return;
    }

    if (adminForm.password.length < 8) {
      setCreateAdminError('Password must be at least 8 characters long');
      return;
    }

    setCreateAdminLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      await authService.createAdmin(
        adminForm.email,
        adminForm.password,
        adminForm.name || undefined,
        token
      );

      setCreateAdminSuccess('Admin account created successfully!');
      setAdminForm({ name: '', email: '', password: '', confirmPassword: '' });
      setTimeout(() => {
        setShowCreateAdmin(false);
        setCreateAdminSuccess('');
      }, 2000);
    } catch (err: any) {
      setCreateAdminError(err.response?.data?.error || 'Failed to create admin account');
    } finally {
      setCreateAdminLoading(false);
    }
  };

  return (
    <>
      {/* Toast notifications removed - all actions logged to console only */}

      {/* Reject Confirmation Modal */}
      {showRejectConfirm && businessToReject && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
          onClick={() => {
            setShowRejectConfirm(false);
            setBusinessToReject(null);
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h2 style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'var(--linkvesta-dark-blue)'
              }}>
                Confirm Rejection
              </h2>
              </div>
              <button
                onClick={() => {
                  setShowRejectConfirm(false);
                  setBusinessToReject(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <p style={{
              color: '#6b7280',
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '1.5rem'
            }}>
              Are you sure you want to reject and remove <strong style={{ color: 'var(--linkvesta-dark-blue)' }}>&quot;{businessToReject.name}&quot;</strong>?
            </p>

            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{
                margin: 0,
                fontSize: '0.875rem',
                color: '#991b1b',
                lineHeight: '1.6'
              }}>
                <strong>This action will permanently:</strong>
              </p>
              <ul style={{
                margin: '0.5rem 0 0 0',
                paddingLeft: '1.5rem',
                fontSize: '0.875rem',
                color: '#991b1b',
                lineHeight: '1.8'
              }}>
                <li>Remove the business from the platform</li>
                <li>Delete the associated user registration</li>
                <li>Remove any uploaded documents</li>
              </ul>
              <p style={{
                margin: '0.75rem 0 0 0',
                fontSize: '0.875rem',
                color: '#991b1b',
                fontWeight: '600'
              }}>
                This action cannot be undone.
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowRejectConfirm(false);
                  setBusinessToReject(null);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmRejectBusiness}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ef4444';
                }}
              >
                Yes, Reject and Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Investor Reject Confirmation Modal */}
      {showInvestorRejectConfirm && investorToReject && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
          onClick={() => {
            setShowInvestorRejectConfirm(false);
            setInvestorToReject(null);
            setRejectionReason('');
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h2 style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'var(--linkvesta-dark-blue)'
              }}>
                Reject Investor
              </h2>
              </div>
              <button
                onClick={() => {
                  setShowInvestorRejectConfirm(false);
                  setInvestorToReject(null);
                  setRejectionReason('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <p style={{
              color: '#6b7280',
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '1.5rem'
            }}>
              Are you sure you want to reject <strong style={{ color: 'var(--linkvesta-dark-blue)' }}>&quot;{investorToReject.name}&quot;</strong>?
            </p>

            <div style={{
              marginBottom: '1.5rem'
            }}>
              <label style={{
                display: 'block',
                color: '#6b7280',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Rejection Reason (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection (this will be shown to the investor)..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{
                margin: 0,
                fontSize: '0.875rem',
                color: '#991b1b',
                lineHeight: '1.6'
              }}>
                <strong>This action will:</strong>
              </p>
              <ul style={{
                margin: '0.5rem 0 0 0',
                paddingLeft: '1.5rem',
                fontSize: '0.875rem',
                color: '#991b1b',
                lineHeight: '1.8'
              }}>
                <li>Mark the investor account as rejected</li>
                <li>Prevent the investor from logging in</li>
                <li>Show the rejection reason when they try to log in</li>
              </ul>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowInvestorRejectConfirm(false);
                  setInvestorToReject(null);
                  setRejectionReason('');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmRejectInvestor}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ef4444';
                }}
              >
                Reject Investor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Business Confirmation Modal */}
      {showDeleteConfirm && businessToDelete && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
          onClick={() => {
            setShowDeleteConfirm(false);
            setBusinessToDelete(null);
            setDeleteReason('');
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </div>
                <h2 style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'var(--linkvesta-dark-blue)'
                }}>
                  Delete Business
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setBusinessToDelete(null);
                  setDeleteReason('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <p style={{
              color: '#6b7280',
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '1.5rem'
            }}>
              Are you sure you want to delete <strong style={{ color: 'var(--linkvesta-dark-blue)' }}>&quot;{businessToDelete.name}&quot;</strong>?
            </p>

            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{
                margin: 0,
                fontSize: '0.875rem',
                color: '#991b1b',
                lineHeight: '1.6'
              }}>
                <strong>This action will:</strong>
              </p>
              <ul style={{
                margin: '0.5rem 0 0 0',
                paddingLeft: '1.5rem',
                fontSize: '0.875rem',
                color: '#991b1b',
                lineHeight: '1.8'
              }}>
                <li>Remove the business from the main website</li>
                <li>Archive all business information to reports for future reference</li>
                <li>Preserve deletion timestamp and reason</li>
              </ul>
              <p style={{
                margin: '0.75rem 0 0 0',
                fontSize: '0.875rem',
                color: '#991b1b',
                fontWeight: '600'
              }}>
                The business data will be saved in reports and can be referenced later.
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: '#6b7280',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Deletion Reason (Optional)
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Enter reason for deletion (optional)..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--linkvesta-dark-blue)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26, 35, 50, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setBusinessToDelete(null);
                  setDeleteReason('');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteBusiness}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }}
              >
                Delete & Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Business Modal */}
      {editingBusiness && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
          onClick={() => {
            setEditingBusiness(null);
            setEditBusinessForm({ description: '', category: 'Other' });
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </div>
                <h2 style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'var(--linkvesta-dark-blue)'
                }}>
                  Edit Business Details
                </h2>
              </div>
              <button
                onClick={() => {
                  setEditingBusiness(null);
                  setEditBusinessForm({ description: '', category: 'Other' });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <p style={{
              color: '#6b7280',
              fontSize: '0.9375rem',
              lineHeight: '1.6',
              marginBottom: '1.5rem'
            }}>
              Update the description and category for <strong style={{ color: 'var(--linkvesta-dark-blue)' }}>&quot;{editingBusiness.name}&quot;</strong>. These fields are required before approval.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--linkvesta-dark-blue)',
                marginBottom: '0.5rem'
              }}>
                Business Category <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={editBusinessForm.category}
                onChange={(e) => setEditBusinessForm({ ...editBusinessForm, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  color: 'var(--linkvesta-dark-blue)',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--linkvesta-dark-blue)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26, 35, 50, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="Other">Other</option>
                <option value="Agri-Tech">Agri-Tech</option>
                <option value="Fintech">Fintech</option>
                <option value="Health-Tech">Health-Tech</option>
                <option value="Energy">Energy</option>
                <option value="Ed-Tech">Ed-Tech</option>
                <option value="Logistics">Logistics</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--linkvesta-dark-blue)',
                marginBottom: '0.5rem'
              }}>
                Business Description <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                value={editBusinessForm.description}
                onChange={(e) => setEditBusinessForm({ ...editBusinessForm, description: e.target.value })}
                placeholder="Enter a detailed description of the business..."
                rows={6}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  color: 'var(--linkvesta-dark-blue)',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--linkvesta-dark-blue)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26, 35, 50, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <p style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.75rem',
                color: '#6b7280'
              }}>
                This description will be displayed on the main website for investors to see.
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setEditingBusiness(null);
                  setEditBusinessForm({ description: '', category: 'Other' });
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateBusiness(editingBusiness.id)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Business Approval Wizard */}
      {showBusinessWizard && selectedBusinessForWizard && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem',
            animation: 'fadeIn 0.3s ease-in-out'
          }}
          onClick={() => {
            if (wizardStep === 1) {
              setShowBusinessWizard(false);
              setSelectedBusinessForWizard(null);
              setWizardStep(1);
              setWizardDescription('');
            }
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              animation: wizardStep === 1 ? 'slideInUp 0.4s ease-out' : 'slideInRight 0.4s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress Indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              marginBottom: '2rem',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '10%',
                right: '10%',
                height: '2px',
                backgroundColor: '#e5e7eb',
                zIndex: 0
              }} />
              {[1, 2].map((step) => (
                <div key={step} style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: wizardStep >= step ? 'var(--linkvesta-dark-blue)' : '#e5e7eb',
                    color: wizardStep >= step ? 'white' : '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    transition: 'all 0.3s ease',
                    boxShadow: wizardStep === step ? '0 0 0 4px rgba(26, 35, 50, 0.1)' : 'none'
                  }}>
                    {wizardStep > step ? '✓' : step}
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    color: wizardStep >= step ? 'var(--linkvesta-dark-blue)' : '#9ca3af',
                    fontWeight: wizardStep === step ? '600' : '400'
                  }}>
                    {step === 1 ? 'Edit Details' : 'Approve/Reject'}
                  </span>
                </div>
              ))}
            </div>

            {/* Step 1: Edit Business Details */}
            {wizardStep === 1 && (
              <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'var(--linkvesta-dark-blue)',
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}>
                  Edit Business Details
                </h2>
                
                <div style={{
                  display: 'grid',
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <div>
                    <label style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#6b7280',
                      marginBottom: '0.5rem',
                      display: 'block'
                    }}>Business Name</label>
                    <div style={{
                      padding: '1rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      color: 'var(--linkvesta-dark-blue)',
                      fontWeight: '500'
                    }}>
                      {selectedBusinessForWizard.name}
                    </div>
                  </div>

                  <div>
                    <label style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--linkvesta-dark-blue)',
                      marginBottom: '0.5rem',
                      display: 'block'
                    }}>
                      Category <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      value={wizardCategory}
                      onChange={(e) => setWizardCategory(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.9375rem',
                        color: 'var(--linkvesta-dark-blue)',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--linkvesta-dark-blue)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26, 35, 50, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <option value="Other">Other</option>
                      <option value="Agri-Tech">Agri-Tech</option>
                      <option value="Fintech">Fintech</option>
                      <option value="Health-Tech">Health-Tech</option>
                      <option value="Energy">Energy</option>
                      <option value="Ed-Tech">Ed-Tech</option>
                      <option value="Logistics">Logistics</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--linkvesta-dark-blue)',
                      marginBottom: '0.5rem',
                      display: 'block'
                    }}>
                      Description <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea
                      value={wizardDescription}
                      onChange={(e) => setWizardDescription(e.target.value)}
                      placeholder="Enter business description..."
                      style={{
                        width: '100%',
                        minHeight: '200px',
                        padding: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        color: 'var(--linkvesta-dark-blue)',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--linkvesta-dark-blue)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26, 35, 50, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {selectedBusinessForWizard.createdAt && (
                    <div>
                      <label style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#6b7280',
                        marginBottom: '0.5rem',
                        display: 'block'
                      }}>Created At</label>
                      <div style={{
                        padding: '1rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        color: '#6b7280'
                      }}>
                        {new Date(selectedBusinessForWizard.createdAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '1rem'
                }}>
                  <button
                    onClick={() => {
                      setShowBusinessWizard(false);
                      setSelectedBusinessForWizard(null);
                      setWizardStep(1);
                      setWizardDescription('');
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'transparent',
                      color: '#6b7280',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (wizardDescription.trim() && wizardCategory) {
                        setWizardStep(2);
                      }
                    }}
                    disabled={!wizardDescription.trim() || !wizardCategory}
                    style={{
                      padding: '0.75rem 2rem',
                      backgroundColor: (wizardDescription.trim() && wizardCategory) ? 'var(--linkvesta-dark-blue)' : '#9ca3af',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: (wizardDescription.trim() && wizardCategory) ? 'pointer' : 'not-allowed',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: (wizardDescription.trim() && wizardCategory) ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (wizardDescription.trim() && wizardCategory) {
                        e.currentTarget.style.transform = 'translateX(5px)';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (wizardDescription.trim() && wizardCategory) {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                      }
                    }}
                  >
                    Next
                    <span style={{
                      marginLeft: '0.5rem',
                      display: 'inline-block',
                      transition: 'transform 0.3s ease'
                    }}>→</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Approve or Reject */}
            {wizardStep === 2 && (
              <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'var(--linkvesta-dark-blue)',
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}>
                  Review & Decision
                </h2>
                
                <div style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#6b7280',
                      marginBottom: '0.5rem',
                      display: 'block'
                    }}>Business Name</label>
                    <div style={{
                      fontSize: '1rem',
                      color: 'var(--linkvesta-dark-blue)',
                      fontWeight: '500'
                    }}>
                      {selectedBusinessForWizard.name}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#6b7280',
                      marginBottom: '0.5rem',
                      display: 'block'
                    }}>Category</label>
                    <div style={{
                      fontSize: '0.95rem',
                      color: '#374151',
                      fontWeight: '500'
                    }}>
                      {wizardCategory}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#6b7280',
                      marginBottom: '0.5rem',
                      display: 'block'
                    }}>Description</label>
                    <div style={{
                      fontSize: '0.95rem',
                      color: '#374151',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {wizardDescription}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}>
                  <button
                    onClick={() => setWizardStep(1)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'transparent',
                      color: '#6b7280',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    ← Back
                  </button>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('admin_token');
                          if (!token) {
                            router.push('/admin/login');
                            return;
                          }
                          
                          // Update description and category if changed
                          if (wizardDescription.trim() !== (selectedBusinessForWizard.description || '') || 
                              wizardCategory !== selectedBusinessForWizard.category) {
                            await apiService.updateBusiness(
                              selectedBusinessForWizard.id,
                              wizardDescription.trim(),
                              wizardCategory,
                              token
                            );
                          }
                          
                          // Reject business
                          handleRejectBusiness(selectedBusinessForWizard.id);
                          setShowBusinessWizard(false);
                          setSelectedBusinessForWizard(null);
                          setWizardStep(1);
                          setWizardDescription('');
                          setWizardCategory('Other');
                        } catch (err: any) {
                          console.error('Error rejecting business:', err);
                        }
                      }}
                      style={{
                        padding: '0.75rem 2rem',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#dc2626';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ef4444';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      Reject
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('admin_token');
                          if (!token) {
                            router.push('/admin/login');
                            return;
                          }
                          
                          // Update description and category if changed
                          if (wizardDescription.trim() !== (selectedBusinessForWizard.description || '') || 
                              wizardCategory !== selectedBusinessForWizard.category) {
                            await apiService.updateBusiness(
                              selectedBusinessForWizard.id,
                              wizardDescription.trim(),
                              wizardCategory,
                              token
                            );
                          }
                          
                          // Approve business
                          await handleApproveBusiness(selectedBusinessForWizard.id);
                          setShowBusinessWizard(false);
                          setSelectedBusinessForWizard(null);
                          setWizardStep(1);
                          setWizardDescription('');
                          setWizardCategory('Other');
                        } catch (err: any) {
                          console.error('Error approving business:', err);
                        }
                      }}
                      style={{
                        padding: '0.75rem 2rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#059669';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#10b981';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'var(--linkvesta-dark-blue)',
        color: 'var(--linkvesta-white)',
        padding: '1.5rem 2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: 0,
              letterSpacing: '-0.02em'
            }}>
              Admin Dashboard
            </h1>
          </div>
          <div style={{ position: 'relative' }} className="menu-dropdown-container">
          <button
              onClick={() => setShowMenuDropdown(!showMenuDropdown)}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: 'var(--linkvesta-white)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
              Menu
            </button>
            
            {showMenuDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)',
                minWidth: '200px',
                zIndex: 1000,
                overflow: 'hidden',
                border: '1px solid #e5e7eb'
              }}>
                <button
                  onClick={() => {
                    setActiveSection('investors');
                    setShowMenuDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1.25rem',
                    backgroundColor: activeSection === 'investors' ? '#f3f4f6' : 'transparent',
                    color: 'var(--linkvesta-dark-blue)',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: activeSection === 'investors' ? '600' : '400',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== 'investors') {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== 'investors') {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  Investors
                </button>
                
                <button
                  onClick={() => {
                    setActiveSection('businesses');
                    setShowMenuDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1.25rem',
                    backgroundColor: activeSection === 'businesses' ? '#f3f4f6' : 'transparent',
                    color: 'var(--linkvesta-dark-blue)',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: activeSection === 'businesses' ? '600' : '400',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'background-color 0.2s',
                    borderTop: '1px solid #e5e7eb',
                    borderBottom: '1px solid #e5e7eb'
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== 'businesses') {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== 'businesses') {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  Businesses
                </button>
                
                <button
                  onClick={() => {
                    setShowMenuDropdown(false);
                    handleLogout();
                  }}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1.25rem',
                    backgroundColor: 'transparent',
                    color: '#dc2626',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fef2f2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
            Logout
          </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1400px',
        margin: '2rem auto',
        padding: '0 2rem'
      }}>
        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            marginBottom: '2rem',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '0.5rem' }}>{error}</div>
              <button
                onClick={() => loadDashboard()}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Create Admin Section */}
        <div style={{
          backgroundColor: 'var(--linkvesta-white)',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: showCreateAdmin ? '1.5rem' : '0'
          }}>
            <div>
              <h2 style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.25rem',
                fontWeight: '600',
                margin: '0 0 0.25rem 0'
              }}>
                Admin Management
              </h2>
              <p style={{
                color: '#6b7280',
                fontSize: '0.875rem',
                margin: 0
              }}>
                Create new admin accounts
              </p>
            </div>
            <button
              onClick={() => {
                setShowCreateAdmin(!showCreateAdmin);
                setCreateAdminError('');
                setCreateAdminSuccess('');
              }}
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: 'var(--linkvesta-dark-blue)',
                color: 'var(--linkvesta-white)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2a3441';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--linkvesta-dark-blue)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {showCreateAdmin ? 'Cancel' : '+ Create Admin'}
            </button>
          </div>

          {showCreateAdmin && (
            <form onSubmit={handleCreateAdmin}>
              {createAdminError && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  padding: '0.875rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: '1px solid #fecaca',
                  fontSize: '0.875rem'
                }}>
                  {createAdminError}
                </div>
              )}
              {createAdminSuccess && (
                <div style={{
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  padding: '0.875rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: '1px solid #bbf7d0',
                  fontSize: '0.875rem'
                }}>
                  {createAdminSuccess}
                </div>
              )}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    color: 'var(--linkvesta-dark-blue)',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={adminForm.name}
                    onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.625rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Admin Name"
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    color: 'var(--linkvesta-dark-blue)',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.625rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    color: 'var(--linkvesta-dark-blue)',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.625rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Min 8 characters"
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    color: 'var(--linkvesta-dark-blue)',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={adminForm.confirmPassword}
                    onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.625rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Confirm password"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={createAdminLoading}
                style={{
                  padding: '0.625rem 1.5rem',
                  backgroundColor: createAdminLoading ? '#9ca3af' : 'var(--linkvesta-dark-blue)',
                  color: 'var(--linkvesta-white)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: createAdminLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                {createAdminLoading ? 'Creating...' : 'Create Admin'}
              </button>
            </form>
          )}
        </div>

        {/* Dashboard Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: 'var(--linkvesta-white)',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e5e7eb',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: '#667eea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 style={{
                color: '#6b7280',
                fontSize: '0.875rem',
                fontWeight: '600',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Total Businesses
              </h3>
            </div>
            <p style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '2.5rem',
              fontWeight: '700',
              margin: 0,
              lineHeight: 1
            }}>
              {loading ? (
                <span style={{ opacity: 0.5 }}>...</span>
              ) : (
                businesses.length
              )}
            </p>
          </div>

          {/* Investors Stats Card */}
          <div style={{
            backgroundColor: 'var(--linkvesta-white)',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e5e7eb',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <h3 style={{
                color: '#6b7280',
                fontSize: '0.875rem',
                fontWeight: '600',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Total Investors
              </h3>
            </div>
            <p style={{
              color: 'var(--linkvesta-dark-blue)',
              fontSize: '2.5rem',
              fontWeight: '700',
              margin: 0,
              lineHeight: 1
            }}>
              {loading ? (
                <span style={{ opacity: 0.5 }}>...</span>
              ) : (
                investors.length
              )}
            </p>
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              marginTop: '1rem',
              fontSize: '0.875rem'
            }}>
              <span style={{ color: '#10b981', fontWeight: '500' }}>
                Approved: {investors.filter(i => i.approved).length}
              </span>
              <span style={{ color: '#f59e0b', fontWeight: '500' }}>
                Pending: {investors.filter(i => !i.approved).length}
              </span>
            </div>
          </div>
        </div>



        {/* Businesses List */}
        {activeSection === 'businesses' && (
        <div style={{
          backgroundColor: 'var(--linkvesta-white)',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '1.75rem 2rem',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0,
                letterSpacing: '-0.02em'
              }}>
                Businesses
              </h2>
              <p style={{
                color: '#6b7280',
                fontSize: '0.875rem',
                margin: '0.5rem 0 0 0'
              }}>
                Manage and approve registered businesses
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: '0.5rem'
            }}>
              <span style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                backgroundColor: '#dbeafe',
                color: '#1e40af'
              }}>
                Approved: {businesses.filter(b => b.approved).length}
              </span>
              <span style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                backgroundColor: '#fef3c7',
                color: '#92400e'
              }}>
                Pending: {businesses.filter(b => !b.approved).length}
              </span>
            </div>
          </div>

          {loading ? (
            <div style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <div style={{
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '3px solid #e5e7eb',
                borderTopColor: 'var(--linkvesta-dark-blue)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '1rem'
              }} />
              <p style={{ margin: 0, fontSize: '0.95rem' }}>Loading businesses...</p>
            </div>
          ) : businesses.length === 0 ? (
            <div style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3, marginBottom: '1rem' }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>No businesses found</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', opacity: 0.7 }}>Businesses will appear here once registered</p>
            </div>
          ) : (
            <div>
              {businesses.map((business, index) => (
                <div
                  key={business.id}
                  onClick={() => {
                    // Find the user associated with this business
                    let associatedUser = null;
                    
                    if (business.description) {
                      const emailMatch = business.description.match(/submitted by\s+([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
                      if (emailMatch && emailMatch[1]) {
                        const email = emailMatch[1].toLowerCase().trim();
                        associatedUser = users.find(u => 
                          u.accountType === 'startup' && 
                          u.email?.toLowerCase().trim() === email
                        );
                      }
                    }
                    
                    if (!associatedUser) {
                      associatedUser = users.find(u => 
                        u.accountType === 'startup' && 
                        u.name?.toLowerCase().trim() === business.name?.toLowerCase().trim()
                      );
                    }
                    
                    if (associatedUser) {
                      setSelectedUser(associatedUser);
                      setShowUserDetails(true);
                    } else {
                      console.warn(`[Business Details] User details not found for business "${business.name}". This may occur if the user was deleted, the business was created manually, or there is a data mismatch.`);
                    }
                  }}
                  style={{
                    padding: '1.5rem 2rem',
                    borderBottom: index < businesses.length - 1 ? '1px solid #e5e7eb' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    transition: 'background-color 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: business.categoryColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '1.5rem',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    flexShrink: 0
                  }}>
                    {business.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '0.375rem'
                    }}>
                      <h3 style={{
                        color: 'var(--linkvesta-dark-blue)',
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        margin: 0,
                        letterSpacing: '-0.01em'
                      }}>
                        {business.name}
                      </h3>
                      {business.approved ? (
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: '#d1fae5',
                          color: '#065f46'
                        }}>
                          Approved
                        </span>
                      ) : (
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: '#fef3c7',
                          color: '#92400e'
                        }}>
                          Pending
                        </span>
                      )}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '0.375rem'
                    }}>
                      <span style={{
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        {business.category}
                      </span>
                    </div>
                    {business.description && (
                      <p style={{
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        margin: '0 0 0.75rem 0',
                        lineHeight: 1.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {business.description}
                      </p>
                    )}
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginTop: '0.5rem',
                      flexWrap: 'wrap'
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Find the user associated with this business
                          let associatedUser = null;
                          
                          if (business.description) {
                            const emailMatch = business.description.match(/submitted by\s+([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
                            if (emailMatch && emailMatch[1]) {
                              const email = emailMatch[1].toLowerCase().trim();
                              associatedUser = users.find(u => 
                                u.accountType === 'startup' && 
                                u.email?.toLowerCase().trim() === email
                              );
                            }
                          }
                          
                          if (!associatedUser) {
                            associatedUser = users.find(u => 
                              u.accountType === 'startup' && 
                              u.name?.toLowerCase().trim() === business.name?.toLowerCase().trim()
                            );
                          }
                          
                          if (associatedUser) {
                            setSelectedUser(associatedUser);
                            setShowUserDetails(true);
                          } else {
                            console.warn(`[Business Details] User details not found for business "${business.name}". This may occur if the user was deleted, the business was created manually, or there is a data mismatch.`);
                          }
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: 'var(--linkvesta-dark-blue)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#1e293b';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--linkvesta-dark-blue)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        View Details
                      </button>
                      {!business.approved && (
                        <>
                          <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Start the approval wizard for pending businesses
                            setSelectedBusinessForWizard(business);
                            setWizardDescription(business.description || '');
                            setWizardCategory(business.category || 'Other');
                            setWizardStep(1);
                            setShowBusinessWizard(true);
                          }}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: 'var(--linkvesta-gold)',
                              color: 'var(--linkvesta-dark-blue)',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fbbf24';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--linkvesta-gold)';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 11l3 3L22 4"></path>
                              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                            </svg>
                            Review & Approve
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBusiness(business.id);
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#dc2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#b91c1c';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#dc2626';
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {business.approved && (
                        <button
                          onClick={() => handleDeleteBusiness(business.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#b91c1c';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#dc2626';
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Investors List */}
        {activeSection === 'investors' && (
        <div style={{
          backgroundColor: 'var(--linkvesta-white)',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          marginTop: '2rem'
        }}>
          <div style={{
            padding: '1.75rem 2rem',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0,
                letterSpacing: '-0.02em'
              }}>
                Investors
              </h2>
              <p style={{
                color: '#6b7280',
                fontSize: '0.875rem',
                margin: '0.5rem 0 0 0'
              }}>
                Review and approve investor registrations
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: '0.5rem'
            }}>
              <span style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                backgroundColor: '#dbeafe',
                color: '#1e40af'
              }}>
                Approved: {investors.filter(i => i.approved).length}
              </span>
              <span style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                backgroundColor: '#fef3c7',
                color: '#92400e'
              }}>
                Pending: {investors.filter(i => !i.approved).length}
              </span>
            </div>
          </div>

          {loading ? (
            <div style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <div style={{
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '3px solid #e5e7eb',
                borderTopColor: 'var(--linkvesta-dark-blue)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '1rem'
              }} />
              <p style={{ margin: 0, fontSize: '0.95rem' }}>Loading investors...</p>
            </div>
          ) : investors.length === 0 ? (
            <div style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3, marginBottom: '1rem' }}>
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>No investors found</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', opacity: 0.7 }}>Investor registrations will appear here</p>
            </div>
          ) : (
            <div>
              {investors.map((investor, index) => (
                <div
                  key={investor.id}
                  onClick={() => {
                    setSelectedInvestor(investor);
                    setShowInvestorDetails(true);
                  }}
                  style={{
                    padding: '1.5rem 2rem',
                    borderBottom: index < investors.length - 1 ? '1px solid #e5e7eb' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    transition: 'background-color 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '1.5rem',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    flexShrink: 0
                  }}>
                    {investor.name ? investor.name.charAt(0).toUpperCase() : investor.email.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      color: 'var(--linkvesta-dark-blue)',
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      margin: '0 0 0.25rem 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {investor.name || 'No name provided'}
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      margin: '0 0 0.5rem 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {investor.email}
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      flexWrap: 'wrap',
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      {investor.phoneNumber && (
                        <span>📞 {investor.phoneNumber}</span>
                      )}
                      {investor.country && (
                        <span>🌍 {investor.country}</span>
                      )}
                      <span style={{
                        color: investor.emailVerified ? '#10b981' : '#ef4444',
                        fontWeight: '500'
                      }}>
                        {investor.emailVerified ? '✓ Email Verified' : '✗ Email Not Verified'}
                      </span>
                      <span style={{
                        color: investor.approved ? '#10b981' : '#f59e0b',
                        fontWeight: '500'
                      }}>
                        {investor.approved ? '✓ Approved' : '⏳ Pending Approval'}
                      </span>
                      {investor.rejectionReason && (
                        <span style={{ color: '#ef4444' }}>
                          ❌ Rejected: {investor.rejectionReason}
                        </span>
                      )}
                    </div>
                    {investor.createdAt && (
                      <p style={{
                        color: '#9ca3af',
                        fontSize: '0.75rem',
                        margin: '0.5rem 0 0 0'
                      }}>
                        Registered: {new Date(investor.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexShrink: 0
                  }}>
                    {!investor.approved && (
                      <>
                        <button
                          onClick={() => handleApproveInvestor(investor.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#059669';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#10b981';
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectInvestor(investor.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#dc2626';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ef4444';
                          }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {investor.approved && (
                      <span style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        ✓ Approved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Registered Users List */}
        {activeSection === 'users' && (
        <div style={{
          backgroundColor: 'var(--linkvesta-white)',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          marginTop: '2rem'
        }}>
          <div style={{
            padding: '1.75rem 2rem',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{
                color: 'var(--linkvesta-dark-blue)',
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0,
                letterSpacing: '-0.02em'
              }}>
                Registered Users
              </h2>
              <p style={{
                color: '#6b7280',
                fontSize: '0.875rem',
                margin: '0.5rem 0 0 0'
              }}>
                View all user registrations and their information
              </p>
            </div>
            <span style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '500',
              backgroundColor: '#dbeafe',
              color: '#1e40af'
            }}>
              Total: {users.length}
            </span>
          </div>

          {loading ? (
            <div style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <p style={{ margin: 0 }}>No registered users yet</p>
            </div>
          ) : (
            <div>
              {users.map((user, index) => (
                <div
                  key={user.id}
                  style={{
                    padding: '1.5rem 2rem',
                    borderBottom: index < users.length - 1 ? '1px solid #e5e7eb' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.5rem'
                      }}>
                        <h3 style={{
                          color: 'var(--linkvesta-dark-blue)',
                          fontSize: '1.125rem',
                          fontWeight: '600',
                          margin: 0,
                          letterSpacing: '-0.01em'
                        }}>
                          {user.name || 'No Name'}
                        </h3>
                        {user.accountType && (
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: 
                              user.accountType === 'investor' ? '#dbeafe' : 
                              user.accountType === 'startup' ? '#fef3c7' : 
                              '#e5e7eb',
                            color: 
                              user.accountType === 'investor' ? '#1e40af' : 
                              user.accountType === 'startup' ? '#92400e' : 
                              '#374151'
                          }}>
                            {user.accountType === 'investor' ? '💼 Investor' : 
                             user.accountType === 'startup' ? '🚀 Startup/SME' : 
                             '👤 User'}
                          </span>
                        )}
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '0.75rem',
                        marginTop: '0.5rem'
                      }}>
                        <div>
                          <p style={{
                            color: '#6b7280',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            margin: '0 0 0.25rem 0',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Email
                          </p>
                          <p style={{
                            color: 'var(--linkvesta-dark-blue)',
                            fontSize: '0.875rem',
                            margin: 0
                          }}>
                            {user.email}
                          </p>
                        </div>
                        {user.phoneNumber && (
                          <div>
                            <p style={{
                              color: '#6b7280',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              margin: '0 0 0.25rem 0',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              Phone
                            </p>
                            <p style={{
                              color: 'var(--linkvesta-dark-blue)',
                              fontSize: '0.875rem',
                              margin: 0
                            }}>
                              {user.phoneNumber}
                            </p>
                          </div>
                        )}
                        {user.country && (
                          <div>
                            <p style={{
                              color: '#6b7280',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              margin: '0 0 0.25rem 0',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              Country
                            </p>
                            <p style={{
                              color: 'var(--linkvesta-dark-blue)',
                              fontSize: '0.875rem',
                              margin: 0
                            }}>
                              {user.country}
                            </p>
                          </div>
                        )}
                        {user.createdAt && (
                          <div>
                            <p style={{
                              color: '#6b7280',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              margin: '0 0 0.25rem 0',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              Registered
                            </p>
                            <p style={{
                              color: 'var(--linkvesta-dark-blue)',
                              fontSize: '0.875rem',
                              margin: 0
                            }}>
                              {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginTop: '0.75rem'
                      }}>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDetails(true);
                          }}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: 'var(--linkvesta-dark-blue)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#1e293b';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--linkvesta-dark-blue)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* User Details Modal */}
        {showUserDetails && selectedUser && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}
          onClick={() => {
            setShowUserDetails(false);
            setSelectedUser(null);
          }}
          >
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                padding: '1.5rem 2rem',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f9fafb'
              }}>
                <div>
                  <h2 style={{
                    color: 'var(--linkvesta-dark-blue)',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    margin: 0,
                    letterSpacing: '-0.02em'
                  }}>
                    User Registration Details
                  </h2>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    margin: '0.25rem 0 0 0'
                  }}>
                    Review all submitted information and requirements
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowUserDetails(false);
                    setSelectedUser(null);
                  }}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    minWidth: '32px',
                    minHeight: '32px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.color = '#374151';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                  title="Close"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ padding: '2rem' }}>
                {/* Account Type Badge */}
                <div style={{ marginBottom: '2rem' }}>
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    backgroundColor: 
                      selectedUser.accountType === 'investor' ? '#dbeafe' : 
                      selectedUser.accountType === 'startup' ? '#fef3c7' : 
                      '#e5e7eb',
                    color: 
                      selectedUser.accountType === 'investor' ? '#1e40af' : 
                      selectedUser.accountType === 'startup' ? '#92400e' : 
                      '#374151'
                  }}>
                    {selectedUser.accountType === 'investor' ? '💼 Investor' : 
                     selectedUser.accountType === 'startup' ? '🚀 Startup/SME' : 
                     '👤 User'}
                  </span>
                </div>

                {/* Personal Information */}
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{
                    color: 'var(--linkvesta-dark-blue)',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    margin: '0 0 1rem 0',
                    paddingBottom: '0.5rem',
                    borderBottom: '2px solid #e5e7eb'
                  }}>
                    Personal Information
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem'
                  }}>
                    <div>
                      <p style={{
                        color: '#6b7280',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        margin: '0 0 0.5rem 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Full Name
                      </p>
                      <p style={{
                        color: 'var(--linkvesta-dark-blue)',
                        fontSize: '1rem',
                        fontWeight: '500',
                        margin: 0
                      }}>
                        {selectedUser.name || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p style={{
                        color: '#6b7280',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        margin: '0 0 0.5rem 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Email Address
                      </p>
                      <p style={{
                        color: 'var(--linkvesta-dark-blue)',
                        fontSize: '1rem',
                        fontWeight: '500',
                        margin: 0
                      }}>
                        {selectedUser.email}
                      </p>
                    </div>
                    {selectedUser.phoneNumber && (
                      <div>
                        <p style={{
                          color: '#6b7280',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          margin: '0 0 0.5rem 0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Phone Number
                        </p>
                        <p style={{
                          color: 'var(--linkvesta-dark-blue)',
                          fontSize: '1rem',
                          fontWeight: '500',
                          margin: 0
                        }}>
                          {selectedUser.phoneNumber}
                        </p>
                      </div>
                    )}
                    {selectedUser.country && (
                      <div>
                        <p style={{
                          color: '#6b7280',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          margin: '0 0 0.5rem 0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Country
                        </p>
                        <p style={{
                          color: 'var(--linkvesta-dark-blue)',
                          fontSize: '1rem',
                          fontWeight: '500',
                          margin: 0
                        }}>
                          {selectedUser.country}
                        </p>
                      </div>
                    )}
                    <div>
                      <p style={{
                        color: '#6b7280',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        margin: '0 0 0.5rem 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Registration Date
                      </p>
                      <p style={{
                        color: 'var(--linkvesta-dark-blue)',
                        fontSize: '1rem',
                        fontWeight: '500',
                        margin: 0
                      }}>
                        {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Business Information (for Startup/SME) */}
                {selectedUser.accountType === 'startup' && (
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{
                      color: 'var(--linkvesta-dark-blue)',
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      margin: '0 0 1rem 0',
                      paddingBottom: '0.5rem',
                      borderBottom: '2px solid #e5e7eb'
                    }}>
                      Business Information
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '1.5rem'
                    }}>
                      {selectedUser.tin && (
                        <div>
                          <p style={{
                            color: '#6b7280',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            margin: '0 0 0.5rem 0',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Tax Identification Number (TIN)
                          </p>
                          <p style={{
                            color: 'var(--linkvesta-dark-blue)',
                            fontSize: '1rem',
                            fontWeight: '500',
                            margin: 0,
                            fontFamily: 'monospace'
                          }}>
                            {selectedUser.tin}
                          </p>
                        </div>
                      )}
                      {selectedUser.businessRegistrationDocument && selectedUser.businessRegistrationDocument.trim() && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <p style={{
                            color: '#6b7280',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            margin: '0 0 0.5rem 0',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Business Registration Document
                          </p>
                          <div style={{
                            padding: '1.5rem',
                            backgroundColor: '#f9fafb',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                              </svg>
                              <span style={{
                                color: 'var(--linkvesta-dark-blue)',
                                fontSize: '1rem',
                                fontWeight: '600'
                              }}>
                                {selectedUser.businessRegistrationDocument.split('/').pop() || 'Business Registration Document.pdf'}
                              </span>
                            </div>
                            <div style={{
                              display: 'flex',
                              gap: '0.75rem',
                              flexWrap: 'wrap'
                            }}>
                              <button
                                onClick={() => {
                                  const pdfUrl = `${typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3002') : 'http://localhost:3002'}${selectedUser.businessRegistrationDocument}`;
                                  window.open(pdfUrl, '_blank', 'noopener,noreferrer');
                                }}
                                style={{
                                  padding: '0.75rem 1.5rem',
                                  backgroundColor: 'var(--linkvesta-gold)',
                                  color: 'var(--linkvesta-dark-blue)',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#f59e0b';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'var(--linkvesta-gold)';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                }}
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                  <polyline points="15 3 21 3 21 9"></polyline>
                                  <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                                Open PDF in New Tab
                              </button>
                              <button
                                onClick={() => setShowPdfViewer(true)}
                                style={{
                                  padding: '0.75rem 1.5rem',
                                  backgroundColor: 'var(--linkvesta-dark-blue)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#1e293b';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'var(--linkvesta-dark-blue)';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                }}
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                View PDF Here
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Requirements Checklist */}
                <div style={{
                  padding: '1.5rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h3 style={{
                    color: 'var(--linkvesta-dark-blue)',
                    fontSize: '1rem',
                    fontWeight: '600',
                    margin: '0 0 1rem 0'
                  }}>
                    Requirements Checklist
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={selectedUser.name ? '#10b981' : '#ef4444'} strokeWidth="2">
                        {selectedUser.name ? (
                          <polyline points="20 6 9 17 4 12"></polyline>
                        ) : (
                          <circle cx="12" cy="12" r="10"></circle>
                        )}
                      </svg>
                      <span style={{ color: selectedUser.name ? '#059669' : '#dc2626', fontSize: '0.875rem' }}>
                        Full Name {selectedUser.name ? '✓' : '✗'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={selectedUser.email ? '#10b981' : '#ef4444'} strokeWidth="2">
                        {selectedUser.email ? (
                          <polyline points="20 6 9 17 4 12"></polyline>
                        ) : (
                          <circle cx="12" cy="12" r="10"></circle>
                        )}
                      </svg>
                      <span style={{ color: selectedUser.email ? '#059669' : '#dc2626', fontSize: '0.875rem' }}>
                        Email Address {selectedUser.email ? '✓' : '✗'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={selectedUser.phoneNumber ? '#10b981' : '#ef4444'} strokeWidth="2">
                        {selectedUser.phoneNumber ? (
                          <polyline points="20 6 9 17 4 12"></polyline>
                        ) : (
                          <circle cx="12" cy="12" r="10"></circle>
                        )}
                      </svg>
                      <span style={{ color: selectedUser.phoneNumber ? '#059669' : '#dc2626', fontSize: '0.875rem' }}>
                        Phone Number {selectedUser.phoneNumber ? '✓' : '✗'}
                      </span>
                    </div>
                    {(selectedUser.accountType === 'investor' || selectedUser.accountType === 'startup') && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={selectedUser.country ? '#10b981' : '#ef4444'} strokeWidth="2">
                          {selectedUser.country ? (
                            <polyline points="20 6 9 17 4 12"></polyline>
                          ) : (
                            <circle cx="12" cy="12" r="10"></circle>
                          )}
                        </svg>
                        <span style={{ color: selectedUser.country ? '#059669' : '#dc2626', fontSize: '0.875rem' }}>
                          Country {selectedUser.country ? '✓' : '✗'}
                        </span>
                      </div>
                    )}
                    {selectedUser.accountType === 'startup' && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={selectedUser.tin ? '#10b981' : '#ef4444'} strokeWidth="2">
                            {selectedUser.tin ? (
                              <polyline points="20 6 9 17 4 12"></polyline>
                            ) : (
                              <circle cx="12" cy="12" r="10"></circle>
                            )}
                          </svg>
                          <span style={{ color: selectedUser.tin ? '#059669' : '#dc2626', fontSize: '0.875rem' }}>
                            Tax Identification Number (TIN) {selectedUser.tin ? '✓' : '✗'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={selectedUser.businessRegistrationDocument ? '#10b981' : '#ef4444'} strokeWidth="2">
                            {selectedUser.businessRegistrationDocument ? (
                              <polyline points="20 6 9 17 4 12"></polyline>
                            ) : (
                              <circle cx="12" cy="12" r="10"></circle>
                            )}
                          </svg>
                          <span style={{ color: selectedUser.businessRegistrationDocument ? '#059669' : '#dc2626', fontSize: '0.875rem' }}>
                            Business Registration Document {selectedUser.businessRegistrationDocument ? '✓' : '✗'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Investor Details Modal */}
        {showInvestorDetails && selectedInvestor && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}
          onClick={() => {
            setShowInvestorDetails(false);
            setSelectedInvestor(null);
          }}
          >
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                padding: '1.5rem 2rem',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f9fafb'
              }}>
                <div>
                  <h2 style={{
                    color: 'var(--linkvesta-dark-blue)',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    margin: 0,
                    letterSpacing: '-0.02em'
                  }}>
                    Investor Details
                  </h2>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    margin: '0.25rem 0 0 0'
                  }}>
                    Review investor registration information
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowInvestorDetails(false);
                    setSelectedInvestor(null);
                  }}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    minWidth: '32px',
                    minHeight: '32px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.color = '#374151';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                  title="Close"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af'
                  }}>
                    💼 Investor Account
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <div>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      margin: '0 0 0.5rem 0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Full Name
                    </p>
                    <p style={{
                      color: 'var(--linkvesta-dark-blue)',
                      fontSize: '1rem',
                      fontWeight: '500',
                      margin: 0
                    }}>
                      {selectedInvestor.name || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      margin: '0 0 0.5rem 0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Email Address
                    </p>
                    <p style={{
                      color: 'var(--linkvesta-dark-blue)',
                      fontSize: '1rem',
                      fontWeight: '500',
                      margin: 0
                    }}>
                      {selectedInvestor.email}
                    </p>
                  </div>

                  {selectedInvestor.phoneNumber && (
                    <div>
                      <p style={{
                        color: '#6b7280',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        margin: '0 0 0.5rem 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Phone Number
                      </p>
                      <p style={{
                        color: 'var(--linkvesta-dark-blue)',
                        fontSize: '1rem',
                        fontWeight: '500',
                        margin: 0
                      }}>
                        {selectedInvestor.phoneNumber}
                      </p>
                    </div>
                  )}

                  {selectedInvestor.country && (
                    <div>
                      <p style={{
                        color: '#6b7280',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        margin: '0 0 0.5rem 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Country
                      </p>
                      <p style={{
                        color: 'var(--linkvesta-dark-blue)',
                        fontSize: '1rem',
                        fontWeight: '500',
                        margin: 0
                      }}>
                        {selectedInvestor.country}
                      </p>
                    </div>
                  )}

                  <div>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      margin: '0 0 0.5rem 0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Registration Date
                    </p>
                    <p style={{
                      color: 'var(--linkvesta-dark-blue)',
                      fontSize: '1rem',
                      fontWeight: '500',
                      margin: 0
                    }}>
                      {new Date(selectedInvestor.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      margin: '0 0 0.5rem 0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Email Verification
                    </p>
                    <p style={{
                      color: selectedInvestor.emailVerified ? '#10b981' : '#ef4444',
                      fontSize: '1rem',
                      fontWeight: '500',
                      margin: 0
                    }}>
                      {selectedInvestor.emailVerified ? '✓ Verified' : '✗ Not Verified'}
                    </p>
                  </div>

                  <div>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      margin: '0 0 0.5rem 0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Approval Status
                    </p>
                    <p style={{
                      color: selectedInvestor.approved ? '#10b981' : '#f59e0b',
                      fontSize: '1rem',
                      fontWeight: '500',
                      margin: 0
                    }}>
                      {selectedInvestor.approved ? '✓ Approved' : '⏳ Pending'}
                    </p>
                  </div>

                  {selectedInvestor.rejectionReason && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <p style={{
                        color: '#6b7280',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        margin: '0 0 0.5rem 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Rejection Reason
                      </p>
                      <p style={{
                        color: '#ef4444',
                        fontSize: '1rem',
                        fontWeight: '500',
                        margin: 0,
                        padding: '1rem',
                        backgroundColor: '#fef2f2',
                        borderRadius: '8px',
                        border: '1px solid #fecaca'
                      }}>
                        {selectedInvestor.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF Viewer Modal */}
        {showPdfViewer && selectedUser?.businessRegistrationDocument && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 2000,
            padding: '1rem'
          }}>
            {/* PDF Viewer Header */}
            <div style={{
              padding: '1rem 1.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              borderRadius: '8px'
            }}>
              <div>
                <h3 style={{
                  color: 'white',
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  margin: 0
                }}>
                  {selectedUser.businessRegistrationDocument.split('/').pop() || 'Business Registration Document.pdf'}
                </h3>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.875rem',
                  margin: '0.25rem 0 0 0'
                }}>
                  {selectedUser.name} - Business Registration Document
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <a
                  href={`${typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3002') : 'http://localhost:3002'}${selectedUser.businessRegistrationDocument}`}
                  download
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download
                </a>
                <button
                  onClick={() => setShowPdfViewer(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Close
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div style={{
              flex: 1,
              backgroundColor: '#1a1a1a',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <iframe
                src={`${typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3002') : 'http://localhost:3002'}${selectedUser.businessRegistrationDocument}`}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                title="Business Registration Document"
              />
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
    </>
  );
}
