import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Briefcase, CreditCard, PlusCircle, Clock, CheckCircle2, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const ClientDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        if (response.data.success) {
          const statsMap = {
            'Posted Gigs': Briefcase,
            'Active Projects': Clock,
            'Total Spent': CreditCard,
            'Pending Payments': TrendingUp
          };

          const mappedStats = (response.data.stats || []).map(s => ({
            ...s,
            icon: statsMap[s.title] || Briefcase
          }));

          const actMap = {
            'proposal': Briefcase,
            'payment': CreditCard,
            'verification': CheckCircle2
          };

          const mappedActivities = (response.data.activities || []).map(act => ({
            ...act,
            icon: actMap[act.type] || Briefcase
          }));

          setStats(mappedStats);
          setActivities(mappedActivities);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
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
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-brand-50 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200">
              🧑‍💼 Client Dashboard
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, <span className="text-brand-600">{user?.name || 'Client'}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor your posted gigs, check incoming bids, and manage payments.
          </p>
        </div>

        <Link
          to="/client/post-gig"
          className="btn-brand inline-flex items-center gap-2 px-6 py-3.5 text-sm relative z-10 self-start md:self-center"
        >
          <PlusCircle className="h-5 w-5" />
          Post a New Gig
        </Link>
      </div>

      {/* ── Stats Cards Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon || Briefcase;
          const iconColors = [
            'bg-indigo-50 text-indigo-600 border-indigo-200',
            'bg-amber-50 text-amber-600 border-amber-200',
            'bg-emerald-50 text-emerald-600 border-emerald-200',
            'bg-blue-50 text-blue-600 border-blue-200',
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

      {/* ── Main Content Areas ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Recent Activity Feed */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-surface-border shadow-card lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Activity Feed</h2>
          
          <div className="relative border-l-2 border-slate-200 pl-6 space-y-8 my-2">
            {activities.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No recent activities found yet. Once you post a gig or receive proposals, they will show up here.
              </div>
            ) : (
              activities.map((act) => {
                const Icon = act.icon || Briefcase;
                const dotColors = {
                  proposal: 'bg-brand-600',
                  payment: 'bg-emerald-600',
                  verification: 'bg-blue-600',
                };
                const dotBg = dotColors[act.type] || 'bg-brand-600';

                return (
                  <div key={act.id} className="relative group">
                    {/* Timeline dot */}
                    <span
                      className={`absolute -left-[33px] top-1.5 h-6 w-6 rounded-full ${dotBg} flex items-center justify-center text-white ring-4 ring-white shadow-sm`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>

                    <div>
                      <div className="flex justify-between items-center gap-4 mb-1">
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
                          {act.title}
                        </h3>
                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                          {act.time}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed">{act.desc}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Quick Action Links / Local Info */}
        <div className="space-y-6">
          {/* Quick Info Box */}
          <div className="bg-gradient-cta text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 h-36 w-36 bg-white/10 rounded-full blur-xl" />
            <h3 className="font-black text-lg mb-2">Need Talent Fast?</h3>
            <p className="text-xs text-white/80 leading-relaxed mb-4">
              Use our smart location engine to find electricians, plumbers, and developers working within 5 kilometers of your office.
            </p>
            <Link
              to="/client/post-gig"
              className="inline-block bg-white text-slate-900 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-all duration-200"
            >
              Post Hyperlocal Gig →
            </Link>
          </div>

          {/* Verification Banner */}
          <div className="bg-white border border-surface-border p-6 rounded-3xl flex items-start gap-3 shadow-card">
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 flex-shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1">
                Verified Client Status
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your email is verified. Complete your profile details to unlock premium candidate verification tags for your job posts.
              </p>
              <Link
                to="/client/profile"
                className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Complete Profile <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
