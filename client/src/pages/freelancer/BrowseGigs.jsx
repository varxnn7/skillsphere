import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search as SearchIcon, SlidersHorizontal } from 'lucide-react';
import api from '../../utils/api';
import { gigsStart, gigsSuccess, gigsFailure } from '../../store/gigsSlice';
import GigCard from '../../components/gigs/GigCard';
import GigFilters from '../../components/gigs/GigFilters';
import Pagination from '../../components/ui/Pagination';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';

const BrowseGigs = () => {
  const dispatch = useDispatch();
  const { gigs, pagination, loading } = useSelector((state) => state.gigs);

  // Filter & Search Params States
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    experienceLevel: '',
    isRemote: '',
    budgetMin: 500,
    budgetMax: 100000,
    sort: 'newest',
    page: 1
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Debounced search helper: 300ms
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setFilters(prev => ({ ...prev, page: 1 })); // reset page on search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchGigs = useCallback(async () => {
    dispatch(gigsStart());
    try {
      // Build query string matching URL query param guidelines
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (filters.category) params.append('category', filters.category);
      if (filters.experienceLevel) params.append('experienceLevel', filters.experienceLevel);
      if (filters.isRemote) params.append('isRemote', filters.isRemote);
      if (filters.budgetMin) params.append('budgetMin', filters.budgetMin);
      if (filters.budgetMax) params.append('budgetMax', filters.budgetMax);
      if (filters.sort) params.append('sort', filters.sort);
      params.append('page', filters.page);
      params.append('limit', 6);

      const response = await api.get(`/gigs?${params.toString()}`);
      if (response.data.success) {
        dispatch(gigsSuccess({
          gigs: response.data.gigs,
          pagination: response.data.pagination
        }));
      }
    } catch (err) {
      dispatch(gigsFailure(err.response?.data?.message || 'Failed to fetch gigs.'));
    }
  }, [filters, debouncedSearch, dispatch]);

  useEffect(() => {
    fetchGigs();
  }, [fetchGigs]);

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
      sort: 'newest',
      page: 1
    });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col transition-smooth">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6 relative z-10 animate-fade-up">
        {/* Top Header Banner search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Gig Marketplace</h1>
            <p className="text-[#94A3B8] text-sm mt-1">Browse approved job postings and bid on matching projects</p>
          </div>

          {/* Search bar inputs */}
          <div className="relative flex-1 max-w-md w-full">
            <SearchIcon className="absolute left-4 top-3.5 h-4.5 w-4.5 text-[#64748B]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keywords (e.g. React Developer)..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-dark-border bg-dark-surface/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo transition-smooth"
            />
          </div>
        </div>

        {/* Sorting and Mobile toggle bar */}
        <div className="flex items-center justify-between border-b border-dark-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#64748B]">Showing approved postings</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort options */}
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
              className="px-3 py-1.5 rounded-lg border border-dark-border bg-dark-surface text-xs font-bold text-slate-300 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="budget">Highest Budget</option>
              <option value="proposals">Popularity (Bids)</option>
            </select>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden p-2 bg-dark-surface border border-dark-border rounded-xl text-[#94A3B8] hover:text-white"
            >
              <SlidersHorizontal className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Main Columns layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar filters (Desktop view) */}
          <div className="hidden md:block md:col-span-1">
            <GigFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
            />
          </div>

          {/* Mobile Bottom Sheets / Filter drawer */}
          {showMobileFilters && (
            <div className="md:hidden col-span-1 border-t border-dark-border pt-4">
              <GigFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
              />
            </div>
          )}

          {/* Listings Marketplace */}
          <div className="col-span-1 md:col-span-3 space-y-6">
            {loading ? (
              /* Skeleton Loader Cards Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {[1, 2, 4].map(idx => (
                  <div key={idx} className="bg-dark-surface border border-dark-border rounded-2xl p-6 h-64 animate-pulse space-y-4">
                    <div className="h-4 bg-dark-border rounded-lg w-1/3" />
                    <div className="h-6 bg-dark-border rounded-lg w-3/4" />
                    <div className="h-16 bg-dark-border rounded-lg w-full" />
                    <div className="flex justify-between items-center pt-4 border-t border-dark-border/40">
                      <div className="h-8 bg-dark-border rounded-lg w-1/4" />
                      <div className="h-8 bg-dark-border rounded-lg w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : gigs.length === 0 ? (
              <div className="text-center py-24 bg-dark-surface/20 border border-dark-border rounded-3xl p-8 max-w-md mx-auto space-y-4">
                <SearchIcon className="h-12 w-12 mx-auto text-[#64748B]" />
                <h3 className="text-md font-bold text-white">No Matching Gigs Found</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Try adjusting your search criteria, widening the budget range, or resetting filters.
                </p>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-brand-indigo rounded-xl text-xs font-bold hover-glow-purple cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                  {gigs.map((gig) => (
                    <GigCard key={gig._id} gig={gig} />
                  ))}
                </div>

                {/* Pagination components */}
                {pagination && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseGigs;
