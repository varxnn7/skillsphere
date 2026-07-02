import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Link } from 'react-router-dom';
import { ShieldAlert, Scale, Clock, RefreshCw, Eye } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';

const Disputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('open'); // 'open', 'under-review', 'resolved'
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10
      };
      
      // Determine status filter based on active tab
      if (activeTab === 'open') {
        params.status = 'open';
      } else if (activeTab === 'under-review') {
        params.status = 'under-review';
      } else if (activeTab === 'resolved') {
        // Find resolved ones. The backend will return them if status is resolved-client / resolved-freelancer / closed
        params.status = 'resolved'; // We can let controller resolve resolved-client/resolved-freelancer/closed
      }

      const response = await api.get('/disputes/admin/all', { params });
      if (response.data.success) {
        setDisputes(response.data.disputes || []);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Failed to load disputes queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [activeTab, page]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 mb-2">
            ⚖️ Platform Arbitration
          </span>
          <h1 className="text-2xl font-extrabold text-white">Disputes Mediation</h1>
          <p className="text-xs text-[#94A3B8] mt-1">Review locked escrow funds, inspect project deliverables evidence, and issue refund/release rulings.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 bg-white/5 border border-dark-border p-1 rounded-xl self-start sm:self-auto">
          {['open', 'under-review', 'resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer capitalize ${
                activeTab === tab
                  ? 'bg-brand-indigo text-white shadow-md'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Disputes content grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
          <RefreshCw className="h-6 w-6 animate-spin text-brand-indigo" />
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide">Syncing Arbitration Files...</span>
        </div>
      ) : disputes.length === 0 ? (
        <div className="py-6">
          <EmptyState
            icon={Scale}
            title={`No ${activeTab} disputes found`}
            message="Arbitration queue is clean for this category."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-200">
          {disputes.map((d) => {
            const dateRaised = new Date(d.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={d._id}
                className="bg-dark-surface p-6 rounded-2xl border border-dark-border flex flex-col justify-between hover:border-[rgba(255,255,255,0.08)] transition-colors space-y-4"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <span className="inline-flex px-2 py-0.5 rounded bg-white/5 border border-dark-border text-[9px] font-extrabold text-[#64748B] uppercase tracking-wide truncate max-w-[150px]">
                      {d.reason}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border ${
                      d.status.startsWith('resolved') ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {d.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white leading-normal truncate">{d.gig?.title || 'Gig Contract'}</h3>
                    <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-2 mt-1.5">{d.description}</p>
                  </div>

                  {/* Parties & Escrow Amount Details */}
                  <div className="border-t border-dark-border/40 pt-4 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="block text-[9px] text-[#64748B] font-bold uppercase">Raised By</span>
                      <span className="text-slate-300 font-semibold truncate block">{d.raisedBy?.name || 'Client'}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-[#64748B] font-bold uppercase">Against</span>
                      <span className="text-slate-300 font-semibold truncate block">{d.against?.name || 'Freelancer'}</span>
                    </div>
                    <div className="col-span-2 border-t border-dark-border/30 pt-3 flex justify-between items-center text-[10px] text-[#64748B] font-bold uppercase">
                      <span>Raised: {dateRaised}</span>
                      <span className="text-white text-xs font-black">Disputed: ₹{d.payment?.amount?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dark-border/40 pt-4 w-full">
                  <Link
                    to={`/dispute/${d._id}`}
                    className="w-full py-2.5 rounded-xl bg-white/5 border border-dark-border hover:border-brand-indigo/50 text-[#94A3B8] hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Scale className="h-4 w-4" />
                    Review Dispute File
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-[#64748B] font-bold">Showing page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3.5 py-2 bg-white/5 border border-dark-border text-[#94A3B8] text-xs font-bold rounded-xl cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:border-brand-indigo/40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3.5 py-2 bg-white/5 border border-dark-border text-[#94A3B8] text-xs font-bold rounded-xl cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:border-brand-indigo/40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Disputes;
