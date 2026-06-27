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
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col text-white transition-smooth">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-brand-purple/20 blur-[100px] pointer-events-none animate-float" />

        <div className="bg-dark-surface rounded-3xl border border-dark-border shadow-2xl max-w-md w-full p-8 relative z-10 animate-fade-up">
          
          <div className="flex items-center gap-2 mb-6">
            <Link to="/login" className="text-[#94A3B8] hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="text-xs font-bold uppercase text-[#94A3B8] tracking-wider">Back to Login</span>
          </div>

          {!submitted ? (
            <>
              <div className="text-center mb-8">
                <div className="h-16 w-16 bg-brand-purple/10 rounded-full flex items-center justify-center text-brand-purple mx-auto mb-6 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                  <KeyRound className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
                <p className="text-[#94A3B8] text-sm leading-normal">
                  Enter your email and we'll transmit a password reset URL to reset your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    className={`w-full px-4 py-3 rounded-xl border bg-[rgba(255,255,255,0.03)] text-white text-sm focus:outline-none focus:ring-2 transition-smooth ${
                      error
                        ? 'border-[#EF4444] focus:ring-[#EF4444]/30 focus:border-[#EF4444]'
                        : 'border-dark-border focus:ring-brand-indigo/30 focus:border-brand-indigo'
                    }`}
                    placeholder="example@email.com"
                  />
                  {error && <p className="text-xs text-[#EF4444] mt-1 font-medium">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-4 mt-2 bg-gradient-brand text-white rounded-xl font-bold shadow-lg hover-glow-purple hover:scale-[1.01] active:scale-95 transition-all duration-200 text-sm cursor-pointer disabled:opacity-70 disabled:hover:scale-100"
                >
                  {loading ? <LoadingSpinner size="sm" color="white" /> : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="h-16 w-16 bg-[#10B981]/10 rounded-full flex items-center justify-center text-[#10B981] mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <Mail className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Instructions Sent</h2>
              <p className="text-[#94A3B8] text-sm mb-6 leading-relaxed">
                We've sent recovery details to <span className="font-semibold text-white">{email}</span>. Click the link inside the email to finalize password setups.
              </p>
              <div className="bg-[rgba(255,255,255,0.03)] border border-dark-border rounded-lg p-4 mb-6 text-left">
                <p className="text-xs text-[#94A3B8] font-medium leading-normal">
                  💡 <span className="font-semibold text-white">Development Log:</span> The reset verification URL is printed in the Node backend console screen.
                </p>
              </div>
              <Link
                to="/login"
                className="block w-full py-3 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-white rounded-xl font-bold transition-all duration-200 text-center text-sm"
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
