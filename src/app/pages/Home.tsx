import React from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { StoryCard } from '../components/StoryCard';
import { ArrowRight, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '../components/ui/carousel';
import { Link } from 'react-router-dom';

function CategorySection({ title, stories, linkText = "View All", linkTo = "/search" }: { title: string, stories: any[], linkText?: string, linkTo?: string }) {
  if (stories.length === 0) return null;
  
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-l-4 border-purple-600 pl-3">
          {title}
        </h2>
        <Link to={linkTo} className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm font-medium">
          {linkText} <ArrowRight size={16} />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {stories.slice(0, 5).map(story => (
          <StoryCard key={`${title}-${story.id}`} story={story} />
        ))}
      </div>
    </div>
  );
}

export function Home() {
  const { stories, drafts, users, getStoryRating } = useApp();

  const originalStories = stories.filter(s => s.type === 'Original');

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
        lastUpdated: draft.lastUpdated,
        description: draft.synopsis,
        author: draft.originalAuthor || author?.username || 'Anonymous',
        editor: draft.originalAuthor ? (editor?.username || author?.username) : undefined,
        isUserStory: true,
        isOfficial: draft.isOfficial || false
      };
    });

  const allStories = [...publishedUserStories, ...stories];
  const communityStories = [...publishedUserStories.filter(s => !s.isOfficial), ...originalStories];
  
  const latestStories = [...allStories].sort((a, b) => 
    new Date(b.lastUpdated || b.updatedAt || b.id).getTime() - new Date(a.lastUpdated || a.updatedAt || a.id).getTime()
  );

  return (
    <div className="pb-20">
      <HeroCarousel />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Flame className="text-orange-500" /> Trending Now
            </h2>
            <Link to="/search" className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm font-medium">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {allStories.slice(0, 5).map(story => (
              <StoryCard key={`trending-${story.id}`} story={story} />
            ))}
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-l-4 border-purple-600 pl-3">
              Latest Updates
            </h2>
            <Link to="/search" className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm font-medium">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="px-12">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {latestStories.map((story) => (
                  <CarouselItem key={story.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
                    <div className="scale-90">
                      <StoryCard story={story} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="bg-slate-800 border-purple-500 text-white hover:bg-purple-600" />
              <CarouselNext className="bg-slate-800 border-purple-500 text-white hover:bg-purple-600" />
            </Carousel>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-r from-purple-900/40 to-slate-900 rounded-2xl border border-purple-500/20 mb-12">
          <CategorySection 
            title="Original Stories by Community" 
            stories={communityStories} 
            linkText="See More" 
            linkTo="/community-stories"
          />
          {communityStories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400 mb-4">No community stories yet. Be the first to publish!</p>
              <Link 
                to="/write" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
              >
                Start Writing <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}