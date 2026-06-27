import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { CheckCircle, XCircle } from 'lucide-react';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message);
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification token is invalid or has expired.');
      }
    };

    if (token) {
      verifyToken();
    } else {
      setStatus('error');
      setMessage('No verification token provided.');
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col text-white transition-smooth">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-[#10B981]/10 blur-[100px] pointer-events-none animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-brand-purple/10 blur-[100px] pointer-events-none animate-float" style={{animationDelay: '1s'}} />

        <div className="bg-dark-surface rounded-3xl border border-dark-border shadow-2xl max-w-md w-full p-8 text-center relative z-10 animate-fade-up">
          
          {status === 'verifying' && (
            <div className="py-6">
              <LoadingSpinner size="lg" color="white" />
              <h2 className="text-xl font-bold text-white mt-4 mb-2">Verifying Your Email</h2>
              <p className="text-[#94A3B8] text-sm">Please wait while we validate your activation token...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-4">
              <div className="h-16 w-16 bg-[#10B981]/10 rounded-full flex items-center justify-center text-[#10B981] mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verification Complete!</h2>
              <p className="text-[#94A3B8] text-sm mb-6 leading-relaxed">
                {message || 'Thank you! Your email address has been successfully verified. You can now access all freelancer features.'}
              </p>
              <Link
                to="/login"
                className="block w-full py-3 bg-gradient-brand text-white rounded-xl font-bold shadow-md hover:scale-[1.02] hover-glow-purple transition-all text-center text-sm"
              >
                Log In to Account
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4">
              <div className="h-16 w-16 bg-[#EF4444]/10 rounded-full flex items-center justify-center text-[#EF4444] mx-auto mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <XCircle className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
              <p className="text-[#94A3B8] text-sm mb-6 leading-relaxed">
                {message}
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/register"
                  className="block w-full py-3 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-white rounded-xl font-bold transition-all duration-200 text-center text-sm"
                >
                  Create New Account
                </Link>
                <Link
                  to="/"
                  className="text-xs font-semibold text-brand-indigo hover:text-white transition-colors"
                >
                  Go to Homepage
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
