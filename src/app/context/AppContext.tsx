import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { translations, Language, TranslationKey } from '../translations';

const API = '/api';

const INITIAL_STORIES: Story[] = [];
const INITIAL_POSTS: Post[] = [];
const COMMUNITY_USERS: User[] = [];

interface Story {
  id: string;
  title: string;
  image: string;
  rating: number;
  chapters: number;
  category: string;
  type: string;
  updatedAt: string;
  description: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  panels?: string[];
}

export interface Draft {
  id: string;
  title: string;
  coverImage: string;
  synopsis: string;
  category: string;
  genre: string;
  lastUpdated: string;
  chapters: Chapter[];
  published: boolean;
  authorId?: string;
  originalAuthor?: string;
  editorId?: string;
  isOfficial?: boolean;
}

interface UserData {
  username: string;
  email?: string;
  password: string;
}

interface User {
  id: string;
  username: string;
  email?: string;
  password: string;
  avatar?: string;
  banner?: string;
  status?: string;
  isAdmin: boolean;
}

interface ProfileUpdate {
  avatar?: string;
  banner?: string;
  status?: string;
  username?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: [string, string];
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
}

export interface PostComment {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: string;
}

export interface Post {
  id: number;
  user: string;
  userId?: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  likedBy: string[];
  comments: number;
  commentsList: PostComment[];
  tags: string[];
  image?: string;
}

interface StoryRating {
  storyId: string;
  userId: string;
  rating: number;
}

export interface Notification {
  id: string;
  type: 'friend_request' | 'like' | 'comment';
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface AppContextType {
  user: User | null;
  users: User[];
  following: string[];
  followers: string[];
  posts: Post[];
  library: string[];
  stories: Story[];
  drafts: Draft[];
  conversations: Conversation[];
  notifications: Notification[];
  readPosts: string[];
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  login: (userData?: UserData) => Promise<boolean>;
  register: (userData?: UserData) => Promise<boolean>;
  adminLogin: (userData?: UserData) => Promise<boolean>;
  registerAdmin: (userData?: UserData, adminCode?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: ProfileUpdate) => void;
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  isFriend: (userId: string) => boolean;
  getFollowers: (userId: string) => string[];
  getFriends: (userId: string) => string[];
  addPost: (content: string, tags?: string[]) => void;
  likePost: (postId: number) => void;
  unlikePost: (postId: number) => void;
  addComment: (postId: number, content: string) => void;
  addToLibrary: (storyId: string) => void;
  removeFromLibrary: (storyId: string) => void;
  isInLibrary: (storyId: string) => boolean;
  updateStory: (id: string, data: Partial<Story>) => void;
  saveDraft: (draft: Draft) => void;
  deleteDraft: (id: string) => void;
  addChapter: (draftId: string, chapter: Chapter) => void;
  updateChapter: (draftId: string, chapterId: string, data: Partial<Chapter>) => void;
  deleteChapter: (draftId: string, chapterId: string) => void;
  reorderChapters: (draftId: string, chapters: Chapter[]) => void;
  sendMessage: (receiverId: string, content: string) => void;
  getConversation: (otherId: string) => Conversation | undefined;
  markMessagesAsRead: (otherId: string) => void;
  getUnreadCount: () => number;
  clearAllData: () => void;
  rateStory: (storyId: string, rating: number) => void;
  getStoryRating: (storyId: string) => number;
  getUserStoryRating: (storyId: string) => number | null;
  markNotificationsRead: () => void;
  getUnreadNotifCount: () => number;
  readPosts: string[];
  markPostAsRead: (postId: number) => void;
  getUnreadPostCount: () => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_DRAFTS: Draft[] = [];

const safeGetStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const safeSetStorage = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn('Failed to save to localStorage:', key);
  }
};

const safeRemoveStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    console.warn('Failed to remove from localStorage:', key);
  }
};

