import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { authStart, authSuccess, authFailure, clearError } from '../store/authSlice';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { LogIn, Mail, Lock, RefreshCw, CheckCircle } from 'lucide-react';

/* ── Logo Mark ──────────────────────────────────────────── */
const LogoMark = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="10" fill="#1F2937"/>
    <path d="M24 11.5C24 11.5 21.5 9 18 9C13.5 9 11 11.5 11 14C11 19 24 17 24 22C24 24.5 21.5 27 17.5 27C13.5 27 11 24.5 11 24.5" stroke="#EA580C" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="27" cy="9" r="3" fill="#FB923C"/>
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [validationErrors, setValidationErrors] = useState({});
  const [toastConfig, setToastConfig] = useState(null);
  const [showVerifyBanner, setShowVerifyBanner] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'freelancer') navigate('/freelancer/dashboard', { replace: true });
      else navigate('/client/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (validationErrors[e.target.name]) {
      setValidationErrors({ ...validationErrors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Please enter a valid email address';
    if (!formData.password) errors.password = 'Password is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    setShowVerifyBanner(false);

    const errors = validate();
    if (Object.keys(errors).length > 0) { setValidationErrors(errors); return; }

    dispatch(authStart());
    try {
      const response = await api.post('/auth/login', { email: formData.email, password: formData.password });
      if (response.data.success) {
        dispatch(authSuccess({ token: response.data.token, user: response.data.user }));
        setToastConfig({ message: 'Logged in successfully!', type: 'success' });
        const role = response.data.user.role;
        setTimeout(() => {
          if (role === 'admin') navigate('/admin/dashboard', { replace: true });
          else if (role === 'freelancer') navigate('/freelancer/dashboard', { replace: true });
          else navigate('/client/dashboard', { replace: true });
        }, 500);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Invalid credentials. Please try again.';
      dispatch(authFailure(errMsg));
      // Show resend banner specifically for unverified email
      if (err.response?.status === 403 && errMsg.toLowerCase().includes('verify')) {
        setShowVerifyBanner(true);
      } else {
        setToastConfig({ message: errMsg, type: 'error' });
      }
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email.trim()) {
      setToastConfig({ message: 'Enter your email address first, then click Resend.', type: 'error' });
      return;
    }
    setResendLoading(true);
    try {
      await api.post('/auth/resend-verification', { email: formData.email });
      setResendSent(true);
      setToastConfig({ message: 'Verification email sent! Check your inbox.', type: 'success' });
    } catch (err) {
      setToastConfig({ message: err.response?.data?.message || 'Could not send email. Try again.', type: 'error' });
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    dispatch(clearError());
    dispatch(authStart());
    try {
      const response = await api.post('/auth/google-oauth', {
        credential: credentialResponse.credential,
        role: 'client',
      });
      if (response.data.success) {
        dispatch(authSuccess({ token: response.data.token, user: response.data.user }));
        setToastConfig({ message: 'Google Sign-In successful!', type: 'success' });
        const role = response.data.user.role;
        setTimeout(() => {
          if (role === 'admin') navigate('/admin/dashboard', { replace: true });
          else if (role === 'freelancer') navigate('/freelancer/dashboard', { replace: true });
          else navigate('/client/dashboard', { replace: true });
        }, 500);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Google sign-in failed. Please try again.';
      dispatch(authFailure(errMsg));
      setToastConfig({ message: errMsg, type: 'error' });
    }
  };

  const handleGoogleError = () => {
    setToastConfig({ message: 'Google sign-in was cancelled or failed.', type: 'error' });
    dispatch(authFailure('Google sign-in failed'));
  };

  return (
    <div className="min-h-screen bg-surface-subtle flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-10 right-10 w-80 h-80 rounded-full bg-orange-100 blur-3xl opacity-50 pointer-events-none animate-float" />
        <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-amber-100 blur-3xl opacity-40 pointer-events-none animate-float" style={{ animationDelay: '2s' }} />

        <div className="bg-white rounded-3xl border border-surface-border shadow-[0_20px_60px_rgba(0,0,0,0.08)] max-w-md w-full p-8 md:p-10 relative z-10 animate-blur-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <LogoMark size={56} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-1">Welcome back</h1>
            <p className="text-slate-400 text-sm">Sign in to your SkillSphere account</p>
          </div>

          {/* Email Verification Banner */}
          {showVerifyBanner && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 animate-fade-up">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-800 mb-1">Email verification required</p>
                  <p className="text-xs text-amber-700 leading-relaxed mb-3">
                    Your account needs email verification before you can log in. 
                    {resendSent ? ' We\'ve resent the verification link — check your inbox!' : ' Click below to resend the verification email.'}
                  </p>
                  {!resendSent ? (
                    <button
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      className="flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      {resendLoading ? <LoadingSpinner size="xs" color="amber" /> : <RefreshCw className="h-3.5 w-3.5" />}
                      Resend Verification Email
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Email sent! Check your inbox.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="login-email"
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
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`input-clean input-with-icon !pl-11 ${validationErrors.password ? 'error' : ''}`}
                />
              </div>
              {validationErrors.password && (
                <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-brand w-full py-3.5 text-sm mt-2"
            >
              {loading ? <LoadingSpinner size="sm" color="white" /> : (
                <><LogIn className="h-4 w-4" /> Sign In</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Google OAuth */}
          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={handleGoogleError}
              theme="outline"
              shape="rectangular"
              width="368"
              text="continue_with"
              logo_alignment="left"
            />
          </div>

          {/* Register Link */}
          <p className="text-center text-xs text-slate-400 mt-8">
            New to SkillSphere?{' '}
            <Link to="/register" className="text-orange-600 font-bold hover:text-orange-700 transition-colors">
              Create a free account
            </Link>
          </p>

          {/* Dev Credentials */}
          {import.meta.env.DEV && (
            <div className="mt-5 p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest mb-2">🔑 Demo Credentials</p>
              <div className="space-y-1 text-[11px] text-slate-500">
                <div className="flex justify-between">
                  <span className="text-amber-600 font-semibold">Admin</span>
                  <span className="font-mono text-slate-700">admin@skillsphere.com / Admin@123</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Register as Client or Freelancer to test those flows.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {toastConfig && (
        <Toast message={toastConfig.message} type={toastConfig.type} onClose={() => setToastConfig(null)} />
      )}
    </div>
  );
};

export default Login;
