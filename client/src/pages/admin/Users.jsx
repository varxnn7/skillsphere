import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Toast from '../../components/Toast';
import ConfirmModal from '../../components/ui/ConfirmModal';
import DataTable from '../../components/admin/DataTable';
import UserRow from '../../components/admin/UserRow';
import { Search, ShieldAlert, UserCheck, Trash2 } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastConfig, setToastConfig] = useState(null);

  // Search/Filters states
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [isVerified, setIsVerified] = useState('');

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Bulk Selection states
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // Confirmation Modals states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    userIds: [], // Array to support both single and bulk actions
    action: null,
    title: '',
    message: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10
      };
      if (search) params.search = search;
      if (role) params.role = role;
      if (status) params.status = status;
      if (isVerified) params.isVerified = isVerified;

      const response = await api.get('/admin/users', { params });
      if (response.data.success) {
        setUsers(response.data.users || []);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages || 1);
          setTotalResults(response.data.pagination.totalResults || 0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch platform users:', err);
      setToastConfig({ message: 'Failed to load user accounts database.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    setSelectedUserIds([]); // Reset selection when query changes
  }, [page, role, status, isVerified]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleSelectUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map((u) => u._id));
    }
  };

  const triggerAction = (userIds, action) => {
    let title = '';
    let message = '';
    
    if (action === 'suspend') {
      title = 'Suspend Account(s)';
      message = `Are you sure you want to suspend ${userIds.length} account(s)? They will lose platform access.`;
    } else if (action === 'activate') {
      title = 'Reactivate Account';
      message = 'Are you sure you want to reactivate this user account?';
    } else if (action === 'delete') {
      title = 'Permanently Delete Account(s)';
      message = `WARNING: This will permanently delete ${userIds.length} user account(s) and all associated profiles, postings, and files. This is irreversible.`;
    } else if (action === 'verify') {
      title = 'Verify Freelancer';
      message = 'Are you sure you want to grant verification status and badge to this freelancer?';
    }

    setConfirmModal({
      isOpen: true,
      userIds,
      action,
      title,
      message
    });
  };

  const handleConfirmAction = async () => {
    const { userIds, action } = confirmModal;
    setConfirmModal({ ...confirmModal, isOpen: false });

    try {
      if (action === 'suspend' || action === 'delete') {
        // Execute sequentially or bulk if API supports. Since backend standard endpoints are singular, we'll run them sequentially
        for (const userId of userIds) {
          const url = action === 'suspend' ? `/admin/users/${userId}/suspend` : `/admin/users/${userId}`;
          if (action === 'suspend') {
            await api.put(url);
          } else {
            await api.delete(url);
          }
        }
        setToastConfig({ message: `Bulk action "${action}" completed successfully.`, type: 'success' });
      } else {
        // Singular verification or activation
        const userId = userIds[0];
        let url = `/admin/users/${userId}/activate`;
        if (action === 'verify') {
          url = `/admin/users/${userId}/verify`;
        }
        await api.put(url);
        setToastConfig({ message: `Action "${action}" completed successfully.`, type: 'success' });
      }
      setSelectedUserIds([]);
      fetchUsers();
    } catch (err) {
      setToastConfig({
        message: err.response?.data?.message || 'Failed to update user status.',
        type: 'error'
      });
    }
  };

  const columns = [
    {
      key: 'checkbox',
      label: (
        <input
          type="checkbox"
          checked={users.length > 0 && selectedUserIds.length === users.length}
          onChange={handleSelectAll}
          className="rounded border-dark-border bg-dark-surface text-brand-indigo focus:ring-brand-indigo cursor-pointer"
        />
      ),
      sortable: false
    },
    { key: 'name', label: 'Account User', sortable: true },
    { key: 'email', label: 'Email Address', sortable: true },
    { key: 'role', label: 'System Role', sortable: true },
    { key: 'createdAt', label: 'Joined', sortable: true },
    { key: 'isSuspended', label: 'Status', sortable: true },
    { key: 'isVerified', label: 'Verified', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
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

      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.action === 'delete' ? 'Permanently Delete' : 'Confirm'}
          confirmColor={confirmModal.action === 'delete' || confirmModal.action === 'suspend' ? 'red' : 'blue'}
          onConfirm={handleConfirmAction}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        />
      )}

      {/* Header */}
      <div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-brand-purple/15 text-brand-purple border border-brand-purple/30 mb-2">
          🛡️ Admin Control Panel
        </span>
        <h1 className="text-2xl font-extrabold text-white">Users Moderation</h1>
        <p className="text-xs text-[#94A3B8] mt-1">Suspend user access, verify freelancer qualifications, and manage system accounts.</p>
      </div>

      {/* Bulk action bar (if items selected) */}
      {selectedUserIds.length > 0 && (
        <div className="bg-white/5 border border-dark-border px-6 py-4 rounded-xl flex items-center justify-between animate-in slide-in-from-top-4 duration-150">
          <span className="text-xs font-bold text-slate-300">{selectedUserIds.length} user(s) selected</span>
          <div className="flex gap-2">
            <button
              onClick={() => triggerAction(selectedUserIds, 'suspend')}
              className="px-3.5 py-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold rounded-xl cursor-pointer transition-colors"
            >
              Suspend Selected
            </button>
            <button
              onClick={() => triggerAction(selectedUserIds, 'delete')}
              className="px-3.5 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Filters Form */}
      <div className="bg-dark-surface p-6 rounded-2xl border border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_0_20px_rgba(0,0,0,0.15)]">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-[#64748B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name or email address..."
              className="w-full pl-9 pr-4 py-3 rounded-xl border border-dark-border bg-dark-surface text-xs text-white placeholder:text-[#475569] focus:outline-none focus:ring-2 focus:ring-brand-indigo"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-3 rounded-xl bg-gradient-brand hover-glow-purple text-white font-bold text-xs cursor-pointer transition-all"
          >
            Search
          </button>
        </form>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-dark-border bg-dark-surface text-xs text-white"
          >
            <option value="">All Roles</option>
            <option value="client">Client</option>
            <option value="freelancer">Freelancer</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-dark-border bg-dark-surface text-xs text-white"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>

          <select
            value={isVerified}
            onChange={(e) => { setIsVerified(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-dark-border bg-dark-surface text-xs text-white"
          >
            <option value="">All Verifications</option>
            <option value="true">Verified Freelancers</option>
            <option value="false">Unverified</option>
          </select>
        </div>
      </div>

      {/* Users table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        renderRow={(user) => (
          <UserRow
            key={user._id}
            user={user}
            selected={selectedUserIds.includes(user._id)}
            onSelect={handleSelectUser}
            onSuspend={(id, act) => triggerAction([id], act)}
            onVerify={(id) => triggerAction([id], 'verify')}
            onDelete={(id) => triggerAction([id], 'delete')}
          />
        )}
      />

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-[#64748B] font-bold">Showing page {page} of {totalPages} ({totalResults} total accounts)</span>
          
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3.5 py-2 bg-white/5 border border-dark-border text-[#94A3B8] text-xs font-bold rounded-xl cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:border-brand-indigo/40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3.5 py-2 bg-white/5 border border-dark-border text-[#94A3B8] text-xs font-bold rounded-xl cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:border-brand-indigo/40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
