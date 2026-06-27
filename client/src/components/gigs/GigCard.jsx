import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { MapPin, Calendar, Users, Eye, Bookmark, BookmarkCheck } from 'lucide-react';
import { addBookmark, removeBookmark } from '../../store/gigsSlice';
import StatusBadge from '../ui/StatusBadge';

const GigCard = ({ gig, isClientView = false }) => {
  const dispatch = useDispatch();
  const { bookmarkedGigs } = useSelector((state) => state.gigs);
  const isBookmarked = bookmarkedGigs.some((g) => g._id === gig._id);

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBookmarked) {
      dispatch(removeBookmark(gig._id));
    } else {
      dispatch(addBookmark(gig));
    }
  };

  return (
    <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 hover:border-[rgba(255,255,255,0.08)] hover:shadow-2xl transition-all duration-300 relative group flex flex-col justify-between">
      <div>
        {/* Header: Title, Category, Bookmark */}
        <div className="flex justify-between items-start gap-4 mb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#64748B] block mb-1">
              {gig.category} {gig.subCategory ? `· ${gig.subCategory}` : ''}
            </span>
            <h3 className="font-extrabold text-white text-lg group-hover:text-brand-indigo transition-colors leading-snug">
              {isClientView ? (
                <Link to={`/client/gigs/${gig._id}/proposals`}>{gig.title}</Link>
              ) : (
                <Link to={`/gigs/${gig._id}`}>{gig.title}</Link>
              )}
            </h3>
          </div>

          {!isClientView && (
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-xl border transition-all ${
                isBookmarked
                  ? 'bg-brand-indigo/15 text-brand-indigo border-brand-indigo/35'
                  : 'bg-white/5 border-dark-border text-[#64748B] hover:text-white hover:border-brand-indigo/50'
              } cursor-pointer`}
            >
              {isBookmarked ? <BookmarkCheck className="h-4.5 w-4.5" /> : <Bookmark className="h-4.5 w-4.5" />}
            </button>
          )}
        </div>

        {/* Client details & remote status */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[#94A3B8] text-xs font-semibold mb-4">
          {gig.client?.name && (
            <span className="flex items-center gap-1.5">
              <span className="w-4.5 h-4.5 rounded-full bg-brand-indigo/10 border border-brand-indigo/20 flex items-center justify-center text-[9px] font-bold text-brand-indigo uppercase">
                {gig.client.name.substring(0, 2)}
              </span>
              {gig.client.name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {gig.isRemote ? 'Remote' : gig.location || 'Hybrid'}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {gig.duration}
          </span>
        </div>

        {/* Description Snippet */}
        <p className="text-xs text-[#94A3B8] leading-relaxed mb-5 line-clamp-2">
          {gig.description}
        </p>

        {/* Skill tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {gig.skills?.slice(0, 4).map((skill, idx) => (
            <span
              key={idx}
              className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-[rgba(255,255,255,0.03)] border border-dark-border text-slate-300"
            >
              {skill}
            </span>
          ))}
          {gig.skills?.length > 4 && (
            <span className="text-[10px] font-bold px-2 py-1 text-[#64748B]">+{gig.skills.length - 4} more</span>
          )}
        </div>
      </div>

      {/* Footer statistics & budget */}
      <div className="border-t border-dark-border/60 pt-4 flex items-center justify-between">
        {/* Budget info */}
        <div>
          <span className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Budget</span>
          <span className="text-sm font-extrabold text-white">
            ₹{gig.budgetMin?.toLocaleString()} - ₹{gig.budgetMax?.toLocaleString()}
            <span className="text-[10px] font-normal text-[#64748B] ml-1">
              /{gig.budgetType === 'hourly' ? 'hr' : 'fixed'}
            </span>
          </span>
        </div>

        {/* Stats view counts */}
        <div className="flex items-center gap-3">
          <StatusBadge status={gig.status} />

          <div className="flex items-center gap-3 text-[11px] font-bold text-[#64748B]">
            <span className="flex items-center gap-1" title="Proposals counts">
              <Users className="h-3.5 w-3.5" />
              {gig.proposals || 0}
            </span>
            <span className="flex items-center gap-1" title="Views counts">
              <Eye className="h-3.5 w-3.5" />
              {gig.views || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigCard;
