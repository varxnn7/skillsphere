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
          className="flex-1 input-clean"
        />
        <button
          type="button"
          onClick={addTag}
          className="px-4 py-3 rounded-xl bg-white border border-surface-border hover:border-orange-400 hover:text-orange-600 text-slate-400 transition-all flex items-center justify-center cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-surface-subtle border border-surface-border">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-50 border border-orange-200 text-orange-700"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(idx)}
                className="hover:text-orange-900 transition-colors"
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
