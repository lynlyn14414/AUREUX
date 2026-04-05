import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, ArrowLeft, Search, User, Circle, Check, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp, ChatMessage } from '../context/AppContext';
import { Link } from 'react-router-dom';

export function Chat() {
  const { user, users, following, isFriend, conversations, sendMessage, getConversation, markMessagesAsRead, getUnreadCount } = useApp();
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [myFollowers, setMyFollowers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch my followers from server
  useEffect(() => {
    const fetchFollowers = async () => {
      if (user?.id) {
        try {
          const res = await fetch(`/api/followers/${user.id}`);
          if (res.ok) {
            const data = await res.json();
            setMyFollowers(data);
          }
        } catch (e) {
          console.error('Failed to fetch followers:', e);
        }
      }
    };
    fetchFollowers();
    const interval = setInterval(fetchFollowers, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Only show mutual friends (people who follow you back)
  const mutualFriends = following.filter(id => myFollowers.includes(id));
  const friendUsers = mutualFriends.map(friendId => users.find(u => u.id === friendId)).filter(Boolean);
  
  const filteredFriends = friendUsers.filter(friend => 
    friend?.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedFriendUser = selectedFriend ? users.find(u => u.id === selectedFriend) : null;
  const currentConversation = selectedFriend ? getConversation(selectedFriend) : undefined;

  useEffect(() => {
    if (selectedFriend) {
      markMessagesAsRead(selectedFriend);
    }
  }, [selectedFriend, currentConversation?.messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedFriend) return;
    sendMessage(selectedFriend, messageInput);
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getUnreadCountForFriend = (friendId: string) => {
    const conv = getConversation(friendId);
    if (!conv || !user) return 0;
    return conv.messages.filter(m => m.receiverId === user.id && !m.read).length;
  };

  const getLastMessage = (friendId: string) => {
    const conv = getConversation(friendId);
    return conv?.lastMessage;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-slate-800 p-6 rounded-full mb-6">
          <MessageCircle size={48} className="text-purple-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Private Messages</h2>
        <p className="text-slate-400 max-w-md mb-8">
          Login to chat privately with your friends.
        </p>
        <Link 
          to="/auth" 
          className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
        >
          Login / Register
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl" style={{ height: 'calc(100vh - 180px)' }}>
        <div className="flex h-full">
          
          <div className={`${selectedFriend ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-slate-700`}>
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search following..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {mutualFriends.length === 0 ? (
                <div className="p-6 text-center">
                  <User size={48} className="text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-2">No friends yet</p>
                  <p className="text-slate-500 text-sm mb-4">You can only chat with mutual friends (people who follow you back)</p>
                  <Link to="/social" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                    Find People
                  </Link>
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-slate-400">No friends match your search</p>
                </div>
              ) : (
                filteredFriends.map(friend => {
                  if (!friend) return null;
                  const unread = getUnreadCountForFriend(friend.id);
                  const lastMsg = getLastMessage(friend.id);
                  
                  return (
                    <motion.button
                      key={friend.id}
                      onClick={() => setSelectedFriend(friend.id)}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-slate-700/50 transition-colors text-left ${
                        selectedFriend === friend.id ? 'bg-slate-700/50' : ''
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden">
                          {friend.avatar ? (
                            <img src={friend.avatar} alt={friend.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold">
                              {friend.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <Circle size={12} className="absolute bottom-0 right-0 text-green-500 fill-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-white truncate">{friend.username}</h3>
                          {lastMsg && (
                            <span className="text-xs text-slate-500">{formatTime(lastMsg.timestamp)}</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 truncate">
                          {lastMsg ? (
                            lastMsg.senderId === user.id ? `You: ${lastMsg.content}` : lastMsg.content
                          ) : (
                            friend.status || 'Start a conversation'
                          )}
                        </p>
                      </div>
                      {unread > 0 && (
                        <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {unread}
                        </span>
                      )}
                    </motion.button>
                  );
                })
              )}
            </div>
          </div>

          <div className={`${selectedFriend ? 'flex' : 'hidden md:flex'} flex-col flex-1`}>
            {selectedFriend && selectedFriendUser ? (
              <>
                <div className="p-4 border-b border-slate-700 flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedFriend(null)}
                    className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <Link to={`/user/${selectedFriend}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden">
                        {selectedFriendUser.avatar ? (
                          <img src={selectedFriendUser.avatar} alt={selectedFriendUser.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold">
                            {selectedFriendUser.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <Circle size={10} className="absolute bottom-0 right-0 text-green-500 fill-green-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white hover:text-purple-400 transition-colors">{selectedFriendUser.username}</h3>
                      <p className="text-xs text-green-400">Online</p>
                    </div>
                  </Link>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {!currentConversation || currentConversation.messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <Link to={`/user/${selectedFriend}`} className="group">
                        <div className="w-20 h-20 rounded-full bg-slate-700 overflow-hidden mb-4 group-hover:ring-2 group-hover:ring-purple-500 transition-all">
                          {selectedFriendUser.avatar ? (
                            <img src={selectedFriendUser.avatar} alt={selectedFriendUser.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                              {selectedFriendUser.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <h3 className="text-white font-medium text-lg group-hover:text-purple-400 transition-colors">{selectedFriendUser.username}</h3>
                      </Link>
                      <p className="text-slate-400 text-sm mt-1">Start your conversation</p>
                    </div>
                  ) : (
                    <>
                      {currentConversation.messages.map((message, index) => {
                        const isOwn = message.senderId === user.id;
                        const showAvatar = index === 0 || 
                          currentConversation.messages[index - 1].senderId !== message.senderId;
                        
                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                              {showAvatar && !isOwn && (
                                <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                                  {selectedFriendUser.avatar ? (
                                    <img src={selectedFriendUser.avatar} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                                      {selectedFriendUser.username.charAt(0)}
                                    </div>
                                  )}
                                </div>
                              )}
                              {!showAvatar && !isOwn && <div className="w-8" />}
                              <div>
                                <div className={`px-4 py-2 rounded-2xl ${
                                  isOwn 
                                    ? 'bg-purple-600 text-white rounded-br-md' 
                                    : 'bg-slate-700 text-white rounded-bl-md'
                                }`}>
                                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                </div>
                                <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                                  <span className="text-[10px] text-slate-500">
                                    {formatTime(message.timestamp)}
                                  </span>
                                  {isOwn && (
                                    message.read ? (
                                      <CheckCheck size={12} className="text-purple-400" />
                                    ) : (
                                      <Check size={12} className="text-slate-500" />
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                <div className="p-4 border-t border-slate-700">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-full px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className="p-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-full transition-colors"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="bg-slate-700/50 p-6 rounded-full mb-6">
                  <MessageCircle size={48} className="text-purple-500" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Your Messages</h3>
                <p className="text-slate-400 max-w-sm">
                  Select a friend from the list to start chatting privately
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
