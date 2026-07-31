import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useScrollAnimationGroup } from '../hooks/useScrollAnimation';
import use3DTilt from '../hooks/use3DTilt';
import {
  ArrowRight, MapPin, ShieldCheck, Award, Users, Zap,
  Star, CheckCircle, TrendingUp, Clock, Globe
} from 'lucide-react';

/* ── Animated counter hook ──────────────────────────────── */
const useCounter = (target, duration = 2000, isVisible = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, target, duration]);
  return count;
};

/* ── 3D Feature Card ──────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, description, gradient, delay }) => {
  const { tiltRef, onMouseMove, onMouseLeave } = use3DTilt({ maxTilt: 10, scale: 1.025 });
  return (
    <div
      ref={tiltRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`ss-animate bg-white rounded-3xl p-8 border border-surface-border cursor-default ${delay}`}
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
    >
      <div
        className={`h-14 w-14 rounded-2xl ${gradient} flex items-center justify-center mb-6 shadow-md`}
      >
        <Icon className="h-7 w-7 text-white" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

/* ── Stat Card ───────────────────────────────────────────── */
const StatCard = ({ value, suffix = '', label, color, isVisible, delay }) => {
  const num = useCounter(value, 2000, isVisible);
  return (
    <div className={`ss-animate text-center ${delay}`}>
      <div className={`text-5xl font-black mb-2 ${color}`}>
        {num.toLocaleString()}{suffix}
      </div>
      <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
    </div>
  );
};

/* ── Step Card ───────────────────────────────────────────── */
const StepCard = ({ number, title, desc, delay }) => {
  const { tiltRef, onMouseMove, onMouseLeave } = use3DTilt({ maxTilt: 8, scale: 1.02 });
  return (
    <div
      ref={tiltRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`ss-animate bg-white rounded-3xl p-7 border border-surface-border relative ${delay}`}
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
    >
      <div className="text-5xl font-black text-brand-100 mb-4 select-none leading-none">{number}</div>
      <h4 className="text-base font-bold text-slate-900 mb-2">{title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
};

/* ── Review Card ─────────────────────────────────────────── */
const ReviewCard = ({ name, role, quote, rating, avatar, delay }) => (
  <div className={`ss-animate bg-white rounded-3xl p-7 border border-surface-border ${delay}`} style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
    <div className="flex mb-4">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
      ))}
    </div>
    <p className="text-slate-600 text-sm leading-relaxed mb-5 italic">&ldquo;{quote}&rdquo;</p>
    <div className="flex items-center gap-3">
      <img src={avatar} alt={name} className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-100" />
      <div>
        <div className="text-sm font-bold text-slate-800">{name}</div>
        <div className="text-xs text-slate-400 font-medium">{role}</div>
      </div>
    </div>
  </div>
);

/* ── Floating Shape ──────────────────────────────────────── */
const FloatingShape = ({ className, style }) => (
  <div className={`absolute pointer-events-none animate-float ${className}`} style={style} />
);

