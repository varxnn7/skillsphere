import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { clearProfile } from '../store/profileSlice';
import { LogOut, User, LayoutDashboard, Settings, Menu, X } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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

  return (
    <nav className="bg-[rgba(10,10,15,0.8)] backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.06)] sticky top-0 z-40 transition-smooth">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-gradient-brand flex items-center justify-center text-white font-extrabold text-lg shadow-md hover-glow-purple transition-smooth">
                S
              </div>
              <span className="text-xl font-bold bg-gradient-brand bg-clip-text text-transparent">
                SkillSphere
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/search" className="text-[#94A3B8] hover:text-white font-medium text-sm transition-smooth relative group py-1">
              Find Gigs
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-brand-indigo transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/search" className="text-[#94A3B8] hover:text-white font-medium text-sm transition-smooth relative group py-1">
              Find Talent
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-brand-indigo transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <img
                    className="h-8 w-8 rounded-full object-cover border border-dark-border"
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80'}
                    alt="Profile"
                  />
                  <span className="text-sm font-medium text-slate-200 max-w-[100px] truncate">{user?.name}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-dark-surface border border-dark-border ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                    <div className="px-4 py-2 border-b border-[rgba(255,255,255,0.05)]">
                      <p className="text-xs text-brand-cyan font-medium uppercase tracking-wider">{user?.role}</p>
                      <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                    </div>

                    <Link
                      to={getDashboardLink()}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>

                    {user?.role !== 'admin' && (
                      <Link
                        to={getProfileLink()}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                      >
                        <User className="h-4 w-4" />
                        My Profile
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-500 hover:bg-rose-500/10 transition-colors border-t border-[rgba(255,255,255,0.05)]"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium transition-smooth"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-brand text-white px-4 py-2 rounded-full text-sm font-semibold hover:brightness-110 hover-glow-purple hover:scale-[1.03] active:scale-95 transition-all duration-200"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-500 hover:text-slate-600 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-dark-border bg-dark-surface px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
          >
            Find Gigs
          </Link>
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
          >
            Find Talent
          </Link>

          {isAuthenticated ? (
            <>
              <div className="px-3 py-2 border-b border-[rgba(255,255,255,0.05)]">
                <p className="text-xs text-brand-cyan font-semibold uppercase">{user?.role}</p>
                <p className="text-sm font-bold text-white">{user?.name}</p>
              </div>
              <Link
                to={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-[rgba(255,255,255,0.05)]"
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Link>
              {user?.role !== 'admin' && (
                <Link
                  to={getProfileLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-[rgba(255,255,255,0.05)]"
                >
                  <User className="h-5 w-5" />
                  My Profile
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-rose-500 hover:bg-rose-500/10"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-4 border-t border-[rgba(255,255,255,0.05)] flex flex-col gap-2 px-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-slate-300 font-medium hover:text-white rounded-md bg-[rgba(255,255,255,0.03)]"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 bg-gradient-brand text-white rounded-md font-semibold shadow-md"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
