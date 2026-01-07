'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, isVisible, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const styles = {
    success: {
      backgroundColor: '#f0fdf4',
      borderColor: '#86efac',
      textColor: '#166534',
      iconColor: '#22c55e'
    },
    error: {
      backgroundColor: '#fef2f2',
      borderColor: '#fecaca',
      textColor: '#dc2626',
      iconColor: '#ef4444'
    },
    info: {
      backgroundColor: '#eff6ff',
      borderColor: '#bfdbfe',
      textColor: '#1e40af',
      iconColor: '#3b82f6'
    }
  };

  const currentStyle = styles[type];

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        minWidth: '320px',
        maxWidth: '500px',
        padding: '1rem 1.25rem',
        backgroundColor: currentStyle.backgroundColor,
        border: `2px solid ${currentStyle.borderColor}`,
        borderRadius: '12px',
        color: currentStyle.textColor,
        fontSize: '0.9375rem',
        fontWeight: '500',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        animation: 'slideIn 0.3s ease-out',
        cursor: 'pointer'
      }}
      onClick={onClose}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.2), 0 6px 15px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.1)';
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      
      {/* Icon */}
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        {type === 'success' && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={currentStyle.iconColor} strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        )}
        {type === 'error' && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={currentStyle.iconColor} strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        )}
        {type === 'info' && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={currentStyle.iconColor} strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        )}
      </div>

      {/* Message */}
      <div style={{ flex: 1, lineHeight: '1.5' }}>
        {message}
      </div>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        style={{
          background: 'none',
          border: 'none',
          color: currentStyle.textColor,
          cursor: 'pointer',
          padding: '0',
          marginLeft: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.7,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.7';
        }}
        aria-label="Close notification"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}
