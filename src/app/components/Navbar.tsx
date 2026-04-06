import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, PenTool, User, Menu, X, Library, BookOpen, Users, LogOut, ShieldCheck, MessageCircle, Settings, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { twMerge } from 'tailwind-merge';
import { useApp } from '../context/AppContext';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, getUnreadCount, notifications, getUnreadNotifCount, markNotificationsRead, t } = useApp();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  const unreadMessages = getUnreadCount();
  const unreadNotifs = getUnreadNotifCount();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allNavLinks = [
    { name: t('home'), path: '/', icon: <BookOpen size={20} /> },
    { name: t('library'), path: '/library', icon: <Library size={20} />, protected: true },
    { name: t('write'), path: '/write', icon: <PenTool size={20} />, protected: true },
    { name: t('search'), path: '/search', icon: <Search size={20} /> },
    { name: t('community'), path: '/social', icon: <Users size={20} /> },
  ];

  const navLinks = allNavLinks.filter(link => !link.protected || user);

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md text-slate-100 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/logo.jpg" alt="HECATE" className="w-10 h-10 rounded-full object-cover scale-[1.4]" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              HECATE
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={twMerge(
                  "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                  location.pathname === link.path
                    ? "text-purple-400 bg-slate-800"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                )}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center gap-4 ml-4">
                <Link 
                  to="/chat"
                  className={twMerge(
                    "relative p-2 rounded-lg transition-colors",
                    location.pathname === '/chat'
                      ? "text-purple-400 bg-slate-800"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  )}
                  title={t('messages')}
                >
                  <MessageCircle size={22} />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </Link>
                
                {/* Profile Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button 
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full hover:bg-slate-800 transition-colors ${user.isAdmin ? 'bg-yellow-900/30 border border-yellow-600/50' : ''}`}
                  >
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden ${user.isAdmin ? 'bg-yellow-600' : 'bg-purple-600'}`}>
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="avatar"/> : user.username.charAt(0)}
                     </div>
                     <div className="flex flex-col">
                       <span className="text-sm font-medium leading-none">{user.username}</span>
                       {user.isAdmin && <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">Admin</span>}
                     </div>
                  </button>
                  
                  {profileMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden z-50">
                      <Link 
                        to="/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-slate-200 hover:bg-slate-700 transition-colors"
                      >
                        <User size={18} className="text-purple-400" />
                        <span>{t('profile')}</span>
                      </Link>
                      <Link 
                        to="/settings"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-slate-200 hover:bg-slate-700 transition-colors"
                      >
                        <Settings size={18} className="text-blue-400" />
                        <span>{t('settings')}</span>
                      </Link>
                      <button 
                        onClick={() => { navigate('/notifications'); setProfileMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-200 hover:bg-slate-700 transition-colors"
                      >
                        <div className="relative">
                          <Bell size={18} className="text-green-400" />
                          {unreadNotifs > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full w-3 h-3 flex items-center justify-center"></span>
                          )}
                        </div>
                        <span>{t('notifications')}</span>
                        {unreadNotifs > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadNotifs}</span>
                        )}
                      </button>
                      <div className="border-t border-slate-700"></div>
                      <button 
                        onClick={() => { logout(); setProfileMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-700 transition-colors"
                      >
                        <LogOut size={18} />
                        <span>{t('signOut')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                to="/auth"
                className="ml-4 px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
              >
                {t('signIn')}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900 border-b border-slate-800 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={twMerge(
                    "flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium",
                    location.pathname === link.path
                      ? "text-purple-400 bg-slate-800"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  )}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}
              
              {user ? (
                 <div className="border-t border-slate-700 mt-4 pt-4 px-3 space-y-1">
                    <div className="flex items-center gap-3 mb-4 p-2">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold overflow-hidden ${user.isAdmin ? 'bg-yellow-600' : 'bg-purple-600'}`}>
                          {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="avatar"/> : user.username.charAt(0)}
                       </div>
                       <div>
                         <p className="text-white font-medium flex items-center gap-2">
                            {user.username}
                            {user.isAdmin && <ShieldCheck size={14} className="text-yellow-500" />}
                         </p>
                         <p className="text-slate-500 text-xs">{user.isAdmin ? 'Admin' : 'User'}</p>
                       </div>
                    </div>
                    
                    <Link 
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className={twMerge(
                        "flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium",
                        location.pathname === '/profile'
                          ? "text-purple-400 bg-slate-800"
                          : "text-slate-300 hover:text-white hover:bg-slate-800"
                      )}
                    >
                      <User size={20} />
                      <span>{t('profile')}</span>
                    </Link>
                    
                    <Link 
                      to="/settings"
                      onClick={() => setIsOpen(false)}
                      className={twMerge(
                        "flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium",
                        location.pathname === '/settings'
                          ? "text-purple-400 bg-slate-800"
                          : "text-slate-300 hover:text-white hover:bg-slate-800"
                      )}
                    >
                      <Settings size={20} />
                      <span>{t('settings')}</span>
                    </Link>
                    
                    <Link 
                      to="/notifications"
                      onClick={() => setIsOpen(false)}
                      className={twMerge(
                        "flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium",
                        location.pathname === '/notifications'
                          ? "text-purple-400 bg-slate-800"
                          : "text-slate-300 hover:text-white hover:bg-slate-800"
                      )}
                    >
                      <div className="relative">
                        <Bell size={20} />
                        {unreadNotifs > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                            {unreadNotifs > 9 ? '9+' : unreadNotifs}
                          </span>
                        )}
                      </div>
                      <span>{t('notifications')}</span>
                      {unreadNotifs > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {unreadNotifs}
                        </span>
                      )}
                    </Link>
                    
                    <Link 
                      to="/chat"
                      onClick={() => setIsOpen(false)}
                      className={twMerge(
                        "flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium",
                        location.pathname === '/chat'
                          ? "text-purple-400 bg-slate-800"
                          : "text-slate-300 hover:text-white hover:bg-slate-800"
                      )}
                    >
                      <div className="relative">
                        <MessageCircle size={20} />
                        {unreadMessages > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                            {unreadMessages > 9 ? '9+' : unreadMessages}
                          </span>
                        )}
                      </div>
                      <span>{t('messages')}</span>
                    </Link>
                    
                    <div className="border-t border-slate-700 my-2"></div>
                    
                    <button 
                      onClick={() => { logout(); setIsOpen(false); }}
                      className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-red-400 hover:text-red-300 w-full text-left"
                    >
                      <LogOut size={20} />
                      <span>{t('signOut')}</span>
                    </button>
                 </div>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-white bg-purple-600 hover:bg-purple-700 mt-4"
                >
                  <User size={20} />
                  <span>{t('signIn')} / {t('createAccount')}</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}