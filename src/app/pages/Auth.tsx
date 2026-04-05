import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, User, Lock, Eye, EyeOff, ShieldCheck, Key, Mail } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminCode: ''
  });

  const { login, register, adminLogin, registerAdmin } = useApp();
  const navigate = useNavigate();

  const handleGoogleLogin = async (email: string, name: string, googleId: string) => {
    // Create username from email (before @)
    const username = email.split('@')[0];
    
    // Try to login first
    const loginSuccess = await login({ username, password: googleId });
    
    if (loginSuccess) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      // User doesn't exist, register them
      const registerSuccess = await register({ 
        username, 
        email,
        password: googleId 
      });
      
      if (registerSuccess) {
        toast.success('Account created with Google!');
        navigate('/');
      } else {
        toast.error('Failed to create account');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    if (!isLogin && !formData.email.trim()) {
      toast.error('Please enter an email');
      return;
    }

    if (!isLogin && !formData.email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    if (!formData.password) {
      toast.error('Please enter a password');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const userData = { 
      username: formData.username.trim(), 
      email: formData.email.trim(),
      password: formData.password 
    };

    if (isAdminMode) {
      if (isLogin) {
        const success = await adminLogin(userData);
        if (success) {
          toast.success('Welcome back, Admin!');
          navigate('/');
        } else {
          toast.error('Invalid admin credentials');
        }
      } else {
        if (!formData.adminCode) {
          toast.error('Please enter the admin registration code');
          return;
        }
        const success = await registerAdmin(userData, formData.adminCode);
        if (success) {
          toast.success('Admin account created successfully!');
          navigate('/');
        } else {
          if (formData.adminCode !== 'AUREUX2024') {
            toast.error('Invalid admin registration code');
          } else {
            toast.error('Username already taken');
          }
        }
      }
    } else {
      if (isLogin) {
        const success = await login(userData);
        if (success) {
          toast.success('Welcome back!');
          navigate('/');
        } else {
          toast.error('Invalid username or password');
        }
      } else {
        const success = await register(userData);
        if (success) {
          toast.success('Account created successfully!');
          navigate('/');
        } else {
          toast.error('Username already taken');
        }
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isAdminMode ? 'bg-yellow-600' : 'bg-gradient-to-br from-purple-600 to-blue-600'}`}>
            {isAdminMode ? <ShieldCheck size={32} className="text-white" /> : <BookOpen size={32} className="text-white" />}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isAdminMode ? 'Admin Portal' : 'Welcome to HECATE'}
          </h1>
          <p className="text-slate-400">
            {isLogin ? 'Sign in to continue' : 'Create your account'}
          </p>
        </div>

        <div className={`rounded-2xl p-8 border shadow-xl ${isAdminMode ? 'bg-yellow-950/30 border-yellow-700/50' : 'bg-slate-800 border-slate-700'}`}>
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                isLogin 
                  ? isAdminMode ? 'bg-yellow-600 text-white' : 'bg-purple-600 text-white' 
                  : 'bg-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                !isLogin 
                  ? isAdminMode ? 'bg-yellow-600 text-white' : 'bg-purple-600 text-white' 
                  : 'bg-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-12 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            )}

            {!isLogin && isAdminMode && (
              <div>
                <label className="block text-sm font-medium text-yellow-400 mb-2">
                  Admin Registration Code
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500" size={20} />
                  <input
                    type="password"
                    value={formData.adminCode}
                    onChange={(e) => setFormData({ ...formData, adminCode: e.target.value })}
                    className="w-full bg-slate-900 border border-yellow-700/50 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    placeholder="Enter admin code"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
                isAdminMode 
                  ? 'bg-yellow-600 hover:bg-yellow-700' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>

            {!isAdminMode && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-800 text-slate-400">Or continue with</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      if (credentialResponse.credential) {
                        const decoded: any = jwtDecode(credentialResponse.credential);
                        const email = decoded.email;
                        const name = decoded.name;
                        const googleId = decoded.sub;
                        
                        // Create or login user with Google data
                        handleGoogleLogin(email, name, googleId);
                      }
                    }}
                    onError={() => {
                      toast.error('Google Sign In failed');
                    }}
                    useOneTap
                  />
                </div>
              </>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <button
              onClick={() => {
                setIsAdminMode(!isAdminMode);
                setFormData({ username: '', password: '', confirmPassword: '', adminCode: '' });
              }}
              className={`w-full py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                isAdminMode 
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                  : 'bg-yellow-900/30 text-yellow-500 hover:bg-yellow-900/50 border border-yellow-700/50'
              }`}
            >
              <ShieldCheck size={18} />
              {isAdminMode ? 'Switch to User Login' : 'Admin Login'}
            </button>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
