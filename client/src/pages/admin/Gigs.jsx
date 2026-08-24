import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Toast from '../../components/Toast';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { Check, X, Eye, ShieldAlert, FileText, Calendar, RefreshCw, Briefcase, Trash2 } from 'lucide-react';

const Gigs = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastConfig, setToastConfig] = useState(null);
  
  // Selected gig for preview modal
  const [previewGig, setPreviewGig] = useState(null);
  const [rejectGigId, setRejectGigId] = useState(null); // id of gig being rejected
  const [rejectReason, setRejectReason] = useState('');
  
  // Delete gig confirm modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    gigId: null,
    gigTitle: ''
  });

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'all'

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchGigs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10
      };
      if (activeTab === 'pending') {
        params.isApproved = 'false';
      }

      const response = await api.get('/admin/gigs', { params });
      if (response.data.success) {
        setGigs(response.data.gigs || []);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Failed to load gigs queue:', err);
      setToastConfig({ message: 'Failed to load gigs database.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, [activeTab, page]);

  const handleApprove = async (gigId) => {
    try {
      const response = await api.put(`/admin/gigs/${gigId}/approve`);
      if (response.data.success) {
        setToastConfig({ message: 'Gig approved and listed publicly successfully!', type: 'success' });
        setPreviewGig(null);
        fetchGigs();
      }
    } catch (err) {
      setToastConfig({ message: 'Failed to approve gig.', type: 'error' });
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setToastConfig({ message: 'Rejection reason is required.', type: 'error' });
      return;
    }

    try {
      const response = await api.put(`/admin/gigs/${rejectGigId}/reject`, {
        reason: rejectReason
      });
      if (response.data.success) {
        setToastConfig({ message: 'Gig rejected and moved to cancelled state.', type: 'info' });
        setRejectGigId(null);
        setRejectReason('');
        setPreviewGig(null);
        fetchGigs();
      }
    } catch (err) {
      setToastConfig({ message: 'Failed to reject gig.', type: 'error' });
    }
  };

  const confirmDeleteGig = (gig) => {
    setDeleteModal({
      isOpen: true,
      gigId: gig._id,
      gigTitle: gig.title
    });
  };

  const handleDeleteGig = async () => {
    const { gigId } = deleteModal;
    setDeleteModal({ isOpen: false, gigId: null, gigTitle: '' });

    try {
      const response = await api.delete(`/admin/gigs/${gigId}`, {
        data: { reason: 'Removed by platform admin (fake, spam, or terms violation)' }
      });
      if (response.data.success) {
        setToastConfig({ message: 'Gig permanently removed from platform!', type: 'success' });
        if (previewGig?._id === gigId) setPreviewGig(null);
        fetchGigs();
      }
    } catch (err) {
      setToastConfig({ message: err.response?.data?.message || 'Failed to remove gig.', type: 'error' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {toastConfig && (
        <Toast
          message={toastConfig.message}
          type={toastConfig.type}
          onClose={() => setToastConfig(null)}
        />
      )}

      {/* Delete Gig Confirm Modal */}
      {deleteModal.isOpen && (
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          title="Remove Gig from Platform"
          message={`Are you sure you want to permanently delete the gig "${deleteModal.gigTitle}"? This will remove all associated proposals and cancel any pending interactions.`}
          confirmText="Permanently Remove"
          confirmColor="red"
          onConfirm={handleDeleteGig}
          onClose={() => setDeleteModal({ isOpen: false, gigId: null, gigTitle: '' })}
        />
      )}

      {/* Reject Modal */}
      {rejectGigId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handleRejectSubmit} className="bg-white w-full max-w-md rounded-2xl border border-surface-border p-6 space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <span>Gig Rejection Reason</span>
            </h3>
            <p className="text-xs text-slate-500">Explain why this gig posting is rejected. This reason will be sent to the client email and notification board.</p>
            
            <textarea
              rows="4"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide a detailed reason (e.g. Terms violations, unclear scope, pricing mismatch...)"
              className="w-full px-4 py-3 rounded-xl border border-surface-border bg-white text-slate-900 text-xs focus:ring-2 focus:ring-orange-600 resize-none"
              required
            />

            <div className="flex gap-3 justify-end border-t border-surface-border/40 pt-4">
              <button
                type="button"
                onClick={() => {
                  setRejectGigId(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-surface-muted border border-surface-border text-slate-500 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-red-500 hover:bg-red-600 text-white cursor-pointer"
              >
                Send Rejection
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Gig Preview Modal */}
      {previewGig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-surface-border p-6 space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start gap-4">
              <h3 className="text-md font-bold text-slate-900 leading-snug">{previewGig.title}</h3>
              <span className="px-2 py-0.5 rounded bg-surface-muted border border-surface-border text-[9px] font-extrabold text-slate-500 uppercase tracking-wide shrink-0">{previewGig.category}</span>
            </div>

            <div className="text-xs text-slate-500 leading-relaxed space-y-3 whitespace-pre-wrap bg-white/[0.01] border border-surface-border p-4 rounded-xl">
              <h4 className="font-bold text-slate-900">Gig Description</h4>
              <p>{previewGig.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="block text-slate-500 font-bold uppercase text-[9px] mb-0.5">Budget Type</span>
                <span className="text-slate-900 font-bold capitalize">{previewGig.budgetType} Budget</span>
              </div>
              <div>
                <span className="block text-slate-500 font-bold uppercase text-[9px] mb-0.5">Budget Range</span>
                <span className="text-slate-900 font-bold">₹{previewGig.budgetMin} - ₹{previewGig.budgetMax}</span>
              </div>
              <div>
                <span className="block text-slate-500 font-bold uppercase text-[9px] mb-0.5">Client</span>
                <span className="text-slate-900 font-bold">{previewGig.client?.name}</span>
              </div>
              <div>
                <span className="block text-slate-500 font-bold uppercase text-[9px] mb-0.5">Category</span>
                <span className="text-slate-900 font-bold">{previewGig.category}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-surface-border/40 pt-4">
              <button
                onClick={() => confirmDeleteGig(previewGig)}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove Gig
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewGig(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-surface-muted border border-surface-border text-slate-500 cursor-pointer"
                >
                  Close
                </button>
                {!previewGig.isApproved && (
                  <>
                    <button
                      onClick={() => setRejectGigId(previewGig._id)}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(previewGig._id)}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm"
                    >
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-orange-50 text-orange-700 border border-orange-200 mb-2">
            <Briefcase className="h-3 w-3 text-orange-600" />
            Job Moderation
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">Gigs Moderation</h1>
          <p className="text-xs text-slate-500 mt-1">Approve new gig listings, audit scope requirements, and manage listings catalog.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 bg-surface-muted border border-surface-border p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => { setActiveTab('pending'); setPage(1); }}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-orange-600 text-slate-900 shadow-md'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Pending Approval
          </button>
          <button
            onClick={() => { setActiveTab('all'); setPage(1); }}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-orange-600 text-slate-900 shadow-md'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Gigs
          </button>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
          <RefreshCw className="h-6 w-6 animate-spin text-orange-600" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Syncing Gigs Queue...</span>
        </div>
      ) : gigs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-surface-border text-xs text-slate-500 font-bold">
          No gig postings found in this queue.
        </div>
      ) : activeTab === 'pending' ? (
        /* Pending Approval Grid Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gigs.map((gig) => (
            <div
              key={gig._id}
              className="bg-white p-6 rounded-2xl border border-surface-border flex flex-col justify-between hover:border-[rgba(255,255,255,0.08)] transition-smooth space-y-4"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <span className="inline-flex px-2 py-0.5 rounded bg-surface-muted border border-surface-border text-[9px] font-extrabold text-slate-500 uppercase tracking-wide">
                    {gig.category}
                  </span>
                  <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide bg-yellow-500/10 text-yellow-400">
                    Pending Approval
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-normal truncate">{gig.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mt-1.5">{gig.description}</p>
                </div>

                <div className="flex flex-wrap justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider border-t border-surface-border/40 pt-3 gap-2">
                  <span>Client: {gig.client?.name || 'Owner'}</span>
                  <span>Budget: ₹{gig.budgetMin} - ₹{gig.budgetMax}</span>
                </div>
              </div>

              <div className="mt-5 border-t border-surface-border/40 pt-4 flex items-center gap-2 w-full">
                <button
                  onClick={() => setPreviewGig(gig)}
                  className="flex-1 py-2.5 rounded-xl bg-surface-muted border border-surface-border hover:border-orange-600/50 text-slate-700 font-bold text-xs cursor-pointer flex items-center justify-center gap-1 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
                <button
                  onClick={() => setRejectGigId(gig._id)}
                  className="py-2.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 font-bold text-xs cursor-pointer hover:bg-amber-500/20 transition-colors"
                  title="Reject"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(gig._id)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => confirmDeleteGig(gig)}
                  className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 cursor-pointer transition-colors"
                  title="Permanently Delete Fake/Spam Gig"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* All Gigs Tab: Table audit view */
        <div className="bg-white rounded-2xl border border-surface-border overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted border-b border-surface-border text-xs">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Gig Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Budget Range</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Proposals</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Badge</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/40 text-xs text-slate-700">
                {gigs.map((gig) => {
                  const formattedDate = new Date(gig.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <tr key={gig._id} className="hover:bg-surface-subtle/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 max-w-[200px] truncate">{gig.title}</td>
                      <td className="px-6 py-4 font-medium">{gig.client?.name || 'Owner'}</td>
                      <td className="px-6 py-4">{gig.category}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">₹{gig.budgetMin?.toLocaleString()} - ₹{gig.budgetMax?.toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-500">{gig.proposals || 0}</td>
                      <td className="px-6 py-4 font-semibold capitalize text-orange-600">{gig.status}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border ${
                          gig.isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {gig.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewGig(gig)}
                            className="p-1.5 rounded-lg bg-surface-muted border border-surface-border hover:border-orange-300 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                            title="Preview Gig"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => confirmDeleteGig(gig)}
                            className="p-1.5 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                            title="Permanently Remove Fake/Spam Gig"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-slate-500 font-bold">Showing page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3.5 py-2 bg-surface-muted border border-surface-border text-slate-500 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:border-orange-600/40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3.5 py-2 bg-surface-muted border border-surface-border text-slate-500 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:border-orange-600/40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gigs;
