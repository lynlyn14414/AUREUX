import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Book } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StoryCard } from '../components/StoryCard';

export function Library() {
  const { user, library, stories } = useApp();

  const savedStories = stories.filter(story => library.includes(story.id));

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-slate-800 p-6 rounded-full mb-6">
            <Lock size={48} className="text-purple-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Library Locked</h2>
        <p className="text-slate-400 max-w-md mb-8">
          Sign in to access your personal library, bookmarks, and reading history.
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4 mb-8">
         <h1 className="text-3xl font-bold text-white">My Library</h1>
         <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-sm font-medium">{savedStories.length} Stories</span>
      </div>
      
      {savedStories.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
           <Book size={48} className="mx-auto text-slate-600 mb-4" />
           <p className="text-slate-400 text-lg mb-6">Your library is empty.</p>
           <Link to="/search" className="text-purple-400 hover:text-purple-300 font-bold hover:underline">Browse Stories</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {savedStories.map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
        </div>
      )}
    </div>
  );
}
