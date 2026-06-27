import React, { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';

const AvatarUpload = ({ currentAvatar, onUpload, isUploading = false }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit 2MB for avatar)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      
      if (onUpload) {
        onUpload(file);
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const avatarSrc = previewUrl || currentAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';

  return (
    <div className="relative group w-24 h-24 rounded-full overflow-hidden shadow-md border-2 border-white bg-slate-100 flex items-center justify-center">
      <img
        src={avatarSrc}
        alt="Avatar"
        className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-75"
      />
      
      {isUploading ? (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-white animate-spin" />
        </div>
      ) : (
        <button
          type="button"
          onClick={triggerFileSelect}
          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white cursor-pointer"
        >
          <Camera className="h-6 w-6" />
        </button>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/jpg"
        className="hidden"
      />
    </div>
  );
};

export default AvatarUpload;
