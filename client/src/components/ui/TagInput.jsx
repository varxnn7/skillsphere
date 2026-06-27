import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

const TagInput = ({ tags, onChange, placeholder = 'Add skills (e.g. React, Python)' }) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const cleaned = input.trim().replace(/,/g, '');
    if (cleaned && !tags.some(t => t.toLowerCase() === cleaned.toLowerCase())) {
      onChange([...tags, cleaned]);
      setInput('');
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 rounded-xl border border-dark-border bg-[rgba(255,255,255,0.03)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo transition-smooth"
        />
        <button
          type="button"
          onClick={addTag}
          className="px-4 py-3 rounded-xl bg-dark-surface border border-dark-border hover:border-brand-indigo hover:text-white text-[#94A3B8] transition-smooth flex items-center justify-center cursor-pointer"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-[rgba(255,255,255,0.01)] border border-dark-border/40">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-indigo/10 border border-brand-indigo/25 text-brand-indigo"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(idx)}
                className="hover:text-white transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;
