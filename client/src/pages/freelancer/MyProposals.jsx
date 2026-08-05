import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FileText, AlertCircle, MessageSquare } from 'lucide-react';
import api from '../../utils/api';
import { myProposalsSuccess, proposalsStart, proposalsFailure } from '../../store/proposalsSlice';
import ProposalCard from '../../components/gigs/ProposalCard';

import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';

const MyProposals = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myProposals, loading } = useSelector((state) => state.proposals);
  const [activeTab, setActiveTab] = useState('all');
  const [toastConfig, setToastConfig] = useState(null);

  const fetchMyProposals = async () => {
    dispatch(proposalsStart());
    try {
      const response = await api.get('/proposals/my-proposals');
      if (response.data.success) {
        dispatch(myProposalsSuccess(response.data.proposals));
      }
    } catch (err) {
      dispatch(proposalsFailure(err.response?.data?.message || 'Failed to fetch proposals.'));
    }
  };

  useEffect(() => {
    fetchMyProposals();
  }, [dispatch]);

  const handleWithdraw = async (propId) => {
    try {
      const response = await api.put(`/proposals/${propId}/withdraw`);
      if (response.data.success) {
        setToastConfig({ message: 'Proposal withdrawn successfully.', type: 'success' });
        fetchMyProposals();
      }
    } catch (err) {
      setToastConfig({ message: err.response?.data?.message || 'Failed to withdraw.', type: 'error' });
    }
  };

  const handleNegotiate = async (propId, amount, message) => {
    try {
      const response = await api.put(`/proposals/${propId}/negotiate`, { amount, message });
      if (response.data.success) {
        setToastConfig({ message: 'Counter-offer sent successfully!', type: 'success' });
        fetchMyProposals();
      }
    } catch (err) {
      setToastConfig({ message: err.response?.data?.message || 'Failed to send counter-offer.', type: 'error' });
    }
  };

  const filteredProposals = myProposals.filter((prop) => {
    if (activeTab === 'all') return true;
    return prop.status?.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-surface-subtle text-slate-900 flex flex-col transition-smooth">
      <div className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-8 relative z-10 animate-fade-up">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">My Submitted Proposals</h1>
          <p className="text-slate-500 text-sm mt-1">Track and negotiate active bidding contracts for your gigs</p>
        </div>

        {/* Tab Filters */}
        <div className="border-b border-surface-border/60 pb-3 flex flex-wrap gap-2">
          {['all', 'pending', 'accepted', 'rejected', 'withdrawn'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                activeTab === tab
                  ? 'bg-orange-600/15 border-orange-600/35 text-orange-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:bg-surface-muted hover:text-slate-900'
              } cursor-pointer`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid display */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <LoadingSpinner size="lg" color="white" />
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="text-center py-20 bg-white/30 border border-surface-border rounded-3xl p-8 max-w-md mx-auto space-y-3">
            <FileText className="h-10 w-10 mx-auto text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">No Proposals Found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {activeTab === 'all'
                ? "You haven't submitted any proposals yet. Check the Marketplace and bid on gigs!"
                : `You don't have any proposals with status "${activeTab}".`}
            </p>
            {activeTab === 'all' && (
              <button
                onClick={() => navigate('/gigs')}
                className="px-4 py-2.5 rounded-xl bg-orange-600 text-slate-900 font-bold text-xs hover-glow-orange cursor-pointer"
              >
                Browse Gigs
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredProposals.map((proposal) => (
              <div key={proposal._id} className="space-y-2">
                {/* Title indicator banner overlay */}
                <div className="p-3 bg-white border border-surface-border rounded-t-2xl border-b-0 flex items-center justify-between text-xs font-bold text-orange-600">
                  <span>
                    Gig Bidded: <span className="text-slate-900 hover:underline cursor-pointer" onClick={() => navigate(`/gigs/${proposal.gig?._id}`)}>{proposal.gig?.title}</span>
                  </span>
                  <span className="text-slate-500">{proposal.gig?.category}</span>
                </div>
                <div className="mt-[-8px]">
                  <ProposalCard
                    proposal={proposal}
                    onWithdraw={handleWithdraw}
                    onNegotiate={handleNegotiate}
                    isFreelancerOwner={true}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
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

export default MyProposals;
