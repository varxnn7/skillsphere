import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import EscrowBadge from '../../components/payments/EscrowBadge';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Toast from '../../components/Toast';
import { CreditCard, Wallet, Calendar, Award, Scale } from 'lucide-react';

const Payments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastConfig, setToastConfig] = useState(null);

  // Confirm Release Modal state
  const [releaseModal, setReleaseModal] = useState({
    isOpen: false,
    paymentId: null,
    amount: 0,
    freelancerName: ''
  });

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments/my-payments');
      if (response.data.success) {
        setPayments(response.data.payments);
      }
    } catch (err) {
      console.error('Failed to load payments ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const openReleaseConfirm = (payment) => {
    setReleaseModal({
      isOpen: true,
      paymentId: payment._id,
      amount: payment.amount,
      freelancerName: payment.freelancer?.name || 'Freelancer'
    });
  };

  const handleRelease = async () => {
    const { paymentId } = releaseModal;
    setReleaseModal({ ...releaseModal, isOpen: false });

    try {
      const response = await api.post(`/payments/release/${paymentId}`);
      if (response.data.success) {
        setToastConfig({ message: 'Payment released successfully', type: 'success' });
        fetchPayments();
      }
    } catch (err) {
      setToastConfig({
        message: err.response?.data?.message || 'Failed to release escrow funds.',
        type: 'error'
      });
    }
  };

  const escrowPayments = payments.filter((p) => p.status === 'escrow' || p.status === 'disputed');

  // Stats Card Calculations
  const totalSpent = payments
    .filter((p) => p.status === 'released')
    .reduce((sum, p) => sum + p.amount, 0);

  const inEscrow = payments
    .filter((p) => p.status === 'escrow')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalGigsPaid = payments
    .filter((p) => p.status === 'released')
    .length;

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const thisMonthSpent = payments
    .filter((p) => p.status === 'released' && p.releasedAt && new Date(p.releasedAt) >= startOfMonth)
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <div className="w-8 h-8 border-3 border-brand-indigo border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide">Loading Payments ledger...</span>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          icon={CreditCard}
          title="No Payments Found"
          message="No payments yet. Accept a proposal to get started."
          ctaText="View Gigs"
          ctaLink="/client/my-gigs"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {toastConfig && (
        <Toast
          message={toastConfig.message}
          type={toastConfig.type}
          onClose={() => setToastConfig(null)}
        />
      )}

      {releaseModal.isOpen && (
        <ConfirmModal
          isOpen={releaseModal.isOpen}
          title="Release Escrow Funds"
          message={`Release ₹${releaseModal.amount.toLocaleString()} to ${releaseModal.freelancerName}? This cannot be undone.`}
          confirmText="Yes, Release"
          confirmColor="green"
          onConfirm={handleRelease}
          onClose={() => setReleaseModal({ ...releaseModal, isOpen: false })}
        />
      )}

      {/* Header */}
      <div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-brand-indigo/15 text-brand-indigo border border-brand-indigo/30 mb-2">
          💳 Financial ledger
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">Payments & Escrow</h1>
        <p className="text-xs text-[#94A3B8] mt-1">Track platform escrow transactions, fund pending milestones, and view payouts history.</p>
      </div>

      {/* Stats Cards Grid (Mobile 2x2 grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-dark-surface p-4 md:p-6 rounded-2xl border border-dark-border flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 shrink-0">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] md:text-xs font-bold text-[#64748B] uppercase tracking-wide">Total Spent</span>
            <span className="text-lg md:text-xl font-extrabold text-white">₹{totalSpent.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="bg-dark-surface p-4 md:p-6 rounded-2xl border border-dark-border flex items-center gap-4">
          <div className="p-3 rounded-xl bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] md:text-xs font-bold text-[#64748B] uppercase tracking-wide">In Escrow</span>
            <span className="text-lg md:text-xl font-extrabold text-white">₹{inEscrow.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="bg-dark-surface p-4 md:p-6 rounded-2xl border border-dark-border flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] md:text-xs font-bold text-[#64748B] uppercase tracking-wide">Gigs Paid</span>
            <span className="text-lg md:text-xl font-extrabold text-white">{totalGigsPaid} Contracts</span>
          </div>
        </div>

        <div className="bg-dark-surface p-4 md:p-6 rounded-2xl border border-dark-border flex items-center gap-4">
          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] md:text-xs font-bold text-[#64748B] uppercase tracking-wide">This Month</span>
            <span className="text-lg md:text-xl font-extrabold text-white">₹{thisMonthSpent.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Active Escrow Section */}
      <div className="space-y-4">
        <h2 className="text-md font-bold text-white uppercase tracking-wider">Funds in Escrow</h2>
        {escrowPayments.length === 0 ? (
          <p className="text-xs text-[#64748B] font-bold py-2">No active escrow transactions.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {escrowPayments.map((p) => (
              <div key={p._id} className="bg-dark-surface p-6 rounded-2xl border border-dark-border flex flex-col justify-between space-y-4 hover:border-[rgba(255,255,255,0.08)] transition-colors">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-sm font-bold text-white leading-snug line-clamp-1">{p.gig?.title || 'Contract Payment'}</h3>
                    <span className="px-2 py-0.5 rounded bg-brand-indigo/15 text-brand-indigo text-[9px] font-extrabold uppercase tracking-wide shrink-0">
                      {p.type === 'milestone' ? `Milestone #${(p.milestoneIndex ?? 0) + 1}` : 'Full Project'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      src={p.freelancer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=30'}
                      alt={p.freelancer?.name}
                      className="h-6 w-6 rounded-full border border-dark-border object-cover"
                    />
                    <span className="text-xs text-slate-300 font-semibold">{p.freelancer?.name || 'Freelancer'}</span>
                  </div>
                  <div className="text-2xl font-black text-white pt-1">
                    ₹{p.amount.toLocaleString('en-IN')}
                  </div>
                  <span className="block text-[10px] text-[#64748B] font-bold">
                    Deposited: {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {p.status === 'escrow' && (
                  <button
                    onClick={() => openReleaseConfirm(p)}
                    className="w-full py-2 bg-[#10B981] hover:bg-[#10B981]/90 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-lg shadow-green-500/10 text-center"
                  >
                    Release Payment
                  </button>
                )}
                {p.status === 'disputed' && (
                  <button
                    disabled
                    className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-xs rounded-xl cursor-not-allowed text-center"
                  >
                    🔒 Locked (Disputed)
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment History Section */}
      <div className="space-y-4">
        <h2 className="text-md font-bold text-white uppercase tracking-wider">Payment History</h2>
        <div className="bg-dark-surface rounded-2xl border border-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-dark-border text-xs">
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Gig Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Freelancer</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Platform Fee</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40 text-xs text-slate-300">
                {payments.map((p) => {
                  const formattedDate = new Date(p.paidAt || p.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <tr key={p._id} className="hover:bg-white/[0.01]">
                      <td className="px-6 py-4 font-bold text-white">{p.gig?.title || 'Gig Contract'}</td>
                      <td className="px-6 py-4">{p.freelancer?.name || 'Freelancer'}</td>
                      <td className="px-6 py-4 font-bold text-white">₹{p.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-[#64748B]">₹{p.platformFee.toLocaleString()}</td>
                      <td className="px-6 py-4">{formattedDate}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                          p.status === 'released' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          p.status === 'refunded' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                          p.status === 'disputed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {p.status === 'escrow' ? (
                          <button
                            onClick={() => navigate(`/dispute/raise/${p._id}`)}
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                          >
                            Raise Dispute
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-3 py-1.5 bg-white/5 border border-dark-border text-[#475569] font-bold text-[10px] rounded-lg cursor-not-allowed"
                          >
                            Raise Dispute
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
