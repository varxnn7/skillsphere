import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import Toast from '../../components/Toast';
import { CreditCard, ShieldCheck, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const MakePayment = () => {
  const { proposalId } = useParams();
  const [searchParams] = useSearchParams();
  const milestoneIndex = Number(searchParams.get('milestone')) || 0;

  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [existingPayment, setExistingPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [toastConfig, setToastConfig] = useState(null);

  useEffect(() => {
    const fetchProposalDetails = async () => {
      try {
        const response = await api.get(`/proposals/${proposalId}`);
        if (response.data.success) {
          setProposal(response.data.proposal);
          // Check if a payment already exists for this proposal
          try {
            const paymentsRes = await api.get('/payments/my-payments');
            if (paymentsRes.data.success) {
              const existing = paymentsRes.data.payments.find(
                (p) => p.proposal?.toString() === proposalId && p.status !== 'refunded'
              );
              if (existing) setExistingPayment(existing);
            }
          } catch (_) {}
        }
      } catch (err) {
        console.error('Failed to load proposal details:', err);
        setToastConfig({ message: 'Failed to load checkout details', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchProposalDetails();
  }, [proposalId]);

  const verifyPayment = async (verificationDetails) => {
    try {
      const verifyRes = await api.post('/payments/verify', verificationDetails);
      if (verifyRes.data.success) {
        setToastConfig({ message: 'Payment successful! Funds held in escrow.', type: 'success' });
        setTimeout(() => {
          navigate('/client/payments');
        }, 2000);
      }
    } catch (vErr) {
      setToastConfig({
        message: vErr.response?.data?.message || 'Payment verification failed',
        type: 'error'
      });
    }
  };

  const handlePayment = async () => {
    setPaying(true);
    try {
      // 1. Create order on server
      const orderRes = await api.post('/payments/create-order', {
        gigId: proposal.gig._id,
        proposalId,
        milestoneIndex
      });

      if (orderRes.data.success) {
        const { order, payment } = orderRes.data;

        // 2. Check if mock checkout
        if (order.isMock) {
          await verifyPayment({
            razorpayOrderId: order.id,
            razorpayPaymentId: 'mock_pay_id_' + Date.now(),
            razorpaySignature: 'mock_sig_id_' + Date.now(),
            paymentId: payment._id
          });
        } else {
          // Open real Razorpay widget
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: 'INR',
            name: 'SkillSphere',
            description: `Secure Escrow: ${proposal.gig?.title}`,
            order_id: order.id,
            handler: function (response) {
              verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentId: payment._id
              });
            },
            modal: {
              ondismiss: function () {
                setPaying(false);
                setToastConfig({ message: 'Payment cancelled. Funds were not charged.', type: 'error' });
              }
            },
            prefill: {
              name: proposal.gig?.client?.name || '',
              email: proposal.gig?.client?.email || ''
            },
            theme: { color: '#6366F1' }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
          return; // Don't run finally while modal is open
        }
      }
    } catch (err) {
      console.error('Checkout creation error:', err);
      setToastConfig({
        message: err.response?.data?.message || 'Could not initiate checkout order.',
        type: 'error'
      });
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <div className="w-8 h-8 border-3 border-brand-indigo border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide">Loading Checkout...</span>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="text-center py-12 text-xs font-bold text-[#64748B]">
        Failed to fetch payment contract data.
      </div>
    );
  }

  const milestoneArr = proposal.milestones || [];
  const milestone = milestoneArr[milestoneIndex];
  const totalAmount = milestone ? milestone.amount : proposal.bidAmount;
  const platformFee = Math.round(totalAmount * 0.10);
  const freelancerNet = totalAmount - platformFee;

  // Show already paid banner
  if (existingPayment && existingPayment.status !== 'refunded') {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-green-500/10 border border-green-500/20 mx-auto">
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>
        <h2 className="text-xl font-extrabold text-white">Payment Already Made</h2>
        <p className="text-xs text-[#94A3B8]">
          A payment of {fmt(existingPayment.amount)} has already been submitted for this proposal.
          Status: <strong className="text-white capitalize">{existingPayment.status}</strong>
        </p>
        <button
          onClick={() => navigate('/client/payments')}
          className="px-6 py-2.5 bg-brand-indigo text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer"
        >
          View Payments
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-200">
      {toastConfig && (
        <Toast
          message={toastConfig.message}
          type={toastConfig.type}
          onClose={() => setToastConfig(null)}
        />
      )}

      {/* Header */}
      <div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-brand-indigo/15 text-brand-indigo border border-brand-indigo/30 mb-2">
          🔒 Secure Escrow Checkout
        </span>
        <h1 className="text-2xl font-extrabold text-white">Milestone Funding</h1>
        <p className="text-xs text-[#94A3B8] mt-1">Fund project milestones securely. Funds are held in platform escrow until you approve deliverables.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Form: Breakdown */}
        <div className="md:col-span-2 space-y-6">
          {/* Payment summary card */}
          <div className="bg-dark-surface p-6 rounded-2xl border border-dark-border space-y-4">
            <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider border-b border-dark-border/40 pb-2">Project Contract Summary</h2>
            
            <div className="space-y-1.5">
              <span className="text-[10px] text-[#64748B] font-bold uppercase">Gig Listing</span>
              <p className="text-sm font-bold text-white leading-snug">{proposal.gig?.title}</p>
            </div>

            {milestone && (
              <div className="p-3 bg-white/5 border border-dark-border rounded-xl space-y-1 text-xs">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Funding Milestone</span>
                <p className="font-semibold text-white">{milestone.title}</p>
                {milestone.description && <p className="text-[10px] text-[#94A3B8]">{milestone.description}</p>}
              </div>
            )}

            <div className="flex items-center gap-3 border-t border-dark-border/40 pt-4">
              <img
                src={proposal.freelancer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=40'}
                alt={proposal.freelancer?.name}
                className="h-8 w-8 rounded-full border border-dark-border object-cover"
              />
              <div>
                <span className="block text-[9px] text-[#64748B] font-extrabold uppercase">Assigned Freelancer</span>
                <span className="text-xs text-white font-bold">{proposal.freelancer?.name}</span>
              </div>
            </div>
          </div>

          {/* Amount Breakdown Card */}
          <div className="bg-dark-surface p-6 rounded-2xl border border-dark-border space-y-4">
            <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider border-b border-dark-border/40 pb-2">Amount Breakdown</h2>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Gig Amount</span>
                <span className="font-bold text-white">₹{freelancerNet.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[#94A3B8] block">Platform Service Fee (10%)</span>
                  <span className="text-[9px] text-[#64748B] block mt-0.5">Secure payment escrow protection fee</span>
                </div>
                <span className="font-medium text-[#64748B]">₹{platformFee.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex justify-between border-t border-dark-border/40 pt-4 text-sm font-black text-white">
                <span>Total to Pay</span>
                <span className="text-lg text-brand-indigo">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Checkout CTA */}
        <div className="space-y-6">
          <div className="bg-dark-surface p-6 rounded-2xl border border-dark-border space-y-4">
            <div className="flex items-center gap-2.5 text-brand-indigo border-b border-dark-border/40 pb-3">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <h3 className="text-xs font-bold uppercase tracking-wider">SkillSphere Escrow Guarantee</h3>
            </div>

            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              We secure your funds in our platform vault. The freelancer only receives the release after you accept and sign off on completed deliverables.
            </p>

            <button
              onClick={handlePayment}
              disabled={paying}
              className="w-full py-3 bg-gradient-brand hover-glow-purple text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{paying ? 'Processing Checkout...' : 'Pay Now'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakePayment;
