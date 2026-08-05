import React from 'react';
import { CreditCard, Calendar, User, ShieldAlert } from 'lucide-react';
import EscrowBadge from './EscrowBadge';
import { Link } from 'react-router-dom';

const PaymentCard = ({ payment, onRelease, isReleasing }) => {
  const formattedDate = new Date(payment.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-[0_0_20px_rgba(0,0,0,0.2)] flex flex-col justify-between hover:border-[rgba(255,255,255,0.08)] transition-smooth">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start gap-2">
          <div className="p-3 bg-orange-600/10 rounded-xl border border-orange-600/20 text-orange-600">
            <CreditCard className="h-5 w-5" />
          </div>
          <EscrowBadge status={payment.status} />
        </div>

        {/* Title */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Project Gig</h4>
          <p className="text-sm font-bold text-slate-900 truncate">{payment.gig?.title || 'Hyperlocal Gig Contract'}</p>
        </div>

        {/* Partner Info */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-surface-muted border border-surface-border flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-slate-500" />
          </div>
          <div>
            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Freelancer</h5>
            <p className="text-xs font-semibold text-slate-500">{payment.freelancer?.name || 'Contractor'}</p>
          </div>
        </div>

        {/* Date & Milestones */}
        <div className="flex justify-between items-center text-xs text-slate-500 border-t border-surface-border/40 pt-3">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formattedDate}
          </span>
          <span className="font-bold">Milestone #{payment.milestoneIndex + 1}</span>
        </div>
      </div>

      {/* Footer & Release Action */}
      <div className="mt-5 border-t border-surface-border/40 pt-4 flex flex-col gap-2">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-bold text-slate-500">Escrow Balance</span>
          <span className="text-xl font-extrabold text-slate-900">₹{payment.amount.toLocaleString('en-IN')}</span>
        </div>

        {payment.status === 'escrow' && (
          <div className="flex gap-2 w-full">
            <button
              onClick={() => onRelease(payment._id)}
              disabled={isReleasing}
              className="flex-1 py-2 rounded-xl bg-gradient-orange hover-glow-orange text-slate-900 font-bold text-xs cursor-pointer text-center transition-all disabled:opacity-50"
            >
              {isReleasing ? 'Releasing...' : 'Release Escrow'}
            </button>
            <Link
              to={`/dispute/raise/${payment._id}`}
              className="px-3 py-2 rounded-xl bg-surface-muted border border-surface-border hover:border-red-500/40 text-slate-500 hover:text-red-400 font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
              title="Dispute Escrow Payment"
            >
              <ShieldAlert className="h-4 w-4" />
            </Link>
          </div>
        )}

        {payment.status === 'disputed' && (
          <div className="w-full text-center py-2 bg-orange-500/10 text-purple-400 border border-orange-500/20 text-[11px] font-bold rounded-xl uppercase tracking-wider">
            ⚠️ Escrow Frozen (Disputed)
          </div>
        )}

        {payment.status === 'released' && (
          <div className="w-full text-center py-2 bg-green-500/10 text-green-400 border border-green-500/20 text-[11px] font-bold rounded-xl uppercase tracking-wider">
            ✓ Released to Freelancer
          </div>
        )}

        {payment.status === 'refunded' && (
          <div className="w-full text-center py-2 bg-red-500/10 text-red-400 border border-red-500/20 text-[11px] font-bold rounded-xl uppercase tracking-wider">
            ✓ Refunded to Client
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCard;
