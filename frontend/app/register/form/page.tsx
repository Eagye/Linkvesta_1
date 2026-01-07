'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/src/lib/auth';
import TermsDialog from '@/app/components/TermsDialog';
import zxcvbn from 'zxcvbn';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accountType = searchParams.get('type') as 'investor' | 'startup' | null;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    country: 'Ghana',
    tin: '',
    businessRegistrationDocument: null as File | null,
    termsAgreed: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; feedback: string[] } | null>(null);

  // Redirect if no account type selected
  useEffect(() => {
    if (!accountType || (accountType !== 'investor' && accountType !== 'startup')) {
      router.push('/register');
    }
  }, [accountType, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Calculate password strength when password changes
    if (name === 'password' && value) {
      const result = zxcvbn(value, [formData.email, formData.fullName].filter(Boolean));
      setPasswordStrength({
        score: result.score,
        feedback: result.feedback.suggestions.length > 0 
          ? result.feedback.suggestions 
          : result.score < 3 
            ? ['Password is too weak. Try adding more characters, numbers, or special characters.'] 
            : []
      });
    } else if (name === 'password' && !value) {
      setPasswordStrength(null);
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      // Validate file type (PDF only)
      if (file.type !== 'application/pdf') {
        setErrors(prev => ({
          ...prev,
          businessRegistrationDocument: 'Please upload a PDF file. Other file formats are not accepted.'
        }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          businessRegistrationDocument: 'File size exceeds the 5MB limit. Please upload a smaller file.'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        businessRegistrationDocument: file
      }));

      // Clear error
      if (errors.businessRegistrationDocument) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.businessRegistrationDocument;
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please provide your full name';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      // Use zxcvbn for password strength validation
      const result = zxcvbn(formData.password, [formData.email, formData.fullName].filter(Boolean));
      if (result.score < 2) {
        newErrors.password = 'Password is too weak. Please choose a stronger password.';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must contain at least 8 characters';
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match. Please try again';
    }

    // Country is required only for Investor/Startup
    if ((accountType === 'investor' || accountType === 'startup') && !formData.country) {
      newErrors.country = 'Please select your country';
    }
    
    // Phone number is required for all account types
    if (!formData.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    // TIN is required only for Startup/SME
    if (accountType === 'startup' && !formData.tin?.trim()) {
      newErrors.tin = 'Tax Identification Number (TIN) is required for business registration';
    }

    // Business registration document is required only for Startup/SME
    if (accountType === 'startup' && !formData.businessRegistrationDocument) {
      newErrors.businessRegistrationDocument = 'Please upload your business registration document';
    }

    // Terms agreement is now handled by the dialog, so we don't need to check the checkbox
    // But we'll keep the checkbox for user awareness
    // if (!formData.termsAgreed) {
    //   newErrors.termsAgreed = 'Please accept the Terms of Service and Privacy Policy to continue';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Show terms dialog instead of submitting immediately
    setShowTermsDialog(true);
  };

  const handleTermsAgree = async () => {
    setShowTermsDialog(false);
    setIsSubmitting(true);

    try {
      // Get account type from URL
      const accountTypeParam = searchParams.get('type');
      
      const response = await authService.register(
        formData.email,
        formData.password,
        formData.fullName,
        formData.phoneNumber,
        formData.country,
        accountTypeParam,
        formData.tin || undefined,
        formData.businessRegistrationDocument || undefined
      );

      // Store token if provided
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      // Redirect to login page after successful registration
      alert('Account created successfully! Please sign in.');
      router.push('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create account. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!accountType) {
    return null; // Will redirect via useEffect
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      backgroundColor: 'var(--linkvesta-white)'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        backgroundColor: 'var(--linkvesta-white)',
        padding: '3rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        {/* Page Title */}
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'var(--linkvesta-dark-blue)',
          marginBottom: '0.5rem',
          textAlign: 'center'
        }}>
          Create Your Linkvesta Account
        </h1>

        {/* Account Type Badge */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <span style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--linkvesta-gold)',
            color: 'var(--linkvesta-dark-blue)',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            {accountType === 'investor' ? '💼 Investor' : '🚀 Startup/SME'}
          </span>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '8px',
            color: '#166534',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            {successMessage}
          </div>
        )}

        {/* General Error Message */}
        {generalError && (
          <div style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{generalError}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="fullName"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--linkvesta-dark-blue)',
                marginBottom: '0.5rem'
              }}
            >
              Full Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: `2px solid ${errors.fullName ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '8px',
                fontSize: '1rem',
                color: 'var(--linkvesta-dark-blue)',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
              placeholder="Enter your legal name"
              onFocus={(e) => {
                if (!errors.fullName) {
                  e.currentTarget.style.borderColor = 'var(--linkvesta-dark-blue)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26, 35, 50, 0.1)';
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.fullName ? '#ef4444' : '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {errors.fullName && (
              <p style={{ 
                color: '#dc2626', 
                fontSize: '0.875rem', 
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--linkvesta-dark-blue)',
                marginBottom: '0.5rem'
              }}
            >
              Email Address <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: `2px solid ${errors.email ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '8px',
                fontSize: '1rem',
                color: 'var(--linkvesta-dark-blue)',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
              placeholder="your.email@example.com"
              onFocus={(e) => {
                if (!errors.email) {
                  e.currentTarget.style.borderColor = 'var(--linkvesta-dark-blue)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26, 35, 50, 0.1)';
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.email ? '#ef4444' : '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {errors.email && (
              <p style={{ 
                color: '#dc2626', 
                fontSize: '0.875rem', 
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone Number - Required for all account types */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="phoneNumber"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--linkvesta-dark-blue)',
                marginBottom: '0.5rem'
              }}
            >
              Phone Number <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: `2px solid ${errors.phoneNumber ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '8px',
                fontSize: '1rem',
                color: 'var(--linkvesta-dark-blue)',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
              placeholder="+233 XX XXX XXXX"
              onFocus={(e) => {
                if (!errors.phoneNumber) {
                  e.currentTarget.style.borderColor = 'var(--linkvesta-dark-blue)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26, 35, 50, 0.1)';
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.phoneNumber ? '#ef4444' : '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {errors.phoneNumber && (
              <p style={{ 
                color: '#dc2626', 
                fontSize: '0.875rem', 
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {errors.phoneNumber}
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--linkvesta-dark-blue)',
                marginBottom: '0.5rem'
              }}
            >
              Password <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: `2px solid ${
                  errors.password 
                    ? '#ef4444' 
                    : passwordStrength && formData.password
                      ? passwordStrength.score < 2 
                        ? '#ef4444' 
                        : passwordStrength.score < 3 
                          ? '#f97316' 
                          : passwordStrength.score < 4 
                            ? '#eab308' 
                            : '#22c55e'
                      : '#e5e7eb'
                }`,
                borderRadius: '8px',
                fontSize: '1rem',
                color: 'var(--linkvesta-dark-blue)',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
              placeholder="Enter a strong password"
              onFocus={(e) => {
                if (!errors.password) {
                  e.currentTarget.style.borderColor = 'var(--linkvesta-dark-blue)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26, 35, 50, 0.1)';
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.password ? '#ef4444' : '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            
            {/* Password Strength Indicator */}
            {passwordStrength && formData.password && (
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{
                  display: 'flex',
                  gap: '0.25rem',
                  marginBottom: '0.5rem'
                }}>
                  {[0, 1, 2, 3, 4].map((level) => {
                    const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];
                    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
                    const isActive = level <= passwordStrength.score;
                    return (
                      <div
                        key={level}
                        style={{
                          flex: 1,
                          height: '4px',
                          backgroundColor: isActive ? colors[passwordStrength.score] : '#e5e7eb',
                          borderRadius: '2px',
                          transition: 'background-color 0.3s'
                        }}
                      />
                    );
                  })}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}>
                  <span style={{
                    color: passwordStrength.score < 2 ? '#ef4444' : passwordStrength.score < 3 ? '#f97316' : passwordStrength.score < 4 ? '#eab308' : '#22c55e',
                    fontWeight: '600'
                  }}>
                    {passwordStrength.score === 0 && 'Very Weak'}
                    {passwordStrength.score === 1 && 'Weak'}
                    {passwordStrength.score === 2 && 'Fair'}
                    {passwordStrength.score === 3 && 'Good'}
                    {passwordStrength.score === 4 && 'Strong'}
                  </span>
                  {passwordStrength.score < 2 && (
                    <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                      (Minimum required: Fair)
                    </span>
                  )}
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: passwordStrength.score < 2 ? '#fef2f2' : '#f0f9ff',
                    border: `1px solid ${passwordStrength.score < 2 ? '#fecaca' : '#bae6fd'}`,
                    borderRadius: '6px'
                  }}>
                    <p style={{
                      fontSize: '0.8125rem',
                      color: passwordStrength.score < 2 ? '#991b1b' : '#1e40af',
                      margin: 0,
                      lineHeight: '1.5'
                    }}>
                      <strong>Suggestion:</strong> {passwordStrength.feedback[0]}
                    </p>
                  </div>
                )}
              </div>
            )}

            {errors.password && (
              <p style={{ 
                color: '#dc2626', 
                fontSize: '0.875rem', 
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="confirmPassword"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--linkvesta-dark-blue)',
                marginBottom: '0.5rem'
              }}
            >
              Confirm Password <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: `2px solid ${errors.confirmPassword ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '8px',
                fontSize: '1rem',
                color: 'var(--linkvesta-dark-blue)',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
              placeholder="Re-enter your password"
              onFocus={(e) => {
                if (!errors.confirmPassword) {
                  e.currentTarget.style.borderColor = 'var(--linkvesta-dark-blue)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26, 35, 50, 0.1)';
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.confirmPassword ? '#ef4444' : '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {errors.confirmPassword && (
              <p style={{ 
                color: '#dc2626', 
                fontSize: '0.875rem', 
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Country - Required for Investor/Startup only (not shown for User) */}
          {(accountType === 'investor' || accountType === 'startup') && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="country"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--linkvesta-dark-blue)',
                  marginBottom: '0.5rem'
                }}
              >
                Country <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: `1px solid ${errors.country ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  color: 'var(--linkvesta-dark-blue)',
                  backgroundColor: 'var(--linkvesta-white)',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              >
                <option value="Ghana">Ghana</option>
                <option value="Nigeria">Nigeria</option>
                <option value="Kenya">Kenya</option>
                <option value="South Africa">South Africa</option>
                <option value="Other">Other</option>
              </select>
              {errors.country && (
                <p style={{ 
                  color: '#dc2626', 
                  fontSize: '0.875rem', 
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {errors.country}
                </p>
              )}
            </div>
          )}

          {/* TIN - Required only for Startup/SME */}
          {accountType === 'startup' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="tin"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--linkvesta-dark-blue)',
                  marginBottom: '0.5rem'
                }}
              >
                TIN (Tax Identification Number) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                id="tin"
                name="tin"
                value={formData.tin}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: `2px solid ${errors.tin ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  color: 'var(--linkvesta-dark-blue)',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
                placeholder="Enter your TIN"
                onFocus={(e) => {
                  if (!errors.tin) {
                    e.currentTarget.style.borderColor = 'var(--linkvesta-dark-blue)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26, 35, 50, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors.tin ? '#ef4444' : '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {errors.tin && (
                <p style={{ 
                  color: '#dc2626', 
                  fontSize: '0.875rem', 
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {errors.tin}
                </p>
              )}
            </div>
          )}

          {/* Business Registration Document - Required only for Startup/SME */}
          {accountType === 'startup' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="businessRegistrationDocument"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--linkvesta-dark-blue)',
                  marginBottom: '0.5rem'
                }}
              >
                Business Registration Document (PDF) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="file"
                  id="businessRegistrationDocument"
                  name="businessRegistrationDocument"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  required
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                    zIndex: 2
                  }}
                />
                <div
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: `2px dashed ${errors.businessRegistrationDocument ? '#ef4444' : formData.businessRegistrationDocument ? '#059669' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    backgroundColor: formData.businessRegistrationDocument ? '#f0fdf4' : '#fafafa',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    minHeight: '60px'
                  }}
                  onMouseEnter={(e) => {
                    if (!formData.businessRegistrationDocument) {
                      e.currentTarget.style.borderColor = 'var(--linkvesta-dark-blue)';
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!formData.businessRegistrationDocument) {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.backgroundColor = '#fafafa';
                    }
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={formData.businessRegistrationDocument ? '#059669' : '#6b7280'} strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span style={{
                    fontSize: '0.875rem',
                    color: formData.businessRegistrationDocument ? '#059669' : '#6b7280',
                    fontWeight: formData.businessRegistrationDocument ? '600' : '400'
                  }}>
                    {formData.businessRegistrationDocument 
                      ? formData.businessRegistrationDocument.name 
                      : 'Click to upload or drag and drop'}
                  </span>
                </div>
              </div>
              {formData.businessRegistrationDocument && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span style={{ color: '#059669', fontSize: '0.875rem', fontWeight: '500' }}>
                    {formData.businessRegistrationDocument.name}
                  </span>
                  <span style={{ color: '#6b7280', fontSize: '0.75rem', marginLeft: 'auto' }}>
                    {(formData.businessRegistrationDocument.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}
              {errors.businessRegistrationDocument && (
                <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  {errors.businessRegistrationDocument}
                </p>
              )}
              <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                Maximum file size: 5MB. PDF format only.
              </p>
            </div>
          )}

          {/* Terms Agreement Info */}
          <div style={{ 
            marginBottom: '2rem',
            padding: '1rem',
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px'
          }}>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--linkvesta-dark-blue)',
              lineHeight: '1.6',
              margin: 0
            }}>
              <strong>Note:</strong> By clicking "Create Account", you will be required to read and agree to our{' '}
              <Link href="/terms" target="_blank" style={{ color: 'var(--linkvesta-gold)', textDecoration: 'underline', fontWeight: '600' }}>
                Terms and Conditions
              </Link>
              {' '}before your account is created.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              backgroundColor: isSubmitting ? '#9ca3af' : 'var(--linkvesta-gold)',
              color: 'var(--linkvesta-dark-blue)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '1.5rem',
              boxShadow: isSubmitting ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }
            }}
            onMouseDown={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Back Link */}
          <div style={{ textAlign: 'center' }}>
            <Link
              href="/register"
              style={{
                color: 'var(--linkvesta-dark-blue)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                opacity: 0.8
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
            >
              ← Back to Account Type Selection
            </Link>
          </div>
        </form>

        {/* Terms and Conditions Dialog */}
        <TermsDialog
          isOpen={showTermsDialog}
          onClose={() => setShowTermsDialog(false)}
          onAgree={handleTermsAgree}
        />
      </div>
    </main>
  );
}

export default function RegisterFormPage() {
  return (
    <Suspense fallback={
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor: 'var(--linkvesta-white)'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'var(--linkvesta-dark-blue)'
        }}>
          <p>Loading...</p>
        </div>
      </main>
    }>
      <RegisterFormContent />
    </Suspense>
  );
}
