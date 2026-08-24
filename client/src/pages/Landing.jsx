import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useScrollAnimationGroup } from '../hooks/useScrollAnimation';
import use3DTilt from '../hooks/use3DTilt';
import {
  ArrowRight, MapPin, ShieldCheck, Award, Users, Zap,
  Star, CheckCircle, TrendingUp, Clock, Globe, X, Mail, Phone, FileText, Shield
} from 'lucide-react';

/* ── Logo Mark (same as Navbar) ─────────────────────────── */
const LogoMark = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="10" fill="#1F2937"/>
    <path
      d="M24 11.5C24 11.5 21.5 9 18 9C13.5 9 11 11.5 11 14C11 19 24 17 24 22C24 24.5 21.5 27 17.5 27C13.5 27 11 24.5 11 24.5"
      stroke="#EA580C"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="27" cy="9" r="3" fill="#FB923C"/>
  </svg>
);

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
        <Icon className="h-7 w-7 text-slate-900" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
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
      <div className="text-5xl font-black text-orange-100 mb-4 select-none leading-none">{number}</div>
      <h4 className="text-base font-bold text-slate-900 mb-2">{title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
};

/* ── Floating Shape ──────────────────────────────────────── */
const FloatingShape = ({ className, style }) => (
  <div className={`absolute pointer-events-none animate-float ${className}`} style={style} />
);

