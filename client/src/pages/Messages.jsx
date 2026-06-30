import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  Search, 
  ArrowLeft, 
  Clock, 
  FileText, 
  User as UserIcon,
  Check,
  CheckCheck,
  ChevronRight,
  Smile
} from 'lucide-react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { setConversations, setMessages } from '../store/messagesSlice';
import useChat from '../hooks/useChat';
import useSocket from '../hooks/useSocket';

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  
  // Hooks
  useSocket(); // Trigger socket connection
  const { sendMessage, sendTypingStart, sendTypingStop, markRead } = useChat(conversationId);

  // Redux State
  const { user } = useSelector((state) => state.auth);
  const { conversations, messages, typingUsers, onlineUsers, loading } = useSelector((state) => state.messages);

  // Local UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [inputText, setInputText] = useState('');
  const [activeConv, setActiveConv] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [attachment, setAttachment] = useState(null); // { url, name, size, type }
  const typingTimeoutRef = useRef(null);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Fetch conversations list on mount
  useEffect(() => {
    const fetchConversationsList = async () => {
      try {
        const response = await api.get('/conversations');
        if (response.data.success) {
          dispatch(setConversations(response.data.conversations));
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      }
    };
    fetchConversationsList();
  }, [dispatch]);

  // Load selected conversation details and messages
  useEffect(() => {
    if (!conversationId) {
      setActiveConv(null);
      return;
    }

    const fetchMessagesList = async () => {
      try {
        const response = await api.get(`/conversations/${conversationId}`);
        if (response.data.success) {
          setActiveConv(response.data.conversation);
          dispatch(setMessages(response.data.messages));
        }
      } catch (err) {
        console.error('Failed to load conversation messages:', err);
        navigate('/messages');
      }
    };

    fetchMessagesList();
  }, [conversationId, dispatch, navigate]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing status notification
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    
    if (!typingTimeoutRef.current) {
      sendTypingStart();
    } else {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStop();
      typingTimeoutRef.current = null;
    }, 2000);
  };

  // Attachment upload handler
  const handleAttachment = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(20);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data.success) {
        setUploadProgress(100);
        setAttachment({
          url: response.data.fileUrl,
          name: response.data.fileName,
          size: response.data.fileSize,
          type: file.type.startsWith('image/') ? 'image' : 'file'
        });
      }
    } catch (err) {
      console.error('Attachment upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  // Send Message
  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() && !attachment) return;

    if (attachment) {
      sendMessage(attachment.name, attachment.type, attachment.url, attachment.name, attachment.size);
      setAttachment(null);
    } else {
      sendMessage(inputText);
    }

    setInputText('');
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    sendTypingStop();
  };

  // Get recipient profile details
  const getRecipient = (conv) => {
    return conv.participants?.find(p => p._id !== user.id) || {};
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const recipient = getRecipient(conv);
    return recipient.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Group messages by date separators
  const groupMessagesByDate = (msgList) => {
    const groups = {};
    msgList.forEach(msg => {
      const date = new Date(msg.createdAt).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return Object.entries(groups);
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col transition-smooth">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex relative z-10 h-[calc(100vh-70px)] overflow-hidden">
        
        {/* Main portal grid container */}
        <div className="w-full flex bg-[#111118] border border-dark-border/80 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.3)]">
          
          {/* LEFT PANEL: Conversation lists */}
          <div className={`w-full md:w-80 border-r border-dark-border/50 flex flex-col ${conversationId ? 'hidden md:flex' : 'flex'}`}>
            {/* Search Header */}
            <div className="p-4 border-b border-dark-border/40 space-y-4">
              <h2 className="text-lg font-extrabold text-white">Inbox Chat</h2>
              <div className="relative">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#475569]" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-dark-border bg-[rgba(255,255,255,0.02)] text-white text-xs placeholder:text-[#475569] focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-smooth"
                />
              </div>
            </div>

            {/* Convo List */}
            <div className="flex-1 overflow-y-auto divide-y divide-dark-border/30 scrollbar-premium">
              {filteredConversations.length === 0 ? (
                <div className="py-20 text-center text-xs text-[#94A3B8] flex flex-col items-center justify-center gap-2">
                  <UserIcon className="h-6 w-6 text-slate-600" />
                  No conversations found
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const recipient = getRecipient(conv);
                  const isActive = conv._id === conversationId;
                  const isOnline = onlineUsers.includes(recipient._id);
                  const isUnread = conv.unreadCountCurrent > 0;

                  return (
                    <div
                      key={conv._id}
                      onClick={() => navigate(`/messages/${conv._id}`)}
                      className={`p-4 flex items-center gap-3 hover:bg-white/5 transition-all cursor-pointer relative ${
                        isActive ? 'bg-white/5 border-l-4 border-brand-purple' : ''
                      }`}
                    >
                      {/* Avatar with online dot */}
                      <div className="relative">
                        <img
                          src={recipient.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80'}
                          alt={recipient.name}
                          className="h-10 w-10 rounded-full object-cover border border-dark-border/60"
                        />
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 bg-[#10B981] border-2 border-[#111118] rounded-full" />
                        )}
                      </div>

                      {/* Summary details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-white truncate">{recipient.name}</h4>
                          <span className="text-[10px] text-[#64748B] font-medium">
                            {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString(undefined, { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className={`text-[11px] truncate mt-1 leading-normal ${isUnread ? 'text-white font-extrabold' : 'text-[#94A3B8]'}`}>
                          {conv.lastMessage?.type === 'image' ? 'Sent an image' : conv.lastMessage?.type === 'file' ? 'Shared a document' : conv.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>

                      {/* Unread dot badge */}
                      {isUnread && (
                        <span className="h-4 w-4 bg-brand-purple text-[9px] font-extrabold text-white flex items-center justify-center rounded-full">
                          {conv.unreadCountCurrent}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Messaging interface */}
          <div className={`flex-1 flex flex-col h-full bg-[rgba(255,255,255,0.01)] ${!conversationId ? 'hidden md:flex justify-center items-center' : 'flex'}`}>
            {activeConv ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-dark-border/40 flex justify-between items-center bg-[#111118]/80 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate('/messages')}
                      className="md:hidden p-1.5 rounded-xl border border-dark-border text-[#94A3B8] hover:text-white cursor-pointer mr-1"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>

                    <div className="relative">
                      <img
                        src={getRecipient(activeConv).avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80'}
                        alt={getRecipient(activeConv).name}
                        className="h-10 w-10 rounded-full object-cover border border-dark-border/60"
                      />
                      {onlineUsers.includes(getRecipient(activeConv)._id) && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 bg-[#10B981] border-2 border-[#111118] rounded-full" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-white">{getRecipient(activeConv).name}</h3>
                      <p className="text-[10px] text-[#94A3B8] mt-0.5 font-medium uppercase tracking-wider">
                        {onlineUsers.includes(getRecipient(activeConv)._id) ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>

                  {/* Gig context if any */}
                  {activeConv.gig && (
                    <div className="hidden lg:flex flex-col items-end px-3 py-1.5 rounded-xl border border-brand-purple/20 bg-brand-purple/5 text-[10px] font-bold">
                      <span className="text-brand-purple uppercase tracking-wider">Gig Context</span>
                      <span className="text-white mt-0.5 truncate max-w-[150px]">{activeConv.gig.title}</span>
                    </div>
                  )}
                </div>

                {/* Messages Ledger Display */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-premium bg-[#0A0A0F]/50">
                  {messageGroups.map(([date, msgs]) => (
                    <div key={date} className="space-y-4">
                      {/* Date separator */}
                      <div className="flex justify-center">
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-dark-border/30 text-[9px] font-extrabold text-[#64748B] uppercase tracking-wider">
                          {date}
                        </span>
                      </div>

                      {/* Messages loop */}
                      {msgs.map((msg) => {
                        const isMe = msg.sender._id === user.id || msg.sender === user.id;

                        return (
                          <div
                            key={msg._id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className="max-w-[70%] space-y-1">
                              {/* Bubble */}
                              <div
                                className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                                  isMe
                                    ? 'bg-brand-purple text-white rounded-tr-none'
                                    : 'bg-dark-surface border border-dark-border/80 text-[#E2E8F0] rounded-tl-none'
                                }`}
                              >
                                {/* Media attachment block */}
                                {msg.type === 'image' && (
                                  <div className="mb-2 overflow-hidden rounded-lg border border-dark-border/30">
                                    <img src={msg.fileUrl} alt="attachment" className="max-h-48 object-cover w-full" />
                                  </div>
                                )}
                                
                                {msg.type === 'file' && (
                                  <a
                                    href={msg.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mb-2 p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-colors"
                                  >
                                    <FileText className="h-5 w-5 text-brand-purple" />
                                    <div className="flex-1 min-w-0 text-left">
                                      <p className="text-[11px] font-bold truncate text-white">{msg.fileName}</p>
                                      <p className="text-[9px] text-[#94A3B8]">{(msg.fileSize / 1024).toFixed(1)} KB</p>
                                    </div>
                                  </a>
                                )}

                                <p className="whitespace-pre-wrap">{msg.content}</p>
                              </div>

                              {/* Time + Receipt ticks */}
                              <div className={`flex items-center gap-1.5 text-[9px] text-[#64748B] font-bold ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <span>
                                  {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isMe && (
                                  msg.isRead ? (
                                    <CheckCheck className="h-3.5 w-3.5 text-brand-purple" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5 text-[#475569]" />
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {typingUsers[conversationId]?.length > 0 && (
                    <div className="flex justify-start">
                      <div className="p-3 bg-dark-surface border border-dark-border/60 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                        <div className="h-2 w-2 bg-brand-purple rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-2 w-2 bg-brand-purple rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-2 w-2 bg-brand-purple rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="p-4 border-t border-dark-border/40 bg-[#111118]">
                  
                  {/* File Upload Progress */}
                  {uploading && (
                    <div className="mb-3 flex items-center justify-between gap-3 text-xs font-bold text-brand-purple">
                      <span>Uploading document...</span>
                      <div className="flex-1 h-1.5 bg-dark-border rounded-lg overflow-hidden relative">
                        <div className="h-full bg-brand-purple transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <span>{uploadProgress}%</span>
                    </div>
                  )}

                  {/* Attachment Preview Card */}
                  {attachment && (
                    <div className="mb-3 p-3 rounded-2xl border border-brand-purple/20 bg-brand-purple/5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {attachment.type === 'image' ? (
                          <img src={attachment.url} alt="preview" className="h-10 w-10 rounded-lg object-cover border border-dark-border" />
                        ) : (
                          <FileText className="h-8 w-8 text-brand-purple flex-shrink-0" />
                        )}
                        <div className="min-w-0 text-left">
                          <p className="text-[11px] font-bold text-white truncate">{attachment.name}</p>
                          <p className="text-[9px] text-[#94A3B8]">{(attachment.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setAttachment(null)}
                        className="text-[#64748B] hover:text-white text-xs font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Text Input Row */}
                  <form onSubmit={handleSend} className="flex gap-3 items-center">
                    
                    {/* File Attachment Dropdowns */}
                    <div className="flex gap-1">
                      <label className="p-2.5 rounded-xl border border-dark-border hover:border-white/20 text-[#94A3B8] hover:text-white cursor-pointer hover:bg-white/5 transition-colors">
                        <Paperclip className="h-4 w-4" />
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleAttachment}
                          accept=".pdf,.doc,.docx"
                        />
                      </label>
                      <label className="p-2.5 rounded-xl border border-dark-border hover:border-white/20 text-[#94A3B8] hover:text-white cursor-pointer hover:bg-white/5 transition-colors">
                        <ImageIcon className="h-4 w-4" />
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleAttachment}
                          accept="image/*"
                        />
                      </label>
                    </div>

                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={inputText}
                      onChange={handleInputChange}
                      disabled={uploading}
                      className="flex-1 px-4 py-3 rounded-xl border border-dark-border bg-[rgba(255,255,255,0.02)] text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-smooth"
                    />

                    <button
                      type="submit"
                      disabled={uploading || (!inputText.trim() && !attachment)}
                      className="p-3 bg-gradient-brand text-white rounded-xl shadow-lg hover-glow-purple flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>

                  </form>
                </div>
              </>
            ) : (
              <div className="py-20 text-center space-y-4 max-w-sm">
                <div className="h-16 w-16 bg-brand-purple/10 border border-brand-purple/25 rounded-3xl flex items-center justify-center text-brand-purple mx-auto">
                  <Send className="h-6 w-6" />
                </div>
                <h3 className="text-md font-extrabold text-white">Select a Conversation</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Start messaging freelancers and clients directly from your inbox list.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Messages;
