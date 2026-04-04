import React from 'react';
import { motion } from 'motion/react';
import { Star, Clock, User, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Story {
  id: string;
  title: string;
  image: string;
  rating: number;
  chapters: number;
  category: string;
  updatedAt: string;
  author?: string;
  editor?: string;
}

export function StoryCard({ story }: { story: Story }) {
  return (
    <Link to={`/story/${story.id}`}>
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-slate-800 rounded-lg overflow-hidden shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group cursor-pointer h-full flex flex-col"
      >
        <div className="relative aspect-[2/3] overflow-hidden">
          <img 
            src={story.image} 
            alt={story.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 text-yellow-400 text-xs font-bold">
            <Star size={12} fill="currentColor" />
            {story.rating}
          </div>
          <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded">
            {story.category}
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col justify-between">
          <h3 className="text-white font-semibold text-lg line-clamp-1 mb-1 group-hover:text-purple-400 transition-colors">
            {story.title}
          </h3>
          {story.author && (
            <div className="text-slate-400 text-xs flex items-center gap-1 mb-1">
              <User size={10} /> {story.author}
              {story.editor && (
                <span className="text-yellow-500 flex items-center gap-1 ml-1">
                  <Edit3 size={10} /> {story.editor}
                </span>
              )}
            </div>
          )}
          <div className="flex items-center justify-between text-slate-400 text-xs mt-2">
            <span className="flex items-center gap-1">
              <Clock size={12} /> {story.updatedAt}
            </span>
            <span>{story.chapters} Chs</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