/* ══════════════════════════════════════════════════════════
   LANDING PAGE
══════════════════════════════════════════════════════════ */
const Landing = () => {
  // Scroll animation groups
  const { groupRef: statsRef } = useScrollAnimationGroup();
  const { groupRef: featuresRef } = useScrollAnimationGroup();
  const { groupRef: stepsRef } = useScrollAnimationGroup();
  const { groupRef: reviewsRef } = useScrollAnimationGroup();
  const { groupRef: heroRef } = useScrollAnimationGroup();
  const { groupRef: ctaRef } = useScrollAnimationGroup();

  // Stats visibility
  const statsContainerRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  useEffect(() => {
    const el = statsContainerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const features = [
    {
      icon: MapPin,
      title: 'Hyperlocal Matching',
      description: 'Connect with freelancers in your neighborhood for on-site projects, quick turnarounds, and genuine local collaboration.',
      gradient: 'bg-gradient-brand',
      delay: 'ss-delay-1',
    },
    {
      icon: ShieldCheck,
      title: 'Milestone Escrow',
      description: 'Funds held securely in escrow, released only when milestones are verified. Complete every transaction with full confidence.',
      gradient: 'bg-gradient-to-br from-cyan-500 to-blue-500',
      delay: 'ss-delay-2',
    },
    {
      icon: Award,
      title: 'Verified Profiles',
      description: 'Skills, certifications, and identities verified by our team. Work with trusted local specialists every time.',
      gradient: 'bg-gradient-to-br from-violet-500 to-purple-600',
      delay: 'ss-delay-3',
    },
    {
      icon: Zap,
      title: 'Instant Messaging',
      description: 'Real-time chat with built-in file sharing. Keep all project communication in one organized, searchable thread.',
      gradient: 'bg-gradient-to-br from-amber-400 to-orange-500',
      delay: 'ss-delay-4',
    },
    {
      icon: TrendingUp,
      title: 'Smart Analytics',
      description: 'Track earnings, proposals, and project performance with detailed analytics. Make data-driven decisions effortlessly.',
      gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      delay: 'ss-delay-5',
    },
    {
      icon: Globe,
      title: 'Dispute Resolution',
      description: 'Our neutral mediation team resolves any project disputes fairly and efficiently. Your work is always protected.',
      gradient: 'bg-gradient-to-br from-rose-500 to-pink-600',
      delay: 'ss-delay-6',
    },
  ];

  const steps = [
    { number: '01', title: 'Create Your Profile', desc: 'Sign up as a client or freelancer in under 2 minutes. Showcase your skills or describe your project needs.' },
    { number: '02', title: 'Connect Locally', desc: 'Browse verified local talent or post your gig. Our smart matching surfaces the best fits in your area.' },
    { number: '03', title: 'Work & Get Paid', desc: 'Collaborate securely with escrow protection. Funds release automatically on milestone completion.' },
  ];

  const reviews = [
    {
      name: 'Priya Mehta',
      role: 'Product Manager, Bengaluru',
      quote: 'Found an incredible UI designer within 2 km of my office. The project was completed faster than any remote hire I\'ve ever used.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&q=80&w=80',
      delay: 'ss-delay-1',
    },
    {
      name: 'Rahul Sharma',
      role: 'Freelance Developer',
      quote: 'SkillSphere changed how I find clients. Local gigs mean less communication lag and I get paid instantly via the milestone system.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80',
      delay: 'ss-delay-2',
    },
    {
      name: 'Anjali Patel',
      role: 'Startup Founder, Mumbai',
      quote: 'The escrow system gave us complete peace of mind. We never had a payment dispute — the platform handled everything seamlessly.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=80',
      delay: 'ss-delay-3',
    },
  ];

  return (
    <div className="min-h-screen bg-surface-subtle flex flex-col">
      <Navbar />

      {/* ── HERO SECTION ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-hero pt-16 pb-28 md:pt-24 md:pb-36">
        {/* Decorative floating shapes */}
        <FloatingShape
          className="w-72 h-72 bg-brand-100 rounded-full blur-3xl opacity-70"
          style={{ top: '-5%', right: '5%', animationDelay: '0s' }}
        />
        <FloatingShape
          className="w-56 h-56 bg-accent-light/30 rounded-full blur-2xl opacity-60"
          style={{ bottom: '0%', left: '3%', animationDelay: '2s' }}
        />
        <FloatingShape
          className="w-40 h-40 bg-cyan-100 rounded-full blur-2xl opacity-50"
          style={{ top: '30%', left: '15%', animationDelay: '1s' }}
        />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366F1' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div ref={heroRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="ss-animate ss-delay-1 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
              Hyperlocal Freelancing Redefined
            </div>

            {/* Headline */}
            <h1 className="ss-animate ss-delay-2 text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight mb-6">
              Find Trusted{' '}
              <span className="text-gradient-brand">Local Freelancers</span>
              <br />
              In Your Area
            </h1>

            {/* Subheadline */}
            <p className="ss-animate ss-delay-3 text-lg md:text-xl text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">
              Connect instantly with talented professionals right in your neighborhood.
              Get services done securely, efficiently, and hyperlocally.
            </p>

            {/* CTAs */}
            <div className="ss-animate ss-delay-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register?role=client" className="btn-brand text-base px-8 py-4 w-full sm:w-auto">
                Post a Job <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/register?role=freelancer"
                className="btn-outline text-base px-8 py-4 w-full sm:w-auto"
              >
                Find Work →
              </Link>
            </div>

            {/* Social proof line */}
            <div className="ss-animate ss-delay-5 flex items-center justify-center gap-6 mt-12 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> Free to join</span>
              <span className="w-px h-4 bg-slate-200" />
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> Secure escrow</span>
              <span className="w-px h-4 bg-slate-200" />
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> Verified freelancers</span>
            </div>
          </div>

          {/* Dashboard preview card (3D floating) */}
          <div className="ss-animate ss-delay-6 mt-16 relative max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl shadow-[0_40px_100px_rgba(99,102,241,0.15)] border border-surface-border p-6 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <div className="ml-auto flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  skillsphere.app
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-5">
                {[
                  { label: 'Active Projects', val: '24', color: 'text-brand-600' },
                  { label: 'Earnings', val: '₹1.2L', color: 'text-emerald-600' },
                  { label: 'Rating', val: '4.9★', color: 'text-amber-500' },
                ].map((s) => (
                  <div key={s.label} className="bg-surface-subtle rounded-2xl p-4 border border-surface-border text-center">
                    <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
                    <div className="text-xs text-slate-400 mt-1 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {['UI/UX Design · Bengaluru', 'React Development · Mumbai', 'Content Writing · Delhi'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-surface-subtle rounded-xl border border-surface-border">
                    <div className="h-8 w-8 rounded-full bg-gradient-brand flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-2.5 bg-slate-200 rounded-full w-32 mb-1.5" />
                      <div className="text-xs text-slate-400 font-medium">{item}</div>
                    </div>
                    <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">Active</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ────────────────────────────────── */}
      <section className="py-20 bg-white border-y border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={el => { statsContainerRef.current = el; statsRef.current = el; }} className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
            <StatCard value={15000} suffix="+" label="Active Users" color="text-gradient-brand" isVisible={statsVisible} delay="ss-delay-1" />
            <StatCard value={45000} suffix="+" label="Gigs Completed" color="text-cyan-600" isVisible={statsVisible} delay="ss-delay-2" />
            <StatCard value={99} suffix=".2%" label="Success Rate" color="text-emerald-600" isVisible={statsVisible} delay="ss-delay-3" />
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ─────────────────────────────── */}
      <section className="py-24 bg-surface-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="ss-animate inline-flex badge-brand mb-4">
              <Zap className="h-3.5 w-3.5" /> Platform Features
            </div>
            <h2 className="ss-animate ss-delay-1 text-4xl font-black text-slate-900 mb-4">
              Everything you need to
              <br />
              <span className="text-gradient-brand">work locally & win</span>
            </h2>
            <p className="ss-animate ss-delay-2 text-slate-500 max-w-md mx-auto leading-relaxed">
              Our hyperlocal platform combines smart matching, secure payments, and real-time communication into one seamless experience.
            </p>
          </div>

          <div ref={featuresRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="ss-animate inline-flex badge-brand mb-4">
              <Clock className="h-3.5 w-3.5" /> Simple Process
            </div>
            <h2 className="ss-animate ss-delay-1 text-4xl font-black text-slate-900">
              Get started in
              <span className="text-gradient-brand"> 3 steps</span>
            </h2>
          </div>

          <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <StepCard key={s.number} {...s} delay={`ss-delay-${i + 1}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section className="py-24 bg-surface-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="ss-animate inline-flex badge-brand mb-4">
              <Star className="h-3.5 w-3.5" /> Real Reviews
            </div>
            <h2 className="ss-animate ss-delay-1 text-4xl font-black text-slate-900">
              Loved by <span className="text-gradient-brand">thousands</span>
            </h2>
          </div>
          <div ref={reviewsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <ReviewCard key={r.name} {...r} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ──────────────────────────────────── */}
      <section className="py-24 bg-gradient-cta relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div ref={ctaRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="ss-animate inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold uppercase tracking-wider mb-8">
            <Users className="h-3.5 w-3.5" /> Join 15,000+ users
          </div>
          <h2 className="ss-animate ss-delay-1 text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Ready to unlock local<br />opportunities?
          </h2>
          <p className="ss-animate ss-delay-2 text-white/70 max-w-xl mx-auto mb-10 text-lg leading-relaxed">
            Create your free account today. Post job requests or apply to top projects in your neighborhood.
          </p>
          <div className="ss-animate ss-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="group flex items-center gap-2 bg-white text-brand-700 px-8 py-4 rounded-full font-black text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 w-full sm:w-auto justify-center"
            >
              Get started free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="text-white/80 hover:text-white text-sm font-semibold transition-colors underline underline-offset-4 decoration-white/30 hover:decoration-white/60"
            >
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-md">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-black text-white">SkillSphere</span>
            </div>
            <p className="text-slate-400 text-sm">© 2025 SkillSphere. Hyperlocal freelancing, reimagined.</p>
            <div className="flex gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
