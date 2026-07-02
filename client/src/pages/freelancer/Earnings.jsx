import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import EmptyState from '../../components/ui/EmptyState';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Landmark, Calendar, TrendingUp, Briefcase, Award, RefreshCw } from 'lucide-react';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const Earnings = () => {
  const navigate = useNavigate();
  const notifications = useSelector((state) => state.notifications?.notifications || []);
  const [releasedList, setReleasedList] = useState([]);
  const [escrowList, setEscrowList] = useState([]);
  const [stats, setStats] = useState({
    totalEarned: 0,
    thisMonthEarnings: 0,
    pendingAmount: 0,
    pendingGigsCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const fetchEarnings = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const response = await api.get('/payments/my-earnings');
      if (response.data.success) {
        setReleasedList(response.data.released || []);
        setEscrowList(response.data.escrow || []);
        setStats({
          totalEarned: response.data.totalEarnings || 0,
          thisMonthEarnings: response.data.thisMonthEarnings || 0,
          pendingAmount: response.data.pendingAmount || 0,
          pendingGigsCount: response.data.escrow?.length || 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch earnings stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  // Auto-refresh when a payment notification arrives via socket
  useEffect(() => {
    const latest = notifications[0];
    if (latest && (latest.type === 'payment_received' || latest.type === 'payment_released')) {
      fetchEarnings(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications]);

  // Compute last 6 months dynamically for the chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const chartData = React.useMemo(() => {
    const last6 = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mName = months[d.getMonth()];
      const year = d.getFullYear();
      const monthStart = new Date(year, d.getMonth(), 1);
      const monthEnd = new Date(year, d.getMonth() + 1, 1);
      const earningsSum = releasedList
        .filter(p => p.releasedAt && new Date(p.releasedAt) >= monthStart && new Date(p.releasedAt) < monthEnd)
        .reduce((sum, p) => sum + p.freelancerAmount, 0);
      last6.push({ month: mName, amount: earningsSum });
    }
    return last6;
  }, [releasedList]);

  const getFilteredPayments = () => {
    let combined = [];
    if (activeTab === 'all' || activeTab === 'released') combined = [...combined, ...releasedList];
    if (activeTab === 'all' || activeTab === 'escrow') combined = [...combined, ...escrowList];
    return combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const filteredPayments = getFilteredPayments();
  const hasAnyPayments = releasedList.length > 0 || escrowList.length > 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <div className="w-8 h-8 border-3 border-brand-indigo border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide">Loading Earnings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-brand-indigo/15 text-brand-indigo border border-brand-indigo/30 mb-2">
            💸 Wallet Center
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Earnings & Escrow Ledger</h1>
          <p className="text-xs text-[#94A3B8] mt-1">Monitor released payouts, track funds held in client escrow, and view income stats.</p>
        </div>
        <button
          onClick={() => fetchEarnings(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-white/5 border border-dark-border rounded-xl text-slate-300 hover:text-white hover:border-brand-indigo/50 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Metrics Row (2x2 grid on mobile) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-dark-surface p-4 md:p-6 rounded-2xl border border-dark-border flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] shrink-0">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] md:text-xs font-bold text-[#64748B] uppercase tracking-wide">Total Earned</span>
            <span className="text-lg md:text-xl font-extrabold text-white">{fmt(stats.totalEarned)}</span>
          </div>
        </div>

        <div className="bg-dark-surface p-4 md:p-6 rounded-2xl border border-dark-border flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] md:text-xs font-bold text-[#64748B] uppercase tracking-wide">This Month</span>
            <span className="text-lg md:text-xl font-extrabold text-white">{fmt(stats.thisMonthEarnings)}</span>
          </div>
        </div>

        <div className="bg-dark-surface p-4 md:p-6 rounded-2xl border border-dark-border flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] md:text-xs font-bold text-[#64748B] uppercase tracking-wide">In Escrow</span>
            <span className="text-lg md:text-xl font-extrabold text-white">{fmt(stats.pendingAmount)}</span>
          </div>
        </div>

        <div className="bg-dark-surface p-4 md:p-6 rounded-2xl border border-dark-border flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] md:text-xs font-bold text-[#64748B] uppercase tracking-wide">Active Escrows</span>
            <span className="text-lg md:text-xl font-extrabold text-white">{stats.pendingGigsCount} Gigs</span>
          </div>
        </div>
      </div>

      {/* Monthly Earnings Chart */}
      <div className="bg-dark-surface p-6 rounded-2xl border border-dark-border space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Income Spread (Last 6 Months)</h3>
          <p className="text-[11px] text-[#64748B]">Bar distribution of released payouts across calendar months</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={1} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111118',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#fff'
                }}
                itemStyle={{ color: '#fff' }}
                formatter={(value) => [fmt(value), 'Net Cleared']}
              />
              <Bar dataKey="amount" fill="url(#earningsGrad)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Earnings Table & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-md font-bold text-white uppercase tracking-wider">Earnings & Escrows Ledger</h2>
          <div className="flex gap-2 bg-white/5 border border-dark-border p-1 rounded-xl">
            {['all', 'released', 'escrow'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                  activeTab === tab
                    ? 'bg-brand-indigo text-white shadow-md'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Table */}
        {!hasAnyPayments ? (
          <div className="py-16 text-center bg-dark-surface/30 border border-dark-border rounded-3xl">
            <Award className="h-12 w-12 text-[#64748B] mx-auto mb-4" />
            <h3 className="text-md font-bold text-white">No Earnings Yet</h3>
            <p className="text-xs text-[#94A3B8] mt-2 max-w-sm mx-auto">
              Complete your first gig to see earnings here. Browse available gigs to get started!
            </p>
            <button
              onClick={() => navigate('/search')}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-indigo text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer"
            >
              Browse Gig Catalog
            </button>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#64748B] font-bold bg-dark-surface/30 border border-dark-border rounded-2xl">
            No {activeTab !== 'all' ? activeTab : ''} transactions found.
          </div>
        ) : (
          <div className="bg-dark-surface rounded-2xl border border-dark-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-dark-border text-xs">
                    <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Gig Title</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Client</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Platform Fee</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Net Earned</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/40 text-xs text-slate-300">
                  {filteredPayments.map((p) => {
                    const formattedDate = new Date(p.releasedAt || p.paidAt || p.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    return (
                      <tr key={p._id} className="hover:bg-white/[0.01]">
                        <td className="px-6 py-4 font-bold text-white">
                          <div className="flex flex-col">
                            <span>{p.gig?.title || 'Gig Contract'}</span>
                            <span className="text-[9px] text-[#64748B] font-semibold mt-0.5">
                              {p.type === 'milestone' ? `Milestone #${(p.milestoneIndex ?? 0) + 1}` : 'Full Project'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">{p.client?.name || 'Client'}</td>
                        <td className="px-6 py-4">{fmt(p.amount)}</td>
                        <td className="px-6 py-4 text-[#64748B]">{fmt(p.platformFee)} <span className="text-[9px]">(10%)</span></td>
                        <td className="px-6 py-4 font-bold text-[#10B981]">{fmt(p.freelancerAmount)} <span className="text-[9px] text-[#64748B]">(90%)</span></td>
                        <td className="px-6 py-4 text-slate-400">{formattedDate}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                            p.status === 'released' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            p.status === 'escrow' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            p.status === 'disputed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                          }`}>
                            {p.status === 'escrow' ? '🔒 In Escrow' : p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Earnings;
