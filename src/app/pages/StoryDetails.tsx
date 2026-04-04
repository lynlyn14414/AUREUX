import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, Clock, BookOpen, Check, Plus, User, Send, MessageSquare, Edit, Edit3, ChevronRight, Lock, Sun, Moon, Settings, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export function StoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, addToLibrary, removeFromLibrary, isInLibrary, addPost, stories, drafts, users, deleteDraft, getStoryRating, getUserStoryRating, rateStory } = useApp();
  const [comment, setComment] = useState("");
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [readerTheme, setReaderTheme] = useState<'dark' | 'light' | 'sepia'>('dark');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const chapterReaderRef = useRef<HTMLDivElement>(null);
  const chapterScrollRef = useRef<HTMLDivElement>(null);
  
  const isUserStory = id?.startsWith('user_story_');
  const draftId = isUserStory ? id?.replace('user_story_', '') : null;
  
  const draft = draftId ? drafts.find(d => d.id === draftId) : null;
  const regularStory = stories.find(s => s.id === id);
  
  const isComicFormat = draft ? ['Manga', 'Manhwa', 'Manhua'].includes(draft.category) : false;
  
  const storyId = draft ? `user_story_${draft.id}` : id || '';
  const currentRating = getStoryRating(storyId);
  const userRating = getUserStoryRating(storyId);

  const authorUser = draft ? users.find(u => u.id === draft.authorId) : null;
  const editorUser = draft?.editorId ? users.find(u => u.id === draft.editorId) : null;
  
  const story = draft ? {
    id: storyId,
    title: draft.title,
    image: draft.coverImage || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    rating: currentRating,
    chapters: draft.chapters.filter(ch => ch.published).length,
    category: draft.genre,
    storyCategory: draft.category,
    type: 'Original',
    updatedAt: draft.lastUpdated,
    description: draft.synopsis,
    author: draft.originalAuthor || authorUser?.username || 'Anonymous',
    editor: draft.originalAuthor ? (editorUser?.username || authorUser?.username) : undefined,
    authorId: draft.authorId,
    isUserStory: true,
    chapterList: draft.chapters.filter(ch => ch.published)
  } : regularStory;

  const handleRating = (rating: number) => {
    if (!user) {
      toast.error("Please login to rate stories");
      return;
    }
    rateStory(storyId, rating);
    toast.success(`You rated this story ${rating} stars!`);
  };

  const isSaved = story ? isInLibrary(story.id) : false;
  const isAuthor = draft && user && (draft.authorId === user.id || !draft.authorId);
  const canEdit = isAuthor;
  const canDelete = user?.isAdmin || isAuthor;

  const handleEditStory = () => {
    if (draftId) {
      navigate(`/write?edit=${draftId}`);
    }
  };

  const handleDeleteStory = () => {
    if (draftId) {
      deleteDraft(draftId);
      toast.success("Story deleted");
      navigate('/');
    }
    setShowDeleteConfirm(false);
  };

  if (!story) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <BookOpen size={64} className="text-slate-600 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Story not found</h2>
        <p className="text-slate-400 mb-6">This story may have been removed or unpublished.</p>
        <Link to="/" className="text-purple-400 hover:text-purple-300 font-medium">
          Back to Home
        </Link>
      </div>
    );
  }

  const handleAddToLibrary = () => {
    if (!user) {
      toast.error("Please login to add to library");
      return;
    }
    
    if (isSaved) {
      removeFromLibrary(story.id);
      toast.success("Removed from library");
    } else {
      addToLibrary(story.id);
      toast.success("Added to library");
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to comment");
      return;
    }
    if (!comment.trim()) return;

    addPost(comment, [story.title, "Discussion"]);
    setComment("");
    toast.success("Comment posted to Community feed!");
  };

  const chapterList = story.chapterList || [];

  return (
    <div className="min-h-screen pb-20">
      <div className="relative h-[300px] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center blur-sm opacity-50"
          style={{ backgroundImage: `url(${story.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-48 md:w-64 flex-shrink-0 mx-auto md:mx-0 rounded-lg overflow-hidden shadow-2xl shadow-purple-500/20"
          >
            <img src={story.image} alt={story.title} className="w-full h-auto object-cover" />
          </motion.div>

          <div className="flex-1 text-center md:text-left pt-4">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
            >
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">{story.category}</span>
                <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-bold">{story.type}</span>
                {story.author && (
                  <span className="flex items-center gap-1 text-slate-400 text-sm">
                    <User size={14} /> {story.author}
                  </span>
                )}
                {story.editor && (
                  <span className="flex items-center gap-1 text-yellow-500 text-sm">
                    <Edit3 size={14} /> Editor: {story.editor}
                  </span>
                )}
                <span className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                  <Star size={14} fill="currentColor" /> {story.rating}
                </span>
                <span className="flex items-center gap-1 text-slate-400 text-sm">
                  <Clock size={14} /> Updated {story.updatedAt}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{story.title}</h1>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
                {chapterList.length > 0 ? (
                  <button 
                    onClick={() => setSelectedChapter(chapterList[0]?.id)}
                    className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
                  >
                    <BookOpen size={20} /> Read First Chapter
                  </button>
                ) : (
                  <button className="bg-slate-700 text-slate-400 px-8 py-3 rounded-full font-bold cursor-not-allowed flex items-center gap-2">
                    <BookOpen size={20} /> {story.chapters || 0} Chapters
                  </button>
                )}
                <button 
                  onClick={handleAddToLibrary}
                  className={`px-6 py-3 rounded-full font-bold border transition-colors flex items-center gap-2 ${
                    isSaved 
                      ? 'bg-slate-800 border-slate-700 text-green-400' 
                      : 'bg-transparent border-white text-white hover:bg-white/10'
                  }`}
                >
                  {isSaved ? <><Check size={20} /> Saved</> : <><Plus size={20} /> Add to Library</>}
                </button>

                {canEdit && (
                  <button 
                    onClick={handleEditStory}
                    className="px-6 py-3 rounded-full font-bold border border-purple-500 text-purple-500 hover:bg-purple-500/10 transition-colors flex items-center gap-2"
                  >
                    <Edit size={20} /> Edit Story
                  </button>
                )}

                {canDelete && (
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-6 py-3 rounded-full font-bold border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={20} /> {user?.isAdmin && !isAuthor ? 'Delete (Admin)' : 'Delete Story'}
                  </button>
                )}
              </div>

              <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 mb-8 text-left">
                <h3 className="text-lg font-bold text-white mb-2">Synopsis</h3>
                <p className="text-slate-300 leading-relaxed">{story.description || 'No synopsis available.'}</p>
              </div>

              <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 mb-8 text-left">
                <h3 className="text-lg font-bold text-white mb-3">Rate this Story</h3>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          size={28}
                          className={`transition-colors ${
                            (hoverRating || userRating || 0) >= star
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-slate-400 text-sm">
                    {userRating ? (
                      <span>Your rating: <span className="text-yellow-400 font-bold">{userRating}</span> stars</span>
                    ) : (
                      <span>Click to rate</span>
                    )}
                  </div>
                </div>
                <p className="text-slate-500 text-sm mt-2">
                  Average: <span className="text-yellow-400 font-bold">{currentRating || 0}</span> stars
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {chapterList.length > 0 && (
          <div className="mt-12 max-w-4xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <BookOpen className="text-purple-500" /> Chapters ({chapterList.length})
            </h2>
            
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              {chapterList.map((chapter, index) => (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedChapter(chapter.id)}
                  className={`p-4 border-b border-slate-700 last:border-b-0 cursor-pointer hover:bg-slate-700/50 transition-colors ${
                    selectedChapter === chapter.id ? 'bg-slate-700/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{chapter.title}</h3>
                      <p className="text-slate-500 text-sm">
                        {chapter.wordCount?.toLocaleString() || 0} words
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-slate-500" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {selectedChapter && (
          <div ref={chapterReaderRef} className={`fixed inset-0 z-50 overflow-y-auto ${
            readerTheme === 'dark' ? 'bg-slate-950' : 
            readerTheme === 'light' ? 'bg-white' : 
            'bg-amber-50'
          }`}>
            <div className="max-w-3xl mx-auto px-4 py-8">
              <div className={`flex items-center justify-between mb-8 sticky top-0 py-4 -mx-4 px-4 z-10 ${
                readerTheme === 'dark' ? 'bg-slate-950' : 
                readerTheme === 'light' ? 'bg-white' : 
                'bg-amber-50'
              }`}>
                <button 
                  onClick={() => setSelectedChapter(null)}
                  className={`transition-colors ${
                    readerTheme === 'dark' ? 'text-slate-400 hover:text-white' : 
                    'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  &larr; Back to Story
                </button>
                
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-1 p-1 rounded-lg ${
                    readerTheme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'
                  }`}>
                    <button
                      onClick={() => setReaderTheme('light')}
                      className={`p-2 rounded-md transition-colors ${
                        readerTheme === 'light' ? 'bg-white shadow text-yellow-600' : 
                        readerTheme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600'
                      }`}
                      title="Light Mode"
                    >
                      <Sun size={18} />
                    </button>
                    <button
                      onClick={() => setReaderTheme('sepia')}
                      className={`p-2 rounded-md transition-colors ${
                        readerTheme === 'sepia' ? 'bg-amber-100 shadow text-amber-700' : 
                        readerTheme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600'
                      }`}
                      title="Sepia Mode"
                    >
                      <BookOpen size={18} />
                    </button>
                    <button
                      onClick={() => setReaderTheme('dark')}
                      className={`p-2 rounded-md transition-colors ${
                        readerTheme === 'dark' ? 'bg-slate-700 shadow text-purple-400' : 
                        'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Dark Mode"
                    >
                      <Moon size={18} />
                    </button>
                  </div>
                  
                  <span className={`text-sm ${
                    readerTheme === 'dark' ? 'text-slate-500' : 'text-slate-600'
                  }`}>
                    {isComicFormat 
                      ? `${chapterList.find(ch => ch.id === selectedChapter)?.panels?.length || 0} panels`
                      : `${chapterList.find(ch => ch.id === selectedChapter)?.wordCount?.toLocaleString() || 0} words`
                    }
                  </span>
                </div>
              </div>
              
              <h1 className={`text-2xl md:text-3xl font-bold mb-8 ${
                readerTheme === 'dark' ? 'text-white' : 
                readerTheme === 'light' ? 'text-slate-900' : 
                'text-amber-900'
              }`}>
                {chapterList.find(ch => ch.id === selectedChapter)?.title}
              </h1>
              
              {isComicFormat && chapterList.find(ch => ch.id === selectedChapter)?.panels?.length ? (
                <div className="space-y-1">
                  {chapterList.find(ch => ch.id === selectedChapter)?.panels?.map((panel, idx) => (
                    <img 
                      key={idx}
                      src={panel} 
                      alt={`Panel ${idx + 1}`}
                      className="w-full"
                      loading="lazy"
                    />
                  ))}
                </div>
              ) : (
                <div 
                  className="prose prose-lg max-w-none"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {chapterList.find(ch => ch.id === selectedChapter)?.content?.split('\n').map((paragraph, idx) => (
                    paragraph.trim() ? (
                      <p key={idx} className={`leading-relaxed mb-4 text-lg ${
                        readerTheme === 'dark' ? 'text-slate-300' : 
                        readerTheme === 'light' ? 'text-slate-700' : 
                        'text-amber-900'
                      }`}>
                        {paragraph}
                      </p>
                    ) : <br key={idx} />
                  ))}
                </div>
              )}

              <div className={`mt-12 flex justify-between items-center pt-8 border-t ${
                readerTheme === 'dark' ? 'border-slate-800' : 
                readerTheme === 'light' ? 'border-slate-200' : 
                'border-amber-200'
              }`}>
                {(() => {
                  const currentIndex = chapterList.findIndex(ch => ch.id === selectedChapter);
                  const prevChapter = currentIndex > 0 ? chapterList[currentIndex - 1] : null;
                  const nextChapter = currentIndex < chapterList.length - 1 ? chapterList[currentIndex + 1] : null;
                  const isLastChapter = currentIndex === chapterList.length - 1;
                  
                  const goToChapter = (chapterId: string) => {
                    setSelectedChapter(chapterId);
                    setTimeout(() => {
                      if (chapterReaderRef.current) {
                        chapterReaderRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }, 50);
                  };
                  
                  return (
                    <>
                      {prevChapter ? (
                        <button 
                          onClick={() => goToChapter(prevChapter.id)}
                          className={`font-medium transition-colors ${
                            readerTheme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 
                            'text-purple-600 hover:text-purple-700'
                          }`}
                        >
                          &larr; Previous Chapter
                        </button>
                      ) : <div />}
                      {nextChapter ? (
                        <button 
                          onClick={() => goToChapter(nextChapter.id)}
                          className={`font-medium transition-colors ${
                            readerTheme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 
                            'text-purple-600 hover:text-purple-700'
                          }`}
                        >
                          Next Chapter &rarr;
                        </button>
                      ) : isLastChapter ? (
                        <Link 
                          to="/"
                          className={`font-medium transition-colors ${
                            readerTheme === 'dark' ? 'text-green-400 hover:text-green-300' : 
                            'text-green-600 hover:text-green-700'
                          }`}
                        >
                          Go to Homepage &rarr;
                        </Link>
                      ) : <div />}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
      )}

        <div className="mt-12 max-w-4xl">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <MessageSquare className="text-purple-500" /> Discussion
          </h2>
          
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
            {!user ? (
               <div className="text-center py-6">
                 <p className="text-slate-400 mb-4">Log in to join the discussion and share your thoughts with the community.</p>
                 <Link to="/auth" className="text-purple-400 font-bold hover:underline">Log In to Comment</Link>
               </div>
            ) : (
              <form onSubmit={handlePostComment}>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="avatar"/> : <User size={20} />}
                  </div>
                  <div className="flex-1">
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={`What do you think about ${story.title}?`}
                      className="w-full bg-slate-900 border-none rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 mb-3 min-h-[100px] resize-none"
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-slate-500">Your comment will appear on the Community page.</p>
                      <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors">
                        <Send size={16} /> Post Comment
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl p-6 w-full max-w-sm border border-slate-700"
          >
            <h3 className="text-xl font-bold text-white mb-2">Delete Story?</h3>
            <p className="text-slate-400 mb-6">
              This will permanently delete "{story.title}" and all its chapters. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={handleDeleteStory}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
              >
                Delete
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
