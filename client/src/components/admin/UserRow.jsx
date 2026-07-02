import React from 'react';
import { UserCheck, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';

const UserRow = ({ user, selected, onSelect, onSuspend, onVerify, onDelete }) => {
  const formattedDate = new Date(user.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <tr className="hover:bg-white/[0.01] text-slate-300 border-b border-dark-border/40 text-xs">
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(user._id)}
          className="rounded border-dark-border bg-dark-surface text-brand-indigo focus:ring-brand-indigo cursor-pointer"
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=40'}
            alt={user.name}
            className="h-8 w-8 rounded-full border border-dark-border object-cover"
          />
          <span className="font-bold text-white">{user.name}</span>
        </div>
      </td>
      <td className="px-6 py-4 font-mono">{user.email}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
          user.role === 'admin' ? 'bg-red-500/10 text-red-400' :
          user.role === 'freelancer' ? 'bg-purple-500/10 text-purple-400' :
          'bg-blue-500/10 text-blue-400'
        }`}>
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4 text-slate-400">{formattedDate}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
          user.isSuspended ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
        }`}>
          {user.isSuspended ? 'Suspended' : 'Active'}
        </span>
      </td>
      <td className="px-6 py-4">
        {user.role === 'freelancer' ? (
          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
            user.isVerified ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-[#64748B]'
          }`}>
            {user.isVerified ? 'Verified' : 'Unverified'}
          </span>
        ) : (
          <span className="text-[#64748B]">-</span>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
          {user.role === 'freelancer' && !user.isVerified && (
            <button
              onClick={() => onVerify(user._id)}
              className="p-1.5 rounded-lg bg-white/5 border border-dark-border hover:border-green-500/40 text-[#94A3B8] hover:text-green-400 cursor-pointer transition-colors"
              title="Verify Freelancer"
            >
              <ShieldCheck className="h-4 w-4" />
            </button>
          )}
          {user.isSuspended ? (
            <button
              onClick={() => onSuspend(user._id, 'activate')}
              className="p-1.5 rounded-lg bg-white/5 border border-dark-border hover:border-green-500/40 text-[#94A3B8] hover:text-green-400 cursor-pointer transition-colors"
              title="Activate Account"
            >
              <UserCheck className="h-4 w-4" />
            </button>
          ) : (
            user.role !== 'admin' && (
              <button
                onClick={() => onSuspend(user._id, 'suspend')}
                className="p-1.5 rounded-lg bg-white/5 border border-dark-border hover:border-red-500/40 text-[#94A3B8] hover:text-red-400 cursor-pointer transition-colors"
                title="Suspend Account"
              >
                <ShieldAlert className="h-4 w-4" />
              </button>
            )
          )}
          {user.role !== 'admin' && (
            <button
              onClick={() => onDelete(user._id)}
              className="p-1.5 rounded-lg bg-white/5 border border-dark-border hover:border-red-500/40 text-[#94A3B8] hover:text-red-400 cursor-pointer transition-colors"
              title="Delete Account Permanent"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default UserRow;
