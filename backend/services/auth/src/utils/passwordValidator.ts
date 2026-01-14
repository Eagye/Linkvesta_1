import zxcvbn from 'zxcvbn';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: {
    score: number; // 0-4 (0 = weak, 4 = very strong)
    feedback: string[];
  };
}

/**
 * Validates password strength and complexity
 * Requirements:
 * - Minimum 12 characters (increased from 8)
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * - zxcvbn score >= 2 (fair strength minimum)
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  const feedback: string[] = [];

  // Check minimum length
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
  }

  // Use zxcvbn for strength estimation
  const strength = zxcvbn(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthLabel = strengthLabels[strength.score] || 'Unknown';

  // Require minimum score of 2 (Fair)
  if (strength.score < 2) {
    errors.push(`Password strength is too weak (${strengthLabel}). Please choose a stronger password.`);
    if (strength.feedback.warning) {
      feedback.push(strength.feedback.warning);
    }
    if (strength.feedback.suggestions && strength.feedback.suggestions.length > 0) {
      feedback.push(...strength.feedback.suggestions);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: {
      score: strength.score,
      feedback: feedback.length > 0 ? feedback : [`Password strength: ${strengthLabel}`]
    }
  };
}

/**
 * Get password strength score (0-4) for frontend display
 */
export function getPasswordStrength(password: string): number {
  const strength = zxcvbn(password);
  return strength.score;
}
