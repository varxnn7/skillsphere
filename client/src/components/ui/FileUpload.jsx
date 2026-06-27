import React, { useState } from 'react';
import { UploadCloud, File, Trash2 } from 'lucide-react';

const FileUpload = ({ files, onChange, maxFiles = 3, label = 'Upload Attachments' }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      addFiles(e.target.files);
    }
  };

  const addFiles = (newFiles) => {
    const updated = [...files];
    for (let i = 0; i < newFiles.length; i++) {
      if (updated.length >= maxFiles) break;
      const file = newFiles[i];
      // Generate a mock Cloudinary URL and store file details
      updated.push({
        name: file.name,
        url: `https://res.cloudinary.com/mock_cloud/image/upload/v123456/${encodeURIComponent(file.name)}`
      });
    }
    onChange(updated);
  };

  const removeFile = (idxToRemove) => {
    onChange(files.filter((_, idx) => idx !== idxToRemove));
  };

  return (
    <div className="space-y-4">
      <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wide">{label}</label>

      {/* Upload Drag Box */}
      {files.length < maxFiles ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all relative ${
            dragActive
              ? 'border-brand-indigo bg-brand-indigo/5 text-white'
              : 'border-dark-border bg-[rgba(255,255,255,0.01)] hover:border-dark-border/80 text-[#94A3B8]'
          }`}
        >
          <UploadCloud className="h-10 w-10 mx-auto text-[#64748B] mb-2" />
          <p className="text-sm font-bold text-slate-200">Drag and drop files here</p>
          <p className="text-xs text-[#64748B] mt-1 mb-3">PDF, DOCX, ZIP, or Image (Max {maxFiles} files)</p>
          
          <label className="inline-block bg-dark-surface border border-dark-border hover:border-brand-indigo hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer">
            Browse Files
            <input
              type="file"
              multiple
              onChange={handleChange}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <p className="text-xs text-[#64748B] font-medium">Maximum upload file limit reached ({maxFiles}/{maxFiles}).</p>
      )}

      {/* Uploaded List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl border border-dark-border bg-dark-surface/50 text-slate-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-brand-indigo/15 text-brand-indigo">
                  <File className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold truncate pr-4">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#EF4444] hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
