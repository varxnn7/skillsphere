import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MessageSquare, Award, Star, ThumbsUp, Send } from 'lucide-react';
import StarRating from '../../components/reviews/StarRating';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';
import Toast from '../../components/Toast';

const FreelancerReviews = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [responseText, setResponseText] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastConfig, setToastConfig] = useState(null);

  const fetchProfileAndReviews = async () => {
    setLoading(true);
    try {
      // Get freelancer profile
      const pResponse = await api.get(`/profile/freelancer/${id}`);
      if (pResponse.data.success) {
        setProfile(pResponse.data.profile);
      }

      // Get reviews
      const rResponse = await api.get(`/reviews/freelancer/${id}`);
      if (rResponse.data.success) {
        setReviews(rResponse.data.reviews);
      }
    } catch (err) {
      setToastConfig({ message: 'Failed to load reviews or profile info.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndReviews();
  }, [id]);

  const handleHelpfulClick = async (reviewId) => {
    try {
      const response = await api.put(`/reviews/${reviewId}/helpful`);
      if (response.data.success) {
        setToastConfig({ message: 'Marked review as helpful.', type: 'success' });
        // Increment helpful count locally
        setReviews(reviews.map(r => r._id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendResponse = async (reviewId) => {
    const text = responseText[reviewId];
    if (!text?.trim()) return;

    try {
      const response = await api.put(`/reviews/${reviewId}/response`, { response: text });
      if (response.data.success) {
        setToastConfig({ message: 'Reply posted successfully!', type: 'success' });
        setReviews(reviews.map(r => r._id === reviewId ? { ...r, response: text } : r));
        setActiveReplyId(null);
      }
    } catch (err) {
      setToastConfig({ message: 'Failed to submit response.', type: 'error' });
    }
  };

  // Calculations
  const averageRating = profile?.averageRating || 0;
  const totalReviews = reviews.length;

  const getRatingCount = (stars) => {
    return reviews.filter(r => r.rating === stars).length;
  };

  const filteredReviews = reviews.filter(r => {
    if (ratingFilter === 'all') return true;
    return r.rating === Number(ratingFilter);
  });

  const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => {
    const count = getRatingCount(stars);
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { stars, count, percentage };
  });

  const isOwner = user?.id === id;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col justify-center items-center">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" color="white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col transition-smooth">
      <Navbar />

      <div className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 space-y-8 relative z-10 animate-fade-up">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-border/40 pb-6">
          <div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-brand-purple/15 text-brand-purple border border-brand-purple/30 mb-2">
              ⭐ Ratings & Feedback
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              {isOwner ? 'My Reviews & Client Feedback' : `${profile?.user?.name || 'Freelancer'}'s Reviews`}
            </h1>
            <p className="text-[#94A3B8] text-sm mt-1">Review evaluations submitted by bidded project clients.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Rating Breakdown sidebar */}
          <div className="space-y-6">
            <div className="bg-dark-surface border border-dark-border p-6 rounded-3xl space-y-6 shadow-sm">
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Overall Rating</h2>
              
              <div className="flex items-center gap-4">
                <span className="text-5xl font-extrabold text-white">{Number(averageRating).toFixed(1)}</span>
                <div className="space-y-1">
                  <StarRating rating={averageRating} size={20} />
                  <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">
                    Based on {totalReviews} reviews
                  </span>
                </div>
              </div>

              {/* Bars */}
              <div className="space-y-3.5 pt-4 border-t border-dark-border/40">
                {ratingBreakdown.map((row) => (
                  <div key={row.stars} className="flex items-center gap-3 text-xs font-bold">
                    <span className="w-6 text-slate-300 flex items-center gap-0.5">
                      {row.stars}
                      <Star size={11} className="text-amber-400 fill-amber-400" />
                    </span>
                    <div className="flex-1 h-2 bg-dark-border rounded-lg overflow-hidden relative">
                      <div 
                        className="h-full bg-amber-400 rounded-lg"
                        style={{ width: `${row.percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-[#64748B]">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter buttons */}
            <div className="bg-dark-surface border border-dark-border p-4 rounded-3xl space-y-3">
              <h3 className="text-xs font-extrabold text-[#64748B] uppercase tracking-wide px-2">Filter Reviews</h3>
              <div className="flex flex-col gap-1">
                {['all', '5', '4', '3', '2', '1'].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => setRatingFilter(stars)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold text-left capitalize transition-all cursor-pointer ${
                      ratingFilter === stars
                        ? 'bg-brand-purple/15 text-brand-purple font-extrabold border border-brand-purple/20'
                        : 'border border-transparent text-[#94A3B8] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {stars === 'all' ? 'All Reviews' : `${stars} Stars (${getRatingCount(Number(stars))})`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="md:col-span-2 space-y-6">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-20 bg-dark-surface/40 border border-dark-border rounded-3xl p-8 max-w-md mx-auto space-y-3">
                <MessageSquare className="h-10 w-10 mx-auto text-[#64748B]" />
                <h3 className="text-sm font-bold text-white">No Reviews Yet</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {ratingFilter === 'all'
                    ? 'No client reviews have been left for this profile.'
                    : `No reviews found with rating "${ratingFilter}".`}
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-up">
                {filteredReviews.map((review) => (
                  <div 
                    key={review._id} 
                    className="bg-dark-surface border border-dark-border rounded-3xl p-5 space-y-4 hover:border-[rgba(255,255,255,0.1)] transition-all"
                  >
                    {/* Header: Reviewer info */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={review.reviewer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80'} 
                          alt={review.reviewer?.name}
                          className="h-10 w-10 rounded-full object-cover border border-dark-border/40"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-white">{review.reviewer?.name || 'Client'}</h4>
                          <span className="text-[10px] text-[#64748B] font-bold block uppercase tracking-wider mt-0.5">
                            Project: {review.gig?.title || 'Contract'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#64748B] font-bold">
                        {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Stars + Rating */}
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} size={15} />
                      <span className="text-xs font-bold text-amber-400">{review.rating}/5</span>
                    </div>

                    {/* Content Comment */}
                    <p className="text-xs text-[#E2E8F0] leading-relaxed">{review.comment}</p>

                    {/* Review Quality Tags */}
                    {review.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {review.tags.map((tag) => (
                          <span 
                            key={tag}
                            className="inline-flex px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wide bg-brand-purple/10 border border-brand-purple/20 text-brand-purple"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Response reply block */}
                    {review.response ? (
                      <div className="p-4 rounded-2xl bg-white/5 border border-dark-border/40 text-xs space-y-1.5">
                        <p className="font-extrabold text-brand-purple uppercase tracking-wider text-[10px]">Response reply:</p>
                        <p className="text-slate-300 leading-relaxed">{review.response}</p>
                      </div>
                    ) : (
                      isOwner && activeReplyId !== review._id && (
                        <button
                          onClick={() => setActiveReplyId(review._id)}
                          className="text-xs font-bold text-brand-purple hover:underline cursor-pointer"
                        >
                          Respond to review
                        </button>
                      )
                    )}

                    {/* Reply Input Box */}
                    {activeReplyId === review._id && (
                      <div className="space-y-3 pt-2 border-t border-dark-border/30">
                        <textarea
                          placeholder="Write a constructive response reply..."
                          rows={2}
                          value={responseText[review._id] || ''}
                          onChange={(e) => setResponseText({ ...responseText, [review._id]: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-dark-border bg-[rgba(255,255,255,0.02)] text-white text-xs placeholder:text-[#475569] focus:outline-none focus:ring-1 focus:ring-brand-purple/30 focus:border-brand-purple transition-smooth resize-none"
                        />
                        <div className="flex justify-end gap-2.5">
                          <button
                            onClick={() => setActiveReplyId(null)}
                            className="px-3.5 py-1.5 rounded-lg border border-dark-border text-[#94A3B8] hover:text-white font-bold text-[10px] cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSendResponse(review._id)}
                            className="px-4 py-1.5 rounded-lg bg-gradient-brand text-white font-bold text-[10px] hover-glow-purple flex items-center gap-1 cursor-pointer"
                          >
                            Post Reply
                            <Send className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Actions: Helpful count */}
                    <div className="flex items-center gap-4 pt-2 border-t border-dark-border/20">
                      <button
                        onClick={() => handleHelpfulClick(review._id)}
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#64748B] hover:text-white transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        Helpful ({review.helpfulCount || 0})
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {toastConfig && (
        <Toast
          message={toastConfig.message}
          type={toastConfig.type}
          onClose={() => setToastConfig(null)}
        />
      )}
    </div>
  );
};

export default FreelancerReviews;
