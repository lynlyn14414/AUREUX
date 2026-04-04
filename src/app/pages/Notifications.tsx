import React from 'react';
import { motion } from 'motion/react';
import { Bell, UserPlus, Heart, MessageCircle, Check, Trash2 } from 'lucide-react';
import { useApp, Notification } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

export function Notifications() {
  const { user, notifications, markNotificationsRead, users } = useApp();
  const navigate = useNavigate();

  if (!user) {
    navigate('/auth');
    return null;
  }

  const userNotifications = notifications.filter(n => n.toUserId === user.id).sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'friend_request': return <UserPlus size={20} className="text-blue-400" />;
      case 'like': return <Heart size={20} className="text-pink-400" />;
      case 'comment': return <MessageCircle size={20} className="text-green-400" />;
      default: return <Bell size={20} className="text-purple-400" />;
    }
  };

  const getMessage = (notif: Notification) => {
    switch (notif.type) {
      case 'friend_request':
        return (
          <>
            <span className="font-semibold text-white">{notif.fromUsername}</span> added you as a friend!
          </>
        );
      case 'like':
        return (
          <>
            <span className="font-semibold text-white">{notif.fromUsername}</span> liked your post
          </>
        );
      case 'comment':
        return (
          <>
            <span className="font-semibold text-white">{notif.fromUsername}</span> commented on your post
          </>
        );
      default:
        return notif.message;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-700 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Bell className="text-purple-400" size={28} />
                Notifications
              </h1>
              <p className="text-slate-400 mt-2">Stay updated on friend requests, likes, and comments</p>
            </div>
            {userNotifications.some(n => !n.read) && (
              <button
                onClick={markNotificationsRead}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium"
              >
                <Check size={16} />
                Mark all read
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-700">
            {userNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell size={48} className="text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No notifications yet</p>
                <p className="text-slate-500 text-sm mt-2">When someone adds you as a friend, likes or comments on your posts, you'll see it here</p>
              </div>
            ) : (
              userNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 flex items-start gap-4 hover:bg-slate-700/50 transition-colors ${!notif.read ? 'bg-purple-900/10' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!notif.read ? 'bg-purple-600/20' : 'bg-slate-700'}`}>
                    {getIcon(notif.type)}
                  </div>
                  
                  <div className="flex-1">
                    <Link 
                      to={`/user/${notif.fromUserId}`}
                      className="text-slate-300 hover:text-white"
                    >
                      {getMessage(notif)}
                    </Link>
                    <p className="text-slate-500 text-sm mt-1">{formatTime(notif.timestamp)}</p>
                  </div>
                  
                  {!notif.read && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
