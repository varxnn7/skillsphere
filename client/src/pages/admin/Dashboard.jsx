import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users, CreditCard, ShieldAlert, FileText,
  ChevronRight, BarChart2, Scale, MessageSquare,
  TrendingUp, CheckCircle, ShieldCheck
} from 'lucide-react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentSignups, setRecentSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastConfig, setToastConfig] = useState(null);

  const handleChat = async (recipientId) => {
    try {
      const response = await api.post('/conversations', { recipientId });
      if (response.data.success) navigate(`/messages/${response.data.conversation._id}`);
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  // ── Fix: use correct admin stats endpoint ─────────────────
  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
    }
  };

  const fetchRecentSignups = async () => {
    try {
      const response = await api.get('/admin/users', { params: { limit: 5, page: 1 } });
      if (response.data.success) {
        const mapped = (response.data.users || []).map((u) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          avatar: u.avatar,
          isVerified: u.isVerified,
          isSuspended: u.isSuspended,
          joined: new Date(u.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
          }),
        }));
        setRecentSignups(mapped);
      }
    } catch (err) {
      console.error('Error fetching recent signups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchStats(), fetchRecentSignups()]);
  }, []);

  // ── Fix: Verify button ─────────────────────────────────────
  const handleVerify = async (userId, name) => {
    try {
      await api.put(`/admin/users/${userId}/verify`);
      setToastConfig({ message: `${name} has been verified successfully.`, type: 'success' });
      fetchRecentSignups();
    } catch (err) {
      setToastConfig({ message: err.response?.data?.message || 'Verification failed.', type: 'error' });
    }
  };

  // ── Fix: Flag (suspend) button ────────────────────────────
  const handleFlag = async (userId, name) => {
    try {
      await api.put(`/admin/users/${userId}/suspend`);
      setToastConfig({ message: `${name}'s account has been flagged (suspended).`, type: 'success' });
      fetchRecentSignups();
    } catch (err) {
      setToastConfig({ message: err.response?.data?.message || 'Flag action failed.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Build stat cards from the new nested stats object
  const statCards = stats ? [
    {
      title: 'Total Users',
      value: stats.users?.total ?? 0,
      icon: Users,
      color: 'bg-orange-50 text-orange-600 border-orange-200',
      change: `+${stats.users?.newThisMonth ?? 0} this month`,
    },
    {
      title: 'Platform Revenue',
      value: `₹${Number(stats.payments?.totalRevenue ?? 0).toLocaleString('en-IN')}`,
      icon: CreditCard,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      change: `${stats.payments?.totalTransactions ?? 0} transactions`,
    },
    {
      title: 'Active Gigs',
      value: stats.gigs?.open ?? 0,
      icon: FileText,
      color: 'bg-slate-50 text-slate-700 border-slate-200',
      change: `${stats.gigs?.pendingApproval ?? 0} pending approval`,
    },
    {
      title: 'Disputes Pending',
      value: (stats.disputes?.open ?? 0) + (stats.disputes?.underReview ?? 0),
      icon: ShieldAlert,
      color: 'bg-red-50 text-red-500 border-red-200',
      change: `${stats.disputes?.resolved ?? 0} resolved`,
    },
  ] : [];

  const getRoleBadge = (role) => {
    const map = {
      admin: 'bg-red-50 text-red-600 border-red-200',
      freelancer: 'bg-slate-50 text-slate-700 border-slate-200',
      client: 'bg-blue-50 text-blue-600 border-blue-200',
    };
    return (
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${map[role] || ''}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {toastConfig && (
        <Toast message={toastConfig.message} type={toastConfig.type} onClose={() => setToastConfig(null)} />
      )}

      {/* Header */}
      <div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-orange-50 text-orange-700 border border-orange-200 mb-3">
          <ShieldCheck className="h-3.5 w-3.5 text-orange-600" />
          Admin Control Panel
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Platform Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Analyze registrations, oversee transactions, and inspect disputes.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-surface-border shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl border ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <TrendingUp className="h-4 w-4 text-slate-300" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                <div className="text-xs font-semibold text-slate-400 mt-0.5">{stat.title}</div>
                <div className="text-[11px] text-slate-400 mt-1">{stat.change}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: '/admin/users', label: 'Manage Users', icon: Users, color: 'text-orange-600' },
            { to: '/admin/gigs', label: 'Moderate Gigs', icon: FileText, color: 'text-slate-700' },
            { to: '/admin/disputes', label: 'Dispute Chamber', icon: Scale, color: 'text-red-500' },
            { to: '/admin/revenue', label: 'Revenue Ledger', icon: BarChart2, color: 'text-emerald-600' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="p-4 bg-white rounded-xl border border-surface-border hover:border-orange-200 hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group"
              >
                <span className="flex items-center gap-2.5 text-sm font-semibold text-slate-600 group-hover:text-slate-800">
                  <Icon className={`h-4 w-4 ${item.color}`} />
                  {item.label}
                </span>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Signups Table */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden">
        <div className="px-6 py-5 border-b border-surface-border flex justify-between items-center bg-surface-subtle">
          <div>
            <h2 className="font-bold text-slate-800 text-base">Recent Signups</h2>
            <p className="text-xs text-slate-400 mt-0.5">Latest registered user accounts</p>
          </div>
          <Link to="/admin/users" className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors">
            View All →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-surface-border text-slate-400 text-xs font-bold uppercase tracking-wider bg-surface-subtle/50">
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-sm text-slate-600">
              {recentSignups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm">
                    No recent signups to display.
                  </td>
                </tr>
              ) : recentSignups.map((usr) => (
                <tr key={usr.id} className="hover:bg-surface-subtle transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={usr.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=40'}
                        alt={usr.name}
                        className="h-8 w-8 rounded-full object-cover border-2 border-orange-100"
                      />
                      <div>
                        <div className="font-semibold text-slate-800 text-sm">{usr.name}</div>
                        <div className="text-xs text-slate-400 font-medium">{usr.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getRoleBadge(usr.role)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                      usr.isSuspended
                        ? 'bg-red-50 text-red-500 border-red-200'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}>
                      {usr.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-medium">{usr.joined}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Chat button */}
                      <button
                        onClick={() => handleChat(usr.id)}
                        title="Start conversation"
                        className="p-1.5 rounded-lg bg-surface-muted hover:bg-orange-50 hover:text-orange-600 text-slate-400 transition-colors cursor-pointer border border-surface-border hover:border-orange-200"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </button>
                      {/* Verify button — only for unverified freelancers */}
                      {usr.role === 'freelancer' && !usr.isVerified && (
                        <button
                          onClick={() => handleVerify(usr.id, usr.name)}
                          title="Verify freelancer"
                          className="p-1.5 rounded-lg bg-surface-muted hover:bg-emerald-50 hover:text-emerald-600 text-slate-400 transition-colors cursor-pointer border border-surface-border hover:border-emerald-200"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {/* Flag (suspend) button */}
                      {usr.role !== 'admin' && !usr.isSuspended && (
                        <button
                          onClick={() => handleFlag(usr.id, usr.name)}
                          title="Flag/Suspend account"
                          className="p-1.5 rounded-lg bg-surface-muted hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors cursor-pointer border border-surface-border hover:border-red-200"
                        >
                          <ShieldAlert className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
