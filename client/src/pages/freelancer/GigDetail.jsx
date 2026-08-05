import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, MapPin, Calendar, Briefcase, FileText, CheckCircle2, ChevronRight, ShieldCheck, CreditCard, Clock, Star, Trash2, Heart } from 'lucide-react';
import api from '../../utils/api';
import { selectedGigSuccess, gigsStart, gigsFailure, addBookmark, removeBookmark } from '../../store/gigsSlice';
import StatusBadge from '../../components/ui/StatusBadge';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import Modal from '../../components/ui/Modal';
import FileUpload from '../../components/ui/FileUpload';

const GigDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedGig: gig, loading } = useSelector((state) => state.gigs);
  const { user } = useSelector((state) => state.auth);

  const [toastConfig, setToastConfig] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

  // Similar gigs mockup for visual excellence
  const [similarGigs, setSimilarGigs] = useState([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Proposal Form State
  const [proposalForm, setProposalForm] = useState({
    coverLetter: '',
    bidAmount: '',
    estimatedDays: '',
    milestones: [],
    attachments: []
  });

  // Milestone Form State
  const [newMilestone, setNewMilestone] = useState({ title: '', amount: '', days: '' });

  const fetchGigDetails = async () => {
    dispatch(gigsStart());
    try {
      // Fetch details
      const response = await api.get(`/gigs/${id}`);
      if (response.data.success) {
        dispatch(selectedGigSuccess(response.data.gig));
        
        // Fetch similar gigs
        const categoryRes = await api.get(`/gigs/category/${response.data.gig.category}`);
        if (categoryRes.data.success) {
          setSimilarGigs(categoryRes.data.gigs.filter((g) => g._id !== id).slice(0, 3));
        }
      }
    } catch (err) {
      dispatch(gigsFailure(err.response?.data?.message || 'Failed to fetch details.'));
    }
  };

  const incrementViews = async () => {
    try {
      await api.post(`/gigs/${id}/view`);
    } catch (err) {
      console.error('Failed to increment views:', err);
    }
  };

  const checkAppliedAndSaved = async () => {
    if (user && user.role === 'freelancer') {
      try {
        const response = await api.get('/proposals/my-proposals');
        if (response.data.success) {
          const applied = response.data.proposals.some(p => {
            const gigIdVal = p.gig?._id || p.gig;
            return gigIdVal === id;
          });
          setHasApplied(applied);
        }
      } catch (err) {
        console.error('Failed to check proposal status:', err);
      }
    }
  };

  const { bookmarkedGigs } = useSelector((state) => state.gigs);
  const isBookmarked = bookmarkedGigs.some((g) => g._id === id);

  const handleToggleSave = () => {
    if (isBookmarked) {
      dispatch(removeBookmark(id));
      setToastConfig({ message: 'Gig removed from bookmarks', type: 'success' });
    } else {
      dispatch(addBookmark(gig));
      setToastConfig({ message: 'Gig saved to bookmarks', type: 'success' });
    }
  };

  useEffect(() => {
    if (id) {
      fetchGigDetails();
      incrementViews();
      checkAppliedAndSaved();
    }
  }, [id, dispatch]);

  const handleAddMilestone = () => {
    if (!newMilestone.title.trim() || !newMilestone.amount || !newMilestone.days) {
      setToastConfig({ message: 'Please add title, amount, and days.', type: 'error' });
      return;
    }
    setProposalForm({
      ...proposalForm,
      milestones: [
        ...proposalForm.milestones,
        {
          title: newMilestone.title,
          amount: Number(newMilestone.amount),
          days: Number(newMilestone.days)
        }
      ]
    });
    setNewMilestone({ title: '', amount: '', days: '' });
  };

  const handleRemoveMilestone = (idxToRemove) => {
    setProposalForm({
      ...proposalForm,
      milestones: proposalForm.milestones.filter((_, idx) => idx !== idxToRemove)
    });
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    if (!proposalForm.coverLetter.trim() || !proposalForm.bidAmount || !proposalForm.estimatedDays) {
      setToastConfig({ message: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    if (proposalForm.coverLetter.trim().length < 100) {
      setToastConfig({ message: 'Cover letter must be at least 100 characters long.', type: 'error' });
      return;
    }

    setIsSubmittingProposal(true);
    try {
      const response = await api.post('/proposals', {
        gigId: id,
        ...proposalForm,
        bidAmount: Number(proposalForm.bidAmount),
        estimatedDays: Number(proposalForm.estimatedDays)
      });

      if (response.data.success) {
        setToastConfig({ message: 'Proposal submitted successfully!', type: 'success' });
        setIsModalOpen(false);
        // Reset form
        setProposalForm({
          coverLetter: '',
          bidAmount: '',
          estimatedDays: '',
          milestones: [],
          attachments: []
        });
        setTimeout(() => {
          navigate('/freelancer/my-proposals');
        }, 1000);
      }
    } catch (err) {
      setToastConfig({
        message: err.response?.data?.message || 'Failed to submit proposal.',
        type: 'error'
      });
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-subtle text-slate-900 flex justify-center items-center">
        <LoadingSpinner size="lg" color="white" />
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-surface-subtle text-slate-900 flex flex-col justify-center items-center gap-4">
        <p className="text-sm text-slate-500">Gig details not found or expired.</p>
        <button onClick={() => navigate('/gigs')} className="px-4 py-2 bg-orange-600 rounded-xl text-xs font-bold">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-subtle text-slate-900 flex flex-col transition-smooth">
      <Navbar />

      <div className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8 relative z-10 animate-fade-up">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Browse
        </button>

        {/* Hero Details Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-surface-border rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                    {gig.category} {gig.subCategory ? `· ${gig.subCategory}` : ''}
                  </span>
                  <StatusBadge status={gig.status} />
                </div>
                <div className="text-[11px] font-bold text-slate-500 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Posted {new Date(gig.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">{gig.title}</h1>

              {/* Specs parameters tag list */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-b border-surface-border/40 py-4 text-xs">
                <div className="space-y-0.5">
                  <span className="block text-slate-500 font-bold uppercase tracking-wider text-[9px]">Budget scale</span>
                  <span className="text-slate-900 font-extrabold">
                    ₹{gig.budgetMin?.toLocaleString()} - ₹{gig.budgetMax?.toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-medium uppercase">{gig.budgetType}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-slate-500 font-bold uppercase tracking-wider text-[9px]">Experience Level</span>
                  <span className="text-slate-900 font-extrabold capitalize">{gig.experienceLevel}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-slate-500 font-bold uppercase tracking-wider text-[9px]">Project Duration</span>
                  <span className="text-slate-900 font-extrabold">{gig.duration}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900">Job Scope & Requirements</h3>
                <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{gig.description}</p>
              </div>

              {/* Required Skills */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {gig.skills?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl bg-surface-subtle border border-surface-border text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Attachments */}
              {gig.attachments?.length > 0 && (
                <div className="space-y-3 border-t border-surface-border/40 pt-4">
                  <h3 className="text-sm font-extrabold text-slate-900">Documents & Attachments</h3>
                  <div className="space-y-2">
                    {gig.attachments.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border border-surface-border bg-surface-muted0 text-xs hover:border-orange-600 transition-colors cursor-pointer"
                      >
                        <FileText className="h-4 w-4 text-orange-600" />
                        <span className="text-slate-300 hover:text-slate-900 font-bold">{file.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Client Profile Stats box */}
          <div className="space-y-6">
            <div className="bg-white border border-surface-border rounded-3xl p-6 space-y-6">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-surface-border/40 pb-3">About Client</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-600/10 border border-orange-600/20 flex items-center justify-center font-bold text-orange-600 text-lg uppercase">
                  {gig.client?.name ? gig.client.name.substring(0, 2) : 'CL'}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{gig.client?.name || 'Company Manager'}</h4>
                  <p className="text-xs text-slate-500">{gig.client?.email}</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-500 font-semibold border-t border-surface-border/40 pt-4">
                <div className="flex justify-between items-center">
                  <span>Rating</span>
                  <span className="text-slate-900 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    {gig.client?.rating ? gig.client.rating.toFixed(1) : '5.0'} / 5.0
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Location</span>
                  <span className="text-slate-900 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
                    {gig.isRemote ? 'Remote' : gig.client?.location || gig.location || 'Hybrid'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Member Since</span>
                  <span className="text-slate-900">
                    {gig.client?.createdAt ? new Date(gig.client.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Recently'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Gigs Posted</span>
                  <span className="text-slate-900">
                    {gig.client?.totalPosted || 1}
                  </span>
                </div>
              </div>

              {/* Submit Proposal trigger button */}
              {user && user.role === 'freelancer' && (
                hasApplied ? (
                  <div className="space-y-2">
                    <div className="w-full py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center text-xs font-bold">
                      You already applied to this gig
                    </div>
                    <button
                      onClick={() => navigate('/freelancer/my-proposals')}
                      className="w-full py-2.5 rounded-xl border border-surface-border bg-surface-muted0 text-slate-500 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer text-center block"
                    >
                      View Your Proposal
                    </button>
                  </div>
                ) : (
                  gig.status === 'open' && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="w-full py-3.5 rounded-xl bg-gradient-orange hover-glow-orange text-slate-900 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Briefcase className="h-4 w-4" />
                      Submit a Proposal
                    </button>
                  )
                )
              )}

              {/* Bookmark Save button */}
              {user && user.role === 'freelancer' && (
                <button
                  onClick={handleToggleSave}
                  className={`w-full py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isBookmarked
                      ? 'border-brand-purple/40 bg-brand-purple/10 text-brand-purple'
                      : 'border-surface-border bg-surface-muted0 text-slate-500 hover:text-slate-900 hover:border-[#94A3B8]/40'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  {isBookmarked ? 'Saved' : 'Save Gig'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Similar Gigs at the bottom */}
        {similarGigs.length > 0 && (
          <div className="space-y-4 border-t border-surface-border/40 pt-8">
            <h3 className="text-sm font-extrabold text-slate-900">Similar Opportunities</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarGigs.map((sim) => (
                <div
                  key={sim._id}
                  onClick={() => {
                    navigate(`/gigs/${sim._id}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-5 border border-surface-border bg-white rounded-2xl hover:border-orange-600/40 hover-lift transition-all cursor-pointer space-y-3"
                >
                  <h4 className="text-sm font-bold text-slate-900 truncate">{sim.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{sim.description}</p>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 font-bold border-t border-surface-border/40 pt-3">
                    <span>₹{sim.budgetMin} - ₹{sim.budgetMax}</span>
                    <span className="text-orange-600">{sim.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submit Proposal Modal overlay */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Apply to: ${gig.title}`}>
        <form onSubmit={handleProposalSubmit} className="space-y-6">
          <div className="p-4 bg-orange-600/5 border border-orange-600/20 rounded-2xl text-xs space-y-1 text-slate-500">
            <span className="block text-slate-900 font-bold">Recruiter's Budget scale:</span>
            <span>₹{gig.budgetMin?.toLocaleString()} - ₹{gig.budgetMax?.toLocaleString()} ({gig.budgetType === 'fixed' ? 'Fixed' : 'Hourly'})</span>
          </div>

          {/* Bid details inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">My Bid (₹)</label>
              <input
                type="number"
                value={proposalForm.bidAmount}
                onChange={(e) => setProposalForm({ ...proposalForm, bidAmount: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-surface-border bg-white text-slate-900 text-xs focus:ring-2 focus:ring-orange-600"
                placeholder="₹ Amount"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Est. Delivery Days</label>
              <input
                type="number"
                value={proposalForm.estimatedDays}
                onChange={(e) => setProposalForm({ ...proposalForm, estimatedDays: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-surface-border bg-white text-slate-900 text-xs focus:ring-2 focus:ring-orange-600"
                placeholder="Days"
                required
              />
            </div>
          </div>

          {/* Cover Letter */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Cover Letter</label>
              <span className="text-[10px] text-slate-500 font-bold">{proposalForm.coverLetter.length}/5000 chars</span>
            </div>
            <textarea
              rows="5"
              maxLength="5000"
              value={proposalForm.coverLetter}
              onChange={(e) => setProposalForm({ ...proposalForm, coverLetter: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-surface-border bg-white text-slate-900 text-xs focus:ring-2 focus:ring-orange-600 resize-none"
              placeholder="Tell the client why you're a good fit, your approach to solving their requirements, and highlight relevant experience..."
              required
            />
          </div>

          {/* Custom milestones proposal additions */}
          <div className="space-y-3 border-t border-surface-border/40 pt-4">
            <h4 className="text-xs font-bold text-slate-900">Propose Project Milestones (Optional)</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Milestone title"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                className="px-3 py-2 text-xs rounded-xl border border-surface-border bg-white text-slate-900"
              />
              <input
                type="number"
                placeholder="Amount (₹)"
                value={newMilestone.amount}
                onChange={(e) => setNewMilestone({ ...newMilestone, amount: e.target.value })}
                className="px-3 py-2 text-xs rounded-xl border border-surface-border bg-white text-slate-900"
              />
              <input
                type="number"
                placeholder="Timeline (Days)"
                value={newMilestone.days}
                onChange={(e) => setNewMilestone({ ...newMilestone, days: e.target.value })}
                className="px-3 py-2 text-xs rounded-xl border border-surface-border bg-white text-slate-900"
              />
            </div>
            <button
              type="button"
              onClick={handleAddMilestone}
              className="w-full py-2 bg-orange-600/15 text-orange-600 border border-orange-600/25 hover:bg-orange-600 hover:text-slate-900 transition-all text-xs font-bold rounded-xl cursor-pointer"
            >
              Propose Milestone
            </button>

            {proposalForm.milestones.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {proposalForm.milestones.map((m, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded-xl border border-surface-border/60 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{m.title}</p>
                      <p className="text-[10px] text-slate-500">{m.days} days duration</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-orange-600">₹{m.amount.toLocaleString()}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(idx)}
                        className="text-slate-500 hover:text-[#EF4444]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* File attachments */}
          <div className="border-t border-surface-border/40 pt-4">
            <FileUpload
              files={proposalForm.attachments}
              onChange={(attachments) => setProposalForm({ ...proposalForm, attachments })}
              maxFiles={2}
              label="Attachments (Resume / PDF Proposals)"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingProposal}
            className="w-full py-3 bg-gradient-orange hover-glow-orange text-slate-900 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            {isSubmittingProposal ? 'Submitting proposal...' : 'Confirm and Submit Application'}
          </button>
        </form>
      </Modal>

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

export default GigDetail;
