import React from 'react';
import { ArrowLeft, BookOpen, Plus, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StoryCard } from '../components/StoryCard';

export function MyStories() {
  const { user, drafts, getStoryRating } = useApp();

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <BookOpen size={64} className="text-slate-600 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Please log in</h2>
        <p className="text-slate-400 mb-6">You need to be logged in to view your stories.</p>
        <Link to="/auth" className="text-purple-400 hover:text-purple-300 font-medium">
          Log In
        </Link>
      </div>
    );
  }

  const myPublishedStories = drafts
    .filter(d => d.published && (d.authorId === user.id || !d.authorId))
    .map(draft => {
      const storyId = `user_story_${draft.id}`;
      return {
        id: storyId,
        title: draft.title,
        image: draft.coverImage || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
        rating: getStoryRating(storyId),
        chapters: draft.chapters.filter(ch => ch.published).length,
        category: draft.genre,
        type: 'Original',
        updatedAt: draft.lastUpdated,
        description: draft.synopsis,
        author: user.username,
        isUserStory: true
      };
    });

  const myDrafts = drafts.filter(d => !d.published && (d.authorId === user.id || !d.authorId));

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-gradient-to-b from-purple-900/50 to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/profile"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">My Stories</h1>
              <p className="text-slate-400">Manage your published and draft stories</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Published Stories ({myPublishedStories.length})</h2>
          <Link 
            to="/write"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus size={18} /> New Story
          </Link>
        </div>

        {myPublishedStories.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/30 rounded-xl border border-slate-700 mb-12">
            <BookOpen size={48} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No published stories yet</h3>
            <p className="text-slate-400 mb-6">Start writing and publish your first story!</p>
            <Link 
              to="/write"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
            >
              <Edit3 size={18} /> Start Writing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
            {myPublishedStories.map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}

        {myDrafts.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-white mb-6">Drafts ({myDrafts.length})</h2>
            <div className="space-y-3">
              {myDrafts.map(draft => (
                <Link 
                  key={draft.id} 
                  to={`/write?edit=${draft.id}`}
                  className="flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-purple-500/50 transition-all"
                >
                  <div className="w-16 h-20 rounded overflow-hidden bg-slate-700 flex-shrink-0">
                    {draft.coverImage ? (
                      <img src={draft.coverImage} alt={draft.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={24} className="text-slate-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{draft.title || 'Untitled'}</h3>
                    <p className="text-slate-500 text-sm">
                      {draft.chapters.length} chapters • {draft.genre} • Last edited {draft.lastUpdated}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-slate-700 text-slate-400 text-xs rounded-full">Draft</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
