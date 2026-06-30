import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  MessageSquare, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  CreditCard, 
  ShieldAlert, 
  Award,
  Trash2,
  CheckCheck,
  Circle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import useNotifications from '../hooks/useNotifications';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading } = useSelector((state) => state.notifications);
  const { fetchNotifications, markAsRead, markAllRead, deleteNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');
  const [toastConfig, setToastConfig] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_message':
        return <MessageSquare className="h-5 w-5 text-sky-400" />;
      case 'new_proposal':
        return <FileText className="h-5 w-5 text-amber-400" />;
      case 'proposal_accepted':
      case 'account_verified':
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case 'proposal_rejected':
        return <XCircle className="h-5 w-5 text-rose-400" />;
      case 'payment_received':
      case 'payment_released':
        return <CreditCard className="h-5 w-5 text-brand-purple" />;
      case 'dispute_opened':
        return <ShieldAlert className="h-5 w-5 text-red-500" />;
      case 'review_added':
        return <Award className="h-5 w-5 text-yellow-400" />;
      default:
        return <Bell className="h-5 w-5 text-[#94A3B8]" />;
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Avoid triggering click navigations
    await deleteNotification(id);
    setToastConfig({ message: 'Notification deleted.', type: 'success' });
  };

  const formatTime = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'messages', label: 'Messages', types: ['new_message'] },
    { id: 'proposals', label: 'Proposals', types: ['new_proposal', 'proposal_accepted', 'proposal_rejected'] },
    { id: 'contracts', label: 'Contracts', types: ['payment_received', 'payment_released', 'review_added'] }
  ];

  const filteredNotifications = notifications.filter(notif => {
    const currentTab = tabs.find(t => t.id === activeTab);
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notif.isRead;
    if (currentTab?.types) {
      return currentTab.types.includes(notif.type);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col transition-smooth">
      <Navbar />

      <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 space-y-8 relative z-10 animate-fade-up">
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border/40 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Notifications Center</h1>
            <p className="text-[#94A3B8] text-sm mt-1">Review alerts, contract status logs, and active chat indicators.</p>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-purple/20 bg-brand-purple/5 text-brand-purple text-xs font-bold hover:bg-brand-purple/10 cursor-pointer transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              Mark All Read
            </button>
          )}
        </div>

        {/* Tab filters */}
        <div className="border-b border-dark-border/40 pb-3 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeTab === tab.id
                  ? 'bg-brand-purple/15 border-brand-purple/35 text-brand-purple font-extrabold'
                  : 'border-transparent text-[#94A3B8] hover:bg-white/5 hover:text-white'
              } cursor-pointer`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid displays */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <LoadingSpinner size="lg" color="white" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-20 bg-dark-surface/30 border border-dark-border rounded-3xl p-8 max-w-md mx-auto space-y-3">
            <Bell className="h-10 w-10 mx-auto text-[#64748B]" />
            <h3 className="text-sm font-bold text-white">All caught up!</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              No notifications found matching your active tab selection.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 flex items-center justify-between gap-4 rounded-2xl border transition-all cursor-pointer ${
                  !notif.isRead
                    ? 'bg-brand-purple/5 border-brand-purple/20 shadow-sm'
                    : 'bg-dark-surface border-dark-border hover:border-white/10'
                }`}
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="p-2 rounded-xl bg-white/5 border border-dark-border/40 flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-xs font-bold truncate ${!notif.isRead ? 'text-white' : 'text-[#E2E8F0]'}`}>
                        {notif.title}
                      </h3>
                      {!notif.isRead && (
                        <Circle className="h-2 w-2 text-brand-purple fill-brand-purple flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed mt-1">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-[#64748B] font-bold mt-1.5 block">
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDelete(e, notif._id)}
                  className="p-2 rounded-xl border border-transparent hover:border-dark-border hover:bg-white/5 text-[#64748B] hover:text-[#EF4444] transition-all cursor-pointer"
                  title="Delete Alert"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

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

export default Notifications;
