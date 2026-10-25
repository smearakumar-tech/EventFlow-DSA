import React, { useState } from 'react';
import {
  Network,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  Info
} from 'lucide-react';
import { UserProfile, AuthValidationErrors } from '../types/auth';
import { isValidEmail, checkPasswordStrength } from '../utils/authStorage';

interface SignUpPageProps {
  onSignUpSuccess: (user: UserProfile) => void;
  onNavigateToLogin: () => void;
  onNavigateToDashboard: () => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({
  onSignUpSuccess,
  onNavigateToLogin,
  onNavigateToDashboard
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<AuthValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const errs: AuthValidationErrors = {};

    // 1. Full name validation
    if (!fullName.trim()) {
      errs.fullName = 'Full name is required.';
    } else if (fullName.trim().length < 2) {
      errs.fullName = 'Please enter at least 2 characters.';
    }

    // 2. Email validation
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!isValidEmail(email)) {
      errs.email = 'Please enter a valid email format (e.g., name@example.com).';
    }

    // 3. Password requirements
    if (!password) {
      errs.password = 'Password is required.';
    } else {
      const strength = checkPasswordStrength(password);
      if (!strength.isValid) {
        errs.password = strength.message;
      }
    }

    // 4. Confirm password matching
    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      const user: UserProfile = {
        name: fullName.trim(),
        email: email.trim(),
        role: 'Symposium Coordinator',
        createdAt: new Date().toISOString()
      };

      onSignUpSuccess(user);
    }, 450);
  };

  return (
    <div className="min-h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Workspace button */}
        <button
          onClick={onNavigateToDashboard}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to EventFlow Workspace</span>
        </button>

        {/* Card Container */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-8 relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-100/50 via-teal-50/20 to-transparent rounded-full blur-2xl -z-10 pointer-events-none" />

          {/* Brand Header */}
          <div className="flex flex-col items-center text-center space-y-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Network className="w-6 h-6 text-indigo-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">EventFlow</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  PRO
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
                Create your account
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Start managing schedules, venues, and conflict resolutions
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700" htmlFor="signup-name">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={e => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
                  }}
                  placeholder="e.g. Dr. Jane Doe"
                  style={{ WebkitTextFillColor: '#000000' }}
                  className={`w-full pl-9 pr-3 py-2 text-xs md:text-sm text-black bg-white placeholder:text-gray-500 border rounded-xl transition-all focus:outline-hidden focus:ring-2 ${
                    errors.fullName
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="text-[11px] font-medium text-red-600 flex items-center gap-1 mt-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>{errors.fullName}</span>
                </p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700" htmlFor="signup-email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  placeholder="name@organization.com"
                  style={{ WebkitTextFillColor: '#000000' }}
                  className={`w-full pl-9 pr-3 py-2 text-xs md:text-sm text-black bg-white placeholder:text-gray-500 border rounded-xl transition-all focus:outline-hidden focus:ring-2 ${
                    errors.email
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] font-medium text-red-600 flex items-center gap-1 mt-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700" htmlFor="signup-password">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  placeholder="At least 8 characters with a number"
                  style={{ WebkitTextFillColor: '#000000' }}
                  className={`w-full pl-9 pr-10 py-2 text-xs md:text-sm text-black bg-white placeholder:text-gray-500 border rounded-xl transition-all focus:outline-hidden focus:ring-2 ${
                    errors.password
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] font-medium text-red-600 flex items-center gap-1 mt-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700" htmlFor="signup-confirm-password">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                  }}
                  placeholder="Re-enter password"
                  style={{ WebkitTextFillColor: '#000000' }}
                  className={`w-full pl-9 pr-10 py-2 text-xs md:text-sm text-black bg-white placeholder:text-gray-500 border rounded-xl transition-all focus:outline-hidden focus:ring-2 ${
                    errors.confirmPassword
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] font-medium text-red-600 flex items-center gap-1 mt-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-98 mt-2"
            >
              {isSubmitting ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline ml-1"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        {/* Security & Architecture Note */}
        <div className="p-3 bg-slate-100/70 rounded-xl border border-slate-200/60 text-slate-500 text-[11px] flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Client-side preview mode active. Full validation is enforced; password credentials are processed securely in browser runtime and never committed to persistence.
          </p>
        </div>
      </div>
    </div>
  );
};
