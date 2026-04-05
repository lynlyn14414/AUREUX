import React from 'react';
import { Github, Twitter, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="HECATE" className="w-10 h-10 rounded-full object-cover" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                HECATE
              </span>
            </div>
            <p className="mt-2 text-sm">Read your favorite stories anytime, anywhere.</p>
          </div>
          
          <div className="flex space-x-6 mb-4 md:mb-0">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>

          <div className="flex space-x-4">
            <a href="#" className="hover:text-white transition-colors"><Twitter size={20} /></a>
            <a href="#" className="hover:text-white transition-colors"><Github size={20} /></a>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm border-t border-slate-800 pt-8 flex items-center justify-center gap-1">
          Made with <Heart size={14} className="text-red-500 fill-current" /> for readers worldwide.
        </div>
      </div>
    </footer>
  );
}