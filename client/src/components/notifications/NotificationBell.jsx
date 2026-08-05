import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Bell, 
  MessageSquare, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  CreditCard, 
  ShieldAlert, 
  Award,
  Circle
} from 'lucide-react';
import useNotifications from '../../hooks/useNotifications';

const NotificationBell = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const { fetchUnreadCount, fetchNotifications, markAsRead, markAllRead, deleteNotification } = useNotifications();

  useEffect(() => {
    fetchUnreadCount();
    if (isOpen) {
      fetchNotifications(1, 8);
    }
  }, [fetchUnreadCount, fetchNotifications, isOpen]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_message':
        return <MessageSquare className="h-4 w-4 text-sky-500" />;
      case 'new_proposal':
        return <FileText className="h-4 w-4 text-amber-500" />;
      case 'proposal_accepted':
      case 'account_verified':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'proposal_rejected':
        return <XCircle className="h-4 w-4 text-rose-500" />;
      case 'payment_received':
      case 'payment_released':
        return <CreditCard className="h-4 w-4 text-orange-500" />;
      case 'dispute_opened':
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case 'review_added':
        return <Award className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  const handleNotificationClick = async (notif) => {
    setIsOpen(false);
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const formatTime = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-xl border transition-all cursor-pointer relative ${
          isOpen
            ? 'bg-orange-50 border-orange-200 text-orange-600'
            : 'border-surface-border hover:border-orange-200 text-slate-500 hover:text-orange-600 hover:bg-orange-50'
        }`}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-[9px] font-extrabold text-slate-900 flex items-center justify-center rounded-full animate-pulse border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-surface-border rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] overflow-hidden animate-fade-up">
          {/* Header */}
          <div className="px-4 py-3 border-b border-surface-border flex justify-between items-center bg-surface-subtle">
            <span className="text-xs font-extrabold text-slate-800">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] font-extrabold text-orange-600 hover:text-orange-700 transition-colors cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List items */}
          <div className="max-h-64 overflow-y-auto divide-y divide-surface-border">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-1.5">
                <Bell className="h-5 w-5 text-slate-300" />
                No new notifications
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`px-4 py-3 flex items-start gap-3 hover:bg-surface-subtle transition-colors cursor-pointer relative ${
                    !notif.isRead ? 'bg-orange-50/50' : ''
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-surface-muted border border-surface-border">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-xs font-bold truncate ${!notif.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                      {notif.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                    <span className="text-[9px] text-slate-400 font-bold mt-1 block">
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>
                  {!notif.isRead && (
                    <Circle className="h-2 w-2 text-orange-500 fill-orange-500 flex-shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <Link
            to="/notifications"
            onClick={() => setIsOpen(false)}
            className="block text-center py-2.5 text-[10px] font-extrabold text-slate-500 hover:text-orange-600 hover:bg-orange-50 border-t border-surface-border transition-colors"
          >
            View All Notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
