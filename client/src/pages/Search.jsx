import React, { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, Users, Briefcase, SlidersHorizontal, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import GigCard from '../components/gigs/GigCard';
import FreelancerCard from '../components/freelancer/FreelancerCard';
import GigFilters from '../components/gigs/GigFilters';
import Pagination from '../components/ui/Pagination';

const SearchPage = () => {
  const [activeTab, setActiveTab] = useState('gigs'); // 'gigs' or 'freelancers'
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState({ categories: [], skills: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);

  // States for search returns
  const [gigResults, setGigResults] = useState([]);
  const [freelancerResults, setFreelancerResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  // Unified Filter States
  const [filters, setFilters] = useState({
    category: '',
    experienceLevel: '',
    isRemote: '',
    budgetMin: 500,
    budgetMax: 100000,
    minRate: 0,
    maxRate: 5000,
    rating: 0,
    isAvailable: '',
    location: '',
    sort: 'newest',
    page: 1
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Debounced lookup
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setFilters(prev => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load suggestions
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const response = await api.get('/search/suggestions');
        if (response.data.success) {
          setSuggestions({
            categories: response.data.categories,
            skills: response.data.skills
          });
        }
      } catch (err) {
        console.error('Failed to load suggestions:', err);
      }
    };
    loadSuggestions();
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) {
        // If query is in categories or skills suggestions, assign proper filter
        params.append('search', debouncedSearch);
      }
      params.append('page', filters.page);
      params.append('limit', 6);

      if (activeTab === 'gigs') {
        if (filters.category) params.append('category', filters.category);
        if (filters.experienceLevel) params.append('experienceLevel', filters.experienceLevel);
        if (filters.isRemote) params.append('isRemote', filters.isRemote);
        if (filters.budgetMin) params.append('budgetMin', filters.budgetMin);
        if (filters.budgetMax) params.append('budgetMax', filters.budgetMax);
        if (filters.sort) params.append('sort', filters.sort);

        const res = await api.get(`/search/gigs?${params.toString()}`);
        if (res.data.success) {
          setGigResults(res.data.gigs);
          setPagination(res.data.pagination);
        }
      } else {
        if (filters.minRate) params.append('minRate', filters.minRate);
        if (filters.maxRate) params.append('maxRate', filters.maxRate);
        if (filters.rating) params.append('rating', filters.rating);
        if (filters.isAvailable) params.append('isAvailable', filters.isAvailable);
        if (filters.location) params.append('location', filters.location);
        if (filters.sort) params.append('sort', filters.sort);

        const res = await api.get(`/search/freelancers?${params.toString()}`);
        if (res.data.success) {
          setFreelancerResults(res.data.freelancers);
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Search failure:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch, filters]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleReset = () => {
    setSearchTerm('');
    setFilters({
      category: '',
      experienceLevel: '',
      isRemote: '',
      budgetMin: 500,
      budgetMax: 100000,
      minRate: 0,
      maxRate: 5000,
      rating: 0,
      isAvailable: '',
      location: '',
      sort: 'newest',
      page: 1
    });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectSuggestion = (val) => {
    setSearchTerm(val);
    setShowSuggestions(false);
  };

  // Filter lists based on input
  const filteredSkills = suggestions.skills.filter(s =>
    s.toLowerCase().includes(searchTerm.toLowerCase()) && searchTerm.trim() !== ''
  ).slice(0, 5);

  const filteredCategories = suggestions.categories.filter(c =>
    c.toLowerCase().includes(searchTerm.toLowerCase()) && searchTerm.trim() !== ''
  ).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col transition-smooth">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6 relative z-10 animate-fade-up">
        {/* Toggle tabs */}
        <div className="flex justify-center">
          <div className="flex gap-2 p-1 bg-dark-surface/50 border border-dark-border rounded-2xl">
            <button
              onClick={() => {
                setActiveTab('gigs');
                handleReset();
              }}
              className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'gigs' ? 'bg-gradient-brand text-white shadow-lg' : 'text-[#94A3B8] hover:text-white'
              } cursor-pointer`}
            >
              <Briefcase className="h-4.5 w-4.5" />
              Find Gigs
            </button>
            <button
              onClick={() => {
                setActiveTab('freelancers');
                handleReset();
              }}
              className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'freelancers' ? 'bg-gradient-brand text-white shadow-lg' : 'text-[#94A3B8] hover:text-white'
              } cursor-pointer`}
            >
              <Users className="h-4.5 w-4.5" />
              Find Freelancers
            </button>
          </div>
        </div>

        {/* Unified Search Input & Autocomplete suggestions */}
        <div className="relative max-w-2xl mx-auto w-full">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-3.5 h-5 w-5 text-[#64748B]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder={
                activeTab === 'gigs'
                  ? 'Search gigs by title, skills, keywords...'
                  : 'Search freelancers by skills, category...'
              }
              className="w-full pl-12 pr-4 py-4.5 rounded-2xl border border-dark-border bg-dark-surface/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/40 focus:border-brand-indigo transition-smooth shadow-lg"
            />
          </div>

          {/* Autocomplete suggestions box */}
          {showSuggestions && (filteredSkills.length > 0 || filteredCategories.length > 0) && (
            <div className="absolute top-16 left-0 w-full bg-dark-surface border border-dark-border rounded-2xl p-4 shadow-2xl z-20 space-y-3">
              {filteredCategories.length > 0 && (
                <div>
                  <span className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Categories Matches</span>
                  <div className="flex flex-col gap-1.5">
                    {filteredCategories.map((cat, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectSuggestion(cat)}
                        className="w-full text-left text-xs font-bold text-slate-300 hover:text-white flex items-center justify-between hover:bg-white/5 p-2 rounded-lg cursor-pointer"
                      >
                        <span>{cat}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-[#64748B]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredSkills.length > 0 && (
                <div>
                  <span className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Skills Matches</span>
                  <div className="flex flex-wrap gap-2">
                    {filteredSkills.map((skill, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectSuggestion(skill)}
                        className="px-3 py-1.5 bg-brand-indigo/15 text-brand-indigo border border-brand-indigo/35 text-xs font-bold rounded-xl hover:bg-brand-indigo hover:text-white transition-all cursor-pointer"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sorting options & Mobile display Filters triggers */}
        <div className="flex items-center justify-between border-b border-dark-border/60 pb-3">
          <span className="text-xs font-bold text-[#64748B]">
            Unified query engine: {activeTab === 'gigs' ? 'Gigs Listings' : 'Freelancer Accounts'}
          </span>

          <div className="flex items-center gap-3">
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
              className="px-3 py-1.5 rounded-lg border border-dark-border bg-dark-surface text-xs font-bold text-slate-300 focus:outline-none"
            >
              {activeTab === 'gigs' ? (
                <>
                  <option value="newest">Newest Gigs</option>
                  <option value="budget">Highest Budget</option>
                  <option value="proposals">Popularity (Bids)</option>
                </>
              ) : (
                <>
                  <option value="rating">Top Rated Freelancers</option>
                  <option value="rate">Lowest Hourly Rate</option>
                  <option value="reviews">Total Reviews count</option>
                </>
              )}
            </select>

            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden p-2 bg-dark-surface border border-dark-border rounded-xl text-[#94A3B8] hover:text-white"
            >
              <SlidersHorizontal className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Results with Left filter column */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar filters */}
          <div className="hidden md:block col-span-1">
            {activeTab === 'gigs' ? (
              <GigFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
              />
            ) : (
              /* Freelancer sidebar filters */
              <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-dark-border/60 pb-3">
                  <span className="text-xs font-extrabold text-white">Freelancer Filters</span>
                  <button onClick={handleReset} className="text-xs font-bold text-brand-indigo hover:text-white">Reset</button>
                </div>

                {/* Rates min/max */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wide">Hourly Rate (₹)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minRate}
                      onChange={(e) => setFilters({ ...filters, minRate: e.target.value })}
                      className="px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-surface text-white"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxRate}
                      onChange={(e) => setFilters({ ...filters, maxRate: e.target.value })}
                      className="px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-surface text-white"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wide">Location</h4>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-surface text-white"
                  />
                </div>

                {/* Minimum Star Rating */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wide">Minimum Rating</h4>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-surface text-white"
                  >
                    <option value="0">Any Star</option>
                    <option value="4">4.0 Stars & Above</option>
                    <option value="4.5">4.5 Stars & Above</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Results grid */}
          <div className="col-span-1 md:col-span-3 space-y-6">
            {loading ? (
              <div className="py-20 flex justify-center items-center">
                <LoadingSpinner size="lg" color="white" />
              </div>
            ) : activeTab === 'gigs' ? (
              /* Gigs results layout */
              gigResults.length === 0 ? (
                <div className="text-center py-20 bg-dark-surface/20 border border-dark-border rounded-3xl p-8 max-w-md mx-auto space-y-3">
                  <Briefcase className="h-10 w-10 mx-auto text-[#64748B]" />
                  <h3 className="text-sm font-bold text-white">No Gigs Found</h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">No matching gig results. Adjust parameters.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {gigResults.map((gig) => (
                      <GigCard key={gig._id} gig={gig} />
                    ))}
                  </div>
                  {pagination && (
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              )
            ) : (
              /* Freelancer results layout */
              freelancerResults.length === 0 ? (
                <div className="text-center py-20 bg-dark-surface/20 border border-dark-border rounded-3xl p-8 max-w-md mx-auto space-y-3">
                  <Users className="h-10 w-10 mx-auto text-[#64748B]" />
                  <h3 className="text-sm font-bold text-white">No Freelancers Found</h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">No matching partner results. Try widening filters.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {freelancerResults.map((profile) => (
                      <FreelancerCard key={profile._id} profile={profile} />
                    ))}
                  </div>
                  {pagination && (
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
