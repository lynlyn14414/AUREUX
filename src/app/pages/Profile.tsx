import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Camera, Edit2, UserPlus, UserMinus, Settings, X, Check, Upload, Link as LinkIcon, BookOpen, MessageSquare, Heart, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

export function Profile() {
  const { user, updateProfile, following, users, followUser, unfollowUser, isFollowing, isFriend, getFollowers, getFriends, drafts, posts } = useApp();
  const navigate = useNavigate();
  const [myFollowers, setMyFollowers] = useState<string[]>([]);
  const [serverFollowing, setServerFollowing] = useState<string[]>([]);
  
  // Fetch following and followers from server
  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        try {
          const [followingRes, followersRes] = await Promise.all([
            fetch(`/api/following/${user.id}`),
            fetch(`/api/followers/${user.id}`)
          ]);
          if (followingRes.ok) {
            const data = await followingRes.json();
            setServerFollowing(data);
          }
          if (followersRes.ok) {
            const data = await followersRes.json();
            setMyFollowers(data);
          }
        } catch (e) {
          console.error('Failed to fetch data:', e);
        }
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);
  
  // Use server following if available, otherwise fallback to context
  const effectiveFollowing = serverFollowing.length > 0 ? serverFollowing : following;
  
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [statusInput, setStatusInput] = useState(user?.status || '');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState(user?.username || '');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (type === 'avatar') {
        setAvatarPreview(result);
      } else {
        setBannerPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveStatus = () => {
    updateProfile({ status: statusInput });
    setIsEditingStatus(false);
    toast.success('Status updated!');
  };

  const handleSaveUsername = () => {
    const trimmed = usernameInput.trim();
    if (!trimmed) {
      toast.error('Username cannot be empty');
      return;
    }
    if (trimmed.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }
    const exists = users.some(u => u.username.toLowerCase() === trimmed.toLowerCase() && u.id !== user?.id);
    if (exists) {
      toast.error('Username already taken');
      return;
    }
    updateProfile({ username: trimmed });
    setIsEditingUsername(false);
    toast.success('Username updated!');
  };

  const handleSaveAvatar = () => {
    const imageToSave = uploadMode === 'file' ? avatarPreview : avatarUrl.trim();
    if (imageToSave) {
      updateProfile({ avatar: imageToSave });
      toast.success('Profile photo updated!');
    }
    closeAvatarModal();
  };

  const handleSaveBanner = () => {
    const imageToSave = uploadMode === 'file' ? bannerPreview : bannerUrl.trim();
    if (imageToSave) {
      updateProfile({ banner: imageToSave });
      toast.success('Banner updated!');
    }
    closeBannerModal();
  };

  const closeAvatarModal = () => {
    setShowAvatarModal(false);
    setAvatarUrl('');
    setAvatarPreview(null);
    setUploadMode('file');
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const closeBannerModal = () => {
    setShowBannerModal(false);
    setBannerUrl('');
    setBannerPreview(null);
    setUploadMode('file');
    if (bannerInputRef.current) bannerInputRef.current.value = '';
  };

  const myFriends = effectiveFollowing.filter(id => myFollowers.includes(id));

  const otherUsers = users.filter(u => u.id !== user.id);

  return (
    <div className="min-h-screen pb-20">
      <div className="relative">
        <div 
          className="h-48 md:h-64 w-full bg-cover bg-center relative group"
          style={{ 
            backgroundImage: user.banner 
              ? `url(${user.banner})` 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <button 
            onClick={() => setShowBannerModal(true)}
            className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Camera size={18} /> Change Banner
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 md:-mt-20 flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-slate-900 overflow-hidden bg-slate-800">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white bg-purple-600">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <button 
                onClick={() => setShowAvatarModal(true)}
                className="absolute bottom-2 right-2 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full shadow-lg transition-colors"
              >
                <Camera size={16} />
              </button>
            </div>

            <div className="flex-1 pb-4">
              <div className="flex items-center gap-3 mb-3">
                {isEditingUsername ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xl font-bold focus:ring-1 focus:ring-purple-500 outline-none"
                      maxLength={20}
                      autoFocus
                    />
                    <button onClick={handleSaveUsername} className="p-2 bg-green-600 hover:bg-green-700 rounded-lg text-white">
                      <Check size={16} />
                    </button>
                    <button onClick={() => { setIsEditingUsername(false); setUsernameInput(user?.username || ''); }} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">{user.username}</h1>
                    <button 
                      onClick={() => setIsEditingUsername(true)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      title="Edit username"
                    >
                      <Edit2 size={16} />
                    </button>
                  </>
                )}
                {user.isAdmin && (
                  <span className="bg-yellow-600 text-white text-xs font-bold px-2 py-1 rounded">ADMIN</span>
                )}
              </div>
              
              {isEditingStatus ? (
                <div className="flex items-center gap-2 max-w-md">
                  <input
                    type="text"
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                    placeholder="What's on your mind?"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                    maxLength={100}
                    autoFocus
                  />
                  <button onClick={handleSaveStatus} className="p-2 bg-green-600 hover:bg-green-700 rounded-lg text-white">
                    <Check size={16} />
                  </button>
                  <button onClick={() => setIsEditingStatus(false)} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-slate-300 italic">
                    {user.status || 'No status set'}
                  </p>
                  <button 
                    onClick={() => {
                      setStatusInput(user.status || '');
                      setIsEditingStatus(true);
                    }}
                    className="p-1 text-slate-500 hover:text-purple-400 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {(() => {
          const myPublishedStories = drafts.filter(d => d.published && (d.authorId === user.id || !d.authorId));
          const myPosts = posts.filter(p => p.user === user.username);
          
          return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Settings size={20} className="text-purple-500" /> Profile Stats
              </h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <Link 
                  to="/social"
                  className="bg-slate-900/50 rounded-lg p-4 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <p className="text-2xl font-bold text-purple-400">{effectiveFollowing.length}</p>
                  <p className="text-slate-400 text-sm">Following</p>
                </Link>
                <Link 
                  to="/my-stories"
                  className="bg-slate-900/50 rounded-lg p-4 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <p className="text-2xl font-bold text-purple-400">{myPublishedStories.length}</p>
                  <p className="text-slate-400 text-sm">Stories</p>
                </Link>
                <Link 
                  to="/social?filter=myposts"
                  className="bg-slate-900/50 rounded-lg p-4 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <p className="text-2xl font-bold text-purple-400">{myPosts.length}</p>
                  <p className="text-slate-400 text-sm">Posts</p>
                </Link>
              </div>
            </div>

            {myPublishedStories.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <BookOpen size={20} className="text-purple-500" /> My Published Stories
                  </h2>
                  <Link to="/my-stories" className="text-purple-400 hover:text-purple-300 text-sm">
                    View All &rarr;
                  </Link>
                </div>
                <div className="space-y-3">
                  {myPublishedStories.slice(0, 3).map(story => (
                    <Link 
                      key={story.id} 
                      to={`/story/user_story_${story.id}`}
                      className="flex items-center gap-4 bg-slate-900/50 rounded-lg p-3 hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="w-16 h-20 rounded overflow-hidden bg-slate-700 flex-shrink-0">
                        {story.coverImage ? (
                          <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen size={24} className="text-slate-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">{story.title}</h3>
                        <p className="text-slate-500 text-sm">
                          {story.chapters.filter(ch => ch.published).length} chapters • {story.genre}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* My Posts Section */}
            {myPosts.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <MessageSquare size={20} className="text-purple-500" /> My Posts
                  </h2>
                  <Link to="/social?filter=myposts" className="text-purple-400 hover:text-purple-300 text-sm">
                    View All &rarr;
                  </Link>
                </div>
                <div className="space-y-4">
                  {myPosts.slice(0, 3).map(post => (
                    <div key={post.id} className="bg-slate-900/50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={post.avatar || 'https://i.pravatar.cc/150?u=0'} alt={post.user} className="w-8 h-8 rounded-full" />
                        <div>
                          <p className="text-white font-medium text-sm">{post.user}</p>
                          <p className="text-slate-500 text-xs">{post.time}</p>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm mb-3 line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-4 text-slate-500 text-sm">
                        <span className="flex items-center gap-1">
                          <Heart size={14} /> {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={14} /> {post.comments}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">Friends ({myFriends.length})</h2>
              {myFriends.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No friends yet. Follow people and if they follow you back, you'll become friends!</p>
              ) : (
                <div className="space-y-3">
                  {myFriends.map(friendId => {
                    const friend = users.find(u => u.id === friendId);
                    if (!friend) return null;
                    return (
                      <div key={friendId} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                        <Link to={`/user/${friendId}`} className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-600">
                            {friend.avatar ? (
                              <img src={friend.avatar} alt={friend.username} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                {friend.username.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">{friend.username}</p>
                            <p className="text-slate-500 text-xs">{friend.status || 'No status'}</p>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <UserPlus size={18} className="text-purple-500" /> Follow Users
              </h2>
              {otherUsers.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No other users available</p>
              ) : (
                <div className="space-y-3">
                  {otherUsers.map(otherUser => (
                    <div key={otherUser.id} className="flex items-center justify-between">
                      <Link to={`/user/${otherUser.id}`} className="flex items-center gap-2 flex-1">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700">
                          {otherUser.avatar ? (
                            <img src={otherUser.avatar} alt={otherUser.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                              {otherUser.username.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="text-white text-sm">{otherUser.username}</span>
                      </Link>
                      {isFollowing(otherUser.id) ? (
                        <button 
                          onClick={() => { unfollowUser(otherUser.id); toast.success(`Unfollowed ${otherUser.username}`); }}
                          className="text-xs bg-slate-700 hover:bg-red-600 text-white px-3 py-1 rounded-full transition-colors"
                        >
                          Unfollow
                        </button>
                      ) : (
                        <button 
                          onClick={() => { followUser(otherUser.id); toast.success(`Following ${otherUser.username}!`); }}
                          className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-full transition-colors"
                        >
                          Follow
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
          );
        })()}
      </div>

      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700"
          >
            <h3 className="text-xl font-bold text-white mb-4">Change Profile Photo</h3>
            
            <div className="flex bg-slate-900/50 p-1 rounded-lg mb-4">
              <button
                onClick={() => setUploadMode('file')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
                  uploadMode === 'file' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload size={16} /> Upload File
              </button>
              <button
                onClick={() => setUploadMode('url')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
                  uploadMode === 'url' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LinkIcon size={16} /> URL
              </button>
            </div>

            {uploadMode === 'file' ? (
              <div className="mb-4">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  onChange={(e) => handleFileSelect(e, 'avatar')}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors bg-slate-900/50"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-32 h-32 rounded-full object-cover" />
                  ) : (
                    <>
                      <Upload size={32} className="text-slate-500 mb-2" />
                      <p className="text-slate-400 text-sm">Click to upload image</p>
                      <p className="text-slate-500 text-xs mt-1">PNG, JPG, GIF, WEBP (max 5MB)</p>
                    </>
                  )}
                </label>
              </div>
            ) : (
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Enter image URL..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white mb-4 focus:ring-1 focus:ring-purple-500 outline-none"
              />
            )}

            <div className="flex gap-3">
              <button 
                onClick={handleSaveAvatar}
                disabled={uploadMode === 'file' ? !avatarPreview : !avatarUrl.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-2 rounded-lg transition-colors"
              >
                Save
              </button>
              <button 
                onClick={closeAvatarModal}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showBannerModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700"
          >
            <h3 className="text-xl font-bold text-white mb-4">Change Banner</h3>
            
            <div className="flex bg-slate-900/50 p-1 rounded-lg mb-4">
              <button
                onClick={() => setUploadMode('file')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
                  uploadMode === 'file' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload size={16} /> Upload File
              </button>
              <button
                onClick={() => setUploadMode('url')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
                  uploadMode === 'url' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LinkIcon size={16} /> URL
              </button>
            </div>

            {uploadMode === 'file' ? (
              <div className="mb-4">
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  onChange={(e) => handleFileSelect(e, 'banner')}
                  className="hidden"
                  id="banner-upload"
                />
                <label
                  htmlFor="banner-upload"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors bg-slate-900/50"
                >
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Preview" className="w-full h-full rounded-lg object-cover" />
                  ) : (
                    <>
                      <Upload size={32} className="text-slate-500 mb-2" />
                      <p className="text-slate-400 text-sm">Click to upload image</p>
                      <p className="text-slate-500 text-xs mt-1">PNG, JPG, GIF, WEBP (max 5MB)</p>
                    </>
                  )}
                </label>
              </div>
            ) : (
              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="Enter image URL..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white mb-4 focus:ring-1 focus:ring-purple-500 outline-none"
              />
            )}

            <div className="flex gap-3">
              <button 
                onClick={handleSaveBanner}
                disabled={uploadMode === 'file' ? !bannerPreview : !bannerUrl.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-2 rounded-lg transition-colors"
              >
                Save
              </button>
              <button 
                onClick={closeBannerModal}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
