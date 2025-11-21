import React from 'react';
import { HnStory } from '../types';

interface NewsCardProps {
  story: HnStory;
  rank: number;
  onClick: (story: HnStory) => void;
  onRefreshTranslation: (e: React.MouseEvent, story: HnStory) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ story, rank, onClick, onRefreshTranslation }) => {
  // Format domain
  const domain = story.url ? new URL(story.url).hostname.replace('www.', '') : '';

  // Format time
  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
  };

  return (
    <div 
      onClick={() => onClick(story)}
      className="group h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-transparent dark:border-gray-700 hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
    >
       {/* Background Rank Number (Watermark style) */}
       <div className="absolute -right-4 -top-4 text-[5rem] font-bold text-gray-50 dark:text-gray-800/50 pointer-events-none select-none transition-colors group-hover:text-orange-50/50 dark:group-hover:text-orange-900/10 z-0 font-sans leading-none">
         {rank}
       </div>

       <div className="relative z-10 flex-1 flex flex-col">
          {/* Header: Domain & Score */}
          <div className="flex justify-between items-center mb-3">
            {domain ? (
                <span className="inline-block bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider px-2 py-1 rounded font-semibold truncate max-w-[60%]">
                  {domain}
                </span>
            ) : (
                 <span className="inline-block bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider px-2 py-1 rounded font-semibold">
                  HN
                </span>
            )}
             
             <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 text-xs font-bold bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>
                {story.score}
             </div>
          </div>

          {/* Title Section */}
          <div className="mb-4">
            {story.titleZh ? (
              <>
                <h2 className="text-[1.05rem] font-bold text-gray-900 dark:text-gray-100 leading-[1.5] mb-2 line-clamp-3 group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors">
                  {story.titleZh}
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-normal leading-relaxed line-clamp-2 font-mono border-l-2 border-gray-100 dark:border-gray-700 pl-2">
                  {story.title}
                </p>
              </>
            ) : (
              <h2 className="text-[1.05rem] font-bold text-gray-900 dark:text-gray-100 leading-[1.5] mb-2 line-clamp-4 group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors">
                {story.title}
              </h2>
            )}
          </div>

          {/* Footer Metadata */}
          <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
             <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  {story.by}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {timeAgo(story.time)} ago
                </span>
             </div>
          </div>
       </div>

      {/* Refresh Button - Moved to Bottom Right */}
      <button 
        onClick={(e) => onRefreshTranslation(e, story)}
        className="absolute bottom-4 right-4 p-2 text-gray-400 hover:text-orange-600 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 rounded-full transition-all opacity-0 group-hover:opacity-100 z-20 transform translate-y-2 group-hover:translate-y-0"
        title="Regenerate Title Translation"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      </button>
    </div>
  );
};

export default NewsCard;