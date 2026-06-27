import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { ShieldCheck, Lock } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  // State
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toastConfig, setToastConfig] = useState(null);
  const [isReset, setIsReset] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: ''
      });
    }
  };

  const validate = () => {
    const errors = {};
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
    setValidationErrors({});

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(`/auth/reset-password/${token}`, {
        password: formData.password
      });

      if (response.data.success) {
        setIsReset(true);
        setToastConfig({
          message: 'Your password has been successfully reset.',
          type: 'success'
        });
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to reset password. Link might be expired.';
      setToastConfig({ message: errMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col text-white transition-smooth">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-brand-indigo/20 blur-[100px] pointer-events-none animate-float" />

        <div className="bg-dark-surface rounded-3xl border border-dark-border shadow-2xl max-w-md w-full p-8 relative z-10 animate-fade-up">
          
          {!isReset ? (
            <>
              <div className="text-center mb-8">
                <div className="h-16 w-16 bg-brand-indigo/10 rounded-full flex items-center justify-center text-brand-indigo mx-auto mb-6 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                  <Lock className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">New Password</h1>
                <p className="text-[#94A3B8] text-sm">Create a secure new password for your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">New Password</label>
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
                    <p className="text-xs text-[#EF4444] mt-1 font-medium">{validationErrors.password}</p>
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
                    <p className="text-xs text-[#EF4444] mt-1 font-medium">{validationErrors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-4 mt-2 bg-gradient-brand text-white rounded-xl font-bold shadow-lg hover-glow-purple hover:scale-[1.01] active:scale-95 transition-all duration-200 text-sm cursor-pointer disabled:opacity-70 disabled:hover:scale-100"
                >
                  {loading ? <LoadingSpinner size="sm" color="white" /> : 'Update Password'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="h-16 w-16 bg-[#10B981]/10 rounded-full flex items-center justify-center text-[#10B981] mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Password Updated</h2>
              <p className="text-[#94A3B8] text-sm mb-6 leading-relaxed">
                Your password has been successfully modified. You can now use your new password to sign into your dashboard.
              </p>
              <Link
                to="/login"
                className="block w-full py-3 bg-gradient-brand text-white rounded-xl font-bold shadow-md hover:scale-[1.02] hover-glow-purple transition-all text-center text-sm"
              >
                Log In
              </Link>
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

export default ResetPassword;
