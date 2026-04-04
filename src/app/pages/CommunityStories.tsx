import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, BookOpen, User, X, Star, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StoryCard } from '../components/StoryCard';

const GENRES = ["Action", "Romance", "Sci-Fi", "Fantasy", "Adventure", "Comedy", "Horror", "Drama", "Mystery", "Thriller", "Slice of Life"];

export function CommunityStories() {
  const { stories, drafts, users, getStoryRating } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  const originalStories = stories.filter(s => s.type === 'Original');

  const publishedUserStories = drafts
    .filter(draft => draft.published && draft.chapters.some(ch => ch.published) && !draft.isOfficial)
    .map(draft => {
      const author = users.find(u => u.id === draft.authorId);
      const editor = draft.editorId ? users.find(u => u.id === draft.editorId) : null;
      const publishedChapters = draft.chapters.filter(ch => ch.published);
      const storyId = `user_story_${draft.id}`;
      return {
        id: storyId,
        title: draft.title,
        image: draft.coverImage || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
        rating: getStoryRating(storyId),
        chapters: publishedChapters.length,
        category: draft.genre,
        type: 'Original',
        updatedAt: draft.lastUpdated,
        description: draft.synopsis,
        author: draft.originalAuthor || author?.username || 'Anonymous',
        editor: draft.originalAuthor ? (editor?.username || author?.username) : undefined,
        authorId: draft.authorId,
        isUserStory: true
      };
    });

  const allCommunityStories = [...publishedUserStories, ...originalStories];

  const filteredStories = allCommunityStories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          story.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const storyGenres = story.category ? story.category.split(', ').map(g => g.trim()) : [];
    const matchesGenre = selectedGenres.length === 0 || 
                         selectedGenres.some(g => storyGenres.includes(g));
    
    const storyRating = story.rating || 0;
    const matchesRating = ratingFilter === null || storyRating >= ratingFilter;
    
    return matchesSearch && matchesGenre && matchesRating;
  });

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setRatingFilter(null);
  };

  const activeFiltersCount = selectedGenres.length + (ratingFilter ? 1 : 0);

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-gradient-to-b from-purple-900/50 to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Community Stories</h1>
              <p className="text-slate-400">Discover original stories created by our community</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stories..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <Search size={18} className="absolute left-3 top-3.5 text-slate-500" />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Filter size={18} />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <span className="bg-white text-purple-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <X size={14} /> Clear all
                  </button>
                )}
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Genres (select multiple)</h4>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map(genre => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedGenres.includes(genre)
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-3">Rating</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setRatingFilter(null)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      ratingFilter === null
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    All Ratings
                  </button>
                  <button
                    onClick={() => setRatingFilter(4)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                      ratingFilter === 4
                        ? 'bg-yellow-500 text-black'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <Star size={14} className={ratingFilter === 4 ? 'fill-black' : ''} /> 4+ Stars
                  </button>
                  <button
                    onClick={() => setRatingFilter(5)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                      ratingFilter === 5
                        ? 'bg-yellow-500 text-black'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <Star size={14} className={ratingFilter === 5 ? 'fill-black' : ''} /> 5 Stars
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {activeFiltersCount > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-slate-400 text-sm">Active filters:</span>
            {selectedGenres.map(genre => (
              <span
                key={genre}
                className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm flex items-center gap-1"
              >
                {genre}
                <button onClick={() => toggleGenre(genre)} className="hover:text-white">
                  <X size={14} />
                </button>
              </span>
            ))}
            {ratingFilter && (
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm flex items-center gap-1">
                {ratingFilter}+ Stars
                <button onClick={() => setRatingFilter(null)} className="hover:text-white">
                  <X size={14} />
                </button>
              </span>
            )}
          </div>
        )}

        {filteredStories.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={64} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No stories found</h3>
            <p className="text-slate-400 mb-6">
              {searchQuery || activeFiltersCount > 0
                ? 'Try adjusting your search or filters' 
                : 'Be the first to publish a story!'}
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="mb-4 text-purple-400 hover:text-purple-300"
              >
                Clear filters
              </button>
            )}
            <Link 
              to="/write"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
            >
              Start Writing
            </Link>
          </div>
        ) : (
          <>
            <p className="text-slate-400 mb-6">{filteredStories.length} stories found</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredStories.map(story => (
                <div key={story.id} className="relative">
                  <StoryCard story={story} />
                  {story.author && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                      <User size={12} />
                      {story.authorId ? (
                        <Link to={`/user/${story.authorId}`} className="hover:text-purple-400 transition-colors">
                          {story.author}
                        </Link>
                      ) : (
                        <span>{story.author}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
