import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Users, CreditCard, MessageSquare, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import { proposalsStart, proposalsSuccess, proposalsFailure } from '../../store/proposalsSlice';
import ProposalCard from '../../components/gigs/ProposalCard';
import StatusBadge from '../../components/ui/StatusBadge';

import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';

const GigProposals = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { proposals, loading } = useSelector((state) => state.proposals);
  const [gig, setGig] = useState(null);
  const [sortOption, setSortOption] = useState('newest');
  const [toastConfig, setToastConfig] = useState(null);

  const fetchGigAndProposals = async () => {
    dispatch(proposalsStart());
    try {
      // Get Gig specifications
      const gigRes = await api.get(`/gigs/${id}`);
      if (gigRes.data.success) {
        setGig(gigRes.data.gig);
      }

      // Get proposals list
      const propRes = await api.get(`/proposals/gig/${id}`);
      if (propRes.data.success) {
        dispatch(proposalsSuccess(propRes.data.proposals));
      }
    } catch (err) {
      dispatch(proposalsFailure(err.response?.data?.message || 'Failed to fetch details.'));
      setToastConfig({ message: 'Failed to fetch details.', type: 'error' });
    }
  };

  useEffect(() => {
    if (id) {
      fetchGigAndProposals();
    }
  }, [id, dispatch]);

  const handleAccept = async (propId) => {
    try {
      const res = await api.put(`/proposals/${propId}/accept`);
      if (res.data.success) {
        setToastConfig({ message: 'Contract accepted successfully! Project started.', type: 'success' });
        fetchGigAndProposals();
      }
    } catch (err) {
      setToastConfig({ message: err.response?.data?.message || 'Failed to accept.', type: 'error' });
    }
  };

  const handleReject = async (propId) => {
    try {
      const res = await api.put(`/proposals/${propId}/reject`, {
        clientResponse: 'Thank you for bidding. We chose to move forward with another freelancer.'
      });
      if (res.data.success) {
        setToastConfig({ message: 'Proposal rejected.', type: 'success' });
        fetchGigAndProposals();
      }
    } catch (err) {
      setToastConfig({ message: err.response?.data?.message || 'Failed to reject.', type: 'error' });
    }
  };

  const handleNegotiate = async (propId, amount, message) => {
    try {
      const res = await api.put(`/proposals/${propId}/negotiate`, { amount, message });
      if (res.data.success) {
        setToastConfig({ message: 'Negotiation offer sent!', type: 'success' });
        fetchGigAndProposals();
      }
    } catch (err) {
      setToastConfig({ message: err.response?.data?.message || 'Failed to send offer.', type: 'error' });
    }
  };

  // Sort logic
  const sortedProposals = [...proposals].sort((a, b) => {
    if (sortOption === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortOption === 'lowest_bid') {
      return a.bidAmount - b.bidAmount;
    } else if (sortOption === 'highest_rated') {
      return (b.freelancer?.averageRating || 0) - (a.freelancer?.averageRating || 0);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col transition-smooth">
      <div className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-8 relative z-10 animate-fade-up">
        {/* Back control */}
        <button
          onClick={() => navigate('/client/my-gigs')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Gigs
        </button>

        {/* Gig Spec Info summary card */}
        {gig && (
          <div className="bg-dark-surface border border-dark-border rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#64748B]">
                  {gig.category}
                </span>
                <StatusBadge status={gig.status} />
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-white leading-snug">{gig.title}</h2>
              <p className="text-xs text-[#94A3B8] leading-relaxed max-w-2xl">{gig.description}</p>
            </div>

            <div className="border-t md:border-t-0 md:border-l border-dark-border/60 pt-4 md:pt-0 md:pl-6 flex-shrink-0 space-y-1">
              <span className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider">Gig Budget</span>
              <span className="text-lg font-extrabold text-white">
                ₹{gig.budgetMin?.toLocaleString()} - ₹{gig.budgetMax?.toLocaleString()}
              </span>
              <span className="block text-[10px] text-[#64748B] font-medium uppercase">
                {gig.budgetType === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
              </span>
            </div>
          </div>
        )}

        {/* Sort & proposal list */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border/60 pb-3">
            <h3 className="text-md font-extrabold text-white flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-brand-indigo" />
              Incoming Proposals ({proposals.length})
            </h3>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#64748B]">Sort by:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-dark-border bg-dark-surface text-xs font-bold text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-indigo"
              >
                <option value="newest">Newest First</option>
                <option value="lowest_bid">Lowest Bid</option>
                <option value="highest_rated">Highest Rated Freelancer</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <LoadingSpinner size="lg" color="white" />
            </div>
          ) : sortedProposals.length === 0 ? (
            <div className="text-center py-20 bg-dark-surface/30 border border-dark-border rounded-3xl p-8 max-w-md mx-auto space-y-3">
              <MessageSquare className="h-10 w-10 mx-auto text-[#64748B]" />
              <h3 className="text-sm font-bold text-white">No Proposals Yet</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                As soon as freelancers start applying to your job post, their applications will show up here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedProposals.map((proposal) => (
                <ProposalCard
                  key={proposal._id}
                  proposal={proposal}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onNegotiate={handleNegotiate}
                  isClientOwner={true}
                />
              ))}
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

export default GigProposals;
