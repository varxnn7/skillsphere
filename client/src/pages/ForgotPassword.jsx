import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { KeyRound, Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toastConfig, setToastConfig] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please provide your email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data.success) {
        setSubmitted(true);
        setToastConfig({
          message: 'Reset instructions have been sent to your email.',
          type: 'success'
        });
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error occurred. Please verify email and try again.';
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
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-orange-100 blur-3xl opacity-50 pointer-events-none animate-float" />

        <div className="bg-white rounded-3xl border border-surface-border shadow-[0_20px_60px_rgba(0,0,0,0.08)] max-w-md w-full p-8 relative z-10 animate-blur-in">
          
          <div className="flex items-center gap-2 mb-6">
            <Link to="/login" className="text-slate-400 hover:text-slate-700 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Back to Login</span>
          </div>

          {!submitted ? (
            <>
              <div className="text-center mb-8">
                <div className="h-16 w-16 bg-orange-50 border-2 border-orange-200 rounded-full flex items-center justify-center text-orange-600 mx-auto mb-6">
                  <KeyRound className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2">Reset Password</h1>
                <p className="text-slate-400 text-sm leading-normal">
                  Enter your email and we'll send a password reset link to your email address.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    className={`input-clean ${error ? 'error' : ''}`}
                    placeholder="you@example.com"
                  />
                  {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-brand w-full py-3.5 text-sm mt-2"
                >
                  {loading ? <LoadingSpinner size="sm" color="white" /> : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="h-16 w-16 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
                <Mail className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Instructions Sent</h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                We've sent recovery details to <span className="font-bold text-slate-700">{email}</span>. Click the link inside the email to reset your password.
              </p>
              <Link
                to="/login"
                className="btn-brand block w-full py-3.5 text-sm"
              >
                Return to Login
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

export default ForgotPassword;
