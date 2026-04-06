import React, { useState, useEffect, useRef } from 'react';
import { 
  PenTool, Upload, Save, Lock, Plus, Trash2, FileText, ArrowLeft, 
  BookOpen, Edit3, Eye, EyeOff, GripVertical, ChevronRight, Settings,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List,
  Image, Link as LinkIcon, Quote, Minus, MoreHorizontal, X, Check, Globe,
  ArrowUp, ArrowDown, ImagePlus, Star, Users, ChevronDown
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp, Draft, Chapter } from '../context/AppContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

type ViewType = 'list' | 'story-settings' | 'chapters' | 'editor';

export function Write() {
  const { user, drafts, saveDraft, deleteDraft, addChapter, updateChapter, deleteChapter } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<ViewType>('list');
  const [currentDraft, setCurrentDraft] = useState<Draft | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: 'draft' | 'chapter', id: string} | null>(null);

  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [category, setCategory] = useState('Novel');
  const [genres, setGenres] = useState<string[]>(['Action']);
  const [coverImage, setCoverImage] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [originalAuthor, setOriginalAuthor] = useState('');
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [chapterPanels, setChapterPanels] = useState<string[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [publishAsOfficial, setPublishAsOfficial] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const panelInputRef = useRef<HTMLInputElement>(null);

  const isComicFormat = ['Manga', 'Manhwa', 'Manhua', 'Comic'].includes(currentDraft?.category || category);

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      const draftToEdit = drafts.find(d => d.id === editId);
      if (draftToEdit) {
        setCurrentDraft(draftToEdit);
        setView('chapters');
        setSearchParams({});
      }
    }
  }, [searchParams, drafts]);

  useEffect(() => {
    if (currentDraft && view === 'story-settings') {
      setTitle(currentDraft.title);
      setSynopsis(currentDraft.synopsis);
      setCategory(currentDraft.category);
      setGenres(Array.isArray(currentDraft.genre) ? currentDraft.genre : [currentDraft.genre]);
      setCoverImage(currentDraft.coverImage);
      setCoverPreview(currentDraft.coverImage || null);
      setOriginalAuthor(currentDraft.originalAuthor || '');
    }
  }, [currentDraft, view]);

  useEffect(() => {
    if (currentChapter && view === 'editor') {
      setChapterTitle(currentChapter.title);
      setChapterContent(currentChapter.content);
      setChapterPanels(currentChapter.panels || []);
      setWordCount(countWords(currentChapter.content));
    }
  }, [currentChapter, view]);

  useEffect(() => {
    if (view === 'editor' && chapterContent) {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      const timer = setTimeout(() => {
        handleAutoSave();
      }, 3000);
      setAutoSaveTimer(timer);
    }
    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [chapterContent, chapterTitle]);

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setChapterContent(content);
    setWordCount(countWords(content));
  };

  const handleAutoSave = () => {
    if (currentDraft && currentChapter && chapterTitle.trim()) {
      updateChapter(currentDraft.id, currentChapter.id, {
        title: chapterTitle,
        content: chapterContent,
        wordCount: countWords(chapterContent),
        panels: chapterPanels
      });
      setLastSaved(new Date().toLocaleTimeString());
    }
  };

  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handlePanelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select image files only');
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Each image must be less than 10MB');
        continue;
      }
      try {
        const compressedImage = await compressImage(file, 1200, 0.8);
        setChapterPanels(prev => [...prev, compressedImage]);
      } catch (error) {
        console.error('Error compressing image:', error);
        toast.error('Failed to process image');
      }
    }
    if (panelInputRef.current) panelInputRef.current.value = '';
  };

  const removePanel = (index: number) => {
    setChapterPanels(prev => prev.filter((_, i) => i !== index));
  };

  const movePanelUp = (index: number) => {
    if (index === 0) return;
    setChapterPanels(prev => {
      const newPanels = [...prev];
      [newPanels[index - 1], newPanels[index]] = [newPanels[index], newPanels[index - 1]];
      return newPanels;
    });
  };

  const movePanelDown = (index: number) => {
    if (index === chapterPanels.length - 1) return;
    setChapterPanels(prev => {
      const newPanels = [...prev];
      [newPanels[index], newPanels[index + 1]] = [newPanels[index + 1], newPanels[index]];
      return newPanels;
    });
  };

  const handleCoverFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCoverPreview(result);
      setCoverImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateNewStory = () => {
    setCurrentDraft(null);
    setTitle('');
    setSynopsis('');
    setCategory('Novel');
    setGenres(['Action']);
    setCoverImage('');
    setCoverPreview(null);
    setOriginalAuthor('');
    setView('story-settings');
  };

  const handleEditStory = (draft: Draft) => {
    setCurrentDraft(draft);
    setView('chapters');
  };

  const handleOpenStorySettings = () => {
    setView('story-settings');
  };

  const handleSaveStorySettings = () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    const draft: Draft = {
      id: currentDraft?.id || Date.now().toString(),
      title,
      synopsis,
      category,
      genre: genres.join(', '),
      lastUpdated: 'Just now',
      coverImage: coverImage,
      chapters: currentDraft?.chapters || [],
      published: currentDraft?.published || false,
      authorId: user?.id,
      originalAuthor: originalAuthor.trim() || undefined,
      editorId: originalAuthor.trim() ? user?.id : undefined
    };
    saveDraft(draft);
    setCurrentDraft(draft);
    toast.success("Story settings saved");
    setView('chapters');
  };

  const handleCreateNewChapter = () => {
    if (!currentDraft) return;
    const chapterNum = currentDraft.chapters.length + 1;
    const newChapter: Chapter = {
      id: 'ch_' + Date.now(),
      title: `Chapter ${chapterNum}: Untitled`,
      content: '',
      wordCount: 0,
      published: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    addChapter(currentDraft.id, newChapter);
    const updatedDraft = { ...currentDraft, chapters: [...currentDraft.chapters, newChapter] };
    setCurrentDraft(updatedDraft);
    setCurrentChapter(newChapter);
    setChapterTitle(newChapter.title);
    setChapterContent('');
    setWordCount(0);
    setView('editor');
  };

  const handleEditChapter = (chapter: Chapter) => {
    setCurrentChapter(chapter);
    setView('editor');
  };

  const handleSaveChapter = () => {
    if (!currentDraft || !currentChapter) return;
    if (!chapterTitle.trim()) {
      toast.error("Please enter a chapter title");
      return;
    }
    try {
      updateChapter(currentDraft.id, currentChapter.id, {
        title: chapterTitle,
        content: chapterContent,
        wordCount: countWords(chapterContent),
        panels: chapterPanels
      });
      const updatedChapter = { ...currentChapter, title: chapterTitle, content: chapterContent, wordCount: countWords(chapterContent), panels: chapterPanels };
      setCurrentChapter(updatedChapter);
      const updatedChapters = currentDraft.chapters.map(ch => ch.id === currentChapter.id ? updatedChapter : ch);
      setCurrentDraft({ ...currentDraft, chapters: updatedChapters });
      setLastSaved(new Date().toLocaleTimeString());
      toast.success("Chapter saved");
    } catch (error) {
      console.error('Error saving chapter:', error);
      toast.error("Failed to save. Try removing some panels to reduce size.");
    }
  };

  const handlePublishChapter = (chapter: Chapter) => {
    if (!currentDraft) return;
    updateChapter(currentDraft.id, chapter.id, { published: !chapter.published });
    const updatedChapters = currentDraft.chapters.map(ch => 
      ch.id === chapter.id ? { ...ch, published: !ch.published } : ch
    );
    setCurrentDraft({ ...currentDraft, chapters: updatedChapters });
    toast.success(chapter.published ? "Chapter unpublished" : "Chapter published!");
  };

  const handlePublishStory = () => {
    if (!currentDraft) return;
    
    if (currentDraft.published) {
      const updatedDraft = { ...currentDraft, published: false };
      saveDraft(updatedDraft);
      setCurrentDraft(updatedDraft);
      toast.success("Story unpublished");
      return;
    }
    
    if (user?.isAdmin) {
      setShowPublishModal(true);
    } else {
      const updatedDraft = { ...currentDraft, published: true, isOfficial: false };
      saveDraft(updatedDraft);
      setCurrentDraft(updatedDraft);
      toast.success("Story published! It's now visible in Community Stories.");
    }
  };

  const confirmPublish = (asOfficial: boolean) => {
    if (!currentDraft) return;
    const updatedDraft = { ...currentDraft, published: true, isOfficial: asOfficial };
    saveDraft(updatedDraft);
    setCurrentDraft(updatedDraft);
    setShowPublishModal(false);
    if (asOfficial) {
      toast.success("Story published as Official! It's now featured on the homepage.");
    } else {
      toast.success("Story published! It's now visible in Community Stories.");
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'draft') {
      deleteDraft(deleteTarget.id);
      toast.success("Story deleted");
      setView('list');
    } else if (deleteTarget.type === 'chapter' && currentDraft) {
      deleteChapter(currentDraft.id, deleteTarget.id);
      const updatedChapters = currentDraft.chapters.filter(ch => ch.id !== deleteTarget.id);
      setCurrentDraft({ ...currentDraft, chapters: updatedChapters });
      toast.success("Chapter deleted");
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleDeleteClick = (type: 'draft' | 'chapter', id: string) => {
    setDeleteTarget({ type, id });
    setShowDeleteModal(true);
  };

  const handleBack = () => {
    if (view === 'editor') {
      handleSaveChapter();
      setView('chapters');
    } else if (view === 'chapters' || view === 'story-settings') {
      setView('list');
      setCurrentDraft(null);
    }
  };

  const insertFormatting = (before: string, after: string = before) => {
    const textarea = editorRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = chapterContent.substring(start, end);
    const newContent = chapterContent.substring(0, start) + before + selectedText + after + chapterContent.substring(end);
    setChapterContent(newContent);
    setWordCount(countWords(newContent));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-slate-800 p-6 rounded-full mb-6">
          <Lock size={48} className="text-purple-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Author Dashboard Locked</h2>
        <p className="text-slate-400 max-w-md mb-8">
          You must be logged in to write and publish stories. Join our community of creators today.
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

  if (view === 'list') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Stories</h1>
            <p className="text-slate-400">Create and manage your stories</p>
          </div>
          <button 
            onClick={handleCreateNewStory}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus size={20} /> New Story
          </button>
        </div>

        {drafts.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/30 rounded-xl border border-slate-700 border-dashed">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={32} className="text-slate-500" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No stories yet</h3>
            <p className="text-slate-400 mb-6">Start writing your next masterpiece today.</p>
            <button 
              onClick={handleCreateNewStory}
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              Create your first story &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drafts.map(draft => (
              <motion.div 
                key={draft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer group shadow-lg"
                onClick={() => handleEditStory(draft)}
              >
                <div className="aspect-[3/2] bg-slate-900 relative overflow-hidden">
                  {draft.coverImage ? (
                    <img src={draft.coverImage} alt={draft.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-slate-900">
                      <BookOpen size={48} className="text-slate-600" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <span className="px-2 py-1 bg-slate-900/80 rounded text-xs text-purple-300 font-medium">
                      {draft.category}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors truncate">
                    {draft.title || "Untitled Story"}
                  </h3>
                  <p className="text-slate-500 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
                    {draft.synopsis || "No synopsis yet..."}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <FileText size={12} />
                        {draft.chapters?.length || 0} chapters
                      </span>
                      <span>{draft.genre}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick('draft', draft.id); }}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700/50 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <DeleteModal 
          show={showDeleteModal} 
          onClose={() => setShowDeleteModal(false)} 
          onConfirm={confirmDelete}
          type={deleteTarget?.type || 'draft'}
        />
      </div>
    );
  }

  if (view === 'story-settings') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {currentDraft ? 'Story Settings' : 'Create New Story'}
            </h1>
            <p className="text-slate-400 text-sm">Set up your story details</p>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 md:p-8 shadow-xl space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Cover Image</label>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverFileSelect}
              className="hidden"
              id="cover-upload"
            />
            <label
              htmlFor="cover-upload"
              className="block aspect-[2/3] max-w-[200px] border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors overflow-hidden bg-slate-900/50"
            >
              {coverPreview ? (
                <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
                  <Upload size={32} className="text-slate-500" />
                  <p className="text-slate-400 text-xs text-center">Click to upload cover</p>
                </div>
              )}
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Story Title *</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your story title..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Synopsis</label>
            <textarea 
              rows={4}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Write a compelling description of your story..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          {user?.isAdmin && (
            <div className="p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
              <label className="block text-sm font-medium text-yellow-400 mb-2">
                Original Author (Admin Only)
              </label>
              <input 
                type="text" 
                value={originalAuthor}
                onChange={(e) => setOriginalAuthor(e.target.value)}
                placeholder="Enter original author's name if this isn't your story..."
                className="w-full bg-slate-900 border border-yellow-600/50 rounded-lg p-3 text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
              />
              <p className="text-yellow-500/70 text-xs mt-2">
                If filled, the story will show the original author's name and you as the editor.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option>Novel</option>
                <option>Manga</option>
                <option>Manhwa</option>
                <option>Manhua</option>
                <option>Comic</option>
                <option>Fanfiction</option>
                <option>Poetry</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Genres (select multiple)</label>
              <div className="relative">
                <button
                  onClick={() => setShowGenreDropdown(!showGenreDropdown)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-left text-white flex items-center justify-between hover:border-purple-500 transition-colors"
                >
                  <span>{genres.length > 0 ? `${genres.length} selected` : 'Select genres...'}</span>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform ${showGenreDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showGenreDropdown && (
                  <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                    <div className="p-2 grid grid-cols-2 gap-2">
                      {['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Thriller', 'Historical', 'Supernatural', 'Psychological', 'Sports', 'Mecha', 'Isekai', 'Yaoi', 'Yuri', 'Shounen', 'Shoujo', 'Seinen', 'Josei', 'Mature', 'Tragedy', 'School Life', 'Martial Arts', 'Video Games', 'Wuxia', 'Xianxia', 'Magical Realism', 'Cyberpunk', 'Steampunk', 'Post-Apocalyptic', 'Dystopian', 'Gore', 'Gender Bender', 'Harem', 'Reverse Harem', 'Survival', 'Military', 'Police', 'Medical', 'Cooking', 'Music', 'Dance', 'Art', 'Philosophy', 'Political', 'Business', 'Economics', 'Law', 'Education', 'Travel', 'Nature', 'Animals', 'Pets', 'Vampires', 'Werewolves', 'Zombies', 'Demons', 'Angels', 'Gods', 'Monsters', 'Dragons', 'Magic', 'Superpowers', 'Time Travel', 'Space', 'Aliens', 'Robots', 'AI', 'Virtual Reality', 'Augmented Reality', 'Dreams', 'Reincarnation', 'Transmigration', 'System', 'Leveling', 'Cultivation', 'Alchemy', 'Astrology', 'Tarot', 'Occult', 'Paranormal', 'Ghost', 'Spirits', 'Folklore', 'Mythology', 'Legends', 'Fairy Tales', 'Fables', 'Poetry', 'Songs', 'LGBTQ+', 'BL', 'GL', 'Non-binary', 'Transgender', 'Asexual', 'Bisexual', 'Pansexual', 'Demisexual', 'Polyamory', 'BDSM', 'Kink', 'Fetish'].map(g => (
                        <label key={g} className="flex items-center gap-2 p-2 hover:bg-slate-800 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={genres.includes(g)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setGenres([...genres, g]);
                              } else {
                                setGenres(genres.filter(x => x !== g));
                              }
                            }}
                            className="w-4 h-4 text-purple-600 bg-slate-800 border-slate-600 rounded focus:ring-purple-500"
                          />
                          <span className="text-white text-sm">{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {genres.length === 0 && (
                <p className="text-red-400 text-sm mt-2">Please select at least one genre</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              onClick={handleSaveStorySettings}
              className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} /> Save & Continue
            </button>
            <button 
              onClick={handleBack}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'chapters') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{currentDraft?.title}</h1>
              <p className="text-slate-400 text-sm">{currentDraft?.chapters?.length || 0} chapters</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleOpenStorySettings}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Story Settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {currentDraft && currentDraft.chapters.length > 0 && currentDraft.chapters.some(ch => ch.published) && (
          <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-white font-medium">
                {currentDraft.published ? 'Your story is live!' : 'Ready to share your story?'}
              </p>
              <p className="text-slate-400 text-sm">
                {currentDraft.published 
                  ? 'Your story is visible in Community Stories' 
                  : 'Publish it to make it visible to everyone'}
              </p>
            </div>
            <button 
              onClick={handlePublishStory}
              className={`px-6 py-2 font-bold rounded-lg transition-colors flex items-center gap-2 ${
                currentDraft.published 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              <Globe size={18} />
              {currentDraft.published ? 'Published' : 'Publish Story'}
            </button>
          </div>
        )}

        <button 
          onClick={handleCreateNewChapter}
          className="w-full py-4 mb-6 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-purple-400 hover:border-purple-500/50 transition-colors flex items-center justify-center gap-2 bg-slate-800/30"
        >
          <Plus size={20} /> Add New Chapter
        </button>

        {currentDraft?.chapters?.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/30 rounded-xl border border-slate-700">
            <FileText size={48} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No chapters yet</h3>
            <p className="text-slate-400">Click "Add New Chapter" to start writing</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentDraft?.chapters?.map((chapter, index) => (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="text-slate-500 cursor-grab">
                    <GripVertical size={20} />
                  </div>
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => handleEditChapter(chapter)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white group-hover:text-purple-400 transition-colors">
                        {chapter.title}
                      </h3>
                      {chapter.published ? (
                        <span className="px-2 py-0.5 bg-green-900/50 text-green-400 text-xs rounded-full">Published</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded-full">Draft</span>
                      )}
                    </div>
                    <p className="text-slate-500 text-sm">
                      {chapter.wordCount.toLocaleString()} words • Updated {chapter.updatedAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditChapter(chapter)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => handlePublishChapter(chapter)}
                      className={`p-2 rounded-lg transition-colors ${chapter.published ? 'text-green-400 hover:text-green-300 hover:bg-green-900/30' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                      title={chapter.published ? "Unpublish" : "Publish"}
                    >
                      {chapter.published ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button 
                      onClick={() => handleDeleteClick('chapter', chapter.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <ChevronRight size={20} className="text-slate-600" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <DeleteModal 
          show={showDeleteModal} 
          onClose={() => setShowDeleteModal(false)} 
          onConfirm={confirmDelete}
          type={deleteTarget?.type || 'chapter'}
        />

        {showPublishModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700"
            >
              <h3 className="text-xl font-bold text-white mb-2">Publish Story</h3>
              <p className="text-slate-400 mb-6">Choose how you want to publish this story:</p>
              
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => confirmPublish(true)}
                  className="w-full p-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 rounded-xl text-left transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Star className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-white">Official Story</p>
                      <p className="text-yellow-200 text-sm">Featured on homepage, highlighted as official</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => confirmPublish(false)}
                  className="w-full p-4 bg-slate-700 hover:bg-slate-600 rounded-xl text-left transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                      <Users className="text-slate-300" size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-white">Community Story</p>
                      <p className="text-slate-400 text-sm">Listed in community stories section</p>
                    </div>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowPublishModal(false)}
                className="w-full py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  if (view === 'editor') {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleBack}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="hidden sm:block">
                <p className="text-slate-500 text-xs">{currentDraft?.title} • {currentDraft?.category}</p>
                <input
                  type="text"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  className="bg-transparent text-white font-medium outline-none text-lg w-full max-w-md"
                  placeholder="Chapter Title..."
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isComicFormat ? (
                <span className="text-slate-500 text-sm hidden sm:block">
                  {chapterPanels.length} panels
                </span>
              ) : (
                <span className="text-slate-500 text-sm hidden sm:block">
                  {wordCount.toLocaleString()} words
                </span>
              )}
              {lastSaved && (
                <span className="text-slate-600 text-xs hidden md:block">
                  Saved {lastSaved}
                </span>
              )}
              <button 
                onClick={handleSaveChapter}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <Save size={16} /> Save
              </button>
            </div>
          </div>

          {!isComicFormat && (
            <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-1 border-t border-slate-800 overflow-x-auto">
              <button 
                onClick={() => insertFormatting('**')}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Bold"
              >
                <Bold size={18} />
              </button>
              <button 
                onClick={() => insertFormatting('*')}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Italic"
              >
                <Italic size={18} />
              </button>
              <button 
                onClick={() => insertFormatting('__')}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Underline"
              >
                <Underline size={18} />
              </button>
              <div className="w-px h-6 bg-slate-700 mx-1" />
              <button 
                onClick={() => insertFormatting('\n> ', '')}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Quote"
              >
                <Quote size={18} />
              </button>
              <button 
                onClick={() => insertFormatting('\n- ', '')}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="List"
              >
                <List size={18} />
              </button>
              <button 
                onClick={() => insertFormatting('\n---\n', '')}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Divider"
              >
                <Minus size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 bg-slate-950">
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="sm:hidden mb-4">
              <input
                type="text"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                className="bg-transparent text-white font-medium outline-none text-xl w-full border-b border-slate-800 pb-2"
                placeholder="Chapter Title..."
              />
            </div>

            {isComicFormat ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-900/30 to-slate-900 rounded-xl p-6 border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-600 rounded-lg">
                      <ImagePlus size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Webtoon/Comic Mode</h3>
                      <p className="text-slate-400 text-sm">Upload your panels in reading order (top to bottom)</p>
                    </div>
                  </div>
                  
                  <input
                    ref={panelInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePanelUpload}
                    className="hidden"
                    id="panel-upload"
                  />
                  <label
                    htmlFor="panel-upload"
                    className="flex items-center justify-center gap-3 w-full py-4 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors bg-slate-900/50"
                  >
                    <Upload size={24} className="text-purple-400" />
                    <div className="text-center">
                      <p className="text-white font-medium">Click to upload panels</p>
                      <p className="text-slate-500 text-sm">PNG, JPG, WEBP (max 5MB each)</p>
                    </div>
                  </label>
                </div>

                {chapterPanels.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">Panels ({chapterPanels.length})</h4>
                      <p className="text-slate-500 text-sm">Drag to reorder or use arrows</p>
                    </div>
                    
                    <div className="flex flex-col" style={{ gap: 0, lineHeight: 0 }}>
                      {chapterPanels.map((panel, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative bg-slate-800 overflow-hidden group"
                          style={{ margin: 0, padding: 0, lineHeight: 0, display: 'block' }}
                        >
                          <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white font-medium z-10">
                            Panel {index + 1}
                          </div>
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                              onClick={() => movePanelUp(index)}
                              disabled={index === 0}
                              className="p-2 bg-black/70 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Move Up"
                            >
                              <ArrowUp size={16} />
                            </button>
                            <button
                              onClick={() => movePanelDown(index)}
                              disabled={index === chapterPanels.length - 1}
                              className="p-2 bg-black/70 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Move Down"
                            >
                              <ArrowDown size={16} />
                            </button>
                            <button
                              onClick={() => removePanel(index)}
                              className="p-2 bg-black/70 hover:bg-red-600 text-white rounded-lg transition-colors"
                              title="Remove"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <img 
                            src={panel} 
                            alt={`Panel ${index + 1}`} 
                            className="w-full h-auto object-cover bg-black"
                            style={{ display: 'block', margin: 0, padding: 0, lineHeight: 0, verticalAlign: 'bottom' }}
                          />
                        </motion.div>
                      ))}
                    </div>

                    <label
                      htmlFor="panel-upload"
                      className="flex items-center justify-center gap-2 w-full py-3 border border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-purple-500 transition-colors text-slate-400 hover:text-purple-400"
                    >
                      <Plus size={20} /> Add more panels
                    </label>
                  </div>
                )}

                {chapterPanels.length === 0 && (
                  <div className="text-center py-12">
                    <Image size={64} className="text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400">No panels uploaded yet</p>
                    <p className="text-slate-600 text-sm mt-1">Upload your comic pages in vertical reading order</p>
                  </div>
                )}
              </div>
            ) : (
              <textarea
                ref={editorRef}
                value={chapterContent}
                onChange={handleContentChange}
                placeholder="Start writing your chapter...

Tips:
• Use **text** for bold
• Use *text* for italic  
• Use > for quotes
• Use --- for dividers

Let your imagination flow!"
                className="w-full min-h-[calc(100vh-300px)] bg-transparent text-slate-200 text-lg leading-relaxed outline-none resize-none placeholder:text-slate-600"
                style={{ fontFamily: 'Georgia, serif' }}
              />
            )}
          </div>
        </div>

        <div className="bg-slate-900 border-t border-slate-800 py-3 px-4 sm:hidden">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-sm">
              {isComicFormat ? `${chapterPanels.length} panels` : `${wordCount.toLocaleString()} words`}
            </span>
            <button 
              onClick={handleSaveChapter}
              className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function DeleteModal({ show, onClose, onConfirm, type }: { show: boolean; onClose: () => void; onConfirm: () => void; type: 'draft' | 'chapter' }) {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-xl p-6 w-full max-w-sm border border-slate-700"
      >
        <h3 className="text-xl font-bold text-white mb-2">
          Delete {type === 'draft' ? 'Story' : 'Chapter'}?
        </h3>
        <p className="text-slate-400 mb-6">
          This action cannot be undone. {type === 'draft' ? 'All chapters will be permanently deleted.' : 'This chapter will be permanently deleted.'}
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onConfirm}
            className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
          >
            Delete
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}
