import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Link as LinkIcon, Shield, Globe } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function Settings() {
  const { user, updateProfile, language, setLanguage, t } = useApp();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState(user?.email || '');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [linkedGoogle, setLinkedGoogle] = useState(false);

  // Check if user has Google linked (based on email domain or stored flag)
  useEffect(() => {
    if (user?.email) {
      // Check if account was created with Google (you could also store a flag in user data)
      const isGoogleAccount = localStorage.getItem('aureux_googleLinked') === 'true';
      setLinkedGoogle(isGoogleAccount);
    }
  }, [user]);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSaveEmail = () => {
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    updateProfile({ email: email.trim() });
    setIsEditingEmail(false);
    toast.success('Email updated!');
  };

  const handleGoogleLink = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const googleEmail = decoded.email;
      const googleId = decoded.sub;
      
      // Update user email and googleId (keep original password for normal login)
      updateProfile({ 
        email: googleEmail, 
        googleId: googleId 
        // Note: We don't change the password, so original password still works
      });
      setEmail(googleEmail);
      localStorage.setItem('aureux_googleLinked', 'true');
      setLinkedGoogle(true);
      toast.success('Google account linked successfully!');
    }
  };

  const handleUnlinkGoogle = () => {
    updateProfile({ googleId: undefined });
    localStorage.removeItem('aureux_googleLinked');
    setLinkedGoogle(false);
    toast.success('Google account unlinked');
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-700">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="text-purple-400" size={28} />
              Account Settings
            </h1>
            <p className="text-slate-400 mt-2">Manage your account details and linked services</p>
          </div>

          <div className="p-6 space-y-8">
            {/* Email Section */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Mail size={20} className="text-blue-400" />
                {t('changeEmail')}
              </h2>
              <div className="bg-slate-700/50 rounded-xl p-4">
                {isEditingEmail ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="your@email.com"
                    />
                    <button 
                      onClick={handleSaveEmail}
                      className="p-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
                    >
                      <Check size={18} />
                    </button>
                    <button 
                      onClick={() => { setIsEditingEmail(false); setEmail(user?.email || ''); }}
                      className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">{t('currentEmail')}</p>
                      <p className="text-white font-medium">{user?.email || 'No email set'}</p>
                    </div>
                    <button 
                      onClick={() => setIsEditingEmail(true)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium"
                    >
                      {t('edit')}
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Language Section */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Globe size={20} className="text-blue-400" />
                {t('language')}
              </h2>
              <div className="bg-slate-700/50 rounded-xl p-4">
                <p className="text-slate-400 text-sm mb-3">{t('selectLanguage')}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      language === 'en'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    🇺🇸 {t('english')}
                  </button>
                  <button
                    onClick={() => setLanguage('es')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      language === 'es'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    🇪🇸 {t('spanish')}
                  </button>
                </div>
              </div>
            </section>

            {/* Linked Accounts Section */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <LinkIcon size={20} className="text-green-400" />
                {t('linkedAccounts')}
              </h2>
              <div className="bg-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold">
                      G
                    </div>
                    <div>
                      <p className="text-white font-medium">Google</p>
                      <p className="text-slate-400 text-sm">
                        {linkedGoogle ? t('connected') : t('notConnected')}
                      </p>
                    </div>
                  </div>
                  {linkedGoogle ? (
                    <button
                      onClick={handleUnlinkGoogle}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
                    >
                      {t('unlink')}
                    </button>
                  ) : (
                    <div className="scale-90 origin-right">
                      <GoogleLogin
                        onSuccess={handleGoogleLink}
                        onError={() => toast.error('Google linking failed')}
                        text="link"
                        size="medium"
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
