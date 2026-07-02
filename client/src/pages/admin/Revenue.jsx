import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  DollarSign, BarChart3, TrendingUp, RefreshCw, Search,
  Filter, Download, ChevronLeft, ChevronRight, Eye, X, Calendar
} from 'lucide-react';

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'];
const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const StatusBadge = ({ status }) => {
  const map = {
    escrow: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    released: 'bg-green-500/10 text-green-400 border-green-500/20',
    refunded: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    disputed: 'bg-red-500/10 text-red-400 border-red-500/20',
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${map[status] || map.pending}`}>
      {status}
    </span>
  );
};

const CalendarIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const Revenue = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment History State
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchFinancialData = async () => {
    try {
      const [statsRes, revRes, freeRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/revenue'),
        api.get('/admin/top-freelancers')
      ]);
      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (revRes.data.success) {
        setRevenueData(revRes.data.monthlyData || []);
        setCategoryData(revRes.data.categoryData || []);
      }
      if (freeRes.data.success) setFreelancers(freeRes.data.freelancers || []);
    } catch (err) {
      console.error('Failed to load platform financial reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = useCallback(async (page = 1) => {
    setPaymentsLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const res = await api.get(`/payments/admin/all?${params}`);
      if (res.data.success) {
        setPayments(res.data.payments || []);
        setPagination(res.data.pagination || { total: 0, page: 1, pages: 1, limit: 10 });
      }
    } catch (err) {
      console.error('Failed to fetch payment history:', err);
    } finally {
      setPaymentsLoading(false);
    }
  }, [search, statusFilter, startDate, endDate]);

  useEffect(() => { fetchFinancialData(); }, []);
  useEffect(() => { fetchPayments(1); }, [fetchPayments]);

  const handleExportCSV = () => {
    const headers = ['#', 'Gig Title', 'Client', 'Freelancer', 'Amount', 'Platform Fee', 'Net to Freelancer', 'Status', 'Date'];
    const rows = payments.map((p, i) => [
      i + 1,
      p.gig?.title || 'N/A',
      p.client?.name || '',
      p.freelancer?.name || '',
      p.amount,
      p.platformFee,
      p.freelancerAmount,
      p.status,
      new Date(p.createdAt).toLocaleDateString('en-IN')
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skillsphere_payments.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <RefreshCw className="h-6 w-6 animate-spin text-brand-indigo" />
        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide">Syncing Financial Ledgers...</span>
      </div>
    );
  }

  const totalRevenue = stats?.payments?.totalRevenue || 0;
  const totalTransactions = stats?.payments?.totalTransactions || 0;
  const pendingEscrow = stats?.payments?.pendingEscrow || 0;
  const avgTransactionValue = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;
  const currentMonthData = revenueData[revenueData.length - 1];
  const thisMonthRevenue = currentMonthData ? currentMonthData.revenue : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-brand-purple/15 text-brand-purple border border-brand-purple/30 mb-2">
          🛡️ Admin Control Panel
        </span>
        <h1 className="text-2xl font-extrabold text-white">Financial Analytics</h1>
        <p className="text-xs text-[#94A3B8] mt-1">Audit platform revenue, track escrows, monitor top earners and full payment history.</p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Total Revenue', value: fmt(totalRevenue), icon: DollarSign, color: 'green' },
          { label: 'This Month', value: fmt(thisMonthRevenue), icon: CalendarIcon, color: 'indigo' },
          { label: 'Transactions', value: `${totalTransactions} Orders`, icon: BarChart3, color: 'purple' },
          { label: 'Avg Ticket', value: fmt(avgTransactionValue), icon: TrendingUp, color: 'yellow' }
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-dark-surface p-4 md:p-6 rounded-2xl border border-dark-border flex items-center gap-4">
            <div className={`p-3.5 rounded-xl bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 shrink-0`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] md:text-xs font-bold text-[#64748B] uppercase tracking-wide">{label}</span>
              <span className="text-lg md:text-xl font-extrabold text-white">{value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-dark-surface p-6 rounded-2xl border border-dark-border space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Platform Revenue Trend</h3>
            <p className="text-[11px] text-[#64748B]">Platform commission fee (10%) aggregated monthly</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value) => [fmt(value), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-dark-surface p-6 rounded-2xl border border-dark-border flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Category Spread</h3>
            <p className="text-[11px] text-[#64748B]">Volume division across service sectors</p>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            {categoryData.length === 0 ? (
              <p className="text-xs text-[#64748B] font-bold">No categorical data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={3} dataKey="value">
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px', color: '#fff' }} formatter={(value) => [fmt(value), 'Platform Fee']} />
                  <Legend layout="horizontal" align="center" verticalAlign="bottom" iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#94A3B8', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ─── PAYMENT HISTORY TABLE ─── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-md font-bold text-white uppercase tracking-wider">Payment History</h2>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-white/5 border border-dark-border rounded-xl text-slate-300 hover:text-white hover:border-brand-indigo/50 transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#64748B]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search gig, client, freelancer..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-dark-surface border border-dark-border rounded-xl text-white placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-brand-indigo/40"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-dark-surface border border-dark-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/40 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="escrow">Escrow</option>
            <option value="released">Released</option>
            <option value="refunded">Refunded</option>
            <option value="disputed">Disputed</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="px-3 py-2 text-xs bg-dark-surface border border-dark-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/40"
            title="From Date"
          />
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="px-3 py-2 text-xs bg-dark-surface border border-dark-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/40"
            title="To Date"
          />
        </div>

        {/* Table */}
        <div className="bg-dark-surface rounded-2xl border border-dark-border overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.2)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-dark-border text-xs">
                  <th className="px-4 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">#</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Gig Title</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Client</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Freelancer</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Platform Fee</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Net Freelancer</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Date</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40 text-xs text-slate-300">
                {paymentsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 10 }).map((_, j) => (
                        <td key={j} className="px-4 py-4"><div className="h-3 bg-dark-border rounded-lg w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-[#64748B] font-bold">
                      No payment records found.
                    </td>
                  </tr>
                ) : (
                  payments.map((p, i) => {
                    const serial = (pagination.page - 1) * pagination.limit + i + 1;
                    const date = new Date(p.createdAt).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    });
                    return (
                      <tr key={p._id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-4 py-4 font-mono font-bold text-[#64748B]">{serial}</td>
                        <td className="px-4 py-4 font-bold text-white max-w-[160px] truncate">
                          {p.gig?.title || 'N/A'}
                          <div className="text-[9px] text-[#64748B] font-normal mt-0.5">{p.gig?.category}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <img src={p.client?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&q=80'} alt="" className="h-6 w-6 rounded-full border border-dark-border object-cover shrink-0" />
                            <div>
                              <div className="font-bold text-white text-[11px]">{p.client?.name}</div>
                              <div className="text-[9px] text-[#64748B]">{p.client?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <img src={p.freelancer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&q=80'} alt="" className="h-6 w-6 rounded-full border border-dark-border object-cover shrink-0" />
                            <div>
                              <div className="font-bold text-white text-[11px]">{p.freelancer?.name}</div>
                              <div className="text-[9px] text-[#64748B]">{p.freelancer?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-bold text-white">{fmt(p.amount)}</td>
                        <td className="px-4 py-4 text-[#64748B]">{fmt(p.platformFee)} <span className="text-[9px]">(10%)</span></td>
                        <td className="px-4 py-4 font-bold text-[#10B981]">{fmt(p.freelancerAmount)} <span className="text-[9px] text-[#64748B]">(90%)</span></td>
                        <td className="px-4 py-4"><StatusBadge status={p.status} /></td>
                        <td className="px-4 py-4 text-[#64748B] text-[10px] whitespace-nowrap">{date}</td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => setSelectedPayment(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold bg-brand-indigo/10 border border-brand-indigo/25 text-brand-indigo hover:bg-brand-indigo hover:text-white rounded-lg transition-all cursor-pointer"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-dark-border text-xs text-[#64748B]">
              <span>Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchPayments(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-1.5 rounded-lg bg-white/5 border border-dark-border text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-default"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="font-bold text-white">Page {pagination.page} of {pagination.pages}</span>
                <button
                  onClick={() => fetchPayments(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="p-1.5 rounded-lg bg-white/5 border border-dark-border text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-default"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Earners Table */}
      <div className="space-y-4">
        <h2 className="text-md font-bold text-white uppercase tracking-wider">Top Performing Freelancers</h2>
        <div className="bg-dark-surface rounded-2xl border border-dark-border overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.2)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-dark-border text-xs">
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Freelancer</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Skills</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Total Earnings</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Completed Gigs</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40 text-xs text-slate-300">
                {freelancers.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.01]">
                    <td className="px-6 py-4 font-bold text-brand-indigo font-mono">#{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={item.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=40'} alt={item.user?.name} className="h-8 w-8 rounded-full border border-dark-border object-cover" />
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{item.user?.name}</span>
                          <span className="text-[10px] text-[#64748B] font-medium">{item.user?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {item.skills?.slice(0, 3).map((skill, sIdx) => (
                          <span key={sIdx} className="px-1.5 py-0.5 rounded bg-white/5 border border-dark-border text-[9px] text-[#94A3B8]">{skill}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-[#10B981]">{fmt(item.totalEarnings)}</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-400">{item.completedGigs} Projects</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-extrabold text-yellow-500">★ {item.rating?.toFixed(1) || '0.0'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedPayment(null)}>
          <div className="bg-[#111118] border border-dark-border rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white">Payment Details</h3>
              <button onClick={() => setSelectedPayment(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-[#64748B] hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
            </div>

            <div className="space-y-3 text-xs">
              {[
                ['Razorpay Order ID', selectedPayment.razorpayOrderId],
                ['Razorpay Payment ID', selectedPayment.razorpayPaymentId || 'Pending'],
                ['Gig', selectedPayment.gig?.title],
                ['Category', selectedPayment.gig?.category],
                ['Client', `${selectedPayment.client?.name} (${selectedPayment.client?.email})`],
                ['Freelancer', `${selectedPayment.freelancer?.name} (${selectedPayment.freelancer?.email})`],
                ['Total Amount', fmt(selectedPayment.amount)],
                ['Platform Fee (10%)', fmt(selectedPayment.platformFee)],
                ['Freelancer Net (90%)', fmt(selectedPayment.freelancerAmount)],
                ['Status', selectedPayment.status.toUpperCase()],
                ['Type', selectedPayment.type],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-dark-border/30 pb-2 last:border-0">
                  <span className="text-[#64748B] font-bold">{label}</span>
                  <span className="text-white font-semibold text-right ml-4 break-all">{value || '—'}</span>
                </div>
              ))}

              {/* Timeline */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Timeline</span>
                <div className="space-y-1.5">
                  {[
                    ['Created', selectedPayment.createdAt],
                    ['Paid / Verified', selectedPayment.paidAt],
                    ['Released', selectedPayment.releasedAt],
                    ['Refunded', selectedPayment.refundedAt]
                  ].filter(([, d]) => d).map(([label, date]) => (
                    <div key={label} className="flex justify-between text-[11px]">
                      <span className="text-[#64748B]">{label}</span>
                      <span className="text-white">{new Date(date).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Revenue;
