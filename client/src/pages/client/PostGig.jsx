import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, ArrowRight, CheckCircle, Save, Trash2, Plus } from 'lucide-react';
import api from '../../utils/api';
import MultiStepForm from '../../components/ui/MultiStepForm';
import TagInput from '../../components/ui/TagInput';
import FileUpload from '../../components/ui/FileUpload';
import Toast from '../../components/Toast';

const PostGig = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [toastConfig, setToastConfig] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    subCategory: '',
    skills: [],
    experienceLevel: 'intermediate',
    duration: '1-3 months',
    budgetType: 'fixed',
    budgetMin: 1000,
    budgetMax: 5000,
    location: '',
    isRemote: true,
    attachments: [],
    milestones: []
  });

  // Milestone Form State
  const [newMilestone, setNewMilestone] = useState({ title: '', amount: '', dueDate: '', description: '' });

  const steps = [
    'Gig Details',
    'Skills & Experience',
    'Budget & Milestones',
    'Location & Review'
  ];

  // Load Draft from LocalStorage if exists, unless in Edit mode
  const editId = new URLSearchParams(window.location.search).get('edit');

  useEffect(() => {
    if (editId) {
      const fetchGigForEdit = async () => {
        try {
          const res = await api.get(`/gigs/${editId}`);
          if (res.data.success) {
            const gig = res.data.gig;
            setFormData({
              title: gig.title,
              description: gig.description,
              category: gig.category || 'Web Development',
              subCategory: gig.subCategory || '',
              skills: gig.skills || [],
              experienceLevel: gig.experienceLevel || 'intermediate',
              duration: gig.duration || '1-3 months',
              budgetType: gig.budgetType || 'fixed',
              budgetMin: gig.budgetMin || 1000,
              budgetMax: gig.budgetMax || 5000,
              location: gig.location || '',
              isRemote: gig.isRemote !== undefined ? gig.isRemote : true,
              attachments: gig.attachments || [],
              milestones: gig.milestones || []
            });
            setToastConfig({ message: 'Loaded job details for editing!', type: 'success' });
          }
        } catch (err) {
          console.error('Failed to fetch gig for editing:', err);
        }
      };
      fetchGigForEdit();
    } else {
      const savedDraft = localStorage.getItem('gig_post_draft');
      if (savedDraft) {
        try {
          setFormData(JSON.parse(savedDraft));
          setToastConfig({ message: 'Loaded saved draft details!', type: 'success' });
        } catch (err) {
          console.error('Failed to parse draft:', err);
        }
      }
    }
  }, [editId]);

  const saveDraft = () => {
    localStorage.setItem('gig_post_draft', JSON.stringify(formData));
    setToastConfig({ message: 'Draft saved successfully!', type: 'success' });
  };

  const [transitionCooldown, setTransitionCooldown] = useState(false);

  const validateStep = (step) => {
    if (step === 0) {
      if (!formData.title.trim()) {
        setToastConfig({ message: 'Please enter a job title.', type: 'error' });
        return false;
      }
      if (formData.description.trim().length < 100) {
        setToastConfig({ message: 'Please enter a description of at least 100 characters.', type: 'error' });
        return false;
      }
      if (formData.description.trim().length > 5000) {
        setToastConfig({ message: 'Description cannot exceed 5000 characters.', type: 'error' });
        return false;
      }
    }
    if (step === 1) {
      if (formData.skills.length === 0) {
        setToastConfig({ message: 'Please add at least one required skill tag.', type: 'error' });
        return false;
      }
    }
    if (step === 2) {
      if (!formData.budgetMin || Number(formData.budgetMin) <= 0) {
        setToastConfig({ message: 'Please enter a valid minimum budget.', type: 'error' });
        return false;
      }
      if (Number(formData.budgetMax) < Number(formData.budgetMin)) {
        setToastConfig({ message: 'Maximum budget must be greater than or equal to minimum budget.', type: 'error' });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    const nextStep = Math.min(currentStep + 1, steps.length - 1);
    setCurrentStep(nextStep);

    // If advancing to Step 4 (Review), set a brief cooldown so rapid clicks cannot auto-submit
    if (nextStep === 3) {
      setTransitionCooldown(true);
      setTimeout(() => setTransitionCooldown(false), 400);
    }
  };

  const handleStepClick = (targetStep) => {
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
    } else {
      for (let i = currentStep; i < targetStep; i++) {
        if (!validateStep(i)) return;
      }
      setCurrentStep(targetStep);
      if (targetStep === 3) {
        setTransitionCooldown(true);
        setTimeout(() => setTransitionCooldown(false), 400);
      }
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const addMilestone = () => {
    if (!newMilestone.title.trim() || !newMilestone.amount || !newMilestone.dueDate) {
      setToastConfig({ message: 'Please add a milestone title, amount, and due date.', type: 'error' });
      return;
    }
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { ...newMilestone, amount: Number(newMilestone.amount) }]
    });
    setNewMilestone({ title: '', amount: '', dueDate: '', description: '' });
  };

  const removeMilestone = (idxToRemove) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((_, idx) => idx !== idxToRemove)
    });
  };

  const handleFinalSubmit = async () => {
    if (currentStep !== 3) {
      handleNext();
      return;
    }
    if (transitionCooldown) return;

    if (!formData.isRemote && !formData.location.trim()) {
      setToastConfig({ message: 'Please specify the on-site project location.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      if (editId) {
        response = await api.put(`/gigs/${editId}`, formData);
      } else {
        response = await api.post('/gigs', formData);
      }

      if (response.data.success) {
        setToastConfig({ message: editId ? 'Gig updated successfully!' : 'Gig posted successfully!', type: 'success' });
        localStorage.removeItem('gig_post_draft');
        setTimeout(() => {
          navigate('/client/my-gigs');
        }, 1000);
      }
    } catch (err) {
      setToastConfig({ message: err.response?.data?.message || 'Failed to post gig.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-subtle text-slate-900 p-4 md:py-10 relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-orange-600/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-brand-purple/5 blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto bg-white border border-surface-border rounded-3xl p-6 md:p-8 relative z-10 shadow-card">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Create a New Job Post</h1>
            <p className="text-xs text-slate-500 mt-1">Hire top freelancers in our hyperlocal system</p>
          </div>
          <button
            type="button"
            onClick={saveDraft}
            className="inline-flex items-center gap-1.5 bg-surface-subtle border border-surface-border hover:border-orange-600 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 transition-all cursor-pointer self-start sm:self-auto shadow-sm"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>
        </div>

        {/* Step Progress Bar */}
        <MultiStepForm steps={steps} currentStep={currentStep} onStepClick={handleStepClick} />

        <div className="mt-6 space-y-6">
          {/* STEP 1: Details */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Job Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. React Front-End Developer for Local Logistics Dashboard"
                  className="w-full px-4 py-3 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600 transition-smooth"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-surface-border bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600 transition-smooth"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Design">Design</option>
                    <option value="Writing">Writing</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Video">Video</option>
                    <option value="Music">Music</option>
                    <option value="Data">Data</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Sub-category</label>
                  <input
                    type="text"
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    placeholder="e.g. Landing Pages, Logo Design"
                    className="w-full px-4 py-3 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Job Description</label>
                <textarea
                  rows="6"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide a detailed scope of work, goals, and expectations for the freelancer (minimum 100 characters)..."
                  maxLength={5000}
                  className="w-full px-4 py-3 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600 transition-smooth resize-none"
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 2: Skills & Requirements */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Skills Needed</label>
                <TagInput
                  tags={formData.skills}
                  onChange={(skills) => setFormData({ ...formData, skills })}
                  placeholder="Type a skill and press Enter (e.g. React, Node.js, CSS)"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Experience Level Required</label>
                <div className="grid grid-cols-3 gap-4">
                  {['entry', 'intermediate', 'expert'].map((level) => (
                    <div
                      key={level}
                      onClick={() => setFormData({ ...formData, experienceLevel: level })}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-center capitalize ${
                        formData.experienceLevel === level
                          ? 'border-orange-600 bg-orange-600/10 text-slate-900 font-bold shadow-sm'
                          : 'border-surface-border bg-white text-slate-500 hover:border-orange-300'
                      }`}
                    >
                      {level}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Project Duration</label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-surface-border bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30"
                >
                  <option value="Less than 1 week">Less than 1 week</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="2-4 weeks">2-4 weeks</option>
                  <option value="1-3 months">1-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="More than 6 months">More than 6 months</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: Budget & Milestones */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Budget Type Toggle */}
              <div className="flex gap-4 p-1 bg-surface-subtle border border-surface-border rounded-2xl w-max">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, budgetType: 'fixed' })}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    formData.budgetType === 'fixed'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  } cursor-pointer`}
                >
                  Fixed Budget
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, budgetType: 'hourly' })}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    formData.budgetType === 'hourly'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  } cursor-pointer`}
                >
                  Hourly Rate
                </button>
              </div>

              {/* Min Max Ranges */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Min Budget (₹)</label>
                  <input
                    type="number"
                    value={formData.budgetMin}
                    onChange={(e) => setFormData({ ...formData, budgetMin: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Max Budget (₹)</label>
                  <input
                    type="number"
                    value={formData.budgetMax}
                    onChange={(e) => setFormData({ ...formData, budgetMax: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30"
                  />
                </div>
              </div>

              {/* Milestones Add Section */}
              <div className="space-y-4 border-t border-surface-border/40 pt-4">
                <h3 className="text-sm font-bold text-slate-900">Project Milestones (Optional)</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                    placeholder="Milestone title"
                    className="px-3 py-2 text-xs rounded-xl border border-surface-border bg-white text-slate-900 sm:col-span-2"
                  />
                  <input
                    type="number"
                    value={newMilestone.amount}
                    onChange={(e) => setNewMilestone({ ...newMilestone, amount: e.target.value })}
                    placeholder="Amount (₹)"
                    className="px-3 py-2 text-xs rounded-xl border border-surface-border bg-white text-slate-900"
                  />
                  <input
                    type="date"
                    value={newMilestone.dueDate}
                    onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                    className="px-3 py-2 text-xs rounded-xl border border-surface-border bg-white text-slate-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="w-full py-2 bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition-all font-bold flex items-center justify-center gap-1.5 cursor-pointer rounded-xl text-xs"
                >
                  <Plus className="h-4 w-4" />
                  Add Milestone
                </button>

                {formData.milestones.length > 0 && (
                  <div className="space-y-2">
                    {formData.milestones.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 rounded-xl border border-surface-border bg-surface-subtle text-xs text-slate-700"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{m.title}</p>
                          <p className="text-[10px] text-slate-500">Due: {new Date(m.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-orange-600">₹{Number(m.amount).toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={() => removeMilestone(idx)}
                            className="p-1 rounded bg-white text-slate-400 hover:text-red-500 border border-surface-border transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Location, Attachments & Final Review */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-surface-border pb-3">
                <h3 className="text-base font-extrabold text-slate-900">Step 4: Location, Attachments & Review</h3>
                <p className="text-xs text-slate-500 mt-0.5">Please review your job posting details before confirming publication.</p>
              </div>

              {/* Work Arrangement Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Work Arrangement</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setFormData({ ...formData, isRemote: true })}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      formData.isRemote
                        ? 'border-orange-600 bg-orange-50/50 shadow-sm'
                        : 'border-surface-border bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-slate-900">🌐 100% Remote</span>
                      <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${formData.isRemote ? 'border-orange-600 bg-orange-600' : 'border-slate-300'}`}>
                        {formData.isRemote && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Freelancers worldwide or across India can apply.</p>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, isRemote: false })}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      !formData.isRemote
                        ? 'border-orange-600 bg-orange-50/50 shadow-sm'
                        : 'border-surface-border bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-slate-900">📍 On-site / Local</span>
                      <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${!formData.isRemote ? 'border-orange-600 bg-orange-600' : 'border-slate-300'}`}>
                        {!formData.isRemote && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Requires local in-person presence in your city.</p>
                  </div>
                </div>
              </div>

              {/* Location Input (Active when On-site is selected) */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                  {formData.isRemote ? 'Preferred Region / Timezone (Optional)' : 'Project Location (Required for On-site)'}
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Mumbai, Maharashtra or Bengaluru, Karnataka"
                  className="w-full px-4 py-3 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30"
                />
              </div>

              {/* Attachments */}
              <div>
                <FileUpload
                  files={formData.attachments}
                  onChange={(attachments) => setFormData({ ...formData, attachments })}
                  label="Reference Attachments (Specs, Designs, Wireframes)"
                />
              </div>

              {/* Comprehensive Review Summary Card */}
              <div className="border border-surface-border rounded-2xl p-5 bg-surface-subtle space-y-4">
                <div className="flex items-center justify-between border-b border-surface-border pb-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Summary of Job Details</h4>
                  <span className="text-[11px] font-bold text-orange-600">{formData.category}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-slate-400 font-bold">Job Title</span>
                    <span className="text-slate-900 font-bold text-sm">{formData.title || 'Untitled Post'}</span>
                  </div>

                  <div>
                    <span className="block text-slate-400 font-bold">Budget & Scale</span>
                    <span className="text-slate-900 font-bold">
                      ₹{formData.budgetMin?.toLocaleString()} - ₹{formData.budgetMax?.toLocaleString()} ({formData.budgetType === 'fixed' ? 'Fixed' : 'Hourly'})
                    </span>
                  </div>

                  <div>
                    <span className="block text-slate-400 font-bold">Experience Level & Duration</span>
                    <span className="text-slate-900 font-bold capitalize">
                      {formData.experienceLevel} · {formData.duration}
                    </span>
                  </div>

                  <div>
                    <span className="block text-slate-400 font-bold">Work Arrangement</span>
                    <span className="text-slate-900 font-bold">
                      {formData.isRemote ? '100% Remote' : `On-site (${formData.location || 'Location pending'})`}
                    </span>
                  </div>
                </div>

                {formData.skills.length > 0 && (
                  <div className="pt-2 border-t border-surface-border/60">
                    <span className="block text-[11px] text-slate-400 font-bold mb-1.5">Required Skills:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.skills.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-white border border-surface-border text-[11px] font-bold text-slate-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Controls Footer */}
          <div className="border-t border-surface-border/60 pt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-5 py-3 rounded-xl bg-surface-subtle border border-surface-border hover:border-orange-200 text-slate-600 disabled:opacity-40 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                Continue to Step {currentStep + 2}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting || transitionCooldown}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                {isSubmitting ? 'Publishing Gig...' : 'Confirm & Post Job Now'}
              </button>
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

export default PostGig;
