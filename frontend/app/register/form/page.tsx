'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/src/lib/auth';
import TermsDialog from '@/app/components/TermsDialog';
import Toast from '@/app/components/Toast';
import zxcvbn from 'zxcvbn';
import { isDisposableEmail, getDisposableEmailMessage } from '@/src/utils/disposableEmail';

// Comprehensive list of all countries
const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt',
  'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
  'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar',
  'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia',
  'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
  'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan',
  'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar',
  'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia',
  'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa',
  'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan',
  'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan',
  'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City',
  'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
].sort(); // Sort alphabetically

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
    country: '',
    tin: '',
    businessRegistrationDocument: null as File | null,
    termsAgreed: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; feedback: string[] } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  // Country selector state
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const highlightedItemRef = useRef<HTMLDivElement>(null);

  // Redirect if no account type selected
  useEffect(() => {
    if (!accountType || (accountType !== 'investor' && accountType !== 'startup')) {
      router.push('/register');
    }
  }, [accountType, router]);

  // Filter countries based on search
  const filteredCountries = COUNTRIES.filter(country =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Handle country selection
  const handleCountrySelect = (country: string) => {
    setFormData(prev => ({ ...prev, country }));
    setCountrySearch('');
    setShowCountryDropdown(false);
    setHighlightedIndex(-1);
    // Clear country error when a country is selected
    if (errors.country) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.country;
        return newErrors;
      });
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.country-selector-container')) {
        setShowCountryDropdown(false);
        setHighlightedIndex(-1);
        // Reset search to selected country when closing
        if (formData.country) {
          setCountrySearch(formData.country);
        } else {
          setCountrySearch('');
        }
      }
    };

    if (showCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCountryDropdown, formData.country]);

  // Initialize search with selected country
  useEffect(() => {
    if (formData.country) {
      setCountrySearch(formData.country);
    }
  }, [formData.country]);

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
          businessRegistrationDocument: 'PDF format required'
        }));
        showToast('Please upload a PDF file. Other file formats are not accepted.', 'error');
        // Clear the invalid file
        setFormData(prev => ({
          ...prev,
          businessRegistrationDocument: null
        }));
        // Reset the file input
        e.target.value = '';
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          businessRegistrationDocument: 'File too large'
        }));
        showToast('The file you selected is too large. Please upload a file smaller than 5MB.', 'error');
        // Clear the invalid file
        setFormData(prev => ({
          ...prev,
          businessRegistrationDocument: null
        }));
        // Reset the file input
        e.target.value = '';
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
    } else {
      // If no file selected, clear it
      setFormData(prev => ({
        ...prev,
        businessRegistrationDocument: null
      }));
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let firstError = '';

    if (!formData.fullName.trim()) {
      newErrors.fullName = accountType === 'startup' ? 'Full business name is required' : 'Full name is required';
      if (!firstError) firstError = accountType === 'startup' ? 'Please provide your full business name to continue.' : 'Please provide your full name to continue.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
      if (!firstError) firstError = 'Please provide your email address to continue.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      if (!firstError) firstError = 'Please enter a valid email address (e.g., name@example.com).';
    } else if (isDisposableEmail(formData.email)) {
      newErrors.email = 'Disposable email not allowed';
      if (!firstError) firstError = getDisposableEmailMessage();
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      if (!firstError) firstError = 'Please create a password for your account.';
    } else {
      // Use zxcvbn for password strength validation
      const result = zxcvbn(formData.password, [formData.email, formData.fullName].filter(Boolean));
      if (result.score < 2) {
        newErrors.password = 'Password is too weak';
        if (!firstError) firstError = 'Your password needs to be stronger. Try adding numbers, special characters, or more letters.';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
        if (!firstError) firstError = 'Your password must be at least 8 characters long.';
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      if (!firstError) firstError = 'Please confirm your password to continue.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      if (!firstError) firstError = 'The passwords you entered do not match. Please try again.';
    }

    // Country is required only for Investor/Startup
    if ((accountType === 'investor' || accountType === 'startup') && !formData.country) {
      newErrors.country = 'Please select your country';
      if (!firstError) firstError = 'Please select your country from the dropdown menu.';
    }
    
    // Phone number is required for all account types
    if (!formData.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
      if (!firstError) firstError = 'Please provide your phone number to continue.';
    }

    // TIN is REQUIRED for Startup/SME
    if (accountType === 'startup') {
      if (!formData.tin?.trim()) {
        newErrors.tin = 'TIN is required';
        if (!firstError) firstError = 'Please provide your Tax Identification Number (TIN) to complete your business registration.';
      }
      
      // Business registration document is REQUIRED for Startup/SME
      if (!formData.businessRegistrationDocument) {
        newErrors.businessRegistrationDocument = 'Business registration document is required';
        if (!firstError) firstError = 'Please upload your business registration document (PDF) to complete your registration.';
      }
    }

    setErrors(newErrors);
    
    // Show toast with first error if validation fails
    if (Object.keys(newErrors).length > 0 && firstError) {
      showToast(firstError, 'error');
      // Scroll to first error field
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }
    
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

      // Check if email verification is required
      if (response.requiresVerification) {
        showToast('Registration successful! Please check your email to verify your account before logging in.', 'success');
        // Redirect to a page showing verification instructions
        setTimeout(() => {
          router.push('/register/verify-instructions');
        }, 3000);
      } else if (response.token) {
        // Legacy support: if token is provided, store it
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        showToast('Welcome to Linkvesta! Your account has been created successfully. You are now logged in.', 'success');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        // Default success message
        showToast('Registration successful! Please check your email to verify your account.', 'success');
        setTimeout(() => {
          router.push('/register/verify-instructions');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Map backend errors to friendly messages
      let friendlyMessage = 'We encountered an issue while creating your account. Please try again in a moment.';
      
      if (error.response?.data?.error) {
        const backendError = error.response.data.error;
        
        if (backendError.includes('already exists')) {
          friendlyMessage = 'An account with this email address already exists. Please use a different email or try logging in.';
        } else if (backendError.includes('disposable') || backendError.includes('temporary') || backendError.includes('permanent email')) {
          friendlyMessage = getDisposableEmailMessage();
        } else if (backendError.includes('TIN') || backendError.includes('Tax Identification')) {
          friendlyMessage = 'Please provide your Tax Identification Number (TIN) to complete your business registration.';
        } else if (backendError.includes('Business registration document') || backendError.includes('PDF')) {
          friendlyMessage = 'Please upload your business registration document (PDF format) to complete your registration.';
        } else if (backendError.includes('password') && backendError.includes('8')) {
          friendlyMessage = 'Your password must be at least 8 characters long. Please choose a stronger password.';
        } else if (backendError.includes('required')) {
          friendlyMessage = 'Please fill in all required fields to complete your registration.';
        } else {
          friendlyMessage = backendError;
        }
      } else if (error.message) {
        if (error.message.includes('Network') || error.message.includes('fetch')) {
          friendlyMessage = 'Unable to connect to our servers. Please check your internet connection and try again.';
        }
      }
      
      showToast(friendlyMessage, 'error');
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
      padding: 'clamp(1rem, 4vw, 2rem)',
      backgroundColor: 'var(--linkvesta-white)'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        backgroundColor: 'var(--linkvesta-white)',
        padding: 'clamp(1.5rem, 5vw, 3rem)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        {/* Page Title */}
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
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

        {/* Toast Notification */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
          duration={toast.type === 'success' ? 3000 : 6000}
        />

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
              {accountType === 'startup' ? 'Full Business Name' : 'Full Name'} <span style={{ color: '#ef4444' }}>*</span>
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
              placeholder={accountType === 'startup' ? 'Enter your full business name' : 'Enter your legal name'}
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
            <div style={{ marginBottom: '1.5rem' }} className="country-selector-container">
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
              {/* Hidden input for form validation */}
              <input
                type="hidden"
                name="country"
                value={formData.country}
                required
              />
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'relative',
                    width: '100%'
                  }}
                >
                  <input
                    type="text"
                    id="country-search"
                    value={countrySearch}
                    onChange={(e) => {
                      setCountrySearch(e.target.value);
                      setShowCountryDropdown(true);
                      setHighlightedIndex(-1);
                    }}
                    onClick={() => {
                      if (!showCountryDropdown) {
                        setShowCountryDropdown(true);
                        if (!formData.country) {
                          setCountrySearch('');
                        }
                      }
                    }}
                    onFocus={(e) => {
                      setShowCountryDropdown(true);
                      if (!formData.country) {
                        setCountrySearch('');
                      }
                      e.currentTarget.style.borderColor = 'var(--linkvesta-dark-blue)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26, 35, 50, 0.1)';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setShowCountryDropdown(true);
                        setHighlightedIndex(prev => 
                          prev < filteredCountries.length - 1 ? prev + 1 : prev
                        );
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        if (highlightedIndex >= 0 && filteredCountries[highlightedIndex]) {
                          handleCountrySelect(filteredCountries[highlightedIndex]);
                        } else if (filteredCountries.length === 1) {
                          handleCountrySelect(filteredCountries[0]);
                        }
                      } else if (e.key === 'Escape') {
                        setShowCountryDropdown(false);
                        setCountrySearch(formData.country || '');
                      }
                    }}
                    placeholder={formData.country || "Search or select a country"}
                    style={{
                      width: '100%',
                      padding: '0.875rem 2.5rem 0.875rem 2.75rem',
                      border: `1px solid ${errors.country ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '1rem',
                      color: 'var(--linkvesta-dark-blue)',
                      backgroundColor: 'var(--linkvesta-white)',
                      boxSizing: 'border-box',
                      cursor: 'text',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onBlur={(e) => {
                      // Delay to allow click on dropdown items
                      setTimeout(() => {
                        e.currentTarget.style.borderColor = errors.country ? '#ef4444' : '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }, 200);
                    }}
                  />
                  {/* Search Icon */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '0.875rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: '#9ca3af',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                  </div>
                  {/* Dropdown Arrow */}
                  <div
                    style={{
                      position: 'absolute',
                      right: '0.875rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'auto',
                      color: '#6b7280',
                      transition: 'transform 0.2s ease',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setShowCountryDropdown(!showCountryDropdown);
                      if (!showCountryDropdown) {
                        setCountrySearch(formData.country || '');
                      }
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{
                        transform: showCountryDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>

                {/* Dropdown List */}
                {showCountryDropdown && (
                  <div
                    ref={countryDropdownRef}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '0.5rem',
                      backgroundColor: 'var(--linkvesta-white)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                      maxHeight: '320px',
                      overflowY: 'auto',
                      zIndex: 1000,
                      animation: 'fadeIn 0.2s ease'
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {filteredCountries.length > 0 ? (
                      <>
                        {filteredCountries.length > 5 && (
                          <div
                            style={{
                              padding: '0.75rem 1rem',
                              backgroundColor: '#f9fafb',
                              borderBottom: '1px solid #e5e7eb',
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              position: 'sticky',
                              top: 0,
                              zIndex: 1
                            }}
                          >
                            {filteredCountries.length} {filteredCountries.length === 1 ? 'country' : 'countries'} found
                          </div>
                        )}
                        {filteredCountries.map((country, index) => (
                          <div
                            key={country}
                            ref={highlightedIndex === index ? highlightedItemRef : null}
                            onClick={() => handleCountrySelect(country)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            style={{
                              padding: '0.875rem 1rem',
                              cursor: 'pointer',
                              backgroundColor: highlightedIndex === index ? '#f3f4f6' : 'transparent',
                              color: 'var(--linkvesta-dark-blue)',
                              fontSize: '0.95rem',
                              transition: 'background-color 0.15s ease',
                              borderBottom: index < filteredCountries.length - 1 ? '1px solid #f3f4f6' : 'none',
                              fontWeight: highlightedIndex === index ? '500' : '400'
                            }}
                          >
                            {country}
                          </div>
                        ))}
                      </>
                    ) : (
                      <div
                        style={{
                          padding: '1.5rem',
                          textAlign: 'center',
                          color: '#6b7280',
                          fontSize: '0.875rem'
                        }}
                      >
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          style={{ margin: '0 auto 0.5rem', opacity: 0.5 }}
                        >
                          <circle cx="11" cy="11" r="8"></circle>
                          <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <p>No countries found matching "{countrySearch}"</p>
                        <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.7 }}>
                          Try a different search term
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: '400', 
                  color: '#6b7280',
                  marginLeft: '0.5rem',
                  fontStyle: 'italic'
                }}>
                  (Required)
                </span>
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

          {/* Business Registration Document - Required for Startup/SME */}
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
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: '400', 
                  color: '#6b7280',
                  marginLeft: '0.5rem',
                  fontStyle: 'italic'
                }}>
                  (Required)
                </span>
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
                <p style={{ 
                  color: '#ef4444', 
                  fontSize: '0.875rem', 
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '500'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {errors.businessRegistrationDocument}
                </p>
              )}
              <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                <strong>Required:</strong> Maximum file size: 5MB. PDF format only.
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
              <strong>Note:</strong> By clicking &quot;Create Account&quot;, you will be required to read and agree to our{' '}
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
