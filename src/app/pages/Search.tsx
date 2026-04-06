import React, { useState } from 'react';
import { Search as SearchIcon, Filter, X, Star, ChevronDown } from 'lucide-react';
import { StoryCard } from '../components/StoryCard';
import { useApp } from '../context/AppContext';

const GENRES = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Thriller", "Historical", "Supernatural", "Psychological", "Sports", "Mecha", "Isekai", "Yaoi", "Yuri", "Shounen", "Shoujo", "Seinen", "Josei", "Mature", "Tragedy", "School Life", "Martial Arts", "Video Games", "Wuxia", "Xianxia", "Magical Realism", "Cyberpunk", "Steampunk", "Post-Apocalyptic", "Dystopian", "Gore", "Gender Bender", "Harem", "Reverse Harem", "Survival", "Military", "Police", "Medical", "Cooking", "Music", "Dance", "Art", "Philosophy", "Political", "Business", "Economics", "Law", "Education", "Travel", "Nature", "Animals", "Pets", "Vampires", "Werewolves", "Zombies", "Demons", "Angels", "Gods", "Monsters", "Dragons", "Magic", "Superpowers", "Time Travel", "Space", "Aliens", "Robots", "AI", "Virtual Reality", "Augmented Reality", "Dreams", "Reincarnation", "Transmigration", "System", "Leveling", "Cultivation", "Alchemy", "Astrology", "Tarot", "Occult", "Paranormal", "Ghost", "Spirits", "Folklore", "Mythology", "Legends", "Fairy Tales", "Fables", "Poetry", "Songs", "LGBTQ+", "BL", "GL", "Non-binary", "Transgender", "Asexual", "Bisexual", "Pansexual", "Demisexual", "Polyamory", "BDSM", "Kink", "Fetish"];

export function Search() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const { stories, drafts, users, getStoryRating } = useApp();

  const publishedUserStories = drafts
    .filter(draft => draft.published && draft.chapters.some(ch => ch.published))
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
        isUserStory: true
      };
    });

  const allStories = [...publishedUserStories, ...stories];

  const filteredStories = allStories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (story.author && story.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (story.description && story.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <h1 className="text-3xl font-bold text-white">Explore Stories</h1>
        
        <div className="flex gap-3 items-center w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <input
              type="text"
              placeholder="Search novels, manga, authors..."
              className="w-full bg-slate-800 border border-slate-700 rounded-full py-3 px-12 text-white focus:outline-none focus:border-purple-500 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-full font-medium transition-all ${
              showFilters || activeFiltersCount > 0
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Filter size={18} />
            <span className="hidden sm:inline">Filter</span>
            {activeFiltersCount > 0 && (
              <span className="bg-white text-purple-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-8 p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filteredStories.map(story => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
      
      {filteredStories.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <p className="text-xl">No stories found matching your criteria.</p>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="mt-4 text-purple-400 hover:text-purple-300"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
