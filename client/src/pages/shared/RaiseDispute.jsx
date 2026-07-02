import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import Toast from '../../components/Toast';
import { ShieldAlert, AlertTriangle, FileUp, ArrowLeft, Trash2, ShieldCheck } from 'lucide-react';

const RaiseDispute = () => {
  const { paymentId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('Work not delivered');
  const [description, setDescription] = useState('');
  
  // Multiple files upload state
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [toastConfig, setToastConfig] = useState(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const response = await api.get(`/payments/${paymentId}`);
        if (response.data.success) {
          setPayment(response.data.payment);
        }
      } catch (err) {
        console.error('Failed to load payment record:', err);
        setToastConfig({ message: 'Failed to load escrow payment summary.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentDetails();
  }, [paymentId]);

  // Drag and Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setEvidenceFiles((prev) => [...prev, ...files]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      setEvidenceFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (idx) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (description.length < 50) {
      setToastConfig({ message: 'Please describe the dispute details. (Minimum 50 characters required)', type: 'error' });
      return;
    }
    if (description.length > 3000) {
      setToastConfig({ message: 'Description cannot exceed 3000 characters.', type: 'error' });
      return;
    }

    setSubmitting(true);
    const data = new FormData();
    data.append('paymentId', paymentId);
    data.append('reason', reason);
    data.append('description', description);
    
    evidenceFiles.forEach((file) => {
      data.append('evidence', file);
    });

    try {
      const response = await api.post('/disputes', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setToastConfig({ message: 'Dispute raised successfully! Redirecting...', type: 'success' });
        setTimeout(() => {
          navigate(`/dispute/${response.data.dispute._id}`);
        }, 2000);
      }
    } catch (err) {
      setToastConfig({
        message: err.response?.data?.message || 'Failed to file dispute file.',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <div className="w-8 h-8 border-3 border-brand-indigo border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide">Syncing Arbitration Portal...</span>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="text-center py-12 text-xs font-bold text-[#64748B]">
        Escrow payment details could not be loaded.
      </div>
    );
  }

  const opposingParty = user.role === 'client' ? payment.freelancer : payment.client;

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-200">
      {toastConfig && (
        <Toast
          message={toastConfig.message}
          type={toastConfig.type}
          onClose={() => setToastConfig(null)}
        />
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 rounded-xl bg-white/5 border border-dark-border text-xs text-[#94A3B8] font-bold hover:border-brand-indigo/50 transition-colors flex items-center gap-1.5 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Header */}
      <div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 mb-2">
          ⚠️ Arbitration Request
        </span>
        <h1 className="text-xl md:text-2xl font-extrabold text-white">Raise Escrow Dispute</h1>
        <p className="text-xs text-[#94A3B8] mt-1">Initiating a dispute freezes this milestone payment in escrow. A platform moderator will investigate the case details.</p>
      </div>

      {/* Payment summary card at top */}
      <div className="bg-dark-surface p-6 rounded-2xl border border-dark-border space-y-4">
        <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider border-b border-dark-border/40 pb-2">Payment Agreement Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="block text-[#64748B] font-bold uppercase tracking-wider text-[9px] mb-0.5">Gig Project</span>
            <span className="text-white font-bold">{payment.gig?.title}</span>
          </div>
          <div>
            <span className="block text-[#64748B] font-bold uppercase tracking-wider text-[9px] mb-0.5">Other Party</span>
            <span className="text-white font-bold">{opposingParty?.name}</span>
          </div>
          <div className="col-span-2 border-t border-dark-border/40 pt-3 flex justify-between items-center">
            <div>
              <span className="block text-[#64748B] font-bold uppercase tracking-wider text-[9px]">Locked Amount</span>
              <span className="text-lg font-black text-white">₹{payment.amount.toLocaleString()}</span>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-brand-indigo/10 border border-brand-indigo/20 text-[9px] font-extrabold text-brand-indigo uppercase tracking-wider">
              {payment.type === 'milestone' ? `Milestone #${(payment.milestoneIndex ?? 0) + 1}` : 'Full Project'}
            </span>
          </div>
        </div>
      </div>

      {/* Warning message */}
      <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl text-yellow-500 text-xs flex gap-2.5 leading-normal">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <p>
          <strong>Disputes are reviewed within 48 hours. Funds will remain in escrow during review.</strong> Please provide clear details and upload any deliverables, messages, or details as evidence.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-dark-surface p-6 rounded-2xl border border-dark-border space-y-5">
        
        {/* Reason dropdown */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide">Primary Dispute Reason</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-dark-border bg-dark-surface text-white text-xs focus:ring-2 focus:ring-brand-indigo"
          >
            <option value="Work not delivered">Work not delivered</option>
            <option value="Quality not as promised">Quality not as promised</option>
            <option value="Payment not released">Payment not released</option>
            <option value="Scope creep">Scope creep</option>
            <option value="Communication breakdown">Communication breakdown</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Description textarea */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide">Detailed Description</label>
            <span className="text-[10px] text-[#64748B] font-semibold">{description.length}/3000 chars (Min 50)</span>
          </div>
          <textarea
            rows="6"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide a chronological description of the issue. Be descriptive about dates, communications, files, and agreements..."
            className="w-full px-4 py-3 rounded-xl border border-dark-border bg-dark-surface text-white text-xs focus:ring-2 focus:ring-brand-indigo resize-none"
            required
          />
        </div>

        {/* Evidence files drag and drop */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide">Upload Evidence files</label>
          
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`p-6 border border-dashed rounded-xl flex flex-col items-center justify-center text-center gap-2 transition-colors relative ${
              dragActive ? 'border-brand-indigo bg-brand-indigo/5' : 'border-dark-border hover:border-brand-indigo/35'
            }`}
          >
            <FileUp className="h-6 w-6 text-[#64748B]" />
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <p className="text-xs text-[#94A3B8]">Drag & Drop files here, or <span className="text-brand-indigo font-bold">Browse</span></p>
            <p className="text-[9px] text-[#64748B]">Supported files: PDF, JPEG, PNG, ZIP. Max size 10MB per file.</p>
          </div>

          {/* Uploaded files list */}
          {evidenceFiles.length > 0 && (
            <div className="space-y-2 pt-2">
              {evidenceFiles.map((file, idx) => (
                <div key={idx} className="p-2.5 rounded-lg border border-dark-border bg-white/[0.01] flex items-center justify-between text-[11px] text-slate-300">
                  <span className="truncate max-w-[80%] font-medium">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {submitting ? 'Submitting dispute dossier...' : 'Submit & Freeze Escrow'}
        </button>
      </form>
    </div>
  );
};

export default RaiseDispute;
