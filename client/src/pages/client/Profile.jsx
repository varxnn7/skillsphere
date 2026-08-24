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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl border border-surface-border shadow-card overflow-hidden">
        {/* Cover Banner */}
        <div className="h-36 bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Profile Content Bar */}
        <div className="px-6 md:px-8 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="p-1 bg-white rounded-full shadow-md inline-block">
                <AvatarUpload
                  currentAvatar={user?.avatar}
                  onUpload={handleAvatarUpload}
                  isUploading={isUploadingAvatar}
                />
              </div>
              <div className="pt-2 sm:pt-0 sm:pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
                    {clientProfile?.companyName || user?.name || 'Company Name'}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200">
                    <Award className="h-3 w-3 text-blue-600" />
                    Verified Client
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mt-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {clientProfile?.location || 'Location not specified'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2.5 text-xs font-bold bg-white hover:bg-surface-subtle border border-surface-border hover:border-orange-200 text-slate-800 rounded-xl transition-all shadow-sm cursor-pointer self-start sm:self-auto"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Stats and Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            <h2 className="font-bold text-slate-900 text-sm mb-4">Platform Stats</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-surface-border pb-3">
                <span className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Briefcase className="h-4 w-4 text-slate-500" />
                  Gigs Posted
                </span>
                <span className="text-sm font-bold text-slate-900">{clientProfile?.totalPosted || 0}</span>
              </div>
              <div className="flex items-center justify-between border-b border-surface-border pb-3">
                <span className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <DollarSign className="h-4 w-4 text-slate-500" />
                  Total Spent
                </span>
                <span className="text-sm font-bold text-slate-900">₹{clientProfile?.totalSpent || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Award className="h-4 w-4 text-slate-500" />
                  Average Rating
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {clientProfile?.averageRating ? `${clientProfile.averageRating}/5` : 'No reviews'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Forms/Bio details */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="font-bold text-slate-900 text-md border-b border-surface-border pb-4">Edit Company Details</h2>
                
                {/* Company Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Company Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="e.g. Acme Corporation"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border bg-surface-subtle text-slate-900 border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600 transition-smooth"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Pune, Maharashtra"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border bg-surface-subtle text-slate-900 border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600 transition-smooth"
                    />
                  </div>
                </div>

                {/* Bio / About */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">About / Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe your company, industry, or goals..."
                    className="w-full px-4 py-3 rounded-xl border bg-surface-subtle text-slate-900 border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600 transition-smooth"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 mt-2 bg-gradient-orange text-slate-900 rounded-xl font-bold shadow-lg hover-glow-orange hover:scale-[1.01] active:scale-95 transition-all duration-200 text-sm cursor-pointer disabled:opacity-70 disabled:hover:scale-100"
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
                <h2 className="font-bold text-slate-900 text-md border-b border-surface-border pb-4">Company Overview</h2>
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">About Us</h3>
                  <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-wrap">
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
