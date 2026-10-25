import { UserProfile } from '../types/auth';

const SESSION_KEY = 'eventflow_user_session_v1';

/**
 * Loads current authenticated user session metadata from browser localStorage.
 * Note: Never contains passwords or sensitive credentials.
 */
export function loadUserSession(): UserProfile | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch (err) {
    console.error('Failed to parse user session:', err);
    return null;
  }
}

/**
 * Saves non-sensitive user session profile to localStorage.
 */
export function saveUserSession(user: UserProfile): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to save user session:', err);
  }
}

/**
 * Clears user session on sign out.
 */
export function clearUserSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (err) {
    console.error('Failed to clear user session:', err);
  }
}

/**
 * RFC 5322 standard email format validation regex
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
}

/**
 * Password strength check:
 * - At least 8 characters
 * - At least one numeric digit or symbol
 */
export function checkPasswordStrength(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must include at least one number (0-9).' };
  }
  return { isValid: true };
}
