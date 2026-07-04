import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure, clearError } from '../store/authSlice';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Briefcase, ShieldAlert, CheckCircle, Mail } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Form State
  const [role, setRole] = useState('client');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [toastConfig, setToastConfig] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Set initial role from query parameter
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && ['client', 'freelancer'].includes(roleParam)) {
      setRole(roleParam);
    }
  }, [searchParams]);

  // Clean error state on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Redirect if already logged in — cover all roles
  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (role === 'client') navigate('/client/dashboard', { replace: true });
      else navigate('/freelancer/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate, role]);

  // 3-second countdown redirect to /login after successful registration
  useEffect(() => {
    if (!isRegistered) return;
    if (countdown <= 0) {
      navigate('/login', { replace: true });
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [isRegistered, countdown, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear field-specific validation errors as user types
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: ''
      });
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please provide a valid email';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear global error
    dispatch(clearError());

    // Client-side validations
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    dispatch(authStart());
    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role
      });

      if (response.data.success) {
        setIsRegistered(true);
        setToastConfig({
          message: 'Registration successful! Verification email has been simulated.',
          type: 'success'
        });
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      dispatch(authFailure(errMsg));
      setToastConfig({ message: errMsg, type: 'error' });
    }
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex flex-col transition-smooth">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-dark-surface rounded-2xl p-8 border border-dark-border shadow-xl max-w-md w-full text-center">
            {/* Animated checkmark */}
            <div className="h-16 w-16 bg-[#10B981]/10 rounded-full flex items-center justify-center text-[#10B981] mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Account Created!</h2>
            <p className="text-[#94A3B8] text-sm mb-4 leading-relaxed">
              We've sent a verification email to{' '}
              <span className="font-semibold text-white">{formData.email}</span>.
              Please click the link inside to verify your account.
            </p>

            {/* Countdown indicator */}
            <div className="bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.25)] rounded-xl p-4 mb-6">
              <p className="text-sm text-[#818CF8] font-semibold">
                Redirecting to login in{' '}
                <span className="text-white text-lg font-bold">{countdown}</span>s...
              </p>
              {/* Progress bar */}
              <div className="mt-2 h-1 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-indigo to-brand-purple rounded-full transition-all duration-1000"
                  style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-[rgba(255,255,255,0.03)] border border-dark-border rounded-lg p-4 mb-6 text-left">
              <p className="text-xs text-[#94A3B8] font-medium leading-normal">
                💡 <span className="font-semibold text-white">Local Sandbox Mode:</span> If you are testing locally, check the backend console log where the verification URL has been printed.
              </p>
            </div>

            <button
              onClick={() => navigate('/login', { replace: true })}
              className="block w-full py-3 bg-gradient-brand text-white rounded-xl font-bold shadow-md hover:scale-[1.02] hover-glow-purple transition-all text-center text-sm cursor-pointer"
            >
              Go to Login Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col text-white transition-smooth">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6 md:py-12 relative overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-brand-purple/20 blur-[100px] pointer-events-none animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-brand-indigo/20 blur-[100px] pointer-events-none animate-float" style={{animationDelay: '2s'}} />

        <div className="bg-dark-surface rounded-3xl border border-dark-border shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row relative z-10 animate-fade-up">
          
          {/* Left panel design */}
          <div className="bg-gradient-brand p-8 text-white md:w-5/12 flex flex-col justify-between relative overflow-hidden">
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px'}}></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-extrabold tracking-tight mb-4">Start your journey today.</h2>
              <p className="text-white/80 text-sm leading-relaxed mb-6">
                Join a premium hyperlocal freelance workspace mapping experts directly to neighboring businesses.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-white/90 flex-shrink-0" />
                <span className="text-sm font-medium">Verify credentials and skills</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-white/90 flex-shrink-0" />
                <span className="text-sm font-medium">Escrow protected payments</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-white/90 flex-shrink-0" />
                <span className="text-sm font-medium">Hyperlocal geolocation match</span>
              </div>
            </div>
            
            <p className="text-xs text-white/60 mt-8 relative z-10">© 2026 SkillSphere Inc.</p>
          </div>

          {/* Right panel form */}
          <div className="p-8 md:w-7/12">
            <h1 className="text-2xl font-bold text-white mb-6">Create Account</h1>

            {/* Role Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {/* Card Client */}
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                  role === 'client'
                    ? 'border-brand-indigo bg-brand-indigo/10 ring-1 ring-brand-indigo shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                    : 'border-dark-border bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                <User className={`h-6 w-6 mb-2 ${role === 'client' ? 'text-brand-indigo' : 'text-[#64748B]'}`} />
                <span className={`text-xs font-bold ${role === 'client' ? 'text-white' : 'text-[#94A3B8]'}`}>Client</span>
              </button>

              {/* Card Freelancer */}
              <button
                type="button"
                onClick={() => setRole('freelancer')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                  role === 'freelancer'
                    ? 'border-brand-purple bg-brand-purple/10 ring-1 ring-brand-purple shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                    : 'border-dark-border bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                <Briefcase className={`h-6 w-6 mb-2 ${role === 'freelancer' ? 'text-brand-purple' : 'text-[#64748B]'}`} />
                <span className={`text-xs font-bold ${role === 'freelancer' ? 'text-white' : 'text-[#94A3B8]'}`}>Freelancer</span>
              </button>

              {/* Card Admin */}
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                  role === 'admin'
                    ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'border-dark-border bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                <ShieldAlert className={`h-6 w-6 mb-2 ${role === 'admin' ? 'text-amber-500' : 'text-[#64748B]'}`} />
                <span className={`text-xs font-bold ${role === 'admin' ? 'text-white' : 'text-[#94A3B8]'}`}>Admin</span>
              </button>
            </div>

            {role === 'admin' ? (
              <div className="bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] rounded-xl p-6 text-center shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                <h3 className="text-md font-bold text-amber-400 mb-1">Administrative Access Only</h3>
                <p className="text-xs text-[#94A3B8] leading-normal max-w-sm mx-auto">
                  Administrator profiles cannot be created through the public registration interface. Please contact system IT operations for credential generation or link invitation templates.
                </p>
                <Link
                  to="/login"
                  className="inline-block mt-4 text-xs font-bold text-amber-500 hover:text-amber-400 underline"
                >
                  Log in with admin credentials
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border bg-[rgba(255,255,255,0.03)] text-white text-sm focus:outline-none focus:ring-2 transition-smooth ${
                      validationErrors.name
                        ? 'border-[#EF4444] focus:ring-[#EF4444]/30 focus:border-[#EF4444]'
                        : 'border-dark-border focus:ring-brand-indigo/30 focus:border-brand-indigo'
                    }`}
                    placeholder="Enter your name"
                  />
                  {validationErrors.name && (
                    <p className="text-xs text-rose-500 mt-1 font-medium">{validationErrors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">Email Address</label>
                  <input
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
                  />
                  {validationErrors.email && (
                    <p className="text-xs text-rose-500 mt-1 font-medium">{validationErrors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">Password</label>
                  <input
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
                  />
                  {validationErrors.password && (
                    <p className="text-xs text-rose-500 mt-1 font-medium">{validationErrors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border bg-[rgba(255,255,255,0.03)] text-white text-sm focus:outline-none focus:ring-2 transition-smooth ${
                      validationErrors.confirmPassword
                        ? 'border-[#EF4444] focus:ring-[#EF4444]/30 focus:border-[#EF4444]'
                        : 'border-dark-border focus:ring-brand-indigo/30 focus:border-brand-indigo'
                    }`}
                    placeholder="••••••••"
                  />
                  {validationErrors.confirmPassword && (
                    <p className="text-xs text-rose-500 mt-1 font-medium">{validationErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-4 mt-2 bg-gradient-brand text-white rounded-xl font-bold shadow-lg hover-glow-purple hover:scale-[1.01] active:scale-95 transition-all duration-200 text-sm cursor-pointer disabled:opacity-70 disabled:hover:scale-100"
                >
                  {loading ? <LoadingSpinner size="sm" color="white" /> : 'Register Account'}
                </button>
              </form>
            )}

            {/* Login Link */}
            <p className="text-center text-xs text-[#94A3B8] mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-indigo font-bold hover:text-white transition-colors">
                Log in
              </Link>
            </p>
          </div>
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

export default Register;
