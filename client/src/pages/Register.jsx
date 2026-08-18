import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { authStart, authSuccess, authFailure, clearError } from '../store/authSlice';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  User, Briefcase, ShieldAlert, CheckCircle,
  Mail, Lock, UserCircle, ArrowRight
} from 'lucide-react';

/* ── Logo Mark ──────────────────────────────────────────── */
const LogoMark = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="10" fill="rgba(255,255,255,0.2)"/>
    <path d="M24 11.5C24 11.5 21.5 9 18 9C13.5 9 11 11.5 11 14C11 19 24 17 24 22C24 24.5 21.5 27 17.5 27C13.5 27 11 24.5 11 24.5" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="27" cy="9" r="3" fill="#FB923C"/>
  </svg>
);

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { loading, isAuthenticated, user } = useSelector((state) => state.auth);

  const [role, setRole] = useState('client');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [validationErrors, setValidationErrors] = useState({});
  const [toastConfig, setToastConfig] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [countdown, setCountdown] = useState(4);

  // Pick role from URL param
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && ['client', 'freelancer'].includes(roleParam)) setRole(roleParam);
  }, [searchParams]);

  useEffect(() => { return () => { dispatch(clearError()); }; }, [dispatch]);

  // If already logged in redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'freelancer') navigate('/freelancer/dashboard', { replace: true });
      else navigate('/client/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Auto-redirect after success screen
  useEffect(() => {
    if (!isRegistered) return;
    if (countdown <= 0) { navigate('/login', { replace: true }); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [isRegistered, countdown, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (validationErrors[e.target.name]) {
      setValidationErrors({ ...validationErrors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Enter a valid email address';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    return errors;
  };

  // ── Email/Password Register ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const errors = validate();
    if (Object.keys(errors).length > 0) { setValidationErrors(errors); return; }

    dispatch(authStart());
    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
      });
      if (response.data.success) {
        setRegisteredEmail(formData.email);
        setIsRegistered(true);
        dispatch(authFailure('')); // clear loading
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      dispatch(authFailure(msg));
      setToastConfig({ message: msg, type: 'error' });
    }
  };

  // ── Google OAuth Register/Login ─────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    dispatch(clearError());
    dispatch(authStart());
    try {
      const response = await api.post('/auth/google-oauth', {
        credential: credentialResponse.credential,
        role, // pass selected role for new accounts
      });
      if (response.data.success) {
        dispatch(authSuccess({ token: response.data.token, user: response.data.user }));
        setToastConfig({ message: 'Google sign-up successful! Welcome to SkillSphere!', type: 'success' });
        const r = response.data.user.role;
        setTimeout(() => {
          if (r === 'admin') navigate('/admin/dashboard', { replace: true });
          else if (r === 'freelancer') navigate('/freelancer/dashboard', { replace: true });
          else navigate('/client/dashboard', { replace: true });
        }, 600);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Google sign-up failed. Please try again.';
      dispatch(authFailure(msg));
      setToastConfig({ message: msg, type: 'error' });
    }
  };

  const handleGoogleError = () => {
    setToastConfig({ message: 'Google sign-up was cancelled or failed.', type: 'error' });
    dispatch(authFailure(''));
  };

  // ── Success Screen ──────────────────────────────────────────────────
  if (isRegistered) {
    return (
      <div className="min-h-screen bg-surface-subtle flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-surface-border shadow-[0_20px_60px_rgba(0,0,0,0.08)] max-w-md w-full p-10 text-center animate-blur-in">
            <div className="h-16 w-16 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-5">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Account Created!</h2>
            <p className="text-slate-400 text-sm mb-5 leading-relaxed">
              We've sent a verification link to{' '}
              <span className="font-bold text-slate-700">{registeredEmail}</span>.
              <br />Check your inbox and click the link to activate your account.
            </p>

            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
              <p className="text-sm text-orange-700 font-semibold">
                Redirecting to login in{' '}
                <span className="text-2xl font-black text-orange-600">{countdown}</span>s
              </p>
              <div className="mt-2 h-1.5 bg-orange-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-orange rounded-full transition-all duration-1000"
                  style={{ width: `${((4 - countdown) / 4) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-left">
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                💡 <span className="font-bold">Can't find the email?</span> Check your spam/junk folder. You can also request a new verification link from the login page.
              </p>
            </div>

            <button
              onClick={() => navigate('/login', { replace: true })}
              className="btn-brand w-full py-3.5 text-sm"
            >
              Go to Login <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Registration Form ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface-subtle flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 md:py-10 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-orange-100 blur-3xl opacity-50 pointer-events-none animate-float" />
        <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-amber-100 blur-3xl opacity-40 pointer-events-none animate-float" style={{ animationDelay: '2s' }} />

        <div className="bg-white rounded-3xl border border-surface-border shadow-[0_20px_60px_rgba(0,0,0,0.07)] max-w-4xl w-full overflow-hidden flex flex-col md:flex-row relative z-10 animate-blur-in">

          {/* ── Left Panel ─────────────────────────────────────── */}
          <div className="bg-gradient-cta p-8 text-white md:w-5/12 flex flex-col justify-between relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-8">
                <LogoMark size={36} />
                <span className="text-lg font-black text-white">SkillSphere</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-4 leading-tight">
                Start your journey today.
              </h2>
              <p className="text-white/75 text-sm leading-relaxed">
                Join thousands of professionals connecting locally for secure, efficient, hyperlocal work.
              </p>
            </div>

            <div className="space-y-3 relative z-10 mt-8">
              {[
                'Free to join — no hidden fees',
                'Milestone-based escrow payments',
                'Verified local freelancers',
                'Real-time messaging',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-white/80 flex-shrink-0" />
                  <span className="text-sm text-white/85 font-medium">{item}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-900/40 mt-8 relative z-10">© 2026 SkillSphere Inc.</p>
          </div>

          {/* ── Right Panel ────────────────────────────────────── */}
          <div className="p-8 md:w-7/12 overflow-y-auto max-h-[90vh] md:max-h-none">
            <h1 className="text-2xl font-black text-slate-900 mb-1">Create your account</h1>
            <p className="text-slate-400 text-sm mb-6">Choose how you'd like to join SkillSphere</p>

            {/* ── Role Selector ─────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 text-center transition-all duration-200 cursor-pointer ${
                  role === 'client'
                    ? 'border-orange-500 bg-orange-50 shadow-sm'
                    : 'border-surface-border bg-surface-subtle hover:border-orange-200 hover:bg-orange-50/50'
                }`}
              >
                <User className={`h-6 w-6 mb-2 ${role === 'client' ? 'text-orange-600' : 'text-slate-400'}`} />
                <span className={`text-sm font-bold ${role === 'client' ? 'text-orange-700' : 'text-slate-500'}`}>I'm a Client</span>
                <span className={`text-[10px] mt-0.5 ${role === 'client' ? 'text-orange-500' : 'text-slate-400'}`}>I want to hire</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('freelancer')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 text-center transition-all duration-200 cursor-pointer ${
                  role === 'freelancer'
                    ? 'border-charcoal-700 bg-charcoal-50 shadow-sm'
                    : 'border-surface-border bg-surface-subtle hover:border-charcoal-300 hover:bg-charcoal-50/50'
                }`}
              >
                <Briefcase className={`h-6 w-6 mb-2 ${role === 'freelancer' ? 'text-charcoal-700' : 'text-slate-400'}`} />
                <span className={`text-sm font-bold ${role === 'freelancer' ? 'text-charcoal-800' : 'text-slate-500'}`}>I'm a Freelancer</span>
                <span className={`text-[10px] mt-0.5 ${role === 'freelancer' ? 'text-charcoal-600' : 'text-slate-400'}`}>I want to work</span>
              </button>
            </div>

            {/* ── Google Sign-Up ─────────────────────────────── */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Quick sign-up with Google
              </p>
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  shape="rectangular"
                  width="368"
                  text="signup_with"
                  logo_alignment="left"
                />
              </div>
            </div>

            {/* ── Divider ───────────────────────────────────── */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400 font-medium">Or register with email</span>
              </div>
            </div>

            {/* ── Email/Password Form ────────────────────────── */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    autoComplete="name"
                    className={`input-clean input-with-icon !pl-11 ${validationErrors.name ? 'error' : ''}`}
                  />
                </div>
                {validationErrors.name && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`input-clean input-with-icon !pl-11 ${validationErrors.email ? 'error' : ''}`}
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    className={`input-clean input-with-icon !pl-11 ${validationErrors.password ? 'error' : ''}`}
                  />
                </div>
                {validationErrors.password && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    className={`input-clean input-with-icon !pl-11 ${validationErrors.confirmPassword ? 'error' : ''}`}
                  />
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.confirmPassword}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-brand w-full py-3.5 text-sm mt-1"
              >
                {loading
                  ? <LoadingSpinner size="sm" color="white" />
                  : <><UserCircle className="h-4 w-4" /> Create Account</>
                }
              </button>
            </form>

            {/* Login Link */}
            <p className="text-center text-xs text-slate-400 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-600 font-bold hover:text-orange-700 transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {toastConfig && (
        <Toast message={toastConfig.message} type={toastConfig.type} onClose={() => setToastConfig(null)} />
      )}
    </div>
  );
};

export default Register;
