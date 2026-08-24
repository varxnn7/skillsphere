import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  CreditCard,
  Sliders,
  Database,
  Check,
  AlertTriangle,
  RefreshCw,
  Save,
  Server,
  Lock,
  Mail,
  Zap,
  Globe
} from 'lucide-react';
import Toast from '../../components/Toast';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [toastConfig, setToastConfig] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    // General
    platformName: 'SkillSphere',
    supportEmail: 'varunkukreja017@gmail.com',
    platformCommissionRate: 10,
    hyperlocalRadiusKm: 25,
    maintenanceMode: false,
    currencySymbol: '₹',

    // Escrow & Payments
    gatewayMode: 'mock',
    autoReleaseDays: 14,
    minEscrowAmount: 500,
    instantPayoutEnabled: true,
    webhookStatus: 'Healthy (Last ping 2m ago)',

    // Moderation & Security
    requireGigApproval: false,
    autoSuspendDisputed: false,
    maxUploadSizeMb: 25,
    bannedKeywords: 'telegram, whatsapp, bitcoin, crypto investment, pay outside platform',
    allowedFileTypes: '.pdf, .docx, .zip, .png, .jpg, .svg',

    // System
    jwtExpiryDays: 7,
    maxLoginAttempts: 5,
    force2FAForAdmins: false,
    cacheStatus: 'Operational (0.42ms latency)'
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setToastConfig({ message: 'Global system configuration updated successfully!', type: 'success' });
    }, 600);
  };

  const handleFlushCache = () => {
    setToastConfig({ message: 'System Redis and memory cache flushed successfully.', type: 'info' });
  };

  const tabs = [
    { id: 'general', label: 'Platform & Brand', icon: Globe },
    { id: 'payments', label: 'Escrow & Financials', icon: CreditCard },
    { id: 'moderation', label: 'Moderation & Anti-Spam', icon: Shield },
    { id: 'security', label: 'Security & Auth', icon: Lock },
    { id: 'system', label: 'System Health', icon: Server }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {toastConfig && (
        <Toast
          message={toastConfig.message}
          type={toastConfig.type}
          onClose={() => setToastConfig(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border/40 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-orange-50 text-orange-700 border border-orange-200 mb-2">
            <SettingsIcon className="h-3 w-3 text-orange-600" />
            Global Control Center
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">Global System Settings</h1>
          <p className="text-xs text-slate-500 mt-1">Configure platform commission fees, escrow security rules, moderation engines, and system diagnostics.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Saving Configuration...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Main Grid: Tabs + Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-orange-50 text-orange-600 border border-orange-200/80 shadow-xs'
                    : 'text-slate-600 hover:bg-surface-subtle hover:text-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-orange-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          <div className="bg-white border border-surface-border rounded-3xl p-6 md:p-8 shadow-card space-y-6">
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Platform & Brand Preferences</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manage public metadata, contact channels, and hyperlocal matching boundaries.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Platform Name</label>
                    <input
                      type="text"
                      value={settings.platformName}
                      onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-600/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Support Desk Email</label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-600/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Platform Commission Fee (%)</label>
                    <input
                      type="number"
                      value={settings.platformCommissionRate}
                      onChange={(e) => setSettings({ ...settings, platformCommissionRate: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-600/30"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Current take rate applied across contract payouts (Default: 10%).</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Default Hyperlocal Radius (km)</label>
                    <input
                      type="number"
                      value={settings.hyperlocalRadiusKm}
                      onChange={(e) => setSettings({ ...settings, hyperlocalRadiusKm: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-600/30"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Radius boundary for nearby talent matching.</span>
                  </div>
                </div>

                {/* Maintenance Mode Toggle */}
                <div className="flex items-center justify-between p-4 bg-orange-50/60 border border-orange-200/80 rounded-2xl">
                  <div>
                    <span className="block text-xs font-extrabold text-slate-900">Platform Maintenance Mode</span>
                    <span className="text-xs text-slate-500">Temporarily restrict public registrations and gig creation during scheduled updates.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600" />
                  </label>
                </div>
              </div>
            )}

            {/* PAYMENTS TAB */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Escrow & Payment Gateway Parameters</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Configure Razorpay connection, automated release timers, and disbursement security.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Payment Gateway Engine</label>
                    <select
                      value={settings.gatewayMode}
                      onChange={(e) => setSettings({ ...settings, gatewayMode: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-600/30"
                    >
                      <option value="mock">Razorpay Mock Simulation (Instant Escrow)</option>
                      <option value="live">Razorpay Live Production Gateway</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Auto-Release Escrow Window (Days)</label>
                    <input
                      type="number"
                      value={settings.autoReleaseDays}
                      onChange={(e) => setSettings({ ...settings, autoReleaseDays: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-600/30"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Release funds automatically if client remains silent post-delivery.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Minimum Escrow Deposit (₹)</label>
                    <input
                      type="number"
                      value={settings.minEscrowAmount}
                      onChange={(e) => setSettings({ ...settings, minEscrowAmount: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-600/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Razorpay Webhook Status</label>
                    <div className="px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      {settings.webhookStatus}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-subtle border border-surface-border rounded-2xl">
                  <div>
                    <span className="block text-xs font-extrabold text-slate-900">Instant Freelancer Payouts</span>
                    <span className="text-xs text-slate-500">Allow freelancers to withdraw approved milestone earnings to their bank immediately.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.instantPayoutEnabled}
                      onChange={(e) => setSettings({ ...settings, instantPayoutEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600" />
                  </label>
                </div>
              </div>
            )}

            {/* MODERATION TAB */}
            {activeTab === 'moderation' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Content Moderation & Anti-Spam Guard</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Protect clients and freelancers from fraudulent jobs, off-platform solicitations, and spam.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-surface-subtle border border-surface-border rounded-2xl">
                    <div>
                      <span className="block text-xs font-extrabold text-slate-900">Require Admin Approval for New Gigs</span>
                      <span className="text-xs text-slate-500">When enabled, newly posted gigs will stay in "Pending" tab until an admin approves them.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.requireGigApproval}
                        onChange={(e) => setSettings({ ...settings, requireGigApproval: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600" />
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Banned / Flagged Keywords Filter</label>
                    <textarea
                      rows="3"
                      value={settings.bannedKeywords}
                      onChange={(e) => setSettings({ ...settings, bannedKeywords: e.target.value })}
                      placeholder="Comma-separated forbidden words"
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-600/30 resize-none"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Gigs or proposals containing these words will be flagged for moderation review.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Max Attachment Size (MB)</label>
                      <input
                        type="number"
                        value={settings.maxUploadSizeMb}
                        onChange={(e) => setSettings({ ...settings, maxUploadSizeMb: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-600/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Allowed Deliverable Formats</label>
                      <input
                        type="text"
                        value={settings.allowedFileTypes}
                        onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-600/30"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Authentication & Security Policies</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Control token expiration, password safeguards, and role permission enforcement.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">JWT Session Expiry (Days)</label>
                    <input
                      type="number"
                      value={settings.jwtExpiryDays}
                      onChange={(e) => setSettings({ ...settings, jwtExpiryDays: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-600/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Max Failed Login Attempts</label>
                    <input
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => setSettings({ ...settings, maxLoginAttempts: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-surface-subtle text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-600/30"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-subtle border border-surface-border rounded-2xl">
                  <div>
                    <span className="block text-xs font-extrabold text-slate-900">Enforce 2-Factor Authentication for Admins</span>
                    <span className="text-xs text-slate-500">Require OTP validation for administrative dashboard access.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.force2FAForAdmins}
                      onChange={(e) => setSettings({ ...settings, force2FAForAdmins: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600" />
                  </label>
                </div>
              </div>
            )}

            {/* SYSTEM HEALTH TAB */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">System Diagnostics & Storage Health</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Live status of backend services, media pipelines, and memory caches.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl border border-surface-border bg-surface-subtle">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-600">Database Engine</span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                    <p className="text-sm font-extrabold text-slate-900">MongoDB Atlas</p>
                    <p className="text-[11px] text-emerald-600 font-bold mt-1">Connected · Primary Cluster</p>
                  </div>

                  <div className="p-4 rounded-2xl border border-surface-border bg-surface-subtle">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-600">Media CDN</span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                    <p className="text-sm font-extrabold text-slate-900">Cloudinary API</p>
                    <p className="text-[11px] text-emerald-600 font-bold mt-1">Ready · Unlimited CDN</p>
                  </div>

                  <div className="p-4 rounded-2xl border border-surface-border bg-surface-subtle">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-600">WebSocket Service</span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                    <p className="text-sm font-extrabold text-slate-900">Socket.IO Server</p>
                    <p className="text-[11px] text-emerald-600 font-bold mt-1">Active · Real-time Bus</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl gap-4">
                  <div>
                    <span className="block text-xs font-extrabold text-slate-900">Cache Invalidation Engine</span>
                    <span className="text-xs text-slate-500">Flush application cache and reload fresh database schemas.</span>
                  </div>
                  <button
                    onClick={handleFlushCache}
                    className="px-4 py-2 rounded-xl bg-white border border-surface-border hover:border-slate-400 text-slate-700 text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    Flush Cache
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
