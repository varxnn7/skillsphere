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
  const [newMilestone, setNewMilestone] = useState({ title: '', amount: '', description: '' });

  const steps = [
    'Gig Details',
    'Skills & Experience',
    'Budget & Milestones',
    'Location & Review'
  ];

  // Load Draft from LocalStorage if exists
  useEffect(() => {
    const savedDraft = localStorage.getItem('gig_post_draft');
    if (savedDraft) {
      try {
        setFormData(JSON.parse(savedDraft));
        setToastConfig({ message: 'Loaded saved draft details!', type: 'success' });
      } catch (err) {
        console.error('Failed to parse draft:', err);
      }
    }
  }, []);

  const saveDraft = () => {
    localStorage.setItem('gig_post_draft', JSON.stringify(formData));
    setToastConfig({ message: 'Draft saved successfully!', type: 'success' });
  };

  const handleNext = () => {
    if (currentStep === 0 && (!formData.title.trim() || !formData.description.trim())) {
      setToastConfig({ message: 'Please enter a title and description.', type: 'error' });
      return;
    }
    if (currentStep === 1 && formData.skills.length === 0) {
      setToastConfig({ message: 'Please add at least one required skill tag.', type: 'error' });
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const addMilestone = () => {
    if (!newMilestone.title.trim() || !newMilestone.amount) {
      setToastConfig({ message: 'Please add a milestone title and amount.', type: 'error' });
      return;
    }
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { ...newMilestone, amount: Number(newMilestone.amount) }]
    });
    setNewMilestone({ title: '', amount: '', description: '' });
  };

  const removeMilestone = (idxToRemove) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((_, idx) => idx !== idxToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.post('/gigs', formData);
      if (response.data.success) {
        setToastConfig({ message: 'Gig posted successfully!', type: 'success' });
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
    <div className="min-h-screen bg-[#0A0A0F] text-white p-6 md:py-12 relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-brand-indigo/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-brand-purple/10 blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto bg-dark-surface border border-dark-border rounded-3xl p-6 md:p-8 relative z-10 shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Create a New Job Post</h1>
            <p className="text-xs text-[#94A3B8] mt-1">Hire top freelancers in our hyperlocal system</p>
          </div>
          <button
            onClick={saveDraft}
            className="inline-flex items-center gap-1.5 bg-white/5 border border-dark-border hover:border-brand-indigo px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>
        </div>

        {/* Step Progress Bar */}
        <MultiStepForm steps={steps} currentStep={currentStep} />

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* STEP 1: Details */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">Job Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. React Front-End Developer for Local Logistics Dashboard"
                  className="w-full px-4 py-3 rounded-xl border border-dark-border bg-[rgba(255,255,255,0.03)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo transition-smooth"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-dark-border bg-dark-surface text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo transition-smooth"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Apps">Mobile Apps</option>
                    <option value="Design & Creative">Design & Creative</option>
                    <option value="Writing & Translation">Writing & Translation</option>
                    <option value="Marketing & Sales">Marketing & Sales</option>
                    <option value="Finance & Accounting">Finance & Accounting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">Sub-category</label>
                  <input
                    type="text"
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    placeholder="e.g. Landing Pages, Logo Design"
                    className="w-full px-4 py-3 rounded-xl border border-dark-border bg-[rgba(255,255,255,0.03)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">Job Description</label>
                <textarea
                  rows="6"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide a detailed scope of work, goals, and expectations for the freelancer..."
                  className="w-full px-4 py-3 rounded-xl border border-dark-border bg-[rgba(255,255,255,0.03)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo transition-smooth resize-none"
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 2: Skills & Requirements */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">Skills Needed</label>
                <TagInput
                  tags={formData.skills}
                  onChange={(skills) => setFormData({ ...formData, skills })}
                  placeholder="Type a skill and press Enter (e.g. React, Node.js, CSS)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">Experience Level Required</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-dark-border bg-dark-surface text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30"
                  >
                    <option value="entry">Entry Level (Junior)</option>
                    <option value="intermediate">Intermediate (Mid-level)</option>
                    <option value="expert">Expert (Senior Consultant)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">Project Duration</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-dark-border bg-dark-surface text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30"
                  >
                    <option value="Less than 1 month">Less than 1 month</option>
                    <option value="1-3 months">1-3 months</option>
                    <option value="3-6 months">3-6 months</option>
                    <option value="More than 6 months">More than 6 months</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Budget & Milestones */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Budget Type Toggle */}
              <div className="flex gap-4 p-1 bg-dark-surface/50 border border-dark-border rounded-2xl w-max">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, budgetType: 'fixed' })}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    formData.budgetType === 'fixed'
                      ? 'bg-gradient-brand text-white shadow-md'
                      : 'text-[#94A3B8] hover:text-white'
                  } cursor-pointer`}
                >
                  Fixed Budget
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, budgetType: 'hourly' })}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    formData.budgetType === 'hourly'
                      ? 'bg-gradient-brand text-white shadow-md'
                      : 'text-[#94A3B8] hover:text-white'
                  } cursor-pointer`}
                >
                  Hourly Rate
                </button>
              </div>

              {/* Min Max Ranges */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">Min Budget (₹)</label>
                  <input
                    type="number"
                    value={formData.budgetMin}
                    onChange={(e) => setFormData({ ...formData, budgetMin: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-dark-border bg-[rgba(255,255,255,0.03)] text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">Max Budget (₹)</label>
                  <input
                    type="number"
                    value={formData.budgetMax}
                    onChange={(e) => setFormData({ ...formData, budgetMax: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-dark-border bg-[rgba(255,255,255,0.03)] text-white text-sm"
                  />
                </div>
              </div>

              {/* Milestones Add Section */}
              <div className="space-y-4 border-t border-dark-border/40 pt-4">
                <h3 className="text-sm font-bold text-white">Project Milestones (Optional)</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                    placeholder="Milestone title"
                    className="px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-surface text-white"
                  />
                  <input
                    type="number"
                    value={newMilestone.amount}
                    onChange={(e) => setNewMilestone({ ...newMilestone, amount: e.target.value })}
                    placeholder="Amount (₹)"
                    className="px-3 py-2 text-xs rounded-xl border border-dark-border bg-dark-surface text-white"
                  />
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="px-3 py-2 text-xs rounded-xl bg-brand-indigo/15 text-brand-indigo border border-brand-indigo/25 hover:bg-brand-indigo hover:text-white transition-all font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Add Milestone
                  </button>
                </div>

                {formData.milestones.length > 0 && (
                  <div className="space-y-2">
                    {formData.milestones.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 rounded-xl border border-dark-border bg-dark-surface/50 text-xs text-slate-300"
                      >
                        <div>
                          <p className="font-bold text-white">{m.title}</p>
                          {m.description && <p className="text-[10px] text-[#64748B]">{m.description}</p>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-brand-indigo">₹{m.amount.toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={() => removeMilestone(idx)}
                            className="p-1 rounded bg-white/5 text-[#64748B] hover:text-[#EF4444]"
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

          {/* STEP 4: Remote Status, Location & Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-[rgba(255,255,255,0.01)] border border-dark-border rounded-2xl">
                  <div>
                    <span className="block text-xs font-bold text-white">Remote Work Opportunity</span>
                    <span className="text-[10px] text-[#64748B]">Allow freelancers to work offsite</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isRemote}
                      onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-dark-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#94A3B8] after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-indigo peer-checked:after:bg-white" />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">Project Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Mumbai, Maharashtra"
                    disabled={formData.isRemote}
                    className="w-full px-4 py-3 rounded-xl border border-dark-border bg-[rgba(255,255,255,0.03)] text-white text-sm disabled:opacity-40"
                  />
                </div>
              </div>

              <div>
                <FileUpload
                  files={formData.attachments}
                  onChange={(attachments) => setFormData({ ...formData, attachments })}
                  label="Reference Attachments (Specs, Designs)"
                />
              </div>

              {/* Review summary cards */}
              <div className="border border-dark-border rounded-2xl p-5 bg-dark-surface/50 space-y-4">
                <h3 className="text-sm font-extrabold text-white border-b border-dark-border/40 pb-2">Final Review</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-[#64748B] font-bold">Title</span>
                    <span className="text-slate-200 font-semibold">{formData.title || 'Untitled'}</span>
                  </div>
                  <div>
                    <span className="block text-[#64748B] font-bold">Budget Scale</span>
                    <span className="text-slate-200 font-semibold">
                      ₹{formData.budgetMin} - ₹{formData.budgetMax} ({formData.budgetType === 'fixed' ? 'Fixed' : 'Hourly'})
                    </span>
                  </div>
                  <div>
                    <span className="block text-[#64748B] font-bold">Experience Required</span>
                    <span className="text-slate-200 font-semibold capitalize">{formData.experienceLevel}</span>
                  </div>
                  <div>
                    <span className="block text-[#64748B] font-bold">Work Arrangement</span>
                    <span className="text-slate-200 font-semibold">{formData.isRemote ? 'Remote' : formData.location || 'On-site'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls Footer */}
          <div className="border-t border-dark-border/60 pt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-5 py-3 rounded-xl bg-white/5 border border-dark-border hover:border-brand-indigo/50 text-[#94A3B8] disabled:opacity-40 disabled:hover:border-dark-border font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-3 rounded-xl bg-gradient-brand hover-glow-purple text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-3 rounded-xl bg-gradient-brand hover-glow-purple text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="h-4 w-4" />
                {isSubmitting ? 'Posting Gig...' : 'Confirm & Post Job'}
              </button>
            )}
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

export default PostGig;
