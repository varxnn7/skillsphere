import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Building2,
  Lock,
  Bell,
  CreditCard,
  Shield,
  Save,
  CheckCircle,
  AlertCircle,
  Globe,
  MapPin,
  Mail,
  User,
  LogOut,
  RefreshCw
} from 'lucide-react';
import api from '../../utils/api';
import { updateUser, logout } from '../../store/authSlice';
import { clientProfileSuccess } from '../../store/profileSlice';
import Toast from '../../components/Toast';
import { useNavigate } from 'react-router-dom';

const ClientSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { clientProfile } = useSelector((state) => state.profile);

  const [activeTab, setActiveTab] = useState('profile');
  const [toastConfig, setToastConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Profile / Company Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    companyName: clientProfile?.companyName || '',
    bio: clientProfile?.bio || '',
    location: clientProfile?.location || '',
    website: ''
  });

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    emailProposals: true,
    emailMilestones: true,
    emailMessages: true,
    emailDisputes: true,
    weeklyDigest: false
  });

  // Billing Form State
  const [billingForm, setBillingForm] = useState({
    billingName: user?.name || '',
    billingEmail: user?.email || '',
    taxId: '',
    billingAddress: ''
  });

  useEffect(() => {
    const fetchCurrentProfile = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const res = await api.get(`/profile/client/${user.id}`);
        if (res.data.success && res.data.profile) {
          dispatch(clientProfileSuccess(res.data.profile));
          setProfileForm({
            name: user.name || '',
            companyName: res.data.profile.companyName || '',
            bio: res.data.profile.bio || '',
            location: res.data.profile.location || '',
            website: ''
          });
        }
      } catch (err) {
        console.error('Failed to load client settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentProfile();
  }, [user, dispatch]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      // 1. Update company profile
      const profRes = await api.put('/profile/client', {
        companyName: profileForm.companyName,
        bio: profileForm.bio,
        location: profileForm.location
      });

      // 2. Update user name if changed
      if (profileForm.name && profileForm.name !== user?.name) {
        const userRes = await api.put('/auth/update-account', { name: profileForm.name });
        if (userRes.data.success) {
          dispatch(updateUser({ name: profileForm.name }));
        }
      }

      if (profRes.data.success) {
        dispatch(clientProfileSuccess(profRes.data.profile));
        setToastConfig({ message: 'Account preferences updated successfully!', type: 'success' });
      }
    } catch (err) {
      setToastConfig({
        message: err.response?.data?.message || 'Failed to update preferences.',
        type: 'error'
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToastConfig({ message: 'New passwords do not match.', type: 'error' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setToastConfig({ message: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await api.put('/auth/update-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      if (res.data.success) {
        setToastConfig({ message: 'Password changed successfully!', type: 'success' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setToastConfig({
        message: err.response?.data?.message || 'Failed to update password.',
        type: 'error'
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    setToastConfig({ message: 'Notification preferences saved successfully!', type: 'success' });
  };

  const handleSaveBilling = (e) => {
    e.preventDefault();
    setToastConfig({ message: 'Billing details saved successfully!', type: 'success' });
  };

  const handleLogoutAll = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const tabs = [
    { id: 'profile', label: 'Company Profile', icon: Building2 },
    { id: 'security', label: 'Security & Login', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing & Invoices', icon: CreditCard }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {toastConfig && (
        <Toast
          message={toastConfig.message}
          type={toastConfig.type}
          onClose={() => setToastConfig(null)}
        />
      )}

      {/* Header */}
      <div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-200 mb-2">
          <Shield className="h-3 w-3 text-blue-600" />
          Client Portal
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Account Settings</h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Manage your organization profile, security credentials, notification channels, and billing details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-white rounded-2xl border border-surface-border p-2 space-y-1 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-orange-50 text-orange-600 border border-orange-200 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-surface-subtle'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-orange-600' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-surface-border p-4 shadow-sm space-y-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Account Info</h4>
            <div className="text-xs space-y-1">
              <div className="text-slate-500 font-medium">Logged in as</div>
              <div className="text-slate-900 font-bold truncate">{user?.email}</div>
              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle className="h-3 w-3" /> Client Account
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="lg:col-span-3">
          {/* TAB 1: Company Profile */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl border border-surface-border p-6 md:p-8 shadow-card space-y-6">
              <div className="border-b border-surface-border pb-4">
                <h2 className="text-lg font-bold text-slate-900">Organization & Profile Information</h2>
                <p className="text-xs text-slate-500 mt-0.5">This information will be displayed to freelancers when you post jobs.</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                      Account / Contact Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        placeholder="Your full name"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                      Company / Organization Name
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={profileForm.companyName}
                        onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                        placeholder="e.g. Acme Tech Solutions"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                      Primary Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={profileForm.location}
                        onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                        placeholder="e.g. Mumbai, India"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                      Company Website
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="url"
                        value={profileForm.website}
                        onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                        placeholder="https://example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                    About the Organization
                  </label>
                  <textarea
                    rows={4}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Brief description about your business, vision, and the type of work you outsource..."
                    className="w-full px-4 py-3 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600 resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    {savingProfile ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" /> Save Profile Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Security & Password */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-3xl border border-surface-border p-6 md:p-8 shadow-card space-y-6">
              <div className="border-b border-surface-border pb-4">
                <h2 className="text-lg font-bold text-slate-900">Security & Authentication</h2>
                <p className="text-xs text-slate-500 mt-0.5">Update your password and secure your client account.</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Repeat new password"
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    {savingPassword ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /> Updating...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" /> Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Danger Zone */}
              <div className="border-t border-red-100 pt-6 mt-8">
                <h3 className="text-sm font-bold text-red-600 mb-1">Session Management</h3>
                <p className="text-xs text-slate-500 mb-4">Log out of your active session on this device.</p>
                <button
                  type="button"
                  onClick={handleLogoutAll}
                  className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" /> Log Out of Account
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Notifications */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-3xl border border-surface-border p-6 md:p-8 shadow-card space-y-6">
              <div className="border-b border-surface-border pb-4">
                <h2 className="text-lg font-bold text-slate-900">Notification Preferences</h2>
                <p className="text-xs text-slate-500 mt-0.5">Control which notifications you receive via email and inside the app.</p>
              </div>

              <form onSubmit={handleSaveNotifications} className="space-y-4">
                {[
                  {
                    key: 'emailProposals',
                    title: 'New Proposals Alert',
                    desc: 'Receive immediate email whenever a freelancer applies to your active gigs.'
                  },
                  {
                    key: 'emailMilestones',
                    title: 'Milestone & Delivery Submissions',
                    desc: 'Notify when a freelancer submits milestone deliverables for your review.'
                  },
                  {
                    key: 'emailMessages',
                    title: 'Direct Chat Messages',
                    desc: 'Receive email alerts for unread messages received while offline.'
                  },
                  {
                    key: 'emailDisputes',
                    title: 'Arbitration & Dispute Updates',
                    desc: 'Critical alerts regarding escrow arbitration or admin mediation.'
                  },
                  {
                    key: 'weeklyDigest',
                    title: 'Weekly Summary Digest',
                    desc: 'A weekly summary of job views, proposals, and active contracts.'
                  }
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 rounded-2xl border border-surface-border bg-surface-subtle/40"
                  >
                    <div className="pr-4">
                      <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={notifications[item.key]}
                        onChange={(e) =>
                          setNotifications({ ...notifications, [item.key]: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600" />
                    </label>
                  </div>
                ))}

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Save className="h-4 w-4" /> Save Notification Preferences
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: Billing & Invoicing */}
          {activeTab === 'billing' && (
            <div className="bg-white rounded-3xl border border-surface-border p-6 md:p-8 shadow-card space-y-6">
              <div className="border-b border-surface-border pb-4">
                <h2 className="text-lg font-bold text-slate-900">Billing & Invoice Settings</h2>
                <p className="text-xs text-slate-500 mt-0.5">Configure invoicing details and business tax identification.</p>
              </div>

              <form onSubmit={handleSaveBilling} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                      Billing Legal Name
                    </label>
                    <input
                      type="text"
                      value={billingForm.billingName}
                      onChange={(e) => setBillingForm({ ...billingForm, billingName: e.target.value })}
                      placeholder="Company or Personal Name for Invoices"
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                      GSTIN / Tax ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={billingForm.taxId}
                      onChange={(e) => setBillingForm({ ...billingForm, taxId: e.target.value })}
                      placeholder="e.g. 27AAAAA0000A1Z5"
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                    Invoice Billing Address
                  </label>
                  <textarea
                    rows={3}
                    value={billingForm.billingAddress}
                    onChange={(e) => setBillingForm({ ...billingForm, billingAddress: e.target.value })}
                    placeholder="Registered business address for tax invoices..."
                    className="w-full px-4 py-3 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600 resize-none"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-xs text-orange-800 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Escrow Protected Invoicing</span>
                    SkillSphere provides itemized GST compliant invoices for all milestone deposits and platform service fees upon escrow funding.
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Save className="h-4 w-4" /> Save Billing Details
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientSettings;