/* ── Footer Modal ────────────────────────────────────────── */
const FooterModal = ({ isOpen, onClose, title, icon: Icon, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-animate-in"
      style={{ background: 'rgba(17,24,39,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-[0_40px_80px_rgba(0,0,0,0.25)] max-w-lg w-full max-h-[85vh] overflow-hidden modal-animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-slate-50 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
              <Icon className="h-5 w-5 text-slate-900" />
            </div>
            <h2 className="text-lg font-black text-slate-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* Modal Content */}
        <div className="px-7 py-6 overflow-y-auto max-h-[70vh] text-slate-600 text-sm leading-relaxed space-y-4">
          {children}
        </div>
        {/* Modal Footer */}
        <div className="px-7 py-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-end">
          <button
            onClick={onClose}
            className="btn-brand text-sm px-6 py-2.5"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   LANDING PAGE
══════════════════════════════════════════════════════════ */
const Landing = () => {
  // Scroll animation groups
  const { groupRef: featuresRef } = useScrollAnimationGroup();
  const { groupRef: stepsRef } = useScrollAnimationGroup();
  const { groupRef: heroRef } = useScrollAnimationGroup();
  const { groupRef: ctaRef } = useScrollAnimationGroup();

  // Footer modal state
  const [activeModal, setActiveModal] = useState(null); // 'privacy' | 'terms' | 'contact'

  const features = [
    {
      icon: MapPin,
      title: 'Hyperlocal Matching',
      description: 'Connect with freelancers in your neighborhood for on-site projects, quick turnarounds, and genuine local collaboration.',
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
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
      gradient: 'bg-gradient-to-br from-slate-600 to-slate-800',
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

  return (
    <div className="min-h-screen bg-surface-subtle flex flex-col">
      <Navbar />

      {/* ── HERO SECTION ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-hero pt-16 pb-28 md:pt-24 md:pb-36">
        {/* Decorative floating shapes — orange toned */}
        <FloatingShape
          className="w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-70"
          style={{ top: '-5%', right: '5%', animationDelay: '0s' }}
        />
        <FloatingShape
          className="w-56 h-56 bg-amber-100 rounded-full blur-2xl opacity-60"
          style={{ bottom: '0%', left: '3%', animationDelay: '2s' }}
        />
        <FloatingShape
          className="w-40 h-40 bg-orange-50 rounded-full blur-2xl opacity-50"
          style={{ top: '30%', left: '15%', animationDelay: '1s' }}
        />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23EA580C' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div ref={heroRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="ss-animate ss-delay-1 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
              Hyperlocal Freelancing Redefined
            </div>

            {/* Headline */}
            <h1 className="ss-animate ss-delay-2 text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight mb-6">
              Find Trusted{' '}
              <span className="text-gradient-orange">Local Freelancers</span>
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
            <div className="bg-white rounded-3xl shadow-[0_40px_100px_rgba(234,88,12,0.12)] border border-surface-border p-6 relative overflow-hidden">
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
                  { label: 'Active Projects', val: '24', color: 'text-orange-600' },
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
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex-shrink-0" />
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

      {/* ── FEATURES SECTION ─────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="ss-animate inline-flex badge-brand mb-4">
              <Zap className="h-3.5 w-3.5" /> Platform Features
            </div>
            <h2 className="ss-animate ss-delay-1 text-4xl font-black text-slate-900 mb-4">
              Everything you need to
              <br />
              <span className="text-gradient-orange">work locally & win</span>
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
      <section className="py-24 bg-surface-subtle border-t border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="ss-animate inline-flex badge-brand mb-4">
              <Clock className="h-3.5 w-3.5" /> Simple Process
            </div>
            <h2 className="ss-animate ss-delay-1 text-4xl font-black text-slate-900">
              Get started in
              <span className="text-gradient-orange"> 3 steps</span>
            </h2>
          </div>

          <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <StepCard key={s.number} {...s} delay={`ss-delay-${i + 1}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ──────────────────────────────────── */}
      <section className="py-24 bg-gradient-cta relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-surface-muted blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-surface-muted blur-2xl pointer-events-none" />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

        <div ref={ctaRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="ss-animate inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold uppercase tracking-wider mb-8">
            <Users className="h-3.5 w-3.5" /> Hyperlocal Freelance Network
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
              className="group flex items-center gap-2 bg-white text-orange-700 px-8 py-4 rounded-full font-black text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 w-full sm:w-auto justify-center"
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
      <footer className="bg-[#111827] text-slate-900 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <LogoMark size={32} />
              <span className="text-lg font-black text-white">
                Skill<span style={{ color: '#EA580C' }}>Sphere</span>
              </span>
            </div>

            <p className="text-slate-400 text-sm">
              © 2026 SkillSphere. Hyperlocal freelancing, reimagined.
            </p>

            {/* Footer links — now open modals */}
            <div className="flex gap-6 text-sm text-slate-400">
              <button
                onClick={() => setActiveModal('privacy')}
                className="hover:text-orange-400 transition-colors cursor-pointer font-medium hover:underline underline-offset-4"
              >
                Privacy
              </button>
              <button
                onClick={() => setActiveModal('terms')}
                className="hover:text-orange-400 transition-colors cursor-pointer font-medium hover:underline underline-offset-4"
              >
                Terms
              </button>
              <button
                onClick={() => setActiveModal('contact')}
                className="hover:text-orange-400 transition-colors cursor-pointer font-medium hover:underline underline-offset-4"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ── FOOTER MODALS ────────────────────────────────── */}

      {/* Privacy Policy Modal */}
      <FooterModal
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        title="Privacy Policy"
        icon={Shield}
      >
        <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Last updated: January 1, 2026</p>
        <p>At SkillSphere, your privacy is our priority. This policy explains how we collect, use, and protect your personal information when you use our hyperlocal freelancing platform.</p>
        <h3 className="font-bold text-slate-900 mt-2">Information We Collect</h3>
        <ul className="list-disc list-inside space-y-1 text-slate-500">
          <li>Account registration details (name, email, location)</li>
          <li>Profile information (skills, work history, portfolio)</li>
          <li>Transaction and payment data (processed securely via Stripe)</li>
          <li>Communication logs between clients and freelancers</li>
          <li>Usage analytics and device information</li>
        </ul>
        <h3 className="font-bold text-slate-900 mt-2">How We Use Your Information</h3>
        <ul className="list-disc list-inside space-y-1 text-slate-500">
          <li>Matching clients with local freelancers based on location and skills</li>
          <li>Processing secure escrow payments and milestone releases</li>
          <li>Sending notifications about project updates and messages</li>
          <li>Improving platform features through anonymized analytics</li>
        </ul>
        <h3 className="font-bold text-slate-900 mt-2">Data Security</h3>
        <p>We use industry-standard encryption (AES-256) for data at rest and TLS 1.3 for data in transit. Payment information is never stored on our servers — all transactions are handled by our PCI-compliant payment processor.</p>
        <h3 className="font-bold text-slate-900 mt-2">Your Rights</h3>
        <p>You may request access, correction, or deletion of your personal data at any time by contacting <a href="mailto:varunkukreja017@gmail.com" className="text-orange-600 font-semibold hover:underline">varunkukreja017@gmail.com</a>.</p>
      </FooterModal>

      {/* Terms of Service Modal */}
      <FooterModal
        isOpen={activeModal === 'terms'}
        onClose={() => setActiveModal(null)}
        title="Terms of Service"
        icon={FileText}
      >
        <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Effective: January 1, 2026</p>
        <p>By using SkillSphere, you agree to these Terms of Service. Please read them carefully before creating an account or posting/accepting any gig.</p>
        <h3 className="font-bold text-slate-900 mt-2">Eligibility</h3>
        <p>You must be at least 18 years old to use SkillSphere. By registering, you confirm that all information you provide is accurate and truthful.</p>
        <h3 className="font-bold text-slate-900 mt-2">Freelancer Responsibilities</h3>
        <ul className="list-disc list-inside space-y-1 text-slate-500">
          <li>Deliver work that meets the agreed-upon scope and quality</li>
          <li>Communicate professionally and respond within reasonable timeframes</li>
          <li>Accurately represent your skills and experience in your profile</li>
          <li>Not engage in plagiarism or submission of others' work as your own</li>
        </ul>
        <h3 className="font-bold text-slate-900 mt-2">Client Responsibilities</h3>
        <ul className="list-disc list-inside space-y-1 text-slate-500">
          <li>Provide clear project briefs and requirements</li>
          <li>Fund escrow before work commences on milestones</li>
          <li>Release milestone payments upon satisfactory completion</li>
          <li>Not request work outside the agreed project scope without additional payment</li>
        </ul>
        <h3 className="font-bold text-slate-900 mt-2">Platform Fees</h3>
        <p>SkillSphere charges a service fee of 10% on all completed transactions. This fee covers platform maintenance, secure payment processing, and dispute resolution services.</p>
        <h3 className="font-bold text-slate-900 mt-2">Dispute Resolution</h3>
        <p>In case of disputes, our mediation team will review the case within 3 business days. Both parties must provide evidence and cooperate with the review process. Our decisions are final and binding.</p>
        <h3 className="font-bold text-slate-900 mt-2">Termination</h3>
        <p>SkillSphere reserves the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or harm the community.</p>
      </FooterModal>

      {/* Contact Modal */}
      <FooterModal
        isOpen={activeModal === 'contact'}
        onClose={() => setActiveModal(null)}
        title="Contact Us"
        icon={Mail}
      >
        <p>We'd love to hear from you! Whether you have a question, feedback, or need help with your account, our team is here to assist.</p>

        <div className="grid grid-cols-1 gap-4 mt-2">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-orange-50 border border-orange-100">
            <div className="h-9 w-9 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
              <Mail className="h-4 w-4 text-slate-900" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Email Support</p>
              <p className="text-slate-500 text-xs mt-0.5">For general inquiries and account help</p>
              <a href="mailto:varunkukreja017@gmail.com" className="text-orange-600 font-semibold text-sm hover:text-orange-700 mt-1 inline-block">varunkukreja017@gmail.com</a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="h-9 w-9 rounded-xl bg-[#1F2937] flex items-center justify-center flex-shrink-0">
              <Shield className="h-4 w-4 text-slate-900" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Trust & Safety</p>
              <p className="text-slate-500 text-xs mt-0.5">Report fraud, abuse, or policy violations</p>
              <a href="mailto:varunkukreja017@gmail.com" className="text-orange-600 font-semibold text-sm hover:text-orange-700 mt-1 inline-block">varunkukreja017@gmail.com</a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="h-9 w-9 rounded-xl bg-[#1F2937] flex items-center justify-center flex-shrink-0">
              <Phone className="h-4 w-4 text-slate-900" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Business Inquiries</p>
              <p className="text-slate-500 text-xs mt-0.5">Partnerships, enterprise plans & queries</p>
              <a href="mailto:varunkukreja017@gmail.com" className="text-orange-600 font-semibold text-sm hover:text-orange-700 mt-1 inline-block">varunkukreja017@gmail.com</a>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Response Times</p>
          <p className="text-slate-500 text-xs">General support: within 24 hours · Trust & Safety: within 4 hours · Billing: within 12 hours</p>
        </div>
      </FooterModal>
    </div>
  );
};

export default Landing;
