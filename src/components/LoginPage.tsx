import React, { useState } from 'react';
import {
  Network,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, AuthValidationErrors } from '../types/auth';
import { isValidEmail } from '../utils/authStorage';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigateToSignUp: () => void;
  onNavigateToDashboard: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateToSignUp,
  onNavigateToDashboard
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<AuthValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const errs: AuthValidationErrors = {};

    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!isValidEmail(email)) {
      errs.email = 'Please enter a valid email address (e.g., name@example.com).';
    }

    if (!password) {
      errs.password = 'Password is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate authenticating against credentials without hardcoding secrets
    setTimeout(() => {
      setIsSubmitting(false);

      // Create authenticated user session (never saves password)
      const user: UserProfile = {
        name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Event Lead',
        email: email.trim(),
        role: 'Event Lead & Administrator',
        createdAt: new Date().toISOString()
      };

      onLoginSuccess(user);
    }, 450);
  };

  const handleFillDemo = () => {
    setEmail('organizer@eventflow.app');
    setPassword('EventFlow2026!');
    setErrors({});
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !isValidEmail(forgotEmail)) {
      setForgotError('Please enter a valid registered email address.');
      return;
    }
    setForgotError('');
    setIsForgotSubmitting(true);

    setTimeout(() => {
      setIsForgotSubmitting(false);
      setForgotSubmitted(true);
    }, 550);
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
          {/* Subtle decorative glow */}
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
                Welcome back
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Enter your credentials to access your EventFlow schedule
              </p>
            </div>
          </div>

          {/* Quick Demo Credentials Helper */}
          <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Previewing EventFlow?</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
            >
              Autofill Demo Info
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700" htmlFor="login-email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
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

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700" htmlFor="login-password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotSubmitted(false);
                    setForgotError('');
                    setShowForgotModal(true);
                  }}
                  className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              {isSubmitting ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToSignUp}
                className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline ml-1"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        {/* Security & Architecture Note */}
        <div className="p-3 bg-slate-100/70 rounded-xl border border-slate-200/60 text-slate-500 text-[11px] flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Client-side authentication mode active. Form validation is strictly enforced; passwords are processed locally and never stored in plaintext.
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Reset Your Password</h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            {forgotSubmitted ? (
              <div className="text-center py-4 space-y-2">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Password Reset Dispatched</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  A verification link has been simulated for <strong>{forgotEmail}</strong>. In production, this triggers an automated email delivery workflow.
                </p>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="mt-3 w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your verified account email address and we will generate a secure reset link.
                </p>
                <div>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="name@organization.com"
                    style={{ WebkitTextFillColor: '#000000' }}
                    className="w-full px-3 py-2 text-xs text-black bg-white placeholder:text-gray-500 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                  {forgotError && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{forgotError}</p>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotSubmitting}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    {isForgotSubmitting ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
