import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { freelancerProfileSuccess, profileFailure, profileStart } from '../../store/profileSlice';
import { updateUser } from '../../store/authSlice';
import api from '../../utils/api';
import Toast from '../../components/Toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import SkillBadge from '../../components/SkillBadge';
import AvatarUpload from '../../components/AvatarUpload';
import {
  User,
  MapPin,
  DollarSign,
  Plus,
  Briefcase,
  Trash2,
  FileText,
  Save,
  Award,
  Link as LinkIcon,
  CheckCircle,
  Clock
} from 'lucide-react';

const FreelancerProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { freelancerProfile, loading } = useSelector((state) => state.profile);

  // Form States
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    bio: '',
    hourlyRate: 0,
    location: '',
    availabilityStatus: 'Available'
  });
  
  // Skills list state
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'Intermediate' });

  // Experience timeline state
  const [experience, setExperience] = useState([]);
  const [newExp, setNewExp] = useState({
    company: '',
    role: '',
    from: '',
    to: '',
    description: ''
  });

  // Portfolio addition state
  const [portfolioData, setPortfolioData] = useState({
    title: '',
    description: '',
    link: ''
  });
  const [portfolioImage, setPortfolioImage] = useState(null);
  
  const [toastConfig, setToastConfig] = useState(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isAddingPortfolio, setIsAddingPortfolio] = useState(false);
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
        const response = await api.get(`/profile/freelancer/${user.id}`);
        if (response.data.success) {
          const profile = response.data.profile;
          dispatch(freelancerProfileSuccess(profile));
          setFormData({
            title: profile.title || '',
            bio: profile.bio || '',
            hourlyRate: profile.hourlyRate || 0,
            location: profile.location || '',
            availabilityStatus: profile.availabilityStatus || 'Available'
          });
          setSkills(profile.skills || []);
          setExperience(profile.workExperience || []);
        }
      } catch (err) {
        dispatch(profileFailure(err.response?.data?.message || 'Failed to load profile.'));
      }
    };

    fetchProfile();
  }, [user, dispatch]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Add a skill
  const handleAddSkill = () => {
    if (!newSkill.name.trim()) return;
    if (skills.some(s => s.name.toLowerCase() === newSkill.name.toLowerCase())) {
      setToastConfig({ message: 'Skill already exists!', type: 'error' });
      return;
    }
    setSkills([...skills, newSkill]);
    setNewSkill({ name: '', level: 'Intermediate' });
  };

  // Remove a skill
  const handleRemoveSkill = (name) => {
    setSkills(skills.filter(s => s.name !== name));
  };

  // Add work experience item
  const handleAddExperience = () => {
    if (!newExp.company.trim() || !newExp.role.trim() || !newExp.from) {
      setToastConfig({ message: 'Please enter company, role and starting date.', type: 'error' });
      return;
    }
    setExperience([...experience, newExp]);
    setNewExp({ company: '', role: '', from: '', to: '', description: '' });
  };

  // Remove experience item
  const handleRemoveExperience = (idx) => {
    setExperience(experience.filter((_, i) => i !== idx));
  };

  // Submit profile edits
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    dispatch(profileStart());
    try {
      const response = await api.put('/profile/freelancer', {
        ...formData,
        skills,
        workExperience: experience
      });

      if (response.data.success) {
        dispatch(freelancerProfileSuccess(response.data.profile));
        setIsEditing(false);
        setToastConfig({ message: 'Profile updated successfully!', type: 'success' });
      }
    } catch (err) {
      dispatch(profileFailure(err.response?.data?.message || 'Failed to update profile.'));
      setToastConfig({ message: 'Failed to save changes.', type: 'error' });
    }
  };

  // Handle Resume PDF file upload
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setToastConfig({ message: 'Please upload a PDF document for your resume.', type: 'error' });
      return;
    }

    const data = new FormData();
    data.append('resume', file);

    setIsUploadingResume(true);
    try {
      const response = await api.post('/profile/freelancer/upload-resume', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        dispatch(freelancerProfileSuccess(response.data.profile));
        setToastConfig({ message: 'Resume uploaded successfully!', type: 'success' });
      }
    } catch (err) {
      setToastConfig({ message: err.response?.data?.message || 'Resume upload failed.', type: 'error' });
    } finally {
      setIsUploadingResume(false);
    }
  };

  // Handle Portfolio item submission
  const handlePortfolioSubmit = async (e) => {
    e.preventDefault();
    if (!portfolioData.title.trim()) {
      setToastConfig({ message: 'Portfolio item title is required.', type: 'error' });
      return;
    }

    const data = new FormData();
    data.append('title', portfolioData.title);
    data.append('description', portfolioData.description);
    data.append('link', portfolioData.link);
    if (portfolioImage) {
      data.append('portfolioImage', portfolioImage);
    }

    setIsAddingPortfolio(true);
    try {
      const response = await api.post('/profile/freelancer/portfolio', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        dispatch(freelancerProfileSuccess(response.data.profile));
        setPortfolioData({ title: '', description: '', link: '' });
        setPortfolioImage(null);
        setToastConfig({ message: 'Portfolio item added successfully!', type: 'success' });
      }
    } catch (err) {
      setToastConfig({ message: err.response?.data?.message || 'Portfolio item save failed.', type: 'error' });
    } finally {
      setIsAddingPortfolio(false);
    }
  };

  if (loading && !freelancerProfile) {
    return (
      <div className="h-64 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Profile card */}
      <div className="bg-dark-surface rounded-3xl border border-dark-border shadow-[0_0_20px_rgba(0,0,0,0.2)] overflow-hidden">
        <div className="h-36 bg-gradient-brand relative" />
        <div className="px-6 pb-6 relative flex flex-col md:flex-row md:items-end gap-6 -mt-12">
          {/* Avatar Upload component */}
          <AvatarUpload 
            currentAvatar={user?.avatar} 
            onUpload={handleAvatarUpload}
            isUploading={isUploadingAvatar}
          />
          
          <div className="flex-1 mt-4 md:mt-0">
            <h1 className="text-2xl font-extrabold text-white">{user?.name}</h1>
            <p className="text-brand-purple font-bold text-sm mb-2">{freelancerProfile?.title || 'Freelance Specialist'}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#94A3B8]">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-[#64748B]" />
                {freelancerProfile?.location || 'Location unspecified'}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-[#64748B]" />
                ₹{freelancerProfile?.hourlyRate || 0}/hr
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-[#64748B]" />
                {freelancerProfile?.availabilityStatus || 'Available'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-white text-xs font-bold rounded-xl transition-smooth cursor-pointer"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Resume, Skills, Availability */}
        <div className="space-y-6">
          {/* Availability and rate panel */}
          <div className="bg-dark-surface p-6 rounded-3xl border border-dark-border shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            <h2 className="font-bold text-white text-sm mb-4">Availability & Rate</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#64748B] font-semibold text-xs">Hourly Rate</span>
                <span className="font-extrabold text-white">₹{freelancerProfile?.hourlyRate || 0}/hr</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#64748B] font-semibold text-xs">Status</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                  {freelancerProfile?.availabilityStatus || 'Available'}
                </span>
              </div>
            </div>
          </div>

          {/* Resume Upload panel */}
          <div className="bg-dark-surface p-6 rounded-3xl border border-dark-border shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            <h2 className="font-bold text-white text-sm mb-3">Professional Resume</h2>
            {freelancerProfile?.resume ? (
              <div className="mb-4 flex items-center gap-2 p-3 bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl">
                <FileText className="h-5 w-5 text-brand-purple flex-shrink-0" />
                <a
                  href={freelancerProfile.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-brand-purple truncate hover:text-white transition-colors"
                >
                  View current resume.pdf
                </a>
              </div>
            ) : (
              <p className="text-xs text-[#94A3B8] mb-4">No resume document uploaded yet.</p>
            )}

            <div className="relative">
              <input
                type="file"
                accept="application/pdf"
                id="resume-file-input"
                onChange={handleResumeUpload}
                className="hidden"
                disabled={isUploadingResume}
              />
              <label
                htmlFor="resume-file-input"
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] rounded-xl text-xs font-bold text-white cursor-pointer transition-colors"
              >
                {isUploadingResume ? <LoadingSpinner size="sm" /> : 'Upload Resume (PDF)'}
              </label>
            </div>
          </div>

          {/* Skill list panel */}
          <div className="bg-dark-surface p-6 rounded-3xl border border-dark-border shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            <h2 className="font-bold text-white text-sm mb-4">Skills & Proficiency</h2>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {skills.length > 0 ? (
                skills.map((sk, idx) => (
                  <div key={idx} className="relative group">
                    <SkillBadge name={sk.name} level={sk.level} />
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveSkill(sk.name)}
                        className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer shadow-lg"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#94A3B8]">Add key skills below.</p>
              )}
            </div>

            {isEditing && (
              <div className="space-y-3 border-t border-dark-border pt-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wide">Add a Skill</h3>
                <input
                  type="text"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  placeholder="e.g. Node.js"
                  className="w-full px-3 py-2 border border-dark-border bg-[rgba(255,255,255,0.03)] text-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-purple/30 focus:border-brand-purple transition-smooth"
                />
                <select
                  value={newSkill.level}
                  onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                  className="w-full px-3 py-2 border border-dark-border bg-[rgba(255,255,255,0.03)] text-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-purple/30 focus:border-brand-purple transition-smooth [&>option]:bg-dark-surface"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="w-full flex items-center justify-center gap-1 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-white rounded-xl text-xs font-bold transition-smooth cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Add Skill
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Bio info, Experience & Portfolio */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info editing / showing */}
          <div className="bg-dark-surface p-6 rounded-3xl border border-dark-border shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            {isEditing ? (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <h2 className="font-bold text-white text-md border-b border-dark-border pb-4">Professional Overview</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1">Professional Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Full-Stack JavaScript Engineer"
                      className="w-full px-4 py-2 border border-dark-border bg-[rgba(255,255,255,0.03)] text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple transition-smooth"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1">Hourly Rate (₹)</label>
                    <input
                      type="number"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-dark-border bg-[rgba(255,255,255,0.03)] text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple transition-smooth"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Mumbai, Maharashtra"
                      className="w-full px-4 py-2 border border-dark-border bg-[rgba(255,255,255,0.03)] text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple transition-smooth"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1">Availability Status</label>
                    <select
                      name="availabilityStatus"
                      value={formData.availabilityStatus}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-dark-border bg-[rgba(255,255,255,0.03)] text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple transition-smooth [&>option]:bg-dark-surface"
                    >
                      <option value="Available">Available</option>
                      <option value="Busy">Busy</option>
                      <option value="Unavailable">Unavailable</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1">Professional Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Describe your design patterns, client projects, and skills..."
                    className="w-full px-4 py-2 border border-dark-border bg-[rgba(255,255,255,0.03)] text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple transition-smooth"
                  />
                </div>

                {/* Submit Profile edits */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 mt-4 bg-gradient-brand hover:brightness-110 hover:scale-[1.01] hover-glow-purple text-white rounded-xl font-bold transition-all text-sm shadow-lg active:scale-95"
                >
                  <Save className="h-4 w-4" />
                  Save Profile Settings
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <h2 className="font-bold text-white text-md border-b border-dark-border pb-4">Professional Bio</h2>
                <p className="text-[#94A3B8] text-sm leading-relaxed whitespace-pre-wrap">
                  {freelancerProfile?.bio || 'Click "Edit Profile" to write a summary of your professional capabilities.'}
                </p>
              </div>
            )}
          </div>

          {/* Work Experience Timeline */}
          <div className="bg-dark-surface p-6 rounded-3xl border border-dark-border shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            <h2 className="font-bold text-white text-md mb-6 border-b border-dark-border pb-4">Work Experience</h2>

            <div className="space-y-6 relative border-l border-dark-border pl-4 ml-2">
              {experience.length > 0 ? (
                experience.map((exp, idx) => (
                  <div key={idx} className="relative">
                    {/* timeline node dot */}
                    <span className="absolute -left-[22px] top-1.5 h-3 w-3 rounded-full bg-brand-purple ring-4 ring-dark-surface" />
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-white text-sm">{exp.role}</h3>
                        <p className="text-xs text-brand-purple font-semibold">{exp.company}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-[#94A3B8] whitespace-nowrap bg-[rgba(255,255,255,0.02)] border border-dark-border px-2 py-0.5 rounded-full">
                          {new Date(exp.from).getFullYear()} - {exp.to ? new Date(exp.to).getFullYear() : 'Present'}
                        </span>
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveExperience(idx)}
                            className="text-rose-500 hover:text-rose-400 cursor-pointer transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[#94A3B8] text-xs mt-2 leading-relaxed">{exp.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#94A3B8] pl-2">No work history entries present.</p>
              )}
            </div>

            {isEditing && (
              <div className="mt-6 border-t border-dark-border pt-6 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wide">Add Work History</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={newExp.company}
                    onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                    placeholder="Company Name"
                    className="w-full px-3 py-2 border border-dark-border bg-[rgba(255,255,255,0.03)] text-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-purple/30 focus:border-brand-purple transition-smooth"
                  />
                  <input
                    type="text"
                    value={newExp.role}
                    onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                    placeholder="Job Role / Title"
                    className="w-full px-3 py-2 border border-dark-border bg-[rgba(255,255,255,0.03)] text-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-purple/30 focus:border-brand-purple transition-smooth"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] mb-1">From Date</label>
                    <input
                      type="date"
                      value={newExp.from}
                      onChange={(e) => setNewExp({ ...newExp, from: e.target.value })}
                      className="w-full px-3 py-2 border border-dark-border bg-[rgba(255,255,255,0.03)] text-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-purple/30 focus:border-brand-purple transition-smooth [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] mb-1">To Date (Leave empty if present)</label>
                    <input
                      type="date"
                      value={newExp.to}
                      onChange={(e) => setNewExp({ ...newExp, to: e.target.value })}
                      className="w-full px-3 py-2 border border-dark-border bg-[rgba(255,255,255,0.03)] text-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-purple/30 focus:border-brand-purple transition-smooth [color-scheme:dark]"
                    />
                  </div>
                </div>
                <textarea
                  value={newExp.description}
                  onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                  placeholder="Job descriptions, key deliverables, and responsibilities..."
                  rows="3"
                  className="w-full px-3 py-2 border border-dark-border bg-[rgba(255,255,255,0.03)] text-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-purple/30 focus:border-brand-purple transition-smooth"
                />
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="flex items-center justify-center gap-1.5 py-2 px-4 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-white rounded-xl text-xs font-bold transition-smooth cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Append Work History
                </button>
              </div>
            )}
          </div>

          {/* Portfolio Grid */}
          <div className="bg-dark-surface p-6 rounded-3xl border border-dark-border shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            <h2 className="font-bold text-white text-md mb-6 border-b border-dark-border pb-4">Project Portfolio</h2>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {freelancerProfile?.portfolio && freelancerProfile.portfolio.length > 0 ? (
                freelancerProfile.portfolio.map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)] rounded-xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-[rgba(255,255,255,0.1)] transition-smooth"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-32 object-cover border-b border-[rgba(255,255,255,0.05)]"
                      />
                    )}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-white text-sm mb-1">{item.title}</h3>
                        <p className="text-[#94A3B8] text-xs mb-3 line-clamp-2">{item.description}</p>
                      </div>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-purple hover:text-white transition-colors"
                        >
                          <LinkIcon className="h-3.5 w-3.5" />
                          Visit Project Link
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#94A3B8] col-span-2">No portfolio items added yet.</p>
              )}
            </div>

            {/* Add Portfolio form */}
            <form onSubmit={handlePortfolioSubmit} className="border-t border-dark-border pt-6 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wide">Add Portfolio Item</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={portfolioData.title}
                  onChange={(e) => setPortfolioData({ ...portfolioData, title: e.target.value })}
                  placeholder="Project Title *"
                  className="w-full px-3 py-2 border border-dark-border bg-[rgba(255,255,255,0.03)] text-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-purple/30 focus:border-brand-purple transition-smooth"
                  required
                />
                <input
                  type="url"
                  value={portfolioData.link}
                  onChange={(e) => setPortfolioData({ ...portfolioData, link: e.target.value })}
                  placeholder="Project External Link URL"
                  className="w-full px-3 py-2 border border-dark-border bg-[rgba(255,255,255,0.03)] text-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-purple/30 focus:border-brand-purple transition-smooth"
                />
              </div>

              <textarea
                value={portfolioData.description}
                onChange={(e) => setPortfolioData({ ...portfolioData, description: e.target.value })}
                placeholder="Describe your design decisions, tech tools, and results..."
                rows="2"
                className="w-full px-3 py-2 border border-dark-border bg-[rgba(255,255,255,0.03)] text-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-purple/30 focus:border-brand-purple transition-smooth"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-dark-border">
                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] mb-1">Project Mock Snapshot / Cover</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPortfolioImage(e.target.files[0])}
                    className="text-xs text-[#94A3B8]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAddingPortfolio}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-white rounded-xl text-xs font-bold transition-smooth cursor-pointer disabled:opacity-75"
                >
                  {isAddingPortfolio ? <LoadingSpinner size="sm" color="white" /> : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add Portfolio Item
                    </>
                  )}
                </button>
              </div>
            </form>
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

export default FreelancerProfile;
