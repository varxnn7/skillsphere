import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { Briefcase, Eye, Users, AlertCircle, PlusCircle, LayoutGrid, List, Edit3, Trash2, HelpCircle } from 'lucide-react';
import api from '../../utils/api';
import { myGigsSuccess, gigsStart, gigsFailure } from '../../store/gigsSlice';
import StatusBadge from '../../components/ui/StatusBadge';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import Modal from '../../components/ui/Modal';

const MyGigs = () => {
  const dispatch = useDispatch();
  const { myGigs, loading } = useSelector((state) => state.gigs);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toastConfig, setToastConfig] = useState(null);

  const fetchMyGigs = async () => {
    dispatch(gigsStart());
    try {
      const response = await api.get('/gigs/client/my-gigs');
      if (response.data.success) {
        dispatch(myGigsSuccess(response.data.gigs));
      }
    } catch (err) {
      dispatch(gigsFailure(err.response?.data?.message || 'Failed to fetch your gigs.'));
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/gigs/${deleteConfirmId}`);
      if (response.data.success) {
        setToastConfig({ message: 'Gig deleted successfully!', type: 'success' });
        fetchMyGigs();
      }
    } catch (err) {
      setToastConfig({ message: err.response?.data?.message || 'Failed to delete gig.', type: 'error' });
    } finally {
      setDeleteConfirmId(null);
    }
  };

  useEffect(() => {
    fetchMyGigs();
  }, [dispatch]);

  const filteredGigs = myGigs.filter((gig) => {
    if (activeTab === 'all') return true;
    return gig.status?.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col transition-smooth">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8 relative z-10 animate-fade-up">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">My Posted Gigs</h1>
            <p className="text-[#94A3B8] text-sm mt-1">Manage and track your active job invitations and proposals</p>
          </div>

          <RouterLink
            to="/client/post-gig"
            className="inline-flex items-center gap-2 bg-gradient-brand text-white px-5 py-3 rounded-xl font-bold shadow-lg hover-glow-purple transition-all text-sm cursor-pointer"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Post a New Gig
          </RouterLink>
        </div>

        {/* Filters Tabs and View Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-dark-border/60 pb-3 gap-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'open', 'in-progress', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                  activeTab === tab
                    ? 'bg-brand-indigo/15 border-brand-indigo/35 text-brand-indigo font-extrabold'
                    : 'border-transparent text-[#94A3B8] hover:bg-white/5 hover:text-white'
                } cursor-pointer`}
              >
                {tab === 'in-progress' ? 'In Progress' : tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 border border-dark-border p-1.5 rounded-xl bg-dark-surface/50 w-max">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-brand-indigo/15 text-brand-indigo' : 'text-[#64748B] hover:text-white'
              } cursor-pointer`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-brand-indigo/15 text-brand-indigo' : 'text-[#64748B] hover:text-white'
              } cursor-pointer`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Loading / Results display */}
        {loading ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="bg-dark-surface border border-dark-border rounded-2xl p-6 h-56 animate-pulse space-y-4">
                  <div className="h-4 bg-dark-border rounded-lg w-1/4" />
                  <div className="h-6 bg-dark-border rounded-lg w-3/4" />
                  <div className="h-12 bg-dark-border rounded-lg w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-dark-surface border border-dark-border rounded-2xl h-48 animate-pulse flex items-center justify-center">
              <div className="h-4 bg-dark-border rounded-lg w-1/3" />
            </div>
          )
        ) : filteredGigs.length === 0 ? (
          <div className="text-center py-20 bg-dark-surface/30 border border-dark-border rounded-3xl p-8 max-w-lg mx-auto space-y-4">
            <Briefcase className="h-12 w-12 mx-auto text-[#64748B]" />
            <h3 className="text-md font-bold text-white">No Gigs Found</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              {activeTab === 'all'
                ? "You haven't posted any gigs yet. Start hiring by posting your first job description!"
                : `You don't have any gigs with status "${activeTab}".`}
            </p>
            {activeTab === 'all' && (
              <RouterLink
                to="/client/post-gig"
                className="inline-block px-4 py-2.5 rounded-xl bg-brand-indigo text-white font-bold text-xs hover-glow-purple"
              >
                Post Your First Gig
              </RouterLink>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGigs.map((gig) => (
              <div
                key={gig._id}
                className="bg-dark-surface border border-dark-border rounded-2xl p-6 flex flex-col justify-between hover:border-[rgba(255,255,255,0.06)] hover:shadow-2xl transition-all"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#64748B]">
                      {gig.category}
                    </span>
                    <StatusBadge status={gig.status} />
                  </div>
                  <h3 className="font-extrabold text-white text-md hover:text-brand-indigo transition-colors leading-snug">
                    <RouterLink to={`/client/gigs/${gig._id}/proposals`}>{gig.title}</RouterLink>
                  </h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-2">{gig.description}</p>
                </div>

                <div className="border-t border-dark-border/60 pt-4 mt-5 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider">Budget</span>
                    <span className="text-xs font-extrabold text-white">
                      ₹{gig.budgetMin?.toLocaleString()} - ₹{gig.budgetMax?.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-bold text-[#64748B]">
                    <span className="flex items-center gap-1" title="Proposals counts">
                      <Users className="h-3.5 w-3.5" />
                      {gig.proposals || 0}
                    </span>
                    <span className="flex items-center gap-1" title="Views counts">
                      <Eye className="h-3.5 w-3.5" />
                      {gig.views || 0}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-dark-border/40">
                  <RouterLink
                    to={`/client/gigs/${gig._id}/proposals`}
                    className="flex-1 text-center py-2 bg-brand-indigo/10 border border-brand-indigo/25 hover:bg-brand-indigo hover:text-white rounded-xl text-[11px] font-bold text-brand-indigo transition-all cursor-pointer"
                  >
                    View Proposals
                  </RouterLink>
                  <RouterLink
                    to={`/client/post-gig?edit=${gig._id}`}
                    className="p-2 bg-white/5 border border-dark-border hover:border-slate-400 rounded-xl text-[#94A3B8] hover:text-white transition-all cursor-pointer"
                    title="Edit Gig"
                  >
                    <Edit3 className="h-4 w-4" />
                  </RouterLink>
                  <button
                    onClick={() => setDeleteConfirmId(gig._id)}
                    className="p-2 bg-[#EF4444]/10 border border-[#EF4444]/20 hover:bg-[#EF4444] rounded-xl text-[#EF4444] hover:text-white transition-all cursor-pointer"
                    title="Delete Gig"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dark-border rounded-2xl overflow-hidden bg-dark-surface/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-dark-border bg-dark-surface text-[#64748B] font-bold uppercase tracking-wider">
                    <th className="p-4">Gig Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Budget</th>
                    <th className="p-4">Bids</th>
                    <th className="p-4">Views</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/40">
                  {filteredGigs.map((gig) => (
                    <tr key={gig._id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <RouterLink to={`/client/gigs/${gig._id}/proposals`} className="font-bold text-white hover:text-brand-indigo">
                          {gig.title}
                        </RouterLink>
                      </td>
                      <td className="p-4 text-slate-300">{gig.category}</td>
                      <td className="p-4 font-semibold text-white">
                        ₹{gig.budgetMin} - ₹{gig.budgetMax}
                      </td>
                      <td className="p-4 text-slate-300 font-bold">{gig.proposals || 0}</td>
                      <td className="p-4 text-slate-300 font-bold">{gig.views || 0}</td>
                      <td className="p-4">
                        <StatusBadge status={gig.status} />
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2 items-center">
                        <RouterLink
                          to={`/client/gigs/${gig._id}/proposals`}
                          className="px-3 py-1.5 bg-brand-indigo/10 border border-brand-indigo/25 hover:bg-brand-indigo hover:text-white rounded-lg text-[10px] font-bold text-brand-indigo transition-all cursor-pointer"
                        >
                          View Proposals
                        </RouterLink>
                        <RouterLink
                          to={`/client/post-gig?edit=${gig._id}`}
                          className="p-1.5 bg-white/5 border border-dark-border hover:border-slate-400 rounded-lg text-[#94A3B8] hover:text-white transition-all cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </RouterLink>
                        <button
                          onClick={() => setDeleteConfirmId(gig._id)}
                          className="p-1.5 bg-[#EF4444]/10 border border-[#EF4444]/20 hover:bg-[#EF4444] hover:text-white rounded-lg text-[#EF4444] transition-all cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Confirm Deletion">
        <div className="space-y-6 text-center py-4">
          <HelpCircle className="h-14 w-14 text-[#EF4444] mx-auto" />
          <div className="space-y-2">
            <h3 className="text-md font-bold text-white">Are you absolutely sure?</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed max-w-sm mx-auto">
              This action cannot be undone. This will permanently delete the gig posting and reject all submitted proposals.
            </p>
          </div>
          <div className="flex gap-4 max-w-xs mx-auto">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="flex-1 py-3 bg-white/5 border border-dark-border hover:border-slate-400 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-3 bg-[#EF4444] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>

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

export default MyGigs;
