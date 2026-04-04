import React from 'react';
import Slider from 'react-slick';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BookOpen } from 'lucide-react';

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 5000,
  arrows: false,
};

export function HeroCarousel() {
  const navigate = useNavigate();
  const { drafts, users, getStoryRating } = useApp();

  const trendingStories = drafts
    .filter(draft => draft.published && draft.chapters.some(ch => ch.published))
    .map(draft => {
      const author = users.find(u => u.id === draft.authorId);
      const storyId = `user_story_${draft.id}`;
      const genres = draft.genre ? draft.genre.split(', ') : [];
      return {
        id: draft.id,
        storyId: storyId,
        title: draft.title,
        description: draft.synopsis || 'No description available',
        image: draft.coverImage || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=1080',
        tags: [draft.category, ...genres.slice(0, 2)],
        rating: getStoryRating(storyId),
        author: author?.username || 'Anonymous'
      };
    })
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  const handleReadNow = (storyId: string) => {
    navigate(`/story/${storyId}`);
  };

  if (trendingStories.length === 0) {
    return (
      <div className="relative w-full overflow-hidden rounded-xl shadow-2xl mb-12 bg-gradient-to-r from-purple-900 to-slate-900">
        <div className="h-[400px] md:h-[500px] flex flex-col items-center justify-center text-center px-8">
          <BookOpen size={64} className="text-purple-400 mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">No Stories Yet</h2>
          <p className="text-slate-300 text-lg mb-6 max-w-md">
            Be the first to publish a story and get featured here!
          </p>
          <button 
            onClick={() => navigate('/write')}
            className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
          >
            Start Writing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl shadow-2xl mb-12 group">
      <Slider {...settings}>
        {trendingStories.map((slide) => (
          <div key={slide.id} className="relative h-[400px] md:h-[500px] w-full focus:outline-none">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex gap-2 mb-3 flex-wrap">
                  {slide.tags.filter(Boolean).map(tag => (
                    <span key={tag} className="px-3 py-1 text-xs font-semibold bg-purple-600 text-white rounded-full">
                      {tag}
                    </span>
                  ))}
                  {slide.rating > 0 && (
                    <span className="px-3 py-1 text-xs font-semibold bg-yellow-500 text-black rounded-full">
                      {slide.rating} Stars
                    </span>
                  )}
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                  {slide.title}
                </h2>
                <p className="text-slate-400 text-sm mb-1">by {slide.author}</p>
                <p className="text-slate-200 text-base md:text-lg line-clamp-2 md:line-clamp-none mb-6 max-w-xl">
                  {slide.description}
                </p>
                <button 
                  onClick={() => handleReadNow(slide.storyId)}
                  className="px-6 py-3 bg-white text-purple-900 font-bold rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Read Now
                </button>
              </motion.div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
