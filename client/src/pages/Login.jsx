import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { authStart, authSuccess, authFailure, clearError } from '../store/authSlice';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { LogIn } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  // Form State
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [validationErrors, setValidationErrors] = useState({});
  const [toastConfig, setToastConfig] = useState(null);

  // Clean error state on unmount
  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  // ── If already authenticated, redirect to role dashboard ────────────
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
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) errors.password = 'Password is required';
    return errors;
  };

  // ── Normal email/password login (works for admin too) ────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    dispatch(authStart());
    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        dispatch(authSuccess({ token: response.data.token, user: response.data.user }));
        setToastConfig({ message: 'Logged in successfully!', type: 'success' });
        // Navigate based on role
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
      setToastConfig({ message: errMsg, type: 'error' });
    }
  };

  // ── Real Google OAuth — credential comes from @react-oauth/google ────
  const handleGoogleLogin = async (credentialResponse) => {
    dispatch(clearError());
    dispatch(authStart());
    try {
      const response = await api.post('/auth/google-oauth', {
        credential: credentialResponse.credential,
        role: 'client' // default role for new Google sign-ups via login page
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
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col text-white transition-smooth">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6 md:py-12 relative overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-brand-purple/20 blur-[100px] pointer-events-none animate-float" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-brand-indigo/20 blur-[100px] pointer-events-none animate-float" style={{animationDelay: '1.5s'}} />

        <div className="bg-dark-surface rounded-3xl border border-dark-border shadow-2xl max-w-md w-full p-8 relative z-10 animate-fade-up">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-[#94A3B8] text-sm">Access your hyperlocal workspace dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">Email Address</label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border bg-[rgba(255,255,255,0.03)] text-white text-sm focus:outline-none focus:ring-2 transition-smooth ${
                  validationErrors.email
                    ? 'border-[#EF4444] focus:ring-[#EF4444]/30 focus:border-[#EF4444]'
                    : 'border-dark-border focus:ring-brand-indigo/30 focus:border-brand-indigo'
                }`}
                placeholder="example@email.com"
                autoComplete="email"
              />
              {validationErrors.email && (
                <p className="text-xs text-[#EF4444] mt-1 font-medium">{validationErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-brand-indigo hover:text-white transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                id="login-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border bg-[rgba(255,255,255,0.03)] text-white text-sm focus:outline-none focus:ring-2 transition-smooth ${
                  validationErrors.password
                    ? 'border-[#EF4444] focus:ring-[#EF4444]/30 focus:border-[#EF4444]'
                    : 'border-dark-border focus:ring-brand-indigo/30 focus:border-brand-indigo'
                }`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {validationErrors.password && (
                <p className="text-xs text-[#EF4444] mt-1 font-medium">{validationErrors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 mt-2 bg-gradient-brand text-white rounded-xl font-bold shadow-lg hover-glow-purple hover:scale-[1.01] active:scale-95 transition-all duration-200 text-sm cursor-pointer disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? <LoadingSpinner size="sm" color="white" /> : (
                <>
                  <LogIn className="h-4 w-4" />
                  Log In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgba(255,255,255,0.08)]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-dark-surface px-3 text-[#475569] font-medium">Or continue with</span>
            </div>
          </div>

          {/* ── Real Google OAuth Button ─────────────────────────────── */}
          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={handleGoogleError}
              theme="filled_black"
              shape="rectangular"
              width="368"
              text="continue_with"
              logo_alignment="left"
            />
          </div>


          {/* Register Link */}
          <p className="text-center text-xs text-[#94A3B8] mt-8">
            New to SkillSphere?{' '}
            <Link to="/register" className="text-brand-indigo font-bold hover:text-white transition-colors">
              Create an account
            </Link>
          </p>

          {/* Demo Credentials Box */}
          {import.meta.env.DEV && (
            <div className="mt-6 p-4 rounded-xl bg-amber-500/8 border border-amber-500/20">
              <p className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest mb-2">🔑 Demo Credentials</p>
              <div className="space-y-1 text-[11px] text-[#94A3B8]">
                <div className="flex justify-between">
                  <span className="text-amber-400 font-semibold">Admin</span>
                  <span className="font-mono text-white">admin@skillsphere.com / Admin@123</span>
                </div>
                <p className="text-[10px] text-[#64748B] mt-1">Register as Client or Freelancer to test those flows.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {toastConfig && (
        <Toast
          message={toastConfig.message}
          type={toastConfig.type}
          onClose={() => setToastConfig(null)}
        />
      )}
    </div>
  );
};

export default Login;
