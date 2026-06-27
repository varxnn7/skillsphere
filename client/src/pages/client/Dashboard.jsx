import React from 'react';
import { useSelector } from 'react-redux';
import { Briefcase, CreditCard, PlusCircle, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClientDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  // Mock stats
  const stats = [
    { title: 'Posted Gigs', value: '4', icon: Briefcase, color: 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20' },
    { title: 'Active Projects', value: '2', icon: Clock, color: 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20' },
    { title: 'Total Spent', value: '₹14,500', icon: CreditCard, color: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20' },
    { title: 'Pending Payments', value: '₹3,200', icon: TrendingUp, color: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20' }
  ];

  // Mock activities
  const activities = [
    {
      id: 1,
      type: 'proposal',
      title: 'New proposal received',
      desc: 'John Doe applied to your "Local WordPress Development" gig.',
      time: '2 hours ago',
      icon: Briefcase,
      color: 'bg-[#3B82F6]'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Milestone escrow deposited',
      desc: 'You deposited ₹5,000 in escrow for "Mobile App UI Design" project.',
      time: '1 day ago',
      icon: CreditCard,
      color: 'bg-[#10B981]'
    },
    {
      id: 3,
      type: 'verification',
      title: 'Gig published successfully',
      desc: 'Your request for "Home Plumbing Maintenance" is live now.',
      time: '3 days ago',
      icon: CheckCircle2,
      color: 'bg-brand-indigo'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30">
              🧑‍💼 Client Dashboard
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Welcome back, <span className="text-brand-indigo">{user?.name || 'Client'}</span>
          </h1>
          <p className="text-[#94A3B8] text-sm">Monitor your posted gigs, check incoming bids, and manage payments.</p>
        </div>

        <Link
          to="/client/post-gig"
          className="inline-flex items-center gap-2 bg-gradient-brand text-white px-5 py-3 rounded-xl font-bold shadow-lg hover-glow-purple hover:scale-[1.02] active:scale-95 transition-all duration-200 text-sm"
        >
          <PlusCircle className="h-5 w-5" />
          Post a New Gig
        </Link>
      </div>

      {/* Stats Cards Grid */}
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

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Recent Activity */}
        <div className="bg-dark-surface p-6 rounded-2xl border border-dark-border shadow-[0_0_20px_rgba(0,0,0,0.2)] lg:col-span-2">
          <h2 className="text-lg font-bold text-white mb-6">Recent Activity Feed</h2>
          
          <div className="relative border-l border-dark-border pl-6 space-y-8">
            {activities.map((act) => {
              const Icon = act.icon;
              return (
                <div key={act.id} className="relative">
                  {/* Timeline dot */}
                  <span className={`absolute -left-9 top-1.5 h-6 w-6 rounded-full ${act.color} flex items-center justify-center text-white ring-4 ring-dark-surface`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  
                  <div>
                    <div className="flex justify-between items-center gap-4 mb-1">
                      <h3 className="font-bold text-white text-sm">{act.title}</h3>
                      <span className="text-xs text-[#64748B] font-medium whitespace-nowrap">{act.time}</span>
                    </div>
                    <p className="text-[#94A3B8] text-xs leading-relaxed">{act.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Quick Action Links / Local Info */}
        <div className="space-y-6">
          {/* Quick Info Box */}
          <div className="bg-gradient-brand text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 h-36 w-36 bg-white/10 rounded-full blur-xl" />
            <h3 className="font-bold text-lg mb-2">Need a Handyman Fast?</h3>
            <p className="text-xs text-white/80 leading-relaxed mb-4">
              Use our smart location engine to find electricians, plumbers, and developers working within 5 kilometers of your office.
            </p>
            <Link
              to="/client/post-gig"
              className="inline-block bg-white text-brand-indigo font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm hover:scale-[1.02] active:scale-95 transition-all duration-200"
            >
              Post Hyperlocal Gig
            </Link>
          </div>

          {/* Verification Banner */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border p-6 rounded-2xl flex items-start gap-3 shadow-[0_0_15px_rgba(0,0,0,0.15)]">
            <CheckCircle2 className="h-5 w-5 text-[#10B981] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wide mb-1">Verified Client Status</h4>
              <p className="text-xs text-[#94A3B8] leading-normal">
                Your email is verified. Complete your profile details to unlock premium candidate verification tags for your job posts.
              </p>
              <Link to="/client/profile" className="inline-block mt-3 text-xs font-bold text-brand-indigo hover:text-white transition-colors">
                Complete Profile →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