async function apiFetch(path: string, options?: RequestInit) {
  try {
    const res = await fetch(API + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => safeGetStorage('aureux_user', null));
  const [users, setUsers] = useState<User[]>(() => safeGetStorage('aureux_users', COMMUNITY_USERS));
  const [following, setFollowing] = useState<string[]>(() => safeGetStorage('aureux_following', []));
  const [followers, setFollowers] = useState<string[]>([]);
  const [posts, setPosts] = useState(() => safeGetStorage('aureux_posts', INITIAL_POSTS));
  const [library, setLibrary] = useState<string[]>(() => safeGetStorage('aureux_library', []));
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [drafts, setDrafts] = useState<Draft[]>(() => safeGetStorage('aureux_drafts', INITIAL_DRAFTS));
  const [conversations, setConversations] = useState<Conversation[]>(() => safeGetStorage('aureux_conversations', []));
  const [storyRatings, setStoryRatings] = useState<StoryRating[]>(() => safeGetStorage('aureux_ratings', []));
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readPosts, setReadPosts] = useState<string[]>(() => safeGetStorage('aureux_readPosts', []));
  const [language, setLanguageState] = useState<Language>(() => safeGetStorage('aureux_language', 'en'));
  const syncTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Translation function
  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  // Set language with persistence
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    safeSetStorage('aureux_language', lang);
  };

  const syncFromServer = useCallback(async () => {
    const serverUsers = await apiFetch('/users');
    if (serverUsers) setUsers(serverUsers);

    const serverDrafts = await apiFetch('/drafts');
    if (serverDrafts) setDrafts(serverDrafts);

    const serverPosts = await apiFetch('/posts');
    if (serverPosts) setPosts(serverPosts);

    const serverRatings = await apiFetch('/ratings');
    if (serverRatings) setStoryRatings(serverRatings);

    const serverConvos = await apiFetch('/conversations');
    if (serverConvos) setConversations(serverConvos);

    if (user) {
      const serverFollowing = await apiFetch(`/following/${user.id}`);
      if (serverFollowing) setFollowing(serverFollowing);

      const serverFollowers = await apiFetch(`/followers/${user.id}`);
      if (serverFollowers) setFollowers(serverFollowers);

      const serverNotifs = await apiFetch(`/notifications/${user.id}`);
      if (serverNotifs) setNotifications(serverNotifs);
    }
  }, [user]);

  useEffect(() => {
    syncFromServer();
    syncTimer.current = setInterval(syncFromServer, 5000);
    return () => {
      if (syncTimer.current) clearInterval(syncTimer.current);
    };
  }, [syncFromServer]);

  useEffect(() => {
    if (user) {
      safeSetStorage('aureux_user', user);
    } else {
      safeRemoveStorage('aureux_user');
    }
  }, [user]);

  useEffect(() => { safeSetStorage('aureux_users', users); }, [users]);
  useEffect(() => { safeSetStorage('aureux_following', following); }, [following]);
  useEffect(() => { safeSetStorage('aureux_posts', posts); }, [posts]);
  useEffect(() => { safeSetStorage('aureux_library', library); }, [library]);
  useEffect(() => { safeSetStorage('aureux_ratings', storyRatings); }, [storyRatings]);
  useEffect(() => { safeSetStorage('aureux_readPosts', readPosts); }, [readPosts]);
  useEffect(() => { safeSetStorage('aureux_language', language); }, [language]);

  useEffect(() => {
    try {
      const draftsToSave = drafts.map(draft => ({
        ...draft,
        chapters: draft.chapters.map(ch => ({
          ...ch,
          panels: ch.panels ? ch.panels.slice(0, 50) : undefined
        }))
      }));
      localStorage.setItem('aureux_drafts', JSON.stringify(draftsToSave));
    } catch {
      try {
        const draftsWithoutPanels = drafts.map(draft => ({
          ...draft,
          chapters: draft.chapters.map(ch => ({ ...ch, panels: undefined }))
        }));
        localStorage.setItem('aureux_drafts', JSON.stringify(draftsWithoutPanels));
      } catch { /* ignore */ }
    }
  }, [drafts]);

  useEffect(() => {
    try {
      localStorage.setItem('aureux_conversations', JSON.stringify(conversations));
    } catch { /* ignore */ }
  }, [conversations]);

  const login = async (userData?: UserData): Promise<boolean> => {
    if (!userData?.username || !userData?.password) return false;
    const isAdminLogin = userData.isAdmin || false;
    const result = await apiFetch('/users/login', {
      method: 'POST',
      body: JSON.stringify({ username: userData.username, password: userData.password, isAdmin: isAdminLogin }),
    });
    if (result && !result.error) {
      setUser(result);
      return true;
    }
    const existingUser = users.find(u =>
      u.username.toLowerCase() === userData.username.toLowerCase() &&
      u.password === userData.password &&
      u.isAdmin === isAdminLogin
    );
    if (existingUser) {
      setUser(existingUser);
      return true;
    }
    return false;
  };

  const register = async (userData?: UserData): Promise<boolean> => {
    if (!userData?.username || !userData?.password) return false;
    const result = await apiFetch('/users/register', {
      method: 'POST',
      body: JSON.stringify({ username: userData.username, password: userData.password, email: userData.email || '', isAdmin: false }),
    });
    if (result && !result.error) {
      setUser(result);
      setUsers(prev => [...prev, result]);
      return true;
    }
    if (result?.error === 'Username taken') return false;
    const usernameExists = users.some(u => u.username.toLowerCase() === userData.username.toLowerCase());
    if (usernameExists) return false;
    const newUser: User = {
      id: 'user_' + Date.now(),
      username: userData.username,
      email: userData.email || '',
      password: userData.password,
      avatar: '', status: '', banner: '',
      isAdmin: false
    };
    setUser(newUser);
    setUsers(prev => [...prev, newUser]);
    return true;
  };

  const adminLogin = async (userData?: UserData): Promise<boolean> => {
    if (!userData?.username || !userData?.password) return false;
    
    // First try server login
    const result = await apiFetch('/users/login', {
      method: 'POST',
      body: JSON.stringify({ username: userData.username, password: userData.password, isAdmin: true }),
    });
    if (result && !result.error) {
      setUser(result);
      return true;
    }
    
    // If server fails, fetch fresh users data and check locally
    const freshUsers = await apiFetch('/users');
    console.log('Fresh users data:', freshUsers);
    console.log('Looking for username:', userData.username!.toLowerCase());
    console.log('With password:', userData.password);
    
    const existingAdmin = freshUsers?.find((u: any) => {
      const usernameMatch = u.username.toLowerCase() === userData.username!.toLowerCase();
      const passwordMatch = u.password === userData.password;
      const googleIdMatch = u.googleId === userData.password;
      const isAdmin = u.isAdmin;
      console.log('Checking user:', u.username, { usernameMatch, passwordMatch, googleIdMatch, isAdmin, storedPassword: u.password, storedGoogleId: u.googleId });
      return usernameMatch && (passwordMatch || googleIdMatch) && isAdmin;
    });
    
    console.log('Found admin:', existingAdmin);
    
    if (existingAdmin) {
      setUser(existingAdmin);
      return true;
    }
    return false;
  };

  const registerAdmin = async (userData?: UserData, adminCode?: string): Promise<boolean> => {
    if (!userData?.username || !userData?.password) return false;
    if (adminCode !== 'AUREUX2024') return false;
    const result = await apiFetch('/users/register', {
      method: 'POST',
      body: JSON.stringify({ username: userData.username, password: userData.password, email: userData.email || '', isAdmin: true, adminCode }),
    });
    if (result && !result.error) {
      setUser(result);
      setUsers(prev => [...prev, result]);
      return true;
    }
    if (result?.error === 'Username taken') return false;
    const usernameExists = users.some(u => u.username.toLowerCase() === userData.username.toLowerCase());
    if (usernameExists) return false;
    const newUser: User = {
      id: 'admin_' + Date.now(),
      username: userData.username,
      email: userData.email || '',
      password: userData.password,
      avatar: '', status: '', banner: '',
      isAdmin: true
    };
    setUser(newUser);
    setUsers(prev => [...prev, newUser]);
    return true;
  };

  const logout = () => {
    setUser(null);
    setFriends([]);
    safeRemoveStorage('aureux_user');
    safeRemoveStorage('aureux_friends');
  };

  const updateProfile = (data: ProfileUpdate) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      apiFetch(`/users/${user.id}`, { method: 'PUT', body: JSON.stringify(data) });
    }
  };

  const sendNotification = (type: Notification['type'], toUserId: string, message: string) => {
    if (!user || toUserId === user.id) return;
    const notif: Notification = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(7),
      type, fromUserId: user.id, fromUsername: user.username,
      toUserId, message, timestamp: new Date().toISOString(), read: false
    };
    apiFetch('/notifications', { method: 'POST', body: JSON.stringify(notif) });
  };

  const followUser = (userId: string) => {
    if (!following.includes(userId)) {
      const newFollowing = [...following, userId];
      setFollowing(newFollowing);
      if (user) {
        apiFetch('/following', { method: 'POST', body: JSON.stringify({ userId: user.id, following: newFollowing }) });
        sendNotification('friend_request', userId, `${user.username} started following you!`);
      }
    }
  };

  const unfollowUser = (userId: string) => {
    const newFollowing = following.filter(id => id !== userId);
    setFollowing(newFollowing);
    if (user) apiFetch('/following', { method: 'POST', body: JSON.stringify({ userId: user.id, following: newFollowing }) });
  };

  const isFollowing = (userId: string): boolean => {
    return following.includes(userId);
  };

  const isFriend = (userId: string): boolean => {
    // Mutual follow = friends (you follow them AND they follow you back)
    return following.includes(userId) && followers.includes(userId);
  };

  const getFollowers = (userId: string): string[] => {
    // Find all users who follow this userId
    return users.filter(u => {
      // Check if this user has the target user in their following list
      // This would need server data, for now we check local
      return false; // Simplified - would need server query
    }).map(u => u.id);
  };

  const getFriends = (userId: string): string[] => {
    // Mutual follows
    const userFollowing = following;
    // Would need to check who follows back from server
    return userFollowing; // Simplified
  };

  const addPost = (content: string, tags: string[] = []) => {
    const newPost: Post = {
      id: Date.now(),
      user: user?.username || "Guest",
      userId: user?.id,
      avatar: user?.avatar || "https://i.pravatar.cc/150?u=0",
      time: "Just now",
      content, likes: 0, likedBy: [], comments: 0, commentsList: [], tags
    };
    setPosts(prev => { const updated = [newPost, ...prev]; return updated; });
    apiFetch('/posts', { method: 'POST', body: JSON.stringify(newPost) });
  };

  const likePost = (postId: number) => {
    if (!user) return;
    setPosts(prev => {
      const updated = prev.map(post => {
        if (post.id === postId && !post.likedBy.includes(user.id)) {
          const p = { ...post, likes: post.likes + 1, likedBy: [...post.likedBy, user.id] };
          apiFetch('/posts', { method: 'POST', body: JSON.stringify(p) });
          if (post.userId) sendNotification('like', post.userId, `${user.username} liked your post`);
          return p;
        }
        return post;
      });
      return updated;
    });
  };

  const unlikePost = (postId: number) => {
    if (!user) return;
    setPosts(prev => {
      const updated = prev.map(post => {
        if (post.id === postId && post.likedBy.includes(user.id)) {
          const p = { ...post, likes: Math.max(0, post.likes - 1), likedBy: post.likedBy.filter(id => id !== user.id) };
          apiFetch('/posts', { method: 'POST', body: JSON.stringify(p) });
          return p;
        }
        return post;
      });
      return updated;
    });
  };

  const addComment = (postId: number, content: string) => {
    if (!user || !content.trim()) return;
    const newComment: PostComment = {
      id: 'comment_' + Date.now(),
      userId: user.id,
      username: user.username,
      avatar: user.avatar || 'https://i.pravatar.cc/150?u=0',
      content: content.trim(),
      timestamp: 'Just now'
    };
    setPosts(prev => {
      const updated = prev.map(post => {
        if (post.id === postId) {
          const p = { ...post, comments: post.comments + 1, commentsList: [...post.commentsList, newComment] };
          apiFetch('/posts', { method: 'POST', body: JSON.stringify(p) });
          if (post.userId) sendNotification('comment', post.userId, `${user.username} commented on your post`);
          return p;
        }
        return post;
      });
      return updated;
    });
  };

  const addToLibrary = (storyId: string) => {
    if (!library.includes(storyId)) setLibrary([...library, storyId]);
  };

  const removeFromLibrary = (storyId: string) => {
    setLibrary(library.filter(id => id !== storyId));
  };

  const isInLibrary = (storyId: string) => library.includes(storyId);

  const updateStory = (id: string, data: Partial<Story>) => {
    setStories(stories.map(story => story.id === id ? { ...story, ...data } : story));
  };

  const saveDraft = (draft: Draft) => {
    const existingIndex = drafts.findIndex(d => d.id === draft.id);
    const updatedDraft = { ...draft, lastUpdated: new Date().toISOString() };
    if (existingIndex >= 0) {
      const newDrafts = [...drafts];
      newDrafts[existingIndex] = updatedDraft;
      setDrafts(newDrafts);
    } else {
      setDrafts([updatedDraft, ...drafts]);
    }
    apiFetch('/drafts', { method: 'POST', body: JSON.stringify(updatedDraft) });
  };

  const deleteDraft = (id: string) => {
    setDrafts(drafts.filter(d => d.id !== id));
    apiFetch(`/drafts/${id}`, { method: 'DELETE' });
  };

  const addChapter = (draftId: string, chapter: Chapter) => {
    setDrafts(prev => {
      const updated = prev.map(d =>
        d.id === draftId
          ? { ...d, chapters: [...d.chapters, chapter], lastUpdated: new Date().toISOString() }
          : d
      );
      const draft = updated.find(d => d.id === draftId);
      if (draft) apiFetch('/drafts', { method: 'POST', body: JSON.stringify(draft) });
      return updated;
    });
  };

  const updateChapter = (draftId: string, chapterId: string, data: Partial<Chapter>) => {
    setDrafts(prev => {
      const updated = prev.map(d =>
        d.id === draftId
          ? {
              ...d,
              chapters: d.chapters.map(ch => ch.id === chapterId ? { ...ch, ...data, updatedAt: new Date().toISOString() } : ch),
              lastUpdated: new Date().toISOString()
            }
          : d
      );
      const draft = updated.find(d => d.id === draftId);
      if (draft) apiFetch('/drafts', { method: 'POST', body: JSON.stringify(draft) });
      return updated;
    });
  };

  const deleteChapter = (draftId: string, chapterId: string) => {
    setDrafts(prev => {
      const updated = prev.map(d =>
        d.id === draftId
          ? { ...d, chapters: d.chapters.filter(ch => ch.id !== chapterId), lastUpdated: new Date().toISOString() }
          : d
      );
      const draft = updated.find(d => d.id === draftId);
      if (draft) apiFetch('/drafts', { method: 'POST', body: JSON.stringify(draft) });
      return updated;
    });
  };

  const reorderChapters = (draftId: string, chapters: Chapter[]) => {
    setDrafts(prev => {
      const updated = prev.map(d =>
        d.id === draftId ? { ...d, chapters, lastUpdated: new Date().toISOString() } : d
      );
      const draft = updated.find(d => d.id === draftId);
      if (draft) apiFetch('/drafts', { method: 'POST', body: JSON.stringify(draft) });
      return updated;
    });
  };

  const getConversationId = (id1: string, id2: string) => [id1, id2].sort().join('_');

  const sendMessage = (receiverId: string, content: string) => {
    if (!user || !content.trim()) return;
    const conversationId = getConversationId(user.id, receiverId);
    const newMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      senderId: user.id,
      receiverId,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };
    setConversations(prev => {
      const existingConv = prev.find(c => c.id === conversationId);
      let updated: Conversation[];
      if (existingConv) {
        updated = prev.map(c =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, newMessage], lastMessage: newMessage }
            : c
        );
      } else {
        updated = [...prev, {
          id: conversationId,
          participants: [user.id, receiverId] as [string, string],
          messages: [newMessage],
          lastMessage: newMessage
        }];
      }
      apiFetch('/conversations', { method: 'POST', body: JSON.stringify(updated) });
      return updated;
    });
  };

  const getConversation = (otherId: string): Conversation | undefined => {
    if (!user) return undefined;
    const conversationId = getConversationId(user.id, otherId);
    return conversations.find(c => c.id === conversationId);
  };

  const markMessagesAsRead = (otherId: string) => {
    if (!user) return;
    const conversationId = getConversationId(user.id, otherId);
    setConversations(prev => {
      const updated = prev.map(c => {
        if (c.id === conversationId) {
          return { ...c, messages: c.messages.map(m => m.receiverId === user.id && !m.read ? { ...m, read: true } : m) };
        }
        return c;
      });
      apiFetch('/conversations', { method: 'POST', body: JSON.stringify(updated) });
      return updated;
    });
  };

  const getUnreadCount = (): number => {
    if (!user) return 0;
    return conversations.reduce((count, conv) => {
      return count + conv.messages.filter(m => m.receiverId === user.id && !m.read).length;
    }, 0);
  };

  const clearAllData = () => {
    safeRemoveStorage('aureux_user');
    safeRemoveStorage('aureux_users');
    safeRemoveStorage('aureux_friends');
    safeRemoveStorage('aureux_posts');
    safeRemoveStorage('aureux_library');
    safeRemoveStorage('aureux_drafts');
    safeRemoveStorage('aureux_conversations');
    safeRemoveStorage('aureux_ratings');
    setUser(null);
    setUsers([]);
    setFriends([]);
    setPosts([]);
    setLibrary([]);
    setStories([]);
    setDrafts([]);
    setConversations([]);
    setStoryRatings([]);
    apiFetch('/clear', { method: 'POST' });
  };

  const rateStory = (storyId: string, rating: number) => {
    if (!user) return;
    setStoryRatings(prev => {
      const existing = prev.findIndex(r => r.storyId === storyId && r.userId === user.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], rating };
        return updated;
      }
      return [...prev, { storyId, userId: user.id, rating }];
    });
    apiFetch('/ratings', { method: 'POST', body: JSON.stringify({ storyId, userId: user.id, rating }) });
  };

  const getStoryRating = (storyId: string): number => {
    const ratings = storyRatings.filter(r => r.storyId === storyId);
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  };

  const getUserStoryRating = (storyId: string): number | null => {
    if (!user) return null;
    const rating = storyRatings.find(r => r.storyId === storyId && r.userId === user.id);
    return rating ? rating.rating : null;
  };

  const markNotificationsRead = () => {
    if (!user) return;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    apiFetch(`/notifications/${user.id}/read`, { method: 'POST' });
  };

  const getUnreadNotifCount = (): number => {
    return notifications.filter(n => !n.read).length;
  };

  const markPostAsRead = (postId: number) => {
    const postIdStr = postId.toString();
    if (!readPosts.includes(postIdStr)) {
      setReadPosts(prev => [...prev, postIdStr]);
    }
  };

  const getUnreadPostCount = (): number => {
    if (!user) return 0;
    // Count posts from people you follow that you haven't read
    return posts.filter(post => {
      const postUserId = users.find(u => u.username === post.user)?.id;
      const isFromFollowing = postUserId && following.includes(postUserId);
      const isUnread = !readPosts.includes(post.id.toString());
      return isFromFollowing && isUnread;
    }).length;
  };

  return (
    <AppContext.Provider value={{
      user, users, following, followers, posts, library, stories, drafts, conversations, notifications,
      readPosts, language, setLanguage, t,
      login, register, adminLogin, registerAdmin, logout, updateProfile,
      followUser, unfollowUser, isFollowing, isFriend, getFollowers, getFriends, addPost, likePost, unlikePost, addComment,
      addToLibrary, removeFromLibrary, isInLibrary, updateStory,
      saveDraft, deleteDraft, addChapter, updateChapter, deleteChapter, reorderChapters,
      sendMessage, getConversation, markMessagesAsRead, getUnreadCount,
      clearAllData, rateStory, getStoryRating, getUserStoryRating,
      markNotificationsRead, getUnreadNotifCount, markPostAsRead, getUnreadPostCount
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    return {
      user: null, users: COMMUNITY_USERS, following: [], followers: [], posts: INITIAL_POSTS,
      library: [], stories: INITIAL_STORIES,
      login: async () => false, register: async () => false,
      adminLogin: async () => false, registerAdmin: async () => false,
      logout: () => {}, updateProfile: () => {},
      followUser: () => {}, unfollowUser: () => {}, isFollowing: () => false, isFriend: () => false, getFollowers: () => [], getFriends: () => [],
      addPost: () => {}, likePost: () => {}, unlikePost: () => {}, addComment: () => {},
      addToLibrary: () => {}, removeFromLibrary: () => {}, isInLibrary: () => false,
      updateStory: () => {},
      drafts: INITIAL_DRAFTS, saveDraft: () => {}, deleteDraft: () => {},
      addChapter: () => {}, updateChapter: () => {}, deleteChapter: () => {}, reorderChapters: () => {},
      conversations: [], sendMessage: () => {}, getConversation: () => undefined,
      markMessagesAsRead: () => {}, getUnreadCount: () => 0,
      clearAllData: () => {},
      rateStory: () => {}, getStoryRating: () => 0, getUserStoryRating: () => null,
      notifications: [], markNotificationsRead: () => {}, getUnreadNotifCount: () => 0,
      readPosts: [], markPostAsRead: () => {}, getUnreadPostCount: () => 0,
      language: 'en', setLanguage: () => {}, t: (key) => key
    };
  }
  return context;
}
