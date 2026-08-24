import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import {
  CreditCard,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  CheckCircle,
  Clock,
  RotateCcw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  DollarSign,
  Shield,
  Layers,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import Toast from '../../components/Toast';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const StatusBadge = ({ status }) => {
  const map = {
    escrow: { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock, label: 'In Escrow' },
    released: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle, label: 'Released' },
    refunded: { bg: 'bg-orange-50 text-orange-700 border-orange-200', icon: RotateCcw, label: 'Refunded' },
    disputed: { bg: 'bg-red-50 text-red-700 border-red-200', icon: AlertTriangle, label: 'Disputed' },
    pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, label: 'Pending' }
  };
  const config = map[status] || map.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${config.bg}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
};

const AdminPayments = () => {
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [toastConfig, setToastConfig] = useState(null);

  // Filters & Pagination
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundingId, setRefundingId] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  const fetchPayments = useCallback(async (page = 1) => {
    setTableLoading(true);
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
      console.error('Failed to fetch payment ledger:', err);
      setToastConfig({ message: 'Failed to load transaction records.', type: 'error' });
    } finally {
      setTableLoading(false);
      setLoading(false);
    }
  }, [search, statusFilter, startDate, endDate]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchPayments(1);
  }, [fetchPayments]);

  const handleRefund = async (paymentId) => {
    if (!window.confirm('Are you sure you want to refund this escrow deposit back to the client?')) {
      return;
    }
    setRefundingId(paymentId);
    try {
      const res = await api.post(`/payments/refund/${paymentId}`);
      if (res.data.success) {
        setToastConfig({ message: 'Payment successfully refunded to client.', type: 'success' });
        fetchPayments(pagination.page);
        fetchStats();
        if (selectedPayment?._id === paymentId) {
          setSelectedPayment(null);
        }
      }
    } catch (err) {
      setToastConfig({
        message: err.response?.data?.message || 'Refund action failed.',
        type: 'error'
      });
    } finally {
      setRefundingId(null);
    }
  };

  const handleExportCSV = () => {
    if (!payments.length) {
      setToastConfig({ message: 'No payments to export.', type: 'info' });
      return;
    }
    const headers = ['#', 'Payment ID', 'Gig Title', 'Client Name', 'Client Email', 'Freelancer Name', 'Total Amount', 'Platform Fee (10%)', 'Net Freelancer (90%)', 'Status', 'Date'];
    const rows = payments.map((p, i) => [
      i + 1,
      p._id,
      `"${p.gig?.title || 'N/A'}"`,
      `"${p.client?.name || 'N/A'}"`,
      p.client?.email || 'N/A',
      `"${p.freelancer?.name || 'N/A'}"`,
      p.amount,
      p.platformFee,
      p.freelancerAmount,
      p.status,
      new Date(p.createdAt).toLocaleDateString('en-IN')
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `skillsphere_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRevenue = stats?.payments?.totalRevenue || 0;
  const totalTransactions = stats?.payments?.totalTransactions || 0;
  const pendingEscrow = stats?.payments?.pendingEscrow || 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-600" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Syncing Payment Gateway & Ledgers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {toastConfig && (
        <Toast
          message={toastConfig.message}
          type={toastConfig.type}
          onClose={() => setToastConfig(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-orange-50 text-orange-700 border border-orange-200 mb-2">
            <Shield className="h-3 w-3 text-orange-600" />
            Admin Financial Center
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Payment Gateway & Ledger</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Monitor Razorpay payment transactions, escrow holdings, dispute settlements, and platform commissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchPayments(pagination.page)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-surface-border bg-white text-xs font-bold text-slate-700 hover:text-slate-900 hover:border-orange-200 transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${tableLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Commission</span>
            <span className="text-xl font-black text-slate-900">{fmt(totalRevenue)}</span>
            <span className="block text-[11px] text-emerald-600 font-semibold mt-0.5">10% Platform Take-rate</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 shrink-0">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Escrow Holdings</span>
            <span className="text-xl font-black text-slate-900">{fmt(pendingEscrow)}</span>
            <span className="block text-[11px] text-blue-600 font-semibold mt-0.5">Active Protected Funds</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 shrink-0">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Volume</span>
            <span className="text-xl font-black text-slate-900">{totalTransactions} Orders</span>
            <span className="block text-[11px] text-purple-600 font-semibold mt-0.5">Lifetime Transactions</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 shrink-0">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gateway Status</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-black text-slate-900">Razorpay Active</span>
            </div>
            <span className="block text-[11px] text-slate-400 font-semibold">Mock & Live Escrow</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-surface-border shadow-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search gig, client, freelancer..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-surface-border bg-surface-subtle text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600/30"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-surface-border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-600/30 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="escrow">In Escrow</option>
              <option value="released">Released</option>
              <option value="refunded">Refunded</option>
              <option value="disputed">Disputed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-600/30"
            />
          </div>

          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-600/30"
            />
          </div>
        </div>

        {(search || statusFilter || startDate || endDate) && (
          <div className="flex items-center justify-between pt-2 border-t border-surface-border text-xs">
            <span className="text-slate-500 font-medium">Active filters applied</span>
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setStartDate('');
                setEndDate('');
              }}
              className="text-orange-600 hover:text-orange-700 font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Payment Ledger Table */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-border bg-surface-subtle flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Transaction Ledger</h2>
            <p className="text-xs text-slate-400 mt-0.5">Total {pagination.total} records found</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-surface-border text-slate-400 text-xs font-bold uppercase tracking-wider bg-surface-subtle/50">
                <th className="px-6 py-3.5">Gig & Order</th>
                <th className="px-6 py-3.5">Client</th>
                <th className="px-6 py-3.5">Freelancer</th>
                <th className="px-6 py-3.5">Gross Amount</th>
                <th className="px-6 py-3.5">Platform Fee</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-xs text-slate-600">
              {tableLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-orange-600 mb-2" />
                    Loading transaction records...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No transaction records matching your filters.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-surface-subtle transition-colors">
                    <td className="px-6 py-4 max-w-[200px]">
                      <div className="font-bold text-slate-900 truncate" title={p.gig?.title}>
                        {p.gig?.title || 'Direct Order'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        ID: {p.razorpayOrderId || p._id.slice(-8)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{p.client?.name || 'Unknown'}</div>
                      <div className="text-[10px] text-slate-400">{p.client?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{p.freelancer?.name || 'Unknown'}</div>
                      <div className="text-[10px] text-slate-400">{p.freelancer?.email}</div>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">{fmt(p.amount)}</td>
                    <td className="px-6 py-4 font-extrabold text-emerald-600">{fmt(p.platformFee)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-medium whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedPayment(p)}
                          title="View Details"
                          className="p-1.5 rounded-lg bg-surface-muted hover:bg-orange-50 hover:text-orange-600 text-slate-500 transition-colors border border-surface-border cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {p.status === 'escrow' && (
                          <button
                            onClick={() => handleRefund(p._id)}
                            disabled={refundingId === p._id}
                            title="Refund to Client"
                            className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 transition-colors border border-orange-200 cursor-pointer disabled:opacity-50"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-surface-border bg-surface-subtle flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing page <strong className="text-slate-900">{pagination.page}</strong> of{' '}
              <strong className="text-slate-900">{pagination.pages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchPayments(pagination.page - 1)}
                className="p-2 rounded-xl border border-surface-border bg-white text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchPayments(pagination.page + 1)}
                className="p-2 rounded-xl border border-surface-border bg-white text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-surface-border shadow-2xl max-w-lg w-full p-6 md:p-8 relative animate-in zoom-in-95 duration-150 space-y-6">
            <div className="flex items-center justify-between border-b border-surface-border pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Transaction Receipt</span>
                <h3 className="text-lg font-bold text-slate-900">Payment Breakdown</h3>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl bg-surface-subtle border border-surface-border">
                <span className="text-slate-500 font-bold">Transaction Status</span>
                <StatusBadge status={selectedPayment.status} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-surface-subtle border border-surface-border">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Client</span>
                  <span className="font-bold text-slate-900 block mt-0.5">{selectedPayment.client?.name || 'N/A'}</span>
                  <span className="text-[10px] text-slate-500 truncate block">{selectedPayment.client?.email}</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-subtle border border-surface-border">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Freelancer</span>
                  <span className="font-bold text-slate-900 block mt-0.5">{selectedPayment.freelancer?.name || 'N/A'}</span>
                  <span className="text-[10px] text-slate-500 truncate block">{selectedPayment.freelancer?.email}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border space-y-2.5">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Order Amount</span>
                  <span className="font-bold text-slate-900">{fmt(selectedPayment.amount)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Platform Commission (10%)</span>
                  <span className="font-bold">+{fmt(selectedPayment.platformFee)}</span>
                </div>
                <div className="flex justify-between text-blue-600 font-medium">
                  <span>Freelancer Payout (90%)</span>
                  <span className="font-bold">{fmt(selectedPayment.freelancerAmount)}</span>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-400">
                <div><strong>Gig:</strong> {selectedPayment.gig?.title || 'Direct Payment'}</div>
                <div><strong>Razorpay Order ID:</strong> {selectedPayment.razorpayOrderId || 'N/A'}</div>
                <div><strong>Razorpay Payment ID:</strong> {selectedPayment.razorpayPaymentId || 'N/A'}</div>
                <div><strong>Created:</strong> {new Date(selectedPayment.createdAt).toLocaleString('en-IN')}</div>
                {selectedPayment.releasedAt && (
                  <div><strong>Released:</strong> {new Date(selectedPayment.releasedAt).toLocaleString('en-IN')}</div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
              {selectedPayment.status === 'escrow' && (
                <button
                  onClick={() => handleRefund(selectedPayment._id)}
                  disabled={refundingId === selectedPayment._id}
                  className="px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-bold border border-orange-200 transition-all cursor-pointer"
                >
                  Process Escrow Refund
                </button>
              )}
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
