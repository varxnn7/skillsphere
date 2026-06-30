import React from 'react';
import { Star, StarHalf } from 'lucide-react';

const StarRating = ({ rating = 0, onChange, interactive = false, size = 18 }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;

  const handleClick = (value) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  for (let i = 1; i <= 5; i++) {
    if (interactive) {
      // Interactive Mode
      const isSelected = i <= rating;
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleClick(i)}
          className="focus:outline-none transition-transform hover:scale-110 active:scale-95 cursor-pointer"
        >
          <Star
            size={size}
            className={`transition-colors ${
              isSelected ? 'text-amber-400 fill-amber-400' : 'text-slate-600 hover:text-amber-300'
            }`}
          />
        </button>
      );
    } else {
      // Display Mode
      if (i <= fullStars) {
        stars.push(
          <Star key={i} size={size} className="text-amber-400 fill-amber-400" />
        );
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(
          <div key={i} className="relative inline-block">
            <Star size={size} className="text-slate-600" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <Star size={size} className="text-amber-400 fill-amber-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} size={size} className="text-slate-600" />
        );
      }
    }
  }

  return <div className="flex items-center gap-1">{stars}</div>;
};

export default StarRating;
