import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Heart, Share2, MoreHorizontal, Bell, User, Send, BookOpen, UserPlus, Sparkles, X, Copy, Check, ArrowLeft, Flag, UserCheck, Users, UserMinus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp, Post } from '../context/AppContext';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const OFFICIAL_UPDATES = [
  { id: 1, title: "System Maintenance", time: "1 day ago", type: "Notice" },
  { id: 2, title: "New Feature: Dark Mode", time: "2 days ago", type: "Feature" },
  { id: 3, title: "Creator Contest Winners Announced", time: "3 days ago", type: "Event" },
  { id: 4, title: "Server Upgrades Complete", time: "5 days ago", type: "Notice" },
];

export function Social() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('filter') === 'myposts' ? 'myposts' : 'feed';
  const [activeTab, setActiveTab] = useState(initialTab);
  const { posts, addPost, likePost, unlikePost, addComment, user, following, users, library, stories, drafts, followUser, unfollowUser, isFollowing, isFriend } = useApp();
  const navigate = useNavigate();
  const [newPostContent, setNewPostContent] = useState("");
  const [expandedComments, setExpandedComments] = useState<number | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchParams.get('filter') === 'myposts') {
      setActiveTab('myposts');
    }
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    addPost(newPostContent, ["Community"]);
    setNewPostContent("");
  };

  const handleLike = (postId: number, isLiked: boolean) => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }
    if (isLiked) {
      unlikePost(postId);
      toast.success('Unliked post');
    } else {
      likePost(postId);
      toast.success('Liked post!');
    }
  };

  const handleComment = (postId: number) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;
    if (!user) {
      toast.error('Please login to comment');
      return;
    }
    addComment(postId, content);
    setCommentInputs({ ...commentInputs, [postId]: '' });
    toast.success('Comment added!');
  };

  const handleShare = async (post: Post) => {
    const shareUrl = `${window.location.origin}/social?post=${post.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.user}`,
          text: post.content.substring(0, 100) + '...',
          url: shareUrl
        });
        toast.success('Shared successfully!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await copyToClipboard(shareUrl);
        }
      }
    } else {
      await copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const toggleComments = (postId: number) => {
    setExpandedComments(expandedComments === postId ? null : postId);
  };

  const friendUsernames = following.map(friendId => {
    const friendUser = users.find(u => u.id === friendId);
    return friendUser?.username;
  }).filter(Boolean);

  const libraryStoryTitles = library.map(storyId => {
    if (storyId.startsWith('user_story_')) {
      const draftId = storyId.replace('user_story_', '');
      const draft = drafts.find(d => d.id === draftId);
      return draft?.title;
    }
    const story = stories.find(s => s.id === storyId);
    return story?.title;
  }).filter(Boolean);

  const followingPosts = posts.filter(post => {
    const isFromFriend = friendUsernames.includes(post.user);
    const isAboutFollowedStory = post.tags?.some((tag: string) => 
      libraryStoryTitles.some(title => title && tag.toLowerCase().includes(title.toLowerCase()))
    );
    return isFromFriend || isAboutFollowedStory;
  });

  const myPosts = user ? posts.filter(post => post.user === user.username) : [];

  const storyUpdates = drafts
    .filter(d => {
      const storyId = `user_story_${d.id}`;
      return library.includes(storyId) && d.published;
    })
    .map(d => ({
      id: d.id,
      title: d.title,
      lastUpdated: d.lastUpdated,
      chapters: d.chapters.filter(ch => ch.published).length,
      author: users.find(u => u.id === d.authorId)?.username || 'Unknown'
    }));

  const displayPosts = activeTab === 'following' ? followingPosts : activeTab === 'myposts' ? myPosts : posts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="hidden lg:block space-y-6">
          <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 sticky top-24">
            <h3 className="text-xl font-bold text-white mb-6">Community</h3>
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('feed')}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'feed' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
              >
                Global Feed
              </button>
              <button 
                onClick={() => setActiveTab('following')}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-between ${activeTab === 'following' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
              >
                <span>Following</span>
                {followingPosts.length > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'following' ? 'bg-white/20' : 'bg-purple-600'}`}>
                    {followingPosts.length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('updates')}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-between ${activeTab === 'updates' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
              >
                <span>Story Updates</span>
                {storyUpdates.length > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'updates' ? 'bg-white/20' : 'bg-green-600'}`}>
                    {storyUpdates.length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('topics')}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'topics' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
              >
                Hot Topics
              </button>
            </nav>

            {user && following.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-700">
                <h4 className="text-white font-medium mb-3 text-sm">Following</h4>
                <div className="space-y-2">
                  {following.slice(0, 5).map(friendId => {
                    const friend = users.find(u => u.id === friendId);
                    if (!friend) return null;
                    return (
                      <Link 
                        key={friendId} 
                        to={`/user/${friendId}`}
                        className="flex items-center gap-2 hover:bg-slate-700/50 p-1 -mx-1 rounded-lg transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                          {friend.avatar ? (
                            <img src={friend.avatar} alt={friend.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-xs">
                              {friend.username.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="text-slate-300 text-sm hover:text-purple-400">{friend.username}</span>
                        <span className="w-2 h-2 bg-green-500 rounded-full ml-auto"></span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          
          <div className="flex gap-2 lg:hidden overflow-x-auto pb-2">
            <button 
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeTab === 'feed' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              Global
            </button>
            <button 
              onClick={() => setActiveTab('following')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeTab === 'following' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              Following {followingPosts.length > 0 && `(${followingPosts.length})`}
            </button>
            <button 
              onClick={() => setActiveTab('updates')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeTab === 'updates' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              Updates {storyUpdates.length > 0 && `(${storyUpdates.length})`}
            </button>
          </div>

          {user && activeTab !== 'updates' && (
            <div className="bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-700">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
                   {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="avatar"/> : <User size={20} />}
                </div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Discuss a story or share your thoughts..."
                    className="w-full bg-slate-900 border-none rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 mb-3"
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                    </div>
                    <button 
                      onClick={handleCreatePost}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
                    >
                      <Send size={16} /> Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'updates' ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="text-yellow-500" size={24} />
                Story Updates from Your Library
              </h2>
              
              {!user ? (
                <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
                  <User size={48} className="text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">Log in to see updates from stories you follow</p>
                  <Link to="/auth" className="text-purple-400 hover:text-purple-300 font-medium">
                    Log In
                  </Link>
                </div>
              ) : library.length === 0 ? (
                <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
                  <BookOpen size={48} className="text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">Add stories to your library to see updates here</p>
                  <Link to="/search" className="text-purple-400 hover:text-purple-300 font-medium">
                    Browse Stories
                  </Link>
                </div>
              ) : storyUpdates.length === 0 ? (
                <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
                  <Bell size={48} className="text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No recent updates from your followed stories</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {storyUpdates.map(update => (
                    <Link 
                      key={update.id}
                      to={`/story/user_story_${update.id}`}
                      className="block bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-purple-500/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                          <BookOpen size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{update.title}</h3>
                          <p className="text-slate-500 text-sm">
                            by {update.author} • {update.chapters} chapters • Updated {update.lastUpdated}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-green-600/20 text-green-400 text-xs rounded-full font-medium">
                          Updated
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {activeTab === 'following' && (
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">
                    Posts from Friends & Followed Stories
                  </h2>
                  {!user && (
                    <Link to="/auth" className="text-purple-400 text-sm hover:underline">
                      Log in to follow
                    </Link>
                  )}
                </div>
              )}

              {activeTab === 'myposts' && (
                <div className="flex items-center justify-between bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3">
                    <Link 
                      to="/profile"
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                      <ArrowLeft size={20} />
                    </Link>
                    <h2 className="text-lg font-bold text-white">
                      My Posts ({myPosts.length})
                    </h2>
                  </div>
                  <Link to="/profile" className="text-purple-400 text-sm hover:text-purple-300">
                    Back to Profile
                  </Link>
                </div>
              )}

              {activeTab === 'myposts' && displayPosts.length === 0 ? (
                <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
                  <MessageSquare size={48} className="text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">You haven't made any posts yet</p>
                  <p className="text-slate-500 text-sm">Share your thoughts with the community!</p>
                </div>
              ) : activeTab === 'following' && displayPosts.length === 0 ? (
                <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
                  {!user ? (
                    <>
                      <UserPlus size={48} className="text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 mb-4">Log in to see posts from people you follow</p>
                      <Link to="/auth" className="text-purple-400 hover:text-purple-300 font-medium">
                        Log In
                      </Link>
                    </>
                  ) : following.length === 0 && library.length === 0 ? (
                    <>
                      <UserPlus size={48} className="text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 mb-2">No following or followed stories yet</p>
                      <p className="text-slate-500 text-sm mb-4">Follow users from your profile or save stories to your library</p>
                      <div className="flex gap-3 justify-center">
                        <Link to="/profile" className="text-purple-400 hover:text-purple-300 font-medium">
                          Find People
                        </Link>
                        <span className="text-slate-600">•</span>
                        <Link to="/search" className="text-purple-400 hover:text-purple-300 font-medium">
                          Browse Stories
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <MessageSquare size={48} className="text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No posts from people you follow or about your followed stories yet</p>
                    </>
                  )}
                </div>
              ) : (
                displayPosts.map((post) => {
                  const postUserId = post.userId || users.find(u => u.username === post.user)?.id || post.user;
                  
                  return (
                  <motion.div 
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          onClick={() => postUserId && navigate(`/user/${postUserId}`)}
                          className={postUserId ? 'cursor-pointer' : ''}
                        >
                          <img src={post.avatar || 'https://i.pravatar.cc/150?u=0'} alt={post.user} className={`w-10 h-10 rounded-full border-2 border-slate-600 ${postUserId ? 'hover:border-purple-500 transition-colors' : ''}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {postUserId ? (
                              <Link to={`/user/${postUserId}`} className="text-white font-bold text-sm hover:text-purple-400 transition-colors">
                                {post.user}
                              </Link>
                            ) : (
                              <span className="text-white font-bold text-sm">{post.user}</span>
                            )}
                            {isFollowing(postUserId) && (
                              <span className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${isFriend(postUserId) ? 'bg-green-600/30 text-green-400' : 'bg-purple-600/30 text-purple-400'}`}>
                                {isFriend(postUserId) ? 'Friend' : 'Following'}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-500 text-xs">{post.time}</p>
                        </div>
                      </div>
                      <div className="relative" ref={openMenu === post.id ? menuRef : null}>
                        <button 
                          onClick={() => setOpenMenu(openMenu === post.id ? null : post.id)}
                          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          <MoreHorizontal size={20} />
                        </button>
                        {openMenu === post.id && (
                          <div className="absolute right-0 top-8 w-48 bg-slate-700 rounded-xl shadow-xl border border-slate-600 overflow-hidden z-50">
                            {user && postUserId && postUserId !== user.id && (
                              <>
                                {!isFollowing(postUserId) ? (
                                  <button
                                    onClick={() => {
                                      followUser(postUserId);
                                      toast.success(`Following ${post.user}!`);
                                      setOpenMenu(null);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-slate-600 transition-colors"
                                  >
                                    <UserPlus size={16} className="text-purple-400" />
                                    Follow
                                  </button>
                                ) : isFriend(postUserId) ? (
                                  <div className="w-full flex items-center gap-3 px-4 py-3 text-sm text-green-400">
                                    <UserCheck size={16} />
                                    Friends
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      unfollowUser(postUserId);
                                      toast.success(`Unfollowed ${post.user}`);
                                      setOpenMenu(null);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-slate-600 transition-colors"
                                  >
                                    <UserMinus size={16} className="text-red-400" />
                                    Unfollow
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    navigate(`/user/${postUserId}`);
                                    setOpenMenu(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-slate-600 transition-colors"
                                >
                                  <Users size={16} className="text-blue-400" />
                                  View Profile
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                toast.success('Post reported. We will review it shortly.');
                                setOpenMenu(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-slate-600 transition-colors"
                            >
                              <Flag size={16} />
                              Report Post
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-200 mb-4 leading-relaxed">
                      {post.content}
                    </p>

                    {post.image && (
                        <div className="mb-4 rounded-lg overflow-hidden">
                            <img src={post.image} alt="Post attachment" className="w-full object-cover max-h-80" />
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags && post.tags.map((tag: string) => (
                        <span key={tag} className="text-purple-400 text-xs font-medium hover:underline cursor-pointer">#{tag}</span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-700 pt-4">
                      <button 
                        onClick={() => handleLike(post.id, post.likedBy?.includes(user?.id || ''))}
                        className={`flex items-center gap-2 transition-colors group ${
                          post.likedBy?.includes(user?.id || '') 
                            ? 'text-pink-500' 
                            : 'text-slate-400 hover:text-pink-500'
                        }`}
                      >
                        <Heart 
                          size={20} 
                          className={`group-hover:scale-110 transition-transform ${
                            post.likedBy?.includes(user?.id || '') ? 'fill-pink-500' : ''
                          }`} 
                        />
                        <span className="text-sm">{post.likes}</span>
                      </button>
                      <button 
                        onClick={() => toggleComments(post.id)}
                        className={`flex items-center gap-2 transition-colors group ${
                          expandedComments === post.id ? 'text-blue-400' : 'text-slate-400 hover:text-blue-400'
                        }`}
                      >
                        <MessageSquare size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="text-sm">{post.comments}</span>
                      </button>
                      <button 
                        onClick={() => handleShare(post)}
                        className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors group"
                      >
                        <Share2 size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="text-sm">Share</span>
                      </button>
                    </div>

                    <AnimatePresence>
                      {expandedComments === post.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 border-t border-slate-700 mt-4">
                            {post.commentsList && post.commentsList.length > 0 ? (
                              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                {post.commentsList.map((comment) => {
                                  const commentUser = users.find(u => u.id === comment.userId);
                                  return (
                                    <div key={comment.id} className="flex gap-3">
                                      {commentUser ? (
                                        <Link to={`/user/${comment.userId}`}>
                                          <img 
                                            src={comment.avatar} 
                                            alt={comment.username} 
                                            className="w-8 h-8 rounded-full border border-slate-600 hover:border-purple-500 transition-colors"
                                          />
                                        </Link>
                                      ) : (
                                        <img 
                                          src={comment.avatar} 
                                          alt={comment.username} 
                                          className="w-8 h-8 rounded-full border border-slate-600"
                                        />
                                      )}
                                      <div className="flex-1 bg-slate-900/50 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                          {commentUser ? (
                                            <Link to={`/user/${comment.userId}`} className="text-white font-medium text-sm hover:text-purple-400">
                                              {comment.username}
                                            </Link>
                                          ) : (
                                            <span className="text-white font-medium text-sm">{comment.username}</span>
                                          )}
                                          <span className="text-slate-500 text-xs">{comment.timestamp}</span>
                                        </div>
                                        <p className="text-slate-300 text-sm">{comment.content}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-slate-500 text-sm mb-4 text-center py-2">No comments yet. Be the first to comment!</p>
                            )}
                            
                            {user ? (
                              <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-600 flex-shrink-0">
                                  {user.avatar ? (
                                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                                      {user.username.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 flex gap-2">
                                  <input
                                    type="text"
                                    value={commentInputs[post.id] || ''}
                                    onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                    onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                                    placeholder="Write a comment..."
                                    className="flex-1 bg-slate-900 border border-slate-700 rounded-full px-4 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 outline-none"
                                  />
                                  <button
                                    onClick={() => handleComment(post.id)}
                                    disabled={!commentInputs[post.id]?.trim()}
                                    className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-full transition-colors"
                                  >
                                    <Send size={16} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <Link to="/auth" className="block text-center text-purple-400 hover:text-purple-300 text-sm py-2">
                                Login to comment
                              </Link>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  );
                })
              )}
            </div>
          )}

        </div>

        <div className="hidden lg:block space-y-6">
          <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <Bell className="text-yellow-500" />
              <h3 className="text-xl font-bold text-white">Official Updates</h3>
            </div>
            
            <div className="space-y-4">
              {OFFICIAL_UPDATES.map(update => (
                <div key={update.id} className="border-l-2 border-purple-500 pl-4 py-1 hover:bg-slate-700/50 rounded-r transition-colors cursor-pointer group">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-purple-400 uppercase">{update.type}</span>
                    <span className="text-xs text-slate-500">{update.time}</span>
                  </div>
                  <h4 className="text-sm font-medium text-slate-200 group-hover:text-white">{update.title}</h4>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700">
                <h4 className="text-white font-bold mb-4">Trending Tags</h4>
                <div className="flex flex-wrap gap-2">
                    {['#SoloLeveling', '#Romance', '#NewChapter', '#FanArt', '#Theory'].map(tag => (
                        <span key={tag} className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs px-3 py-1 rounded-full cursor-pointer transition-colors">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
