import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search as SearchIcon, SlidersHorizontal } from 'lucide-react';
import api from '../../utils/api';
import { gigsStart, gigsSuccess, gigsFailure } from '../../store/gigsSlice';
import GigCard from '../../components/gigs/GigCard';
import GigFilters from '../../components/gigs/GigFilters';
import Pagination from '../../components/ui/Pagination';

import LoadingSpinner from '../../components/LoadingSpinner';

const BrowseGigs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { gigs, pagination, loading } = useSelector((state) => state.gigs);

  // Parse state from URL
  const getParams = useCallback(() => {
    const params = new URLSearchParams(location.search);
    return {
      search: params.get('search') || '',
      category: params.get('category') || '',
      experienceLevel: params.get('experienceLevel') || '',
      isRemote: params.get('isRemote') || '',
      budgetMin: params.get('budgetMin') ? Number(params.get('budgetMin')) : 500,
      budgetMax: params.get('budgetMax') ? Number(params.get('budgetMax')) : 100000,
      sort: params.get('sort') || 'newest',
      page: params.get('page') ? Number(params.get('page')) : 1
    };
  }, [location.search]);

  const currentParams = getParams();

  // Local state for search bar (immediate feedback)
  const [searchTerm, setSearchTerm] = useState(currentParams.search);

  // Sync state search term with URL search term if it changes (e.g. on reset or URL paste)
  useEffect(() => {
    setSearchTerm(currentParams.search);
  }, [currentParams.search]);

  // Debounced URL updates for typing in search bar
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(location.search);
      if (searchTerm) {
        params.set('search', searchTerm);
      } else {
        params.delete('search');
      }
      params.set('page', '1'); // reset page on search
      navigate({ search: params.toString() }, { replace: true });
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, navigate]);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchGigs = useCallback(async () => {
    dispatch(gigsStart());
    try {
      const params = new URLSearchParams(location.search);
      if (!params.has('page')) params.set('page', '1');
      if (!params.has('limit')) params.set('limit', '6');

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
  }, [location.search, dispatch]);

  useEffect(() => {
    fetchGigs();
  }, [fetchGigs]);

  const handleFilterChange = (newFilters) => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.experienceLevel) params.set('experienceLevel', newFilters.experienceLevel);
    if (newFilters.isRemote) params.set('isRemote', newFilters.isRemote);
    if (newFilters.budgetMin && newFilters.budgetMin !== 500) params.set('budgetMin', newFilters.budgetMin);
    if (newFilters.budgetMax && newFilters.budgetMax !== 100000) params.set('budgetMax', newFilters.budgetMax);
    if (newFilters.sort) params.set('sort', newFilters.sort);
    params.set('page', newFilters.page || '1');

    navigate({ search: params.toString() });
  };

  const handleReset = () => {
    setSearchTerm('');
    navigate({ search: '' });
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(location.search);
    params.set('page', page);
    navigate({ search: params.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col transition-smooth">
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
              value={currentParams.sort}
              onChange={(e) => {
                const params = new URLSearchParams(location.search);
                params.set('sort', e.target.value);
                params.set('page', '1');
                navigate({ search: params.toString() });
              }}
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
              filters={currentParams}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
            />
          </div>

          {/* Mobile Bottom Sheets / Filter drawer */}
          {showMobileFilters && (
            <div className="md:hidden col-span-1 border-t border-dark-border pt-4">
              <GigFilters
                filters={currentParams}
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
                {[1, 2, 3, 4, 5, 6].map(idx => (
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
