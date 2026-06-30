import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clientProfileSuccess, profileFailure, profileStart } from '../../store/profileSlice';
import { updateUser } from '../../store/authSlice';
import api from '../../utils/api';
import Toast from '../../components/Toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import AvatarUpload from '../../components/AvatarUpload';
import { Building, MapPin, Save, Award, Briefcase, DollarSign } from 'lucide-react';

const ClientProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { clientProfile, loading } = useSelector((state) => state.profile);

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    bio: '',
    location: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [toastConfig, setToastConfig] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (file) => {
    const data = new FormData();
    data.append('avatar', file);

    setIsUploadingAvatar(true);
    try {
      const response = await api.post('/profile/upload-avatar', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        dispatch(updateUser({ avatar: response.data.avatar }));
        setToastConfig({ message: 'Avatar updated successfully!', type: 'success' });
      }
    } catch (err) {
      setToastConfig({ message: err.response?.data?.message || 'Avatar upload failed.', type: 'error' });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      dispatch(profileStart());
      try {
        const response = await api.get(`/profile/client/${user.id}`);
        if (response.data.success) {
          dispatch(clientProfileSuccess(response.data.profile));
          setFormData({
            companyName: response.data.profile.companyName || '',
            bio: response.data.profile.bio || '',
            location: response.data.profile.location || ''
          });
        }
      } catch (err) {
        dispatch(profileFailure(err.response?.data?.message || 'Failed to fetch client profile.'));
      }
    };

    fetchProfile();
  }, [user, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(profileStart());
    try {
      const response = await api.put('/profile/client', formData);
      if (response.data.success) {
        dispatch(clientProfileSuccess(response.data.profile));
        setIsEditing(false);
        setToastConfig({ message: 'Client profile updated successfully!', type: 'success' });
      }
    } catch (err) {
      dispatch(profileFailure(err.response?.data?.message || 'Failed to update profile.'));
      setToastConfig({ message: 'Failed to update profile.', type: 'error' });
    }
  };

  if (loading && !clientProfile) {
    return (
      <div className="h-64 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Overview Card */}
      <div className="bg-dark-surface rounded-3xl border border-dark-border shadow-[0_0_20px_rgba(0,0,0,0.2)] overflow-hidden">
        <div className="h-32 bg-gradient-brand relative" />
        <div className="px-6 pb-6 relative flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
          <AvatarUpload
            currentAvatar={user?.avatar}
            onUpload={handleAvatarUpload}
            isUploading={isUploadingAvatar}
          />
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-white">{clientProfile?.companyName || user?.name || 'Company Name'}</h1>
            <p className="text-xs text-[#94A3B8] font-bold uppercase tracking-wider mb-2">Verified Client Account</p>
            <div className="flex items-center gap-2 text-[#94A3B8] text-xs font-semibold">
              <MapPin className="h-4 w-4" />
              {clientProfile?.location || 'Location not specified'}
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-xs font-bold bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-white rounded-xl transition-smooth cursor-pointer"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Stats and Info */}
        <div className="space-y-6">
          <div className="bg-dark-surface p-6 rounded-3xl border border-dark-border shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            <h2 className="font-bold text-white text-sm mb-4">Platform Stats</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-dark-border pb-3">
                <span className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
                  <Briefcase className="h-4 w-4 text-[#64748B]" />
                  Gigs Posted
                </span>
                <span className="text-sm font-bold text-white">{clientProfile?.totalPosted || 0}</span>
              </div>
              <div className="flex items-center justify-between border-b border-dark-border pb-3">
                <span className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
                  <DollarSign className="h-4 w-4 text-[#64748B]" />
                  Total Spent
                </span>
                <span className="text-sm font-bold text-white">₹{clientProfile?.totalSpent || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
                  <Award className="h-4 w-4 text-[#64748B]" />
                  Average Rating
                </span>
                <span className="text-sm font-bold text-white">
                  {clientProfile?.averageRating ? `${clientProfile.averageRating}/5` : 'No reviews'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Forms/Bio details */}
        <div className="md:col-span-2">
          <div className="bg-dark-surface p-6 rounded-3xl border border-dark-border shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="font-bold text-white text-md border-b border-dark-border pb-4">Edit Company Details</h2>
                
                {/* Company Name */}
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">Company Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3.5 h-4 w-4 text-[#64748B]" />
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="e.g. Acme Corporation"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border bg-[rgba(255,255,255,0.03)] text-white border-dark-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo transition-smooth"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-[#64748B]" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Pune, Maharashtra"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border bg-[rgba(255,255,255,0.03)] text-white border-dark-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo transition-smooth"
                    />
                  </div>
                </div>

                {/* Bio / About */}
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">About / Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe your company, industry, or goals..."
                    className="w-full px-4 py-3 rounded-xl border bg-[rgba(255,255,255,0.03)] text-white border-dark-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo transition-smooth"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 mt-2 bg-gradient-brand text-white rounded-xl font-bold shadow-lg hover-glow-purple hover:scale-[1.01] active:scale-95 transition-all duration-200 text-sm cursor-pointer disabled:opacity-70 disabled:hover:scale-100"
                >
                  {loading ? <LoadingSpinner size="sm" color="white" /> : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <h2 className="font-bold text-white text-md border-b border-dark-border pb-4">Company Overview</h2>
                <div>
                  <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-2">About Us</h3>
                  <p className="text-[#94A3B8] text-sm leading-relaxed whitespace-pre-wrap">
                    {clientProfile?.bio || 'No details provided. Click "Edit Profile" to add company information.'}
                  </p>
                </div>
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

export default ClientProfile;
