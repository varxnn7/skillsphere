import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FileText, AlertCircle, MessageSquare } from 'lucide-react';
import api from '../../utils/api';
import { myProposalsSuccess, proposalsStart, proposalsFailure } from '../../store/proposalsSlice';
import ProposalCard from '../../components/gigs/ProposalCard';
import Navbar from '../../components/Navbar';
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
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col transition-smooth">
      <Navbar />

      <div className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-8 relative z-10 animate-fade-up">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">My Submitted Proposals</h1>
          <p className="text-[#94A3B8] text-sm mt-1">Track and negotiate active bidding contracts for your gigs</p>
        </div>

        {/* Tab Filters */}
        <div className="border-b border-dark-border/60 pb-3 flex flex-wrap gap-2">
          {['all', 'pending', 'accepted', 'rejected', 'withdrawn'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                activeTab === tab
                  ? 'bg-brand-indigo/15 border-brand-indigo/35 text-brand-indigo font-extrabold'
                  : 'border-transparent text-[#94A3B8] hover:bg-white/5 hover:text-white'
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
          <div className="text-center py-20 bg-dark-surface/30 border border-dark-border rounded-3xl p-8 max-w-md mx-auto space-y-3">
            <FileText className="h-10 w-10 mx-auto text-[#64748B]" />
            <h3 className="text-sm font-bold text-white">No Proposals Found</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              {activeTab === 'all'
                ? "You haven't submitted any proposals yet. Check the Marketplace and bid on gigs!"
                : `You don't have any proposals with status "${activeTab}".`}
            </p>
            {activeTab === 'all' && (
              <button
                onClick={() => navigate('/gigs')}
                className="px-4 py-2.5 rounded-xl bg-brand-indigo text-white font-bold text-xs hover-glow-purple cursor-pointer"
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
                <div className="p-3 bg-dark-surface border border-dark-border rounded-t-2xl border-b-0 flex items-center justify-between text-xs font-bold text-brand-indigo">
                  <span>
                    Gig Bidded: <span className="text-white hover:underline cursor-pointer" onClick={() => navigate(`/gigs/${proposal.gig?._id}`)}>{proposal.gig?.title}</span>
                  </span>
                  <span className="text-[#64748B]">{proposal.gig?.category}</span>
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
