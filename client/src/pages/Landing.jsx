import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowRight, MapPin, ShieldCheck, Sparkles, Zap, Award, Users } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col text-white transition-smooth">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36">
        {/* Decorative ambient blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-purple/30 blur-[120px] pointer-events-none animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-brand-indigo/20 blur-[120px] pointer-events-none animate-float" style={{animationDelay: '1s'}} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Sparkles className="h-3.5 w-3.5 text-brand-cyan" />
            Hyperlocal Freelancing Redefined
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-[72px] font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6 animate-fade-up">
            Find Trusted <span className="bg-gradient-brand bg-clip-text text-transparent">Local Freelancers</span> In Your Area
          </h1>
          
          <p className="text-lg md:text-xl text-[#94A3B8] max-w-[500px] mx-auto mb-10 leading-relaxed animate-fade-up" style={{animationDelay: '0.1s'}}>
            Connect instantly with talented professionals right in your neighborhood. Get services done securely, efficiently, and hyperlocally.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{animationDelay: '0.2s'}}>
            <Link
              to="/register?role=client"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-brand text-white px-8 py-4 rounded-full font-bold shadow-lg hover:scale-105 hover-glow-purple transition-all duration-200"
            >
              Post a Job <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/register?role=freelancer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent hover:bg-[rgba(255,255,255,0.05)] text-white border border-[rgba(255,255,255,0.2)] px-8 py-4 rounded-full font-bold transition-all duration-200"
            >
              Find Work
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 -mt-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center animate-fade-up" style={{animationDelay: '0.3s'}}>
            <div className="flex flex-col items-center glass-panel p-6">
              <span className="text-4xl md:text-5xl font-extrabold bg-gradient-brand bg-clip-text text-transparent mb-2 animate-count-up">15,000+</span>
              <span className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">Active Users</span>
            </div>
            <div className="flex flex-col items-center glass-panel p-6">
              <span className="text-4xl md:text-5xl font-extrabold bg-gradient-accent bg-clip-text text-transparent mb-2 animate-count-up">45,000+</span>
              <span className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">Gigs Completed</span>
            </div>
            <div className="flex flex-col items-center glass-panel p-6">
              <span className="text-4xl md:text-5xl font-extrabold text-[#10B981] mb-2 animate-count-up">99.2%</span>
              <span className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">Success Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#0D0D14] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4 relative inline-block">
              Why Choose SkillSphere?
              <span className="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-gradient-brand rounded-full"></span>
            </h2>
            <p className="text-[#94A3B8] mt-6">Our hyperlocal network makes it easier than ever to hire and work locally with peace of mind.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="glass-panel p-8 hover-lift hover-glow-purple transition-smooth group">
              <div className="h-12 w-12 rounded-full bg-gradient-brand text-white flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Hyperlocal Matching</h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                Connect with freelancers located in your neighborhood. Perfect for on-site projects, quick handovers, and local collaboration.
              </p>
            </div>

            {/* Card 2 */}
            <div className="glass-panel p-8 hover-lift hover-glow-blue transition-smooth group">
              <div className="h-12 w-12 rounded-full bg-gradient-accent text-white flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Milestone Escrow Payments</h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                Funds are held securely in escrow and released only as milestones are verified. Complete transactions with confidence.
              </p>
            </div>

            {/* Card 3 */}
            <div className="glass-panel p-8 hover-lift hover-glow-purple transition-smooth group">
              <div className="h-12 w-12 rounded-full bg-gradient-brand text-white flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Verified Profiles</h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                Trust is our currency. We verify skills, certifications, and identities, so you can work with verified local specialists.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="bg-[linear-gradient(135deg,#1a1a2e,#16213e)] text-white py-20 relative overflow-hidden mt-auto border-t border-[rgba(255,255,255,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">Ready to unlock local opportunities?</h2>
          <p className="text-[#94A3B8] max-w-xl mx-auto mb-10 text-sm md:text-lg">
            Create your account today. Post job requests or apply to top projects in your neighborhood.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="bg-gradient-brand px-8 py-4 rounded-full font-bold shadow-lg hover:scale-105 hover-glow-purple transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
