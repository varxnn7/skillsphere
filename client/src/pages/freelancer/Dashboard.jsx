import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Briefcase,
  Eye,
  FileText,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight
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

          const mappedStats = (response.data.stats || []).map(s => ({
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
        <LoadingSpinner size="lg" color="brand" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-blur-in">
      {/* ── Header Banner ────────────────────────────────────────────── */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-surface-border shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative overflow-hidden">
        {/* Subtle decorative blob */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-brand-50 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-brand-50 text-brand-600 border border-brand-200">
              💼 Freelancer Dashboard
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, <span className="text-brand-600">{user?.name || 'Freelancer'}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review your profile visits, pending bids, earnings progression, and local work alerts.
          </p>
        </div>
      </div>

      {/* ── Stats Cards Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon || Eye;
          const iconColors = [
            'bg-indigo-50 text-indigo-600 border-indigo-200',
            'bg-violet-50 text-violet-600 border-violet-200',
            'bg-emerald-50 text-emerald-600 border-emerald-200',
            'bg-amber-50 text-amber-600 border-amber-200',
          ];
          const colorClass = iconColors[idx % iconColors.length];

          return (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-surface-border shadow-card hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex items-center gap-4 cursor-default"
            >
              <div className={`p-3.5 rounded-2xl border ${colorClass} flex-shrink-0`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {stat.title}
                </span>
                <span className="text-2xl md:text-3xl font-black text-slate-900 mt-0.5 block">
                  {stat.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Grid: Earnings Chart & Local Leads ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Earnings Chart Card */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-surface-border shadow-card lg:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Earnings Performance</h2>
              <p className="text-xs text-slate-400">Monthly earnings summary tracker</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <TrendingUp className="h-3.5 w-3.5" />
              +28% this month
            </span>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#0F172A'
                  }}
                  formatter={(value) => [`₹${value}`, 'Earnings']}
                />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="#6366F1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorEarnings)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Local Matches / Quick Leads */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-brand-600" />
              <h2 className="text-md font-black text-slate-900">Hyperlocal Opportunities</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-normal">
              Based on your location coordinates, these gigs match your background:
            </p>

            <div className="space-y-3">
              {localJobs.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No hyperlocal leads found at the moment. Check back soon!
                </div>
              ) : (
                localJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-3.5 border border-slate-200 bg-slate-50/70 rounded-2xl hover:border-brand-300 hover:bg-brand-50/30 transition-all cursor-pointer group"
                  >
                    <h3 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-brand-600 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex justify-between items-center text-xs text-slate-500 font-medium mb-2.5">
                      <span className="flex items-center gap-1 text-slate-600">
                        <MapPin className="h-3.5 w-3.5 text-brand-500" />
                        {job.distance}
                      </span>
                      <span>{job.client}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-200/80 pt-2.5">
                      <span className="text-sm font-black text-slate-900">{job.budget}</span>
                      <button className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                        Quick Proposal <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tip Box */}
          <div className="bg-violet-50 border border-violet-200 p-5 rounded-3xl shadow-sm">
            <h4 className="text-xs font-bold text-violet-800 mb-1">💡 Optimization Tip</h4>
            <p className="text-xs text-violet-700 leading-relaxed">
              Add your recent work certifications and upload your resume on the profile page to rank higher in local search query returns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
