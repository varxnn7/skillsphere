import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, CreditCard, ShieldAlert, Award, FileText, Calendar, MessageSquare, Scale, BarChart2 } from 'lucide-react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [recentSignups, setRecentSignups] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleChat = async (recipientId) => {
    try {
      const response = await api.post('/conversations', { recipientId });
      if (response.data.success) {
        navigate(`/messages/${response.data.conversation._id}`);
      }
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        if (response.data.success) {
          const statsMap = {
            'Total Registered Users': Users,
            'Total Platform Revenue': CreditCard,
            'Active Gigs': FileText,
            'Disputes Pending': ShieldAlert
          };

          const mappedStats = response.data.stats.map(s => ({
            ...s,
            icon: statsMap[s.title] || Users
          }));

          setStats(mappedStats);
          setRecentSignups(response.data.recentSignups || []);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" color="white" />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const styles = {
      verified: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
      pending: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
      flagged: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">Platform Management System</h1>
        <p className="text-[#94A3B8] text-sm">Analyze registration flows, oversee transactional activities, and inspect disputes.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-dark-surface p-6 rounded-2xl border border-dark-border shadow-[0_0_20px_rgba(0,0,0,0.2)] flex items-center gap-4 hover:border-[rgba(255,255,255,0.1)] transition-smooth cursor-default"
            >
              <div className={`p-3 rounded-xl border ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-xs font-bold text-[#64748B] uppercase tracking-wide">{stat.title}</span>
                <span className="text-2xl font-extrabold text-white">{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="p-4 bg-dark-surface rounded-xl border border-dark-border hover:border-brand-indigo/50 transition-smooth flex items-center justify-between text-xs font-bold text-[#94A3B8] hover:text-white"
          >
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-indigo" />
              Manage Platform Users
            </span>
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            to="/admin/gigs"
            className="p-4 bg-dark-surface rounded-xl border border-dark-border hover:border-brand-indigo/50 transition-smooth flex items-center justify-between text-xs font-bold text-[#94A3B8] hover:text-white"
          >
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-purple" />
              Moderate Gigs Queue
            </span>
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            to="/admin/disputes"
            className="p-4 bg-dark-surface rounded-xl border border-dark-border hover:border-brand-indigo/50 transition-smooth flex items-center justify-between text-xs font-bold text-[#94A3B8] hover:text-white"
          >
            <span className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-red-400" />
              Escrow Dispute Chamber
            </span>
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            to="/admin/revenue"
            className="p-4 bg-dark-surface rounded-xl border border-dark-border hover:border-brand-indigo/50 transition-smooth flex items-center justify-between text-xs font-bold text-[#94A3B8] hover:text-white"
          >
            <span className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-[#10B981]" />
              Platform Revenue Ledger
            </span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Signups Table */}
      <div className="bg-dark-surface rounded-2xl border border-dark-border shadow-[0_0_20px_rgba(0,0,0,0.2)] overflow-hidden">
        <div className="px-6 py-5 border-b border-dark-border flex justify-between items-center bg-[rgba(255,255,255,0.02)]">
          <div>
            <h2 className="font-bold text-white text-md">Recent Signups</h2>
            <p className="text-xs text-[#94A3B8]">Newly registered user profiles awaiting audit</p>
          </div>
          <Link
            to="/admin/users"
            className="text-xs font-bold text-brand-indigo hover:text-white transition-colors cursor-pointer"
          >
            View All Users →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-dark-border text-[#94A3B8] text-xs font-bold uppercase tracking-wider bg-[rgba(255,255,255,0.01)]">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border text-sm text-[#E2E8F0]">
              {recentSignups.map((usr) => (
                <tr key={usr.id} className="hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-bold text-white">{usr.name}</div>
                      <div className="text-xs text-[#94A3B8] font-medium">{usr.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold">{usr.role}</td>
                  <td className="px-6 py-4">{getStatusBadge(usr.status)}</td>
                  <td className="px-6 py-4 text-xs font-medium text-[#94A3B8]">{usr.joined}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleChat(usr.id)}
                      className="text-xs font-bold text-brand-purple hover:text-white transition-colors mr-4 cursor-pointer"
                    >
                      Chat
                    </button>
                    <button className="text-xs font-bold text-brand-indigo hover:text-white transition-colors mr-4 cursor-pointer">
                      Verify
                    </button>
                    <button className="text-xs font-bold text-[#EF4444] hover:text-white transition-colors cursor-pointer">
                      Flag
                    </button>
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
