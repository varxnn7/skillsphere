import React, { useState } from 'react';
import { Calendar, CreditCard, MessageSquare, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

const ProposalCard = ({ proposal, onAccept, onReject, onNegotiate, onWithdraw, isClientOwner, isFreelancerOwner }) => {
  const [showMilestones, setShowMilestones] = useState(false);
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [negMessage, setNegMessage] = useState('');
  const [negAmount, setNegAmount] = useState(proposal.bidAmount);
  const [isSubmittingNeg, setIsSubmittingNeg] = useState(false);

  const handleNegotiateSubmit = async (e) => {
    e.preventDefault();
    if (!negAmount || !negMessage) return;
    setIsSubmittingNeg(true);
    await onNegotiate(proposal._id, Number(negAmount), negMessage);
    setIsSubmittingNeg(false);
    setNegMessage('');
    setShowNegotiation(false);
  };

  const freelancer = proposal.freelancer || {};

  return (
    <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 space-y-4 hover:border-[rgba(255,255,255,0.06)] transition-all">
      {/* Header: User Profile Info */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-indigo/10 border border-brand-indigo/20 flex items-center justify-center font-bold text-brand-indigo text-lg uppercase">
            {freelancer.name?.substring(0, 2) || 'FL'}
          </div>
          <div>
            <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
              {freelancer.name || 'Anonymous Freelancer'}
              {freelancer.isVerified && <ShieldCheck className="h-4 w-4 text-[#10B981]" />}
            </h4>
            <p className="text-[#94A3B8] text-xs">{freelancer.email}</p>
          </div>
        </div>

        {/* Pricing/Timeline summary */}
        <div className="flex items-center gap-4 text-xs font-bold bg-[rgba(255,255,255,0.02)] border border-dark-border px-4 py-2.5 rounded-xl">
          <div className="flex items-center gap-1.5 text-white">
            <CreditCard className="h-4 w-4 text-brand-indigo" />
            <span>₹{proposal.bidAmount?.toLocaleString()}</span>
          </div>
          <div className="h-4 w-px bg-dark-border" />
          <div className="flex items-center gap-1.5 text-[#94A3B8]">
            <Calendar className="h-4 w-4 text-[#64748B]" />
            <span>{proposal.estimatedDays} Days</span>
          </div>
          <div className="h-4 w-px bg-dark-border" />
          <StatusBadge status={proposal.status} />
        </div>
      </div>

      {/* Cover Letter */}
      <div className="space-y-1.5">
        <h5 className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">Cover Letter</h5>
        <p className="text-xs text-[#94A3B8] leading-relaxed whitespace-pre-line p-4 rounded-xl bg-[rgba(255,255,255,0.01)] border border-dark-border/40">
          {proposal.coverLetter}
        </p>
      </div>

      {/* Milestones toggle */}
      {proposal.milestones?.length > 0 && (
        <div className="border-t border-dark-border/40 pt-3">
          <button
            onClick={() => setShowMilestones(!showMilestones)}
            className="flex items-center gap-1.5 text-xs font-bold text-brand-indigo hover:text-white transition-colors cursor-pointer"
          >
            {showMilestones ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showMilestones ? 'Hide Proposed Milestones' : `Show Proposed Milestones (${proposal.milestones.length})`}
          </button>

          {showMilestones && (
            <div className="mt-3 space-y-2 pl-2">
              {proposal.milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 rounded-xl border border-dark-border bg-[rgba(255,255,255,0.01)] text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">{m.title}</p>
                    <p className="text-[10px] text-[#64748B]">{m.days} days to deliver</p>
                  </div>
                  <span className="font-extrabold text-brand-indigo">₹{m.amount?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Negotiation History Toggle */}
      {proposal.negotiationHistory?.length > 0 && (
        <div className="border-t border-dark-border/40 pt-3">
          <button
            onClick={() => setShowNegotiation(!showNegotiation)}
            className="flex items-center gap-1.5 text-xs font-bold text-brand-purple hover:text-white transition-colors cursor-pointer"
          >
            {showNegotiation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showNegotiation ? 'Hide Negotiation History' : `Show Negotiation Logs (${proposal.negotiationHistory.length})`}
          </button>

          {showNegotiation && (
            <div className="mt-3 space-y-3 pl-2">
              {proposal.negotiationHistory.map((neg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs max-w-md ${
                    neg.by === 'client'
                      ? 'bg-[#3B82F6]/5 border-[#3B82F6]/20 mr-auto'
                      : 'bg-brand-purple/5 border-brand-purple/20 ml-auto'
                  }`}
                >
                  <div className="flex justify-between items-center gap-4 mb-1">
                    <span className="font-extrabold capitalize text-white">
                      Offer by {neg.by === 'client' ? 'Client' : 'Freelancer'}
                    </span>
                    <span className="font-bold text-[10px] text-[#64748B]">
                      {new Date(neg.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[#94A3B8] leading-relaxed mb-1">{neg.message}</p>
                  <span className="font-extrabold text-white text-xs">Counter-Offer: ₹{neg.amount?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      {proposal.status === 'pending' && (
        <div className="border-t border-dark-border/40 pt-4 flex flex-wrap gap-3">
          {/* Client Specific Actions */}
          {isClientOwner && (
            <>
              <button
                onClick={() => onAccept(proposal._id)}
                className="px-4 py-2.5 rounded-xl bg-gradient-brand text-white text-xs font-bold hover-glow-purple transition-all duration-200 cursor-pointer"
              >
                Accept Proposal
              </button>
              <button
                onClick={() => onReject(proposal._id)}
                className="px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500 hover:text-white text-rose-400 text-xs font-bold transition-all cursor-pointer"
              >
                Reject Proposal
              </button>
              <button
                onClick={() => setShowNegotiation(!showNegotiation)}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-dark-border text-slate-300 text-xs font-bold hover:border-brand-purple/50 transition-all cursor-pointer"
              >
                Negotiate
              </button>
            </>
          )}

          {/* Freelancer Specific Actions */}
          {isFreelancerOwner && (
            <>
              <button
                onClick={() => onWithdraw(proposal._id)}
                className="px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500 hover:text-white text-rose-400 text-xs font-bold transition-all cursor-pointer"
              >
                Withdraw Proposal
              </button>
              <button
                onClick={() => setShowNegotiation(!showNegotiation)}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-dark-border text-slate-300 text-xs font-bold hover:border-brand-purple/50 transition-all cursor-pointer"
              >
                Counter Offer
              </button>
            </>
          )}
        </div>
      )}

      {/* Negotiation Input Box (Inline Drawer style) */}
      {showNegotiation && (isClientOwner || isFreelancerOwner) && (
        <form onSubmit={handleNegotiateSubmit} className="mt-3 p-4 rounded-2xl border border-dark-border bg-[rgba(255,255,255,0.01)] space-y-3">
          <h4 className="text-xs font-bold text-white flex items-center gap-1">
            <MessageSquare className="h-4 w-4 text-brand-purple" />
            Propose Negotiation Counters
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">New Bid Price (₹)</span>
              <input
                type="number"
                value={negAmount}
                onChange={(e) => setNegAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-dark-border bg-dark-surface text-white text-xs focus:ring-2 focus:ring-brand-purple"
                required
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Message to Other Party</span>
              <input
                type="text"
                value={negMessage}
                onChange={(e) => setNegMessage(e.target.value)}
                placeholder="Offer explanation..."
                className="w-full px-3 py-2 rounded-xl border border-dark-border bg-dark-surface text-white text-xs focus:ring-2 focus:ring-brand-purple"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmittingNeg}
            className="w-full py-2.5 rounded-xl bg-brand-purple text-white text-xs font-bold hover:scale-[1.01] transition-all cursor-pointer"
          >
            {isSubmittingNeg ? 'Submitting offer...' : 'Submit Counter-Offer'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ProposalCard;
