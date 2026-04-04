import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { UserPlus, UserMinus, MessageCircle, BookOpen, ArrowLeft, Users, UserCheck, Settings, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user, users, following, followUser, unfollowUser, isFollowing, isFriend, getFollowers, drafts, posts } = useApp();

  const profileUser = users.find(u => u.id === userId || u.username === userId);

  if (!profileUser) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-slate-800 p-6 rounded-full mb-6">
          <Users size={48} className="text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">User Not Found</h2>
        <p className="text-slate-400 mb-6">This user doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate(-1)}
          className="text-purple-400 hover:text-purple-300 font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isOwnProfile = user?.id === profileUser.id;
  const amFollowing = isFollowing(profileUser.id);
  const weAreFriends = isFriend(profileUser.id);
  const theirFollowers = getFollowers(profileUser.id);

  const userStories = drafts.filter(d => 
    d.published && (d.authorId === profileUser.id)
  );

  const userPosts = posts.filter(p => p.userId === profileUser.id || p.user === profileUser.username);

  const handleFollow = () => {
    if (!user) {
      toast.error('Please login to follow users');
      return;
    }
    followUser(profileUser.id);
    toast.success(`Following ${profileUser.username}!`);
  };

  const handleUnfollow = () => {
    unfollowUser(profileUser.id);
    toast.success(`Unfollowed ${profileUser.username}`);
  };

  if (isOwnProfile) {
    navigate('/profile');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      {/* Banner */}
      <div 
        className="h-48 md:h-64 rounded-t-xl bg-gradient-to-r from-purple-900 to-slate-900 relative overflow-hidden"
        style={profileUser.banner ? { 
          backgroundImage: `url(${profileUser.banner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        {profileUser.banner && <div className="absolute inset-0 bg-black/30" />}
      </div>

      {/* Profile Info */}
      <div className="bg-slate-800 rounded-b-xl border-x border-b border-slate-700 px-6 pb-6 -mt-12 relative">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-slate-800 overflow-hidden bg-slate-700 flex-shrink-0">
            {profileUser.avatar ? (
              <img 
                src={profileUser.avatar} 
                alt={profileUser.username} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-3xl md:text-4xl font-bold bg-purple-600">
                {profileUser.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white">{profileUser.username}</h1>
              {profileUser.isAdmin && (
                <span className="bg-yellow-600 text-white text-xs font-bold px-2 py-1 rounded">ADMIN</span>
              )}
              {weAreFriends && (
                <span className="px-2 py-0.5 bg-green-600/30 text-green-400 text-xs rounded-full font-medium">
                  Friends
                </span>
              )}
            </div>
            {profileUser.status && (
              <p className="text-slate-400 mt-1">{profileUser.status}</p>
            )}
          </div>

          {user && (
            <div className="flex gap-3 pb-2">
              {weAreFriends && (
                <Link
                  to="/chat"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                >
                  <MessageCircle size={18} />
                  <span>Message</span>
                </Link>
              )}
              {amFollowing ? (
                <button
                  onClick={handleUnfollow}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                >
                  <UserMinus size={18} />
                  <span>Unfollow</span>
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                >
                  <UserPlus size={18} />
                  <span>Follow</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Stats */}
      <div className="mt-6 bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Settings size={18} className="text-purple-500" /> Profile Stats
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <Link 
            to="#"
            className="bg-slate-900/50 rounded-lg p-4 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <p className="text-2xl font-bold text-purple-400">{userStories.length}</p>
            <p className="text-slate-400 text-sm">Stories</p>
          </Link>
          <Link 
            to="#"
            className="bg-slate-900/50 rounded-lg p-4 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <p className="text-2xl font-bold text-purple-400">{theirFollowers.length}</p>
            <p className="text-slate-400 text-sm">Followers</p>
          </Link>
          <Link 
            to="#"
            className="bg-slate-900/50 rounded-lg p-4 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <p className="text-2xl font-bold text-purple-400">{userPosts.length}</p>
            <p className="text-slate-400 text-sm">Posts</p>
          </Link>
        </div>
      </div>

      {/* Published Stories */}
      {userStories.length > 0 && (
        <div className="mt-6 bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen size={20} className="text-purple-500" /> Published Stories
            </h2>
            <Link to="#" className="text-purple-400 hover:text-purple-300 text-sm">View All →</Link>
          </div>
          <div className="space-y-3">
            {userStories.slice(0, 3).map(story => (
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
                  <p className="text-slate-500 text-sm">{story.chapters.filter(ch => ch.published).length} chapters • {story.genre}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* User Posts */}
      {userPosts.length > 0 && (
        <div className="mt-6 bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare size={20} className="text-purple-500" /> Posts
            </h2>
            <Link to="#" className="text-purple-400 hover:text-purple-300 text-sm">View All →</Link>
          </div>
          <div className="space-y-4">
            {userPosts.slice(0, 3).map(post => (
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
                  <span className="flex items-center gap-1">❤️ {post.likes}</span>
                  <span className="flex items-center gap-1">💬 {post.comments}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {userStories.length === 0 && userPosts.length === 0 && (
        <div className="mt-6 bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
          <BookOpen size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No published stories or posts yet</p>
        </div>
      )}
    </div>
  );
}
