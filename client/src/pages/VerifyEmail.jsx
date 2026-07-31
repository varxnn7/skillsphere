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
    <div className="min-h-screen bg-surface-subtle flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-brand-100 blur-3xl opacity-50 pointer-events-none animate-float" />
        <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full bg-emerald-100 blur-3xl opacity-40 pointer-events-none animate-float" style={{ animationDelay: '1s' }} />

        <div className="bg-white rounded-3xl border border-surface-border shadow-[0_20px_60px_rgba(0,0,0,0.08)] max-w-md w-full p-8 text-center relative z-10 animate-blur-in">
          
          {status === 'verifying' && (
            <div className="py-6">
              <LoadingSpinner size="lg" />
              <h2 className="text-xl font-bold text-slate-900 mt-4 mb-2">Verifying Your Email</h2>
              <p className="text-slate-400 text-sm">Please wait while we validate your activation token...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-4">
              <div className="h-16 w-16 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Verified!</h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                {message || 'Your email address has been successfully verified. You can now log in.'}
              </p>
              <Link
                to="/login"
                className="btn-brand block w-full py-3 text-sm"
              >
                Log In to Account
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4">
              <div className="h-16 w-16 bg-red-50 border-2 border-red-200 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
                <XCircle className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">{message}</p>
              <div className="flex flex-col gap-3">
                <Link to="/register" className="btn-brand block w-full py-3 text-sm text-center">
                  Create New Account
                </Link>
                <Link to="/" className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
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
