import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Briefcase,
  Eye,
  FileText,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const FreelancerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [localJobs, setLocalJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        if (response.data.success) {
          const statsMap = {
            'Profile Views': Eye,
            'Proposals Sent': FileText,
            'Active Gigs': Briefcase,
            'Total Earnings': TrendingUp
          };

          const mappedStats = response.data.stats.map(s => ({
            ...s,
            icon: statsMap[s.title] || Eye
          }));

          setStats(mappedStats);
          setChartData(response.data.chartData || []);
          setLocalJobs(response.data.localJobs || []);
        }
      } catch (err) {
        console.error('Error fetching freelancer dashboard:', err);
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

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-brand-purple/15 text-brand-purple border border-brand-purple/30">
              💼 Freelancer Dashboard
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Welcome back, <span className="text-brand-purple">{user?.name || 'Freelancer'}</span>
          </h1>
          <p className="text-[#94A3B8] text-sm">Review your profile visits, pending bids, earnings progression, and local work alerts.</p>
        </div>
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

      {/* Main Grid: Earnings Chart & Local Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Earnings Chart Card */}
        <div className="bg-dark-surface p-6 rounded-2xl border border-dark-border shadow-[0_0_20px_rgba(0,0,0,0.2)] lg:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Earnings Performance</h2>
              <p className="text-xs text-[#64748B]">Monthly earnings summary tracker</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
              <TrendingUp className="h-3.5 w-3.5" />
              +28% this month
            </span>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
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
                  formatter={(value) => [`₹${value}`, 'Earnings']}
                />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="#7C3AED"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEarnings)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Local Matches / Quick Leads */}
        <div className="space-y-6">
          <div className="bg-dark-surface p-6 rounded-2xl border border-dark-border shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-brand-purple animate-pulse" />
              <h2 className="text-md font-bold text-white">Hyperlocal Opportunities</h2>
            </div>
            <p className="text-xs text-[#94A3B8] mb-4 leading-normal">
              Based on your location coordinates, these gigs match your background:
            </p>

            <div className="space-y-3">
              {localJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-3 border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)] rounded-xl hover:border-brand-purple/40 hover:bg-[rgba(255,255,255,0.03)] transition-colors cursor-pointer"
                >
                  <h3 className="text-xs font-bold text-white mb-1">{job.title}</h3>
                  <div className="flex justify-between items-center text-[10px] text-[#64748B] font-semibold mb-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.distance}
                    </span>
                    <span>{job.client}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-[rgba(255,255,255,0.05)] pt-2">
                    <span className="text-xs font-bold text-white">{job.budget}</span>
                    <button className="text-[10px] font-bold text-brand-purple hover:text-white transition-colors cursor-pointer">
                      Quick Proposal →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tip Box */}
          <div className="bg-brand-purple/10 border border-brand-purple/20 p-5 rounded-2xl shadow-[0_0_15px_rgba(139,92,246,0.1)]">
            <h4 className="text-xs font-bold text-brand-purple mb-1">💡 Optimization Tip</h4>
            <p className="text-[11px] text-[#94A3B8] leading-normal">
              Add your recent work certifications and upload your resume on the profile page to rank higher in local search query returns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
