import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, CreditCard, Link as LinkIcon, Shield, ChevronRight, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function Settings() {
  const { user, updateProfile } = useApp();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState(user?.email || '');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [linkedAccounts, setLinkedAccounts] = useState({
    google: false,
    discord: false,
    facebook: false
  });
  const [paymentMethods, setPaymentMethods] = useState({
    creditcard: false,
    paypal: false,
    bizum: false
  });

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

  const toggleLinkedAccount = (provider: keyof typeof linkedAccounts) => {
    setLinkedAccounts(prev => ({ ...prev, [provider]: !prev[provider] }));
    toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} ${linkedAccounts[provider] ? 'unlinked' : 'linked'}!`);
  };

  const togglePaymentMethod = (method: keyof typeof paymentMethods) => {
    setPaymentMethods(prev => ({ ...prev, [method]: !prev[method] }));
    toast.success(`${method === 'creditcard' ? 'Credit Card' : method.charAt(0).toUpperCase() + method.slice(1)} ${paymentMethods[method] ? 'removed' : 'added'}!`);
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
                Email Address
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
                      <p className="text-slate-400 text-sm">Current email</p>
                      <p className="text-white font-medium">{user?.email || 'No email set'}</p>
                    </div>
                    <button 
                      onClick={() => setIsEditingEmail(true)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Linked Accounts Section */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <LinkIcon size={20} className="text-green-400" />
                Linked Accounts
              </h2>
              <div className="space-y-3">
                {[
                  { key: 'google', name: 'Google', color: 'bg-red-500' },
                  { key: 'discord', name: 'Discord', color: 'bg-indigo-500' },
                  { key: 'facebook', name: 'Facebook', color: 'bg-blue-600' }
                ].map((account) => (
                  <div 
                    key={account.key}
                    className="flex items-center justify-between bg-slate-700/50 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${account.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                        {account.name[0]}
                      </div>
                      <div>
                        <p className="text-white font-medium">{account.name}</p>
                        <p className="text-slate-400 text-sm">
                          {linkedAccounts[account.key as keyof typeof linkedAccounts] ? 'Connected' : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleLinkedAccount(account.key as keyof typeof linkedAccounts)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        linkedAccounts[account.key as keyof typeof linkedAccounts]
                          ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      {linkedAccounts[account.key as keyof typeof linkedAccounts] ? 'Unlink' : 'Link'}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Payment Methods Section */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-yellow-400" />
                Payment Methods
              </h2>
              <div className="space-y-3">
                {[
                  { key: 'creditcard', name: 'Credit Card', icon: '💳' },
                  { key: 'paypal', name: 'PayPal', icon: '🅿️' },
                  { key: 'bizum', name: 'Bizum', icon: '💶' }
                ].map((method) => (
                  <div 
                    key={method.key}
                    className="flex items-center justify-between bg-slate-700/50 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center text-xl">
                        {method.icon}
                      </div>
                      <div>
                        <p className="text-white font-medium">{method.name}</p>
                        <p className="text-slate-400 text-sm">
                          {paymentMethods[method.key as keyof typeof paymentMethods] ? 'Added' : 'Not added'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => togglePaymentMethod(method.key as keyof typeof paymentMethods)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        paymentMethods[method.key as keyof typeof paymentMethods]
                          ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      {paymentMethods[method.key as keyof typeof paymentMethods] ? 'Remove' : 'Add'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
