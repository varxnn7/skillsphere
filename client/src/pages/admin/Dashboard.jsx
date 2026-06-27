import React from 'react';
import { Users, CreditCard, ShieldAlert, Award, FileText, Calendar } from 'lucide-react';

const AdminDashboard = () => {
  // Mock administrative stats
  const stats = [
    { title: 'Total Registered Users', value: '1,420', icon: Users, color: 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20' },
    { title: 'Total Platform Revenue', value: '₹5,40,000', icon: CreditCard, color: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20' },
    { title: 'Active Gigs', value: '382', icon: FileText, color: 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20' },
    { title: 'Disputes Pending', value: '7', icon: ShieldAlert, color: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20' }
  ];

  // Mock signups table
  const recentSignups = [
    { id: 1, name: 'Alice Smith', email: 'alice.smith@example.com', role: 'Freelancer', status: 'verified', joined: 'June 27, 2026' },
    { id: 2, name: 'Metro Construction', email: 'hr@metroconst.in', role: 'Client', status: 'pending', joined: 'June 26, 2026' },
    { id: 3, name: 'Devendra Kumar', email: 'devendra.k@gmail.com', role: 'Freelancer', status: 'verified', joined: 'June 25, 2026' },
    { id: 4, name: 'Nisha Sharma', email: 'nisha.sharma@hotmail.com', role: 'Freelancer', status: 'flagged', joined: 'June 24, 2026' },
    { id: 5, name: 'City Plumbing Inc', email: 'ops@cityplumb.org', role: 'Client', status: 'verified', joined: 'June 24, 2026' }
  ];

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

      {/* Signups Table */}
      <div className="bg-dark-surface rounded-2xl border border-dark-border shadow-[0_0_20px_rgba(0,0,0,0.2)] overflow-hidden">
        <div className="px-6 py-5 border-b border-dark-border flex justify-between items-center bg-[rgba(255,255,255,0.02)]">
          <div>
            <h2 className="font-bold text-white text-md">Recent Signups</h2>
            <p className="text-xs text-[#94A3B8]">Newly registered user profiles awaiting audit</p>
          </div>
          <span className="text-xs font-bold text-brand-indigo hover:text-white transition-colors cursor-pointer">
            View All Users →
          </span>
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
