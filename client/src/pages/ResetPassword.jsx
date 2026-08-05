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
    <div className="min-h-screen bg-surface-subtle flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-orange-100 blur-3xl opacity-50 pointer-events-none animate-float" />
        <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-amber-100 blur-3xl opacity-40 pointer-events-none animate-float" style={{ animationDelay: '2s' }} />

        <div className="bg-white rounded-3xl border border-surface-border shadow-[0_20px_60px_rgba(0,0,0,0.08)] max-w-md w-full p-8 relative z-10 animate-blur-in">
          
          {!isReset ? (
            <>
              <div className="text-center mb-8">
                <div className="h-16 w-16 bg-orange-50 border-2 border-orange-200 rounded-full flex items-center justify-center text-orange-600 mx-auto mb-6">
                  <Lock className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2">New Password</h1>
                <p className="text-slate-400 text-sm">Create a secure new password for your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">New Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input-clean ${validationErrors.password ? 'error' : ''}`}
                    placeholder="••••••••"
                  />
                  {validationErrors.password && (
                    <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input-clean ${validationErrors.confirmPassword ? 'error' : ''}`}
                    placeholder="••••••••"
                  />
                  {validationErrors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-brand w-full py-3.5 text-sm mt-2"
                >
                  {loading ? <LoadingSpinner size="sm" color="white" /> : 'Update Password'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="h-16 w-16 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Password Updated</h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Your password has been successfully modified. You can now use your new password to sign into your dashboard.
              </p>
              <Link
                to="/login"
                className="btn-brand block w-full py-3.5 text-sm text-center"
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
