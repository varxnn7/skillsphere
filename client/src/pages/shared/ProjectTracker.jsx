import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import Toast from '../../components/Toast';
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
  Undo,
  Activity,
  Shield,
  ShieldAlert,
  CreditCard,
  MessageSquare,
  Paperclip,
  Download,
  Calendar,
  ExternalLink,
  ChevronRight
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
    freelancerName: '',
    milestoneIndex: 0
  });

  const fetchProjectData = async () => {
    try {
      const gigRes = await api.get(`/gigs/${gigId}`);
      if (gigRes.data.success) {
        setGig(gigRes.data.gig);
      }

      const payRes = await api.get(`/payments/gig/${gigId}`).catch(() => ({ data: { success: false, payments: [] } }));
      if (payRes.data?.success) {
        setPayments(payRes.data.payments || []);
      }

      const propRes = await api.get(`/proposals/gig/${gigId}`).catch(() => ({ data: { success: false, proposals: [] } }));
      if (propRes.data?.success) {
        setProposals(propRes.data.proposals || []);
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

  // Find accepted proposal & active freelancer
  const acceptedProposal = useMemo(() => {
    return proposals.find(p => p.status === 'accepted') || null;
  }, [proposals]);

  const contractor = useMemo(() => {
    return acceptedProposal?.freelancer || payments[0]?.freelancer || gig?.freelancer || null;
  }, [acceptedProposal, payments, gig]);

  const isClient = user?.role === 'client' || gig?.client?._id === user?._id;
  const isFreelancer = user?.role === 'freelancer' || contractor?._id === user?._id;

  const milestonesList = useMemo(() => {
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
      title: 'Full Project Scope Contract',
      description: 'Complete all deliverables according to the agreed project specifications and requirements.',
      amount: acceptedProposal ? acceptedProposal.bidAmount : gig.budgetMax,
      status: displayStatus,
      dueDate: gig.createdAt
    }];
  }, [gig, payments, acceptedProposal]);

  // Financial Calculations
  const contractTotal = useMemo(() => {
    return milestonesList.reduce((acc, m) => acc + (Number(m.amount) || 0), 0);
  }, [milestonesList]);

  const heldInEscrow = useMemo(() => {
    return payments
      .filter(p => p.status === 'escrow')
      .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  }, [payments]);

  const totalReleased = useMemo(() => {
    return payments
      .filter(p => p.status === 'released')
      .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  }, [payments]);

  const totalMilestones = milestonesList.length;
  const completedMilestones = milestonesList.filter(m => m.status === 'approved' || m.status === 'released').length;
  const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const handleChat = async (recipientId) => {
    if (!recipientId) return;
    try {
      const response = await api.post('/conversations', { recipientId });
      if (response.data.success) {
        navigate(`/messages/${response.data.conversation._id}`);
      }
    } catch (err) {
      navigate('/messages');
    }
  };

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
      const uploadRes = await api.post('/messages/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadRes.data.success) {
        const fileUrl = uploadRes.data.fileUrl;
        const fileName = uploadRes.data.fileName;

        const response = await api.put(`/gigs/${gigId}/milestones/${submitModalIndex}/submit`, {
          notes: submissionNotes,
          fileUrl,
          fileName
        });

        if (response.data.success) {
          setToastConfig({ message: 'Milestone deliverables submitted successfully for client review!', type: 'success' });
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
        setToastConfig({ message: 'Revision request sent to contractor.', type: 'info' });
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
    const payment = payments.find(p => p.milestoneIndex === idx && (p.status === 'escrow' || p.status === 'disputed')) || payments[0];
    
    if (!payment) {
      setToastConfig({ message: 'No active escrow deposit found to release for this milestone.', type: 'error' });
      return;
    }

    setReleaseConfirm({
      isOpen: true,
      paymentId: payment._id,
      amount: payment.amount || milestonesList[idx]?.amount || 0,
      freelancerName: contractor?.name || 'Contractor',
      milestoneIndex: idx
    });
  };

  // Approve & Release Payment (Client)
  const handleApproveRelease = async () => {
    const { paymentId, milestoneIndex } = releaseConfirm;
    setReleaseConfirm({ ...releaseConfirm, isOpen: false });

    try {
      const response = await api.post(`/payments/release/${paymentId}`);
      if (response.data.success) {
        setToastConfig({ message: 'Milestone approved and escrow payment released to freelancer!', type: 'success' });
        fetchProjectData();
      }
    } catch (err) {
      setToastConfig({ message: err.response?.data?.message || 'Failed to release milestone payment.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <div className="w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Syncing Project Tracker...</span>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-surface-border p-8 max-w-xl mx-auto space-y-4">
        <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Project Not Found</h2>
        <p className="text-xs text-slate-500">The requested project board could not be loaded.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold"
        >
          Return Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:py-8 space-y-6 animate-in fade-in duration-200">
      {toastConfig && (
        <Toast
          message={toastConfig.message}
          type={toastConfig.type}
          onClose={() => setToastConfig(null)}
        />
      )}

      {/* Release Funds Modal */}
      {releaseConfirm.isOpen && (
        <ConfirmModal
          isOpen={releaseConfirm.isOpen}
          title="Approve Milestone & Release Escrow"
          message={`Are you sure you want to approve this milestone and release ₹${releaseConfirm.amount.toLocaleString()} from escrow to ${releaseConfirm.freelancerName}? This action marks the deliverable as accepted.`}
          confirmText="Approve & Release Funds"
          confirmColor="green"
          onConfirm={handleApproveRelease}
          onClose={() => setReleaseConfirm({ ...releaseConfirm, isOpen: false })}
        />
      )}

      {/* Header Overview Card */}
      <div className="bg-white rounded-3xl border border-surface-border p-6 md:p-8 shadow-card space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Activity className="h-3 w-3 text-emerald-600" />
                Active Contract Board
              </span>
              <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-surface-subtle text-slate-600 border border-surface-border uppercase">
                {gig.category}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">{gig.title}</h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 font-semibold pt-1">
              <span>Client: <strong className="text-slate-900">{gig.client?.name || 'Client'}</strong></span>
              <span>Contractor: <strong className="text-slate-900">{contractor?.name || 'Not assigned yet'}</strong></span>
              <span>Status: <strong className="text-orange-600 capitalize">{gig.status}</strong></span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {contractor && (
              <button
                onClick={() => handleChat(isClient ? contractor._id : gig.client?._id)}
                className="px-4 py-2.5 bg-surface-subtle hover:bg-orange-50 hover:text-orange-600 border border-surface-border text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <MessageSquare className="h-4 w-4 text-orange-600" />
                Message {isClient ? 'Contractor' : 'Client'}
              </button>
            )}

            {payments.some(p => p.status === 'escrow') && (
              <button
                onClick={() => navigate(`/dispute/raise/${payments.find(p => p.status === 'escrow')?._id}`)}
                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ShieldAlert className="h-4 w-4" />
                Raise Dispute
              </button>
            )}
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-surface-border/60 pt-6">
          <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border">
            <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Contract Total</span>
            <span className="text-lg md:text-xl font-extrabold text-slate-900">₹{contractTotal.toLocaleString()}</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
            <span className="block text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Held in Escrow</span>
            <span className="text-lg md:text-xl font-extrabold text-emerald-700">₹{heldInEscrow.toLocaleString()}</span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
            <span className="block text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-1">Released Payouts</span>
            <span className="text-lg md:text-xl font-extrabold text-blue-700">₹{totalReleased.toLocaleString()}</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border flex flex-col justify-between">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Progress</span>
              <span className="text-xs font-extrabold text-slate-900">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Milestones Track + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Milestone Board */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">Project Milestones & Deliverables</h2>
            <span className="text-xs text-slate-500 font-bold">{completedMilestones} of {totalMilestones} Completed</span>
          </div>

          <div className="space-y-4">
            {milestonesList.map((m, idx) => {
              const milestonePayment = payments.find(p => p.milestoneIndex === idx) || payments[0];
              
              let displayStatus = m.status || 'pending';
              if (milestonePayment) {
                if (milestonePayment.status === 'released') displayStatus = 'approved';
                else if (milestonePayment.status === 'escrow' && displayStatus === 'pending') displayStatus = 'funded';
                else if (milestonePayment.status === 'disputed') displayStatus = 'disputed';
              }

              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-surface-border p-6 shadow-card hover:border-orange-200 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {displayStatus === 'approved' || displayStatus === 'released' ? (
                          <div className="h-6 w-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        ) : displayStatus === 'submitted' ? (
                          <div className="h-6 w-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600">
                            <Clock className="h-4 w-4" />
                          </div>
                        ) : displayStatus === 'in-progress' ? (
                          <div className="h-6 w-6 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-600">
                            <Activity className="h-4 w-4 animate-pulse" />
                          </div>
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-surface-subtle border border-surface-border flex items-center justify-center text-slate-400">
                            <Clock className="h-4 w-4" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-extrabold text-slate-900">
                            Milestone #{idx + 1}: {m.title}
                          </h3>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                            displayStatus === 'approved' || displayStatus === 'released' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            displayStatus === 'submitted' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            displayStatus === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            displayStatus === 'funded' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            displayStatus === 'disputed' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-surface-subtle text-slate-600 border-surface-border'
                          }`}>
                            {displayStatus === 'submitted' ? 'Review Deliverables' : displayStatus}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{m.description || 'Deliverables and scope covering this project phase.'}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Milestone Value</span>
                      <span className="text-base font-extrabold text-slate-900">₹{Number(m.amount).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Submission Deliverables View */}
                  {m.submissionNotes && (
                    <div className="p-4 bg-surface-subtle border border-surface-border rounded-xl space-y-2 text-xs">
                      <span className="font-bold text-slate-700 block">Deliverables Submitted by Contractor:</span>
                      <p className="text-slate-600 italic">"{m.submissionNotes}"</p>
                      {m.fileUrl && (
                        <a
                          href={m.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:underline pt-1"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download Deliverable Attachment ({m.fileName || 'Attachment'})
                        </a>
                      )}
                    </div>
                  )}

                  {/* Action Buttons Panel */}
                  <div className="border-t border-surface-border/40 pt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-400 font-medium">
                      {m.dueDate && <span>Estimated Delivery: {new Date(m.dueDate).toLocaleDateString('en-IN')}</span>}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* CLIENT CONTROLS */}
                      {isClient && (
                        <>
                          {displayStatus === 'pending' && (
                            <button
                              onClick={() => {
                                if (acceptedProposal) {
                                  navigate(`/client/pay/${acceptedProposal._id}?milestone=${idx}`);
                                } else {
                                  navigate(`/client/gigs/${gig._id}/proposals`);
                                }
                              }}
                              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              Fund Escrow (₹{Number(m.amount).toLocaleString()})
                            </button>
                          )}

                          {displayStatus === 'submitted' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowRevisionModal(idx)}
                                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                              >
                                Request Revision
                              </button>
                              <button
                                onClick={() => openApproveConfirm(idx)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Approve & Release Payment
                              </button>
                            </div>
                          )}

                          {displayStatus === 'funded' && (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                              <Shield className="h-3.5 w-3.5" />
                              Protected in Escrow
                            </span>
                          )}
                        </>
                      )}

                      {/* FREELANCER CONTROLS */}
                      {isFreelancer && (
                        <>
                          {displayStatus === 'funded' && (
                            <button
                              onClick={() => handleMarkInProgress(idx)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                            >
                              Start Working on Milestone
                            </button>
                          )}

                          {displayStatus === 'in-progress' && (
                            <button
                              onClick={() => setSubmitModalIndex(idx)}
                              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <FileUp className="h-3.5 w-3.5" />
                              Submit Deliverables
                            </button>
                          )}
                        </>
                      )}

                      {(displayStatus === 'approved' || displayStatus === 'released') && (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Payment Released
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Contract & Contractor Sidebar */}
        <div className="space-y-6">
          {/* Active Contractor / Client Card */}
          <div className="bg-white rounded-3xl border border-surface-border p-6 shadow-card space-y-4">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              {isClient ? 'Assigned Freelancer' : 'Project Client'}
            </h3>

            {contractor ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-600/10 border border-orange-600/20 flex items-center justify-center font-extrabold text-orange-600 text-base uppercase">
                    {contractor.name ? contractor.name.substring(0, 2) : 'FL'}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{contractor.name}</h4>
                    <p className="text-xs text-slate-500">{contractor.email}</p>
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 mt-1 capitalize">
                      Verified {contractor.role || 'Freelancer'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleChat(isClient ? contractor._id : gig.client?._id)}
                  className="w-full py-2.5 bg-surface-subtle hover:bg-orange-50 hover:text-orange-600 border border-surface-border text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <MessageSquare className="h-4 w-4 text-orange-600" />
                  Chat with {isClient ? contractor.name?.split(' ')[0] : 'Client'}
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-surface-subtle text-center space-y-2">
                <p className="text-xs font-bold text-slate-500">No proposal accepted yet.</p>
                {isClient && (
                  <Link
                    to={`/client/gigs/${gig._id}/proposals`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:underline"
                  >
                    Review Candidate Proposals <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Escrow Guarantee Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-card space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <Shield className="h-5 w-5" />
              <h4 className="text-sm font-extrabold">SkillSphere Escrow Shield</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Funds deposited by the client remain locked in secure escrow until deliverables are inspected and approved.
            </p>
            <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
              <span>Arbitration Support</span>
              <span className="text-emerald-400 font-bold">24/7 Protected</span>
            </div>
          </div>

          {/* Original Gig Attachments */}
          {gig.attachments && gig.attachments.length > 0 && (
            <div className="bg-white rounded-3xl border border-surface-border p-6 shadow-card space-y-3">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Project Specification Files</h3>
              <div className="space-y-2">
                {gig.attachments.map((att, idx) => (
                  <a
                    key={idx}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-surface-border bg-surface-subtle hover:border-orange-300 text-xs font-bold text-slate-800 transition-colors"
                  >
                    <span className="truncate max-w-[180px]">{att.name || `Attachment ${idx + 1}`}</span>
                    <Download className="h-3.5 w-3.5 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Freelancer Submit Deliverables Modal */}
      {submitModalIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handleDeliverableSubmit} className="bg-white w-full max-w-md rounded-2xl border border-surface-border p-6 space-y-4 shadow-2xl">
            <h3 className="text-md font-bold text-slate-900">Submit Milestone Deliverables</h3>
            <p className="text-xs text-slate-500">Upload the deliverable files and include explanation notes. The client will review these to release escrow payment.</p>
            
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Attach File (ZIP, PDF, Image)</label>
              <div className="p-4 border border-dashed border-surface-border rounded-xl flex flex-col items-center justify-center text-center gap-2">
                <FileUp className="h-6 w-6 text-slate-400" />
                <input
                  type="file"
                  onChange={(e) => setDeliverableFile(e.target.files[0])}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:bg-surface-subtle file:text-slate-900 file:cursor-pointer w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Submission Notes</label>
              <textarea
                rows="3"
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder="Explain the work done, design decisions, or file paths..."
                className="w-full px-4 py-3 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-xs focus:ring-2 focus:ring-orange-600 resize-none"
                required
              />
            </div>

            <div className="flex gap-3 justify-end border-t border-surface-border/40 pt-4">
              <button
                type="button"
                onClick={() => {
                  setSubmitModalIndex(null);
                  setDeliverableFile(null);
                  setSubmissionNotes('');
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-surface-subtle border border-surface-border text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingFile}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {submittingFile ? 'Uploading deliverables...' : 'Submit For Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Client Revision Modal */}
      {showRevisionModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl border border-surface-border p-6 space-y-4 shadow-2xl">
            <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
              <Undo className="h-5 w-5 text-amber-500" />
              <span>Request Revision</span>
            </h3>
            <p className="text-xs text-slate-500">Describe what improvements or changes the freelancer needs to deliver for Milestone #{showRevisionModal + 1}.</p>
            
            <textarea
              rows="4"
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="Provide clear details on what was missing or needs refinement..."
              className="w-full px-4 py-3 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-xs focus:ring-2 focus:ring-orange-600 resize-none"
              required
            />

            <div className="flex gap-3 justify-end border-t border-surface-border/40 pt-4">
              <button
                onClick={() => {
                  setShowRevisionModal(null);
                  setRevisionNotes('');
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-surface-subtle border border-surface-border text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestRevision}
                disabled={sendingRevision}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {sendingRevision ? 'Sending...' : 'Send Revision Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTracker;
