import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import Toast from '../../components/Toast';
import EscrowBadge from '../../components/payments/EscrowBadge';
import ConfirmModal from '../../components/ui/ConfirmModal';
import {
  CheckCircle2,
  Clock,
  Play,
  FileUp,
  FileCheck,
  Send,
  AlertCircle,
  HelpCircle,
  Undo
} from 'lucide-react';

const ProjectTracker = () => {
  const { gigId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [gig, setGig] = useState(null);
  const [payments, setPayments] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastConfig, setToastConfig] = useState(null);

  // Deliverable upload modal state
  const [submitModalIndex, setSubmitModalIndex] = useState(null); // milestoneIndex
  const [deliverableFile, setDeliverableFile] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submittingFile, setSubmittingFile] = useState(false);

  // Revision modal states
  const [revisionNotes, setRevisionNotes] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState(null); // milestoneIndex
  const [sendingRevision, setSendingRevision] = useState(false);

  // Payment Release Confirm states
  const [releaseConfirm, setReleaseConfirm] = useState({
    isOpen: false,
    paymentId: null,
    amount: 0,
    freelancerName: ''
  });

  const fetchProjectData = async () => {
    try {
      const gigRes = await api.get(`/gigs/${gigId}`);
      if (gigRes.data.success) {
        setGig(gigRes.data.gig);
      }

      const payRes = await api.get(`/payments/gig/${gigId}`);
      if (payRes.data.success) {
        setPayments(payRes.data.payments);
      }

      const propRes = await api.get(`/proposals/gig/${gigId}`);
      if (propRes.data.success) {
        setProposals(propRes.data.proposals);
      }
    } catch (err) {
      console.error('Failed to load project details:', err);
      setToastConfig({ message: 'Failed to sync project tracker details', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [gigId]);

  // Find accepted proposal
  const acceptedProposal = proposals.find(p => p.status === 'accepted');

  const isClient = user?.role === 'client';
  const isFreelancer = user?.role === 'freelancer';

  const milestonesList = React.useMemo(() => {
    if (!gig) return [];
    if (gig.milestones && gig.milestones.length > 0) {
      return gig.milestones;
    }
    const payment = payments[0];
    let displayStatus = 'pending';
    if (payment) {
      if (payment.status === 'released') displayStatus = 'approved';
      else if (payment.status === 'escrow') displayStatus = 'funded';
      else if (payment.status === 'disputed') displayStatus = 'disputed';
    }
    return [{
      title: 'Project Deliverable Contract',
      description: 'Deliverables and scope covering the entire project agreement.',
      amount: acceptedProposal ? acceptedProposal.bidAmount : gig.budgetMax,
      status: displayStatus,
      dueDate: gig.createdAt
    }];
  }, [gig, payments, acceptedProposal]);

  // Mark milestone in-progress (Freelancer)
  const handleMarkInProgress = async (idx) => {
    try {
      const res = await api.put(`/gigs/${gigId}/milestones/${idx}/in-progress`);
      if (res.data.success) {
        setToastConfig({ message: 'Milestone marked as in progress', type: 'success' });
        fetchProjectData();
      }
    } catch (err) {
      setToastConfig({
        message: err.response?.data?.message || 'Failed to update milestone status',
        type: 'error'
      });
    }
  };

  // Submit deliverables (Freelancer)
  const handleDeliverableSubmit = async (e) => {
    e.preventDefault();
    if (!deliverableFile) {
      setToastConfig({ message: 'Please select a deliverable file', type: 'error' });
      return;
    }

    setSubmittingFile(true);
    const data = new FormData();
    data.append('file', deliverableFile);

    try {
      // 1. Upload file to Cloudinary
      const uploadRes = await api.post('/messages/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadRes.data.success) {
        const fileUrl = uploadRes.data.fileUrl;
        const fileName = uploadRes.data.fileName;

        // 2. Call submit endpoint
        const response = await api.put(`/gigs/${gigId}/milestones/${submitModalIndex}/submit`, {
          notes: submissionNotes,
          fileUrl,
          fileName
        });

        if (response.data.success) {
          setToastConfig({ message: 'Milestone deliverables submitted successfully!', type: 'success' });
          setSubmitModalIndex(null);
          setDeliverableFile(null);
          setSubmissionNotes('');
          fetchProjectData();
        }
      }
    } catch (err) {
      setToastConfig({
        message: err.response?.data?.message || 'Deliverables submission failed.',
        type: 'error'
      });
    } finally {
      setSubmittingFile(false);
    }
  };

  // Request revision (Client)
  const handleRequestRevision = async () => {
    if (!revisionNotes.trim()) {
      setToastConfig({ message: 'Please explain revision instructions', type: 'error' });
      return;
    }

    setSendingRevision(true);
    try {
      const response = await api.put(`/gigs/${gigId}/milestones/${showRevisionModal}/revision`, {
        notes: revisionNotes
      });

      if (response.data.success) {
        setToastConfig({ message: 'Revision instructions sent to freelancer.', type: 'info' });
        setShowRevisionModal(null);
        setRevisionNotes('');
        fetchProjectData();
      }
    } catch (err) {
      setToastConfig({ message: 'Failed to submit revision notes.', type: 'error' });
    } finally {
      setSendingRevision(false);
    }
  };

  // Open Release Confirmation (Client)
  const openApproveConfirm = (idx) => {
    // Find the payment associated with this milestone index in escrow status
    const payment = payments.find(p => p.milestoneIndex === idx && (p.status === 'escrow' || p.status === 'disputed'));
    if (!payment) {
      setToastConfig({ message: 'No escrow payment found to release.', type: 'error' });
      return;
    }

    setReleaseConfirm({
      isOpen: true,
      paymentId: payment._id,
      amount: payment.amount,
      freelancerName: gig.freelancer?.name || acceptedProposal?.freelancer?.name || 'Freelancer'
    });
  };

  // Approve & Release Payment (Client)
  const handleApproveRelease = async () => {
    const { paymentId } = releaseConfirm;
    setReleaseConfirm({ ...releaseConfirm, isOpen: false });

    try {
      const response = await api.post(`/payments/release/${paymentId}`);
      if (response.data.success) {
        setToastConfig({ message: 'Milestone approved and payment released!', type: 'success' });
        fetchProjectData();
      }
    } catch (err) {
      setToastConfig({ message: 'Failed to release milestone payment.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <div className="w-8 h-8 border-3 border-brand-indigo border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide">Syncing Project Tracker...</span>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="text-center py-12 text-xs font-bold text-[#64748B]">
        Failed to fetch gig project tracker.
      </div>
    );
  }

  const totalMilestones = milestonesList.length;
  const completedMilestones = milestonesList.filter(m => m.status === 'approved' || m.status === 'released').length;
  const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {toastConfig && (
        <Toast
          message={toastConfig.message}
          type={toastConfig.type}
          onClose={() => setToastConfig(null)}
        />
      )}

      {releaseConfirm.isOpen && (
        <ConfirmModal
          isOpen={releaseConfirm.isOpen}
          title="Approve Milestone & Release Funds"
          message={`Approve this milestone and release ₹${releaseConfirm.amount.toLocaleString()} to ${releaseConfirm.freelancerName}?`}
          confirmText="Approve & Release"
          confirmColor="green"
          onConfirm={handleApproveRelease}
          onClose={() => setReleaseConfirm({ ...releaseConfirm, isOpen: false })}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-dark-border/40 pb-6">
        <div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 mb-2">
            🚀 Active Project Board
          </span>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">{gig.title}</h1>
          <div className="flex flex-wrap gap-4 text-xs text-[#94A3B8] mt-1.5 font-medium">
            <span>Client: <strong className="text-white">{gig.client?.name}</strong></span>
            <span>Freelancer: <strong className="text-white">{acceptedProposal?.freelancer?.name || 'Unassigned'}</strong></span>
            <span>Status: <strong className="text-brand-indigo capitalize">{gig.status}</strong></span>
          </div>
        </div>

        {/* Progress Bar and Indicator */}
        <div className="flex items-center gap-4 bg-dark-surface p-4 rounded-xl border border-dark-border w-full md:w-auto min-w-[200px]">
          <div className="w-12 h-12 rounded-full border-4 border-brand-indigo/10 border-t-brand-indigo flex items-center justify-center font-extrabold text-sm text-white shrink-0">
            {progressPercent}%
          </div>
          <div className="w-full">
            <h4 className="text-xs font-bold text-white">Project Progress</h4>
            <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block mt-0.5">
              {completedMilestones} of {totalMilestones} Milestones Approved
            </span>
            <div className="w-full bg-white/5 rounded-full h-1.5 mt-2 overflow-hidden border border-dark-border">
              <div className="bg-[#10B981] h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones List */}
      <div className="space-y-6">
        <h2 className="text-md font-bold text-white uppercase tracking-wider">Milestone Board</h2>
        
        <div className="grid grid-cols-1 gap-6">
          {milestonesList.map((m, idx) => {
            const milestonePayment = payments.find(p => p.milestoneIndex === idx);
            
            // Determine active display status
            let displayStatus = m.status; // pending, funded, in-progress, submitted, approved, cancelled
            if (milestonePayment) {
              if (milestonePayment.status === 'escrow' && displayStatus === 'pending') {
                displayStatus = 'funded'; // Paid, not yet marked in-progress by freelancer
              }
              if (milestonePayment.status === 'disputed') {
                displayStatus = 'disputed';
              }
            }

            return (
              <div
                key={idx}
                className="bg-dark-surface p-6 rounded-2xl border border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[rgba(255,255,255,0.05)] transition-all"
              >
                {/* Left Side: Status Circle and Info */}
                <div className="flex items-start gap-4 flex-1">
                  
                  {/* Status indicator circle */}
                  <div className="pt-1 shrink-0">
                    {displayStatus === 'approved' || displayStatus === 'released' ? (
                      <div className="w-5 h-5 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    ) : displayStatus === 'submitted' ? (
                      <div className="w-5 h-5 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400" title="Submitted for Review">
                        <Clock className="h-3.5 w-3.5" />
                      </div>
                    ) : displayStatus === 'in-progress' ? (
                      <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-white/5 border border-dark-border flex items-center justify-center text-[#64748B]" />
                    )}
                  </div>

                  {/* Milestone Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-bold text-white uppercase tracking-wide">
                        Milestone #{idx + 1}: {m.title}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                        displayStatus === 'approved' || displayStatus === 'released' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        displayStatus === 'submitted' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        displayStatus === 'in-progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        displayStatus === 'funded' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        displayStatus === 'disputed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-white/5 text-[#94A3B8] border-dark-border'
                      }`}>
                        {displayStatus}
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed whitespace-pre-line">{m.description || 'No detailed instructions.'}</p>
                    
                    <div className="flex flex-wrap gap-4 pt-1 text-[10px] font-bold text-[#64748B] uppercase tracking-wide">
                      {m.dueDate && (
                        <span>Est. Due: {new Date(m.dueDate).toLocaleDateString('en-IN')}</span>
                      )}
                      <span>Budget: ₹{m.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Actions Panel */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  
                  {/* CLIENT ACTIONS */}
                  {isClient && (
                    <>
                      {displayStatus === 'pending' && acceptedProposal && (
                        <button
                          onClick={() => navigate(`/client/pay/${acceptedProposal._id}?milestone=${idx}`)}
                          className="px-4 py-2 bg-gradient-brand text-white text-xs font-bold rounded-xl text-center hover-glow-purple cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Play className="h-3.5 w-3.5" />
                          Fund Escrow
                        </button>
                      )}
                      
                      {displayStatus === 'submitted' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowRevisionModal(idx)}
                            className="px-3 py-2 bg-white/5 border border-dark-border hover:border-yellow-500/30 text-[#94A3B8] hover:text-yellow-400 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                          >
                            Request Revision
                          </button>
                          <button
                            onClick={() => openApproveConfirm(idx)}
                            className="px-3 py-2 bg-[#10B981] hover:bg-[#10B981]/90 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1 shadow-lg shadow-green-500/10"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Approve Milestone
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* FREELANCER ACTIONS */}
                  {isFreelancer && (
                    <>
                      {/* Mark as In Progress */}
                      {(displayStatus === 'funded' || displayStatus === 'pending') && milestonePayment?.status === 'escrow' && (
                        <button
                          onClick={() => handleMarkInProgress(idx)}
                          className="px-4 py-2 bg-brand-indigo hover:bg-brand-indigo/90 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors text-center"
                        >
                          Mark as In Progress
                        </button>
                      )}
                      
                      {/* Submit deliverable */}
                      {displayStatus === 'in-progress' && (
                        <button
                          onClick={() => setSubmitModalIndex(idx)}
                          className="px-4 py-2 bg-brand-indigo hover:bg-brand-indigo/90 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 text-center"
                        >
                          <FileUp className="h-3.5 w-3.5" />
                          Submit for Review
                        </button>
                      )}
                    </>
                  )}

                  {/* Status Badges */}
                  {(displayStatus === 'approved' || displayStatus === 'released') && (
                    <div className="px-4 py-2 bg-green-500/5 text-green-400 border border-green-500/20 text-xs font-bold rounded-xl uppercase tracking-wider flex items-center gap-1.5 cursor-default">
                      <FileCheck className="h-4 w-4" />
                      Milestone Approved
                    </div>
                  )}

                  {displayStatus === 'disputed' && (
                    <div className="px-4 py-2 bg-red-500/5 text-red-400 border border-red-500/20 text-xs font-bold rounded-xl uppercase tracking-wider cursor-default">
                      ⚠️ Locked (Disputed)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Freelancer Submit Deliverables Modal */}
      {submitModalIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handleDeliverableSubmit} className="bg-dark-surface w-full max-w-md rounded-2xl border border-dark-border p-6 space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <h3 className="text-md font-bold text-white">Submit Milestone Deliverables</h3>
            <p className="text-xs text-[#94A3B8]">Upload the deliverable files and include explanation notes. The client will review these to release escrow payment.</p>
            
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wide">Attach File (ZIP, PDF, Image)</label>
              <div className="p-4 border border-dashed border-dark-border rounded-xl flex flex-col items-center justify-center text-center gap-2">
                <FileUp className="h-6 w-6 text-[#64748B]" />
                <input
                  type="file"
                  onChange={(e) => setDeliverableFile(e.target.files[0])}
                  className="text-xs text-[#94A3B8] file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:bg-white/5 file:text-white file:cursor-pointer w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wide">Submission Notes</label>
              <textarea
                rows="3"
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder="Explain the work done, design decisions, or file paths..."
                className="w-full px-4 py-3 rounded-xl border border-dark-border bg-dark-surface text-white text-xs focus:ring-2 focus:ring-brand-indigo resize-none"
                required
              />
            </div>

            <div className="flex gap-3 justify-end border-t border-dark-border/40 pt-4">
              <button
                type="button"
                onClick={() => {
                  setSubmitModalIndex(null);
                  setDeliverableFile(null);
                  setSubmissionNotes('');
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-white/5 border border-dark-border text-[#94A3B8]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingFile}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-indigo text-white disabled:opacity-50"
              >
                {submittingFile ? 'Uploading deliverables...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Client Revision Modal */}
      {showRevisionModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-dark-surface w-full max-w-md rounded-2xl border border-dark-border p-6 space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <Undo className="h-5 w-5 text-yellow-500" />
              <span>Revision Instructions</span>
            </h3>
            <p className="text-xs text-[#94A3B8]">Describe what improvements or changes the freelancer needs to deliver for Milestone #{showRevisionModal + 1}.</p>
            
            <textarea
              rows="4"
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="Provide clear details on what was missing or needs refinement..."
              className="w-full px-4 py-3 rounded-xl border border-dark-border bg-dark-surface text-white text-xs focus:ring-2 focus:ring-brand-indigo resize-none"
              required
            />

            <div className="flex gap-3 justify-end border-t border-dark-border/40 pt-4">
              <button
                onClick={() => {
                  setShowRevisionModal(null);
                  setRevisionNotes('');
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-white/5 border border-dark-border text-[#94A3B8]"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestRevision}
                disabled={sendingRevision}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-indigo text-white disabled:opacity-50"
              >
                {sendingRevision ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTracker;
