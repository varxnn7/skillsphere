import { Calendar, CreditCard, MessageSquare, ShieldCheck, ChevronDown, ChevronUp, Star, Trash2, HelpCircle, FileText, ExternalLink } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import Modal from '../ui/Modal';

const ProposalCard = ({ proposal, onAccept, onReject, onNegotiate, onWithdraw, isClientOwner, isFreelancerOwner }) => {
  const [showMilestones, setShowMilestones] = useState(false);
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [negMessage, setNegMessage] = useState('');
  const [negAmount, setNegAmount] = useState(proposal.bidAmount);
  const [isSubmittingNeg, setIsSubmittingNeg] = useState(false);
  
  // Modals / Dialogs states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

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
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="flex items-center text-amber-500">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="text-xs font-bold text-white ml-1">
                  {freelancer.averageRating ? freelancer.averageRating.toFixed(1) : '5.0'}
                </span>
              </div>
              <span className="text-[10px] text-[#64748B] font-bold">•</span>
              <p className="text-[#94A3B8] text-xs">{freelancer.email}</p>
            </div>
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
          <StatusBadge status={proposal.status === 'rejected' ? 'Not Selected' : proposal.status} />
        </div>
      </div>

      {/* Cover Letter */}
      <div className="space-y-1.5">
        <h5 className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">Cover Letter</h5>
        <div className="text-xs text-[#94A3B8] leading-relaxed p-4 rounded-xl bg-[rgba(255,255,255,0.01)] border border-dark-border/40">
          <p className="whitespace-pre-line inline">
            {proposal.coverLetter?.length > 150
              ? `${proposal.coverLetter.substring(0, 150)}...`
              : proposal.coverLetter}
          </p>
          {proposal.coverLetter?.length > 150 && (
            <button
              onClick={() => setIsDetailModalOpen(true)}
              className="text-brand-indigo hover:text-white font-bold ml-1.5 cursor-pointer underline"
            >
              Read more
            </button>
          )}
        </div>
      </div>

      {/* Client Rejection Reason */}
      {proposal.status === 'rejected' && proposal.clientResponse && (
        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs text-rose-400 space-y-1">
          <p className="font-extrabold">Client Feedback:</p>
          <p className="text-slate-300 leading-relaxed italic">"{proposal.clientResponse}"</p>
        </div>
      )}

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
                onClick={() => setShowAcceptConfirm(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-brand text-white text-xs font-bold hover-glow-purple transition-all duration-200 cursor-pointer"
              >
                Accept Proposal
              </button>
              <button
                onClick={() => setShowRejectConfirm(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500 hover:text-white text-rose-400 text-xs font-bold transition-all cursor-pointer"
              >
                Reject Proposal
              </button>
              <button
                onClick={() => setIsDetailModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-dark-border text-slate-300 text-xs font-bold hover:border-brand-purple/50 transition-all cursor-pointer"
              >
                View Details & Negotiate
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

      {/* Accept Confirmation Dialog */}
      <Modal isOpen={showAcceptConfirm} onClose={() => setShowAcceptConfirm(false)} title="Accept Proposal">
        <div className="space-y-6 text-center py-4">
          <HelpCircle className="h-14 w-14 text-emerald-400 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-md font-bold text-white">Accept Bid of ₹{proposal.bidAmount?.toLocaleString()}?</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed max-w-sm mx-auto">
              Accepting this proposal will automatically reject all other bids for this gig and set the status to active.
            </p>
          </div>
          <div className="flex gap-4 max-w-xs mx-auto">
            <button
              onClick={() => setShowAcceptConfirm(false)}
              className="flex-1 py-3 bg-white/5 border border-dark-border text-xs font-bold rounded-xl text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onAccept(proposal._id);
                setShowAcceptConfirm(false);
              }}
              className="flex-1 py-3 bg-emerald-500 text-white text-xs font-bold rounded-xl"
            >
              Confirm Accept
            </button>
          </div>
        </div>
      </Modal>

      {/* Reject Confirmation Dialog */}
      <Modal isOpen={showRejectConfirm} onClose={() => setShowRejectConfirm(false)} title="Reject Proposal">
        <div className="space-y-6 text-center py-4">
          <HelpCircle className="h-14 w-14 text-rose-400 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-md font-bold text-white">Reject this application?</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed max-w-sm mx-auto">
              Are you sure you want to reject the proposal from {freelancer.name}? They will be notified.
            </p>
          </div>
          <div className="flex gap-4 max-w-xs mx-auto">
            <button
              onClick={() => setShowRejectConfirm(false)}
              className="flex-1 py-3 bg-white/5 border border-dark-border text-xs font-bold rounded-xl text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onReject(proposal._id);
                setShowRejectConfirm(false);
              }}
              className="flex-1 py-3 bg-[#EF4444] text-white text-xs font-bold rounded-xl"
            >
              Reject Proposal
            </button>
          </div>
        </div>
      </Modal>

      {/* Full Detail Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Application Details">
        <div className="space-y-6 text-left py-2">
          {/* Cover Letter */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-[#64748B] uppercase tracking-wider">Cover Letter</h4>
            <div className="text-xs text-slate-300 leading-relaxed bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-dark-border whitespace-pre-wrap">
              {proposal.coverLetter}
            </div>
          </div>

          {/* Milestones list */}
          {proposal.milestones?.length > 0 && (
            <div className="space-y-2 border-t border-dark-border/40 pt-4">
              <h4 className="text-xs font-extrabold text-[#64748B] uppercase tracking-wider">Proposed Milestones</h4>
              <div className="space-y-2">
                {proposal.milestones.map((m, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 border border-dark-border bg-dark-surface/50 rounded-xl text-xs">
                    <div>
                      <p className="font-bold text-white">{m.title}</p>
                      <p className="text-[10px] text-[#64748B]">{m.days} days delivery</p>
                    </div>
                    <span className="font-extrabold text-brand-indigo">₹{m.amount?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Negotiation logs */}
          {proposal.negotiationHistory?.length > 0 && (
            <div className="space-y-2 border-t border-dark-border/40 pt-4">
              <h4 className="text-xs font-extrabold text-[#64748B] uppercase tracking-wider">Negotiation History</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {proposal.negotiationHistory.map((neg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs max-w-sm ${
                      neg.by === 'client'
                        ? 'bg-[#3B82F6]/5 border-[#3B82F6]/20 mr-auto'
                        : 'bg-brand-purple/5 border-brand-purple/20 ml-auto'
                    }`}
                  >
                    <div className="flex justify-between items-center gap-4 mb-1">
                      <span className="font-extrabold capitalize text-white">
                        Offer by {neg.by === 'client' ? 'Client' : 'Freelancer'}
                      </span>
                      <span className="font-bold text-[9px] text-[#64748B]">
                        {new Date(neg.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[#94A3B8] leading-relaxed mb-1">{neg.message}</p>
                    <span className="font-extrabold text-white text-xs">Counter-Offer: ₹{neg.amount?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {proposal.attachments?.length > 0 && (
            <div className="space-y-2 border-t border-dark-border/40 pt-4">
              <h4 className="text-xs font-extrabold text-[#64748B] uppercase tracking-wider">Attached Files</h4>
              <div className="space-y-2">
                {proposal.attachments.map((file, idx) => (
                  <a
                    key={idx}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-dark-border bg-dark-surface/50 text-xs hover:border-brand-indigo transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-brand-indigo" />
                      <span className="text-slate-300 font-bold">{file.name}</span>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-[#64748B]" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Inline negotiation forms inside modal */}
          {proposal.status === 'pending' && (isClientOwner || isFreelancerOwner) && (
            <div className="border-t border-dark-border/40 pt-4">
              <button
                type="button"
                onClick={() => setShowNegotiation(!showNegotiation)}
                className="w-full py-2.5 bg-brand-purple/10 border border-brand-purple/35 text-brand-purple hover:bg-brand-purple hover:text-white rounded-xl text-xs font-bold transition-all"
              >
                {showNegotiation ? 'Cancel Counter-Offer' : 'Negotiate / Send Counter-Offer'}
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ProposalCard;
