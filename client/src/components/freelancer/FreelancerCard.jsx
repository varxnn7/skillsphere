import React from 'react';
import { MapPin, Star, ShieldCheck, Mail } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

const FreelancerCard = ({ profile }) => {
  const user = profile.user || {};
  const initials = user.name ? user.name.substring(0, 2) : 'FL';

  return (
    <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 hover:border-[rgba(255,255,255,0.06)] hover:shadow-2xl transition-all duration-300 relative group flex flex-col justify-between">
      <div>
        {/* Header Profile Section */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-xl object-cover border border-dark-border"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-brand-indigo/10 border border-brand-indigo/20 flex items-center justify-center font-bold text-brand-indigo text-lg uppercase">
                {initials}
              </div>
            )}
            <div>
              <h3 className="font-extrabold text-white text-md flex items-center gap-1.5">
                {user.name || 'Anonymous User'}
                {profile.isVerified && <ShieldCheck className="h-4 w-4 text-[#10B981]" />}
              </h3>
              <p className="text-[#94A3B8] text-xs font-semibold">{profile.title || 'Freelancer Partner'}</p>
            </div>
          </div>

          <StatusBadge status={profile.availabilityStatus || 'Available'} />
        </div>

        {/* Info stats: Hourly rate, location, rating */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[#94A3B8] text-xs font-semibold mb-4">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            {profile.averageRating ? `${profile.averageRating} (${profile.totalReviews || 0} reviews)` : 'No ratings'}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {profile.location || 'Remote'}
          </span>
        </div>

        {/* Bio Snippet */}
        {profile.bio && (
          <p className="text-xs text-[#94A3B8] leading-relaxed mb-5 line-clamp-2">
            {profile.bio}
          </p>
        )}

        {/* Skills Tag Cloud */}
        {profile.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {profile.skills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-[rgba(255,255,255,0.03)] border border-dark-border text-slate-300"
              >
                {skill.name}
              </span>
            ))}
            {profile.skills.length > 4 && (
              <span className="text-[10px] font-bold px-2 py-1 text-[#64748B]">+{profile.skills.length - 4} more</span>
            )}
          </div>
        )}
      </div>

      {/* Footer stats: Hourly Rate + Action Button */}
      <div className="border-t border-dark-border/60 pt-4 flex items-center justify-between">
        <div>
          <span className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Hourly Rate</span>
          <span className="text-sm font-extrabold text-white">
            ₹{profile.hourlyRate ? profile.hourlyRate.toLocaleString() : '0'}/hr
          </span>
        </div>

        <a
          href={`mailto:${user.email}`}
          className="inline-flex items-center gap-1.5 bg-gradient-brand text-white px-4 py-2 rounded-xl font-bold hover-glow-purple text-xs cursor-pointer"
        >
          <Mail className="h-3.5 w-3.5" />
          Hire Freelancer
        </a>
      </div>
    </div>
  );
};

export default FreelancerCard;
