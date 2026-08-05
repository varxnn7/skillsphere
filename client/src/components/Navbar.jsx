import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { clearProfile } from '../store/profileSlice';
import { LogOut, User, LayoutDashboard, Menu, X, MessageSquare } from 'lucide-react';
import NotificationBell from './notifications/NotificationBell';

/* ── Modern SkillSphere Logo Mark ──────────────────────── */
const LogoMark = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="10" fill="#1F2937"/>
    {/* S shape built from two arcs */}
    <path
      d="M24 11.5C24 11.5 21.5 9 18 9C13.5 9 11 11.5 11 14C11 19 24 17 24 22C24 24.5 21.5 27 17.5 27C13.5 27 11 24.5 11 24.5"
      stroke="#EA580C"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Orange accent dot */}
    <circle cx="27" cy="9" r="3" fill="#FB923C"/>
  </svg>
);

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearProfile());
    setDropdownOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (user?.role === 'client') return '/client/dashboard';
    if (user?.role === 'freelancer') return '/freelancer/dashboard';
    if (user?.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  const getProfileLink = () => {
    if (user?.role === 'client') return '/client/profile';
    if (user?.role === 'freelancer') return '/freelancer/profile';
    return '/';
  };

  const navLinkClass =
    'relative text-slate-600 hover:text-orange-600 font-medium text-sm py-1 transition-colors duration-200 group';

  return (
    <nav
      className={`bg-white/90 backdrop-blur-md sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'shadow-[0_2px_20px_rgba(0,0,0,0.08)] border-b border-surface-border'
          : 'border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="group-hover:scale-105 transition-transform duration-300">
              <LogoMark size={36} />
            </div>
            <span className="text-xl font-black tracking-tight text-[#1F2937] group-hover:text-orange-600 transition-colors duration-200">
              Skill<span style={{ color: '#EA580C' }}>Sphere</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/search" className={navLinkClass}>
              Find Gigs
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 rounded-full transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link to="/search" className={navLinkClass}>
              Find Talent
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 rounded-full transition-all duration-300 group-hover:w-full" />
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Messages */}
                <Link
                  to="/messages"
                  className="p-2 rounded-xl border border-surface-border hover:border-orange-200 hover:bg-orange-50 text-slate-500 hover:text-orange-600 transition-all duration-200"
                  title="Messages"
                >
                  <MessageSquare className="h-4 w-4" />
                </Link>

                {/* Notifications */}
                <NotificationBell />

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-surface-muted border border-transparent hover:border-surface-border transition-all duration-200"
                  >
                    <img
                      className="h-7 w-7 rounded-full object-cover border-2 border-orange-200 ring-2 ring-white"
                      src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80'}
                      alt="Profile"
                    />
                    <span className="text-sm font-semibold text-slate-700 max-w-[100px] truncate">
                      {user?.name}
                    </span>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] bg-white border border-surface-border overflow-hidden animate-scale-in origin-top-right">
                      <div className="px-4 py-3 border-b border-surface-border bg-surface-subtle">
                        <p className="text-[10px] font-extrabold text-orange-600 uppercase tracking-widest">{user?.role}</p>
                        <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">{user?.name}</p>
                      </div>

                      <Link
                        to={getDashboardLink()}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-colors font-medium"
                      >
                        <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
                        Dashboard
                      </Link>

                      {user?.role !== 'admin' && (
                        <Link
                          to={getProfileLink()}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-colors font-medium"
                        >
                          <User className="h-4 w-4 flex-shrink-0" />
                          My Profile
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-surface-border font-medium"
                      >
                        <LogOut className="h-4 w-4 flex-shrink-0" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-orange-600 px-3 py-2 text-sm font-semibold transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="btn-brand text-sm px-5 py-2.5"
                >
                  Sign up free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-surface-muted transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-border bg-white px-4 pt-3 pb-5 space-y-1 shadow-lg animate-fade-down">
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
          >
            Find Gigs
          </Link>
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
          >
            Find Talent
          </Link>

          {isAuthenticated ? (
            <>
              <div className="px-3 py-3 border-t border-surface-border mt-2">
                <div className="flex items-center gap-3">
                  <img
                    className="h-9 w-9 rounded-full object-cover border-2 border-orange-200"
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80'}
                    alt="Profile"
                  />
                  <div>
                    <p className="text-[10px] font-extrabold text-orange-600 uppercase tracking-widest">{user?.role}</p>
                    <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                  </div>
                </div>
              </div>
              <Link
                to={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              {user?.role !== 'admin' && (
                <Link
                  to={getProfileLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                >
                  <User className="h-4 w-4" />
                  My Profile
                </Link>
              )}
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-3 border-t border-surface-border flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-slate-600 hover:text-orange-600 rounded-xl hover:bg-surface-muted transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-brand w-full text-center py-2.5 text-sm"
              >
                Sign up free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
