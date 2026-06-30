import React, { useState } from 'react';
import { X, Send, Award, MessageSquare } from 'lucide-react';
import StarRating from './StarRating';
import api from '../../utils/api';
import Toast from '../Toast';

const WriteReview = ({ isOpen, onClose, gigId, revieweeId, gigTitle, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toastConfig, setToastConfig] = useState(null);

  const availableTags = [
    'Fast Delivery',
    'Highly Skilled',
    'Professional',
    'Communicative',
    'Great Quality',
    'Highly Recommended',
    'Problem Solver',
    'Flexible'
  ];

  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      setToastConfig({ message: 'Please provide a feedback comment.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/reviews', {
        gigId,
        revieweeId,
        rating,
        comment,
        tags: selectedTags
      });

      if (response.data.success) {
        setToastConfig({ message: 'Review submitted successfully!', type: 'success' });
        setTimeout(() => {
          if (onReviewSubmitted) onReviewSubmitted();
          onClose();
        }, 1500);
      }
    } catch (err) {
      setToastConfig({ message: err.response?.data?.message || 'Failed to submit review.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#050508]/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="bg-[#111118] border border-dark-border/80 w-full max-w-lg rounded-3xl p-6 relative z-10 shadow-[0_0_50px_rgba(139,92,246,0.15)] animate-scale-up space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-border/40 pb-4">
          <div className="flex items-center gap-2.5">
            <Award className="h-5 w-5 text-brand-purple" />
            <div>
              <h3 className="text-md font-extrabold text-white">Leave Feedback</h3>
              <p className="text-[#94A3B8] text-xs mt-0.5">Share your experience for: <span className="text-white">{gigTitle}</span></p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl border border-dark-border hover:border-white/20 text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Star Selection */}
          <div className="space-y-2 text-center bg-white/5 border border-dark-border/40 p-4 rounded-2xl">
            <span className="block text-xs font-bold text-[#64748B] uppercase tracking-widest">Rate Your Experience</span>
            <div className="flex justify-center my-1.5">
              <StarRating rating={rating} onChange={setRating} interactive={true} size={32} />
            </div>
            <span className="text-xs text-brand-purple font-extrabold">
              {rating === 5 ? 'Excellent 5/5' : rating === 4 ? 'Very Good 4/5' : rating === 3 ? 'Good 3/5' : rating === 2 ? 'Fair 2/5' : 'Poor 1/5'}
            </span>
          </div>

          {/* Tag Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Highlight Qualities</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-purple/15 border-brand-purple/40 text-brand-purple shadow-md'
                        : 'border-dark-border bg-white/5 text-[#94A3B8] hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback Comment */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Written Review
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What was it like working with them? Be detailed, polite, and constructive."
              rows={4}
              maxLength={2000}
              className="w-full px-4 py-3 rounded-xl border border-dark-border bg-[rgba(255,255,255,0.03)] text-white text-xs placeholder:text-[#475569] focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple transition-smooth resize-none"
            />
            <div className="flex justify-between items-center text-[10px] text-[#64748B] font-bold">
              <span>Min. 10 characters</span>
              <span>{comment.length}/2000</span>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex justify-end gap-3 pt-2 border-t border-dark-border/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-dark-border hover:border-white/20 text-[#94A3B8] hover:text-white font-bold text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-brand text-white font-bold text-xs hover-glow-purple flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
              {!submitting && <Send className="h-3.5 w-3.5" />}
            </button>
          </div>
        </form>
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

export default WriteReview;
