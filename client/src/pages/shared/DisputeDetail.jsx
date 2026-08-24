import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import Toast from '../../components/Toast';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { ShieldAlert, Download, FileText, Send, User, Clock, ChevronRight, CheckCircle2, AlertOctagon } from 'lucide-react';

const DisputeDetail = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastConfig, setToastConfig] = useState(null);

  // Evidence upload state
  const [additionalFile, setAdditionalFile] = useState(null);
  const [addingEvidence, setAddingEvidence] = useState(false);

  // Admin resolution modal state
  const [adjudicateWinner, setAdjudicateWinner] = useState(null); // 'client' | 'freelancer'
  const [resolutionText, setResolutionText] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  const fetchDisputeDetail = async () => {
    try {
      const response = await api.get(`/disputes/${id}`);
      if (response.data.success) {
        setDispute(response.data.dispute);
      }
    } catch (err) {
      console.error('Failed to load dispute details:', err);
      setToastConfig({ message: 'Dispute file loading failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputeDetail();
  }, [id]);

  // Submit additional evidence
  const handleAddEvidence = async (e) => {
    e.preventDefault();
    if (!additionalFile) {
      setToastConfig({ message: 'Please select a file to upload.', type: 'error' });
      return;
    }

    setAddingEvidence(true);
    const data = new FormData();
    data.append('evidence', additionalFile);

    try {
      const response = await api.put(`/disputes/${id}/evidence`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setToastConfig({ message: 'New evidence uploaded successfully!', type: 'success' });
        setAdditionalFile(null);
        fetchDisputeDetail();
      }
    } catch (err) {
      setToastConfig({ message: 'Failed to upload additional evidence.', type: 'error' });
    } finally {
      setAddingEvidence(false);
    }
  };

  // Submit admin adjudication verdict
  const executeVerdict = async () => {
    if (!resolutionText.trim()) {
      setToastConfig({ message: 'Please provide resolution explanation details.', type: 'error' });
      return;
    }

    setResolving(true);
    try {
      const response = await api.put(`/disputes/${id}/resolve`, {
        winner: adjudicateWinner,
        adminNotes: adminNotes,
        resolution: resolutionText
      });

      if (response.data.success) {
        setToastConfig({ message: 'Dispute resolved successfully!', type: 'success' });
        setAdjudicateWinner(null);
        setResolutionText('');
        setAdminNotes('');
        fetchDisputeDetail();
      }
    } catch (err) {
      setToastConfig({ message: 'Failed to resolve dispute contract.', type: 'error' });
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <div className="w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Loading Arbitration Dossier...</span>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="text-center py-12 text-xs font-bold text-slate-500">
        Dispute details could not be found.
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';
  const isResolved = dispute.status.startsWith('resolved');
  const isRaiser = user?._id === (dispute.raisedBy?._id || dispute.raisedBy);

  // Generate event timeline dynamically
  const timelineEvents = [];
  if (dispute.createdAt) {
    timelineEvents.push({
      title: 'Dispute Raised',
      description: `Conflict registered regarding milestone payment.`,
      date: new Date(dispute.createdAt)
    });
  }
  if (dispute.evidence && dispute.evidence.length > 0) {
    timelineEvents.push({
      title: 'Evidence Dossier Filed',
      description: `${dispute.evidence.length} files attached as proof.`,
      date: new Date(dispute.createdAt)
    });
  }
  if (isResolved && dispute.resolvedAt) {
    timelineEvents.push({
      title: 'Verdict Issued',
      description: `Admin adjudicated dispute: "${dispute.resolution}"`,
      date: new Date(dispute.resolvedAt)
    });
  }
  // Sort timeline by date
  timelineEvents.sort((a, b) => a.date - b.date);

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-200">
      {toastConfig && (
        <Toast
          message={toastConfig.message}
          type={toastConfig.type}
          onClose={() => setToastConfig(null)}
        />
      )}

      {/* Admin Adjudication Confirmation Modal */}
      {adjudicateWinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl border border-surface-border p-6 space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-orange-600" />
              <span>Adjudicate Verdict: Resolve for {adjudicateWinner === 'client' ? 'Client (Refund)' : 'Freelancer (Release)'}</span>
            </h3>
            
            <p className="text-xs text-slate-500">
              Explain the reason behind this verdict. This message will be sent to both client and freelancer.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Resolution Explanation (Required)</label>
                <textarea
                  rows="3"
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="Explain why this decision is made based on evidence..."
                  className="w-full px-3 py-2 rounded-xl border border-surface-border bg-white text-slate-900 focus:ring-2 focus:ring-orange-600 resize-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Private Adjudication Notes (Admin only)</label>
                <textarea
                  rows="2"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal audit log details..."
                  className="w-full px-3 py-2 rounded-xl border border-surface-border bg-white text-slate-900 focus:ring-2 focus:ring-orange-600 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end border-t border-surface-border/40 pt-4">
              <button
                type="button"
                onClick={() => {
                  setAdjudicateWinner(null);
                  setResolutionText('');
                  setAdminNotes('');
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-surface-muted border border-surface-border text-slate-500 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeVerdict}
                disabled={resolving}
                className={`px-4 py-2 text-xs font-bold rounded-xl text-slate-900 cursor-pointer ${
                  adjudicateWinner === 'client' ? 'bg-[#10B981] hover:bg-[#10B981]/90' : 'bg-orange-600 hover:bg-orange-600/90'
                }`}
              >
                {resolving ? 'Issuing verdict...' : 'Confirm Adjudication'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-red-50 text-red-700 border border-red-200 mb-2">
            <ShieldAlert className="h-3 w-3 text-red-600" />
            Mediation Chamber
          </span>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">Dispute Arbitration File</h1>
          <p className="text-xs text-slate-500 mt-1">Project Contract: <span className="font-semibold text-slate-900">{dispute.gig?.title}</span></p>
        </div>

        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start ${
          isResolved ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {dispute.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left main area: dispute statement and evidence */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Statement */}
          <div className="bg-white p-6 rounded-2xl border border-surface-border space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-surface-border/40 pb-2">Conflict Context</h3>
            
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-slate-500 font-bold uppercase text-[9px] mb-0.5">Raised By</span>
                  <span className="text-slate-900 font-semibold">{dispute.raisedBy?.name || 'User'} ({dispute.raisedBy?.role})</span>
                </div>
                <div>
                  <span className="block text-slate-500 font-bold uppercase text-[9px] mb-0.5">Opposing Party</span>
                  <span className="text-slate-900 font-semibold">{dispute.against?.name || 'User'} ({dispute.against?.role})</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="block text-slate-500 font-bold uppercase text-[9px]">Primary Dispute Reason</span>
                <p className="font-semibold text-slate-900 bg-surface-muted p-3 rounded-xl border border-surface-border">{dispute.reason}</p>
              </div>

              <div className="space-y-1.5">
                <span className="block text-slate-500 font-bold uppercase text-[9px]">Detailed Statement</span>
                <p className="text-xs text-slate-500 leading-relaxed bg-[rgba(255,255,255,0.01)] p-4 rounded-xl border border-surface-border/60">
                  {dispute.description}
                </p>
              </div>
            </div>
          </div>

          {/* Evidence dossier */}
          <div className="bg-white p-6 rounded-2xl border border-surface-border space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-surface-border/40 pb-2">Evidence Dossier</h3>
            
            {dispute.evidence.length === 0 ? (
              <p className="text-xs text-slate-500 font-bold text-center py-4">No evidence documents submitted yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dispute.evidence.map((file, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-surface-border bg-white/[0.01] flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="h-4 w-4 text-orange-600 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-surface-muted border border-surface-border hover:border-orange-600 text-slate-500 hover:text-slate-900 shrink-0 cursor-pointer"
                      title="Download Evidence File"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* Add More Evidence (only for dispute raiser) */}
            {!isResolved && isRaiser && (
              <form onSubmit={handleAddEvidence} className="border-t border-surface-border/40 pt-4 flex items-center gap-2">
                <input
                  type="file"
                  onChange={(e) => setAdditionalFile(e.target.files[0])}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:bg-surface-muted file:text-slate-900 file:cursor-pointer flex-1"
                  required
                />
                <button
                  type="submit"
                  disabled={addingEvidence}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-600/90 text-slate-900 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {addingEvidence ? 'Uploading...' : 'Add Evidence'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right sidebar: timeline & arbitration tools */}
        <div className="space-y-6">
          
          {/* Dispute contract escrow info */}
          <div className="bg-white p-6 rounded-2xl border border-surface-border space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Escrow Info</h3>
            {dispute.payment ? (
              <div className="space-y-3.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Locked Escrow</span>
                  <span className="font-bold text-slate-900">₹{dispute.payment.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Milestone Index</span>
                  <span className="font-bold text-slate-900">Milestone #{dispute.payment.milestoneIndex + 1}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-red-400">Escrow payment details missing.</p>
            )}
          </div>

          {/* Timeline of events */}
          <div className="bg-white p-6 rounded-2xl border border-surface-border space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-surface-border/40 pb-2">Timeline of Events</h3>
            <div className="relative border-l border-surface-border/60 ml-2.5 pl-5 space-y-5 text-xs">
              {timelineEvents.map((ev, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-orange-600 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-[10px] text-slate-500 font-bold">
                      {ev.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <h4 className="font-bold text-slate-900">{ev.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-normal">{ev.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Adjudication Ruling Output */}
          {isResolved && (
            <div className="bg-green-500/5 border border-green-500/20 p-5 rounded-2xl space-y-3.5">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <h4 className="text-sm font-bold">Mediator Verdict</h4>
              </div>
              <div className="text-xs space-y-2 text-slate-500">
                <p><span className="font-bold text-slate-900">Ruling Winner:</span> <span className="capitalize text-green-400 font-bold">{dispute.status.split('-')[1] || 'Resolved'}</span></p>
                <p><span className="font-bold text-slate-900">Resolution Summary:</span> {dispute.resolution}</p>
                {dispute.resolvedAt && (
                  <p><span className="font-bold text-slate-900">Date Adjudicated:</span> {new Date(dispute.resolvedAt).toLocaleDateString('en-IN')}</p>
                )}
                {dispute.adminNotes && (
                  <p className="border-t border-surface-border/40 pt-2"><span className="font-bold text-slate-900">Mediator Internal Notes:</span> {dispute.adminNotes}</p>
                )}
              </div>
            </div>
          )}

          {/* Admin resolving tools */}
          {isAdmin && !isResolved && (
            <div className="bg-white p-6 rounded-2xl border border-surface-border space-y-4">
              <div className="flex items-center gap-2 text-orange-600 border-b border-surface-border/40 pb-2">
                <AlertOctagon className="h-5 w-5" />
                <h3 className="text-sm font-bold text-slate-900">Arbitrate Ruling</h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">Evaluate the evidence. Resolving for Client refunds the money, while resolving for Freelancer releases escrow.</p>
              
              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => setAdjudicateWinner('client')}
                  className="w-full py-2.5 bg-[#10B981] hover:bg-[#10B981]/90 text-slate-900 font-bold text-xs rounded-xl cursor-pointer shadow-lg shadow-green-500/10 text-center"
                >
                  Resolve for Client (Refund)
                </button>
                
                <button
                  onClick={() => setAdjudicateWinner('freelancer')}
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-600/90 text-slate-900 font-bold text-xs rounded-xl cursor-pointer shadow-lg shadow-indigo-500/10 text-center"
                >
                  Resolve for Freelancer (Release)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisputeDetail;
