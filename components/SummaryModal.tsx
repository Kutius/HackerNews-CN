import React, { useEffect, useState } from 'react';
import { HnStory, AppSettings, ArticleSummary } from '../types';
import { summarizeArticle } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface SummaryModalProps {
  story: HnStory;
  onClose: () => void;
  settings: AppSettings;
}

const SummaryModal: React.FC<SummaryModalProps> = ({ story, onClose, settings }) => {
  const [summary, setSummary] = useState<ArticleSummary | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async (forceRefresh = false) => {
    setLoading(true);
    setErrorMsg(null);
    if (story.url) {
      const result = await summarizeArticle(
          story.url, 
          story.title, 
          settings.summaryModel, 
          settings.translationStyle,
          forceRefresh
      );
      if (result) {
        setSummary(result);
      } else {
        setErrorMsg("无法获取摘要内容，请稍后再试。");
      }
    } else {
      setErrorMsg("本文没有外部链接，无法进行摘要。");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSummary(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story, settings]);

  // Stop scrolling on body when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleRegenerate = () => {
    fetchSummary(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col relative z-10 overflow-hidden animate-[fadeIn_0.2s_ease-out] transition-colors duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start bg-white dark:bg-gray-900 sticky top-0 z-20">
          <div className="pr-8">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">
              {story.titleZh || story.title}
            </h3>
            <a 
              href={story.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 mt-1 inline-flex items-center gap-1 font-medium"
            >
              Visit Source
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors shrink-0"
          >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-gray-900/50">
          {loading ? (
             <div className="p-6 sm:p-8 space-y-8">
              {/* Loading Skeleton */}
              <div className="animate-pulse space-y-6">
                 {/* Hero Skeleton */}
                 <div className="h-24 bg-orange-50 dark:bg-gray-800 rounded-xl border border-orange-100 dark:border-gray-700 w-full"></div>
                 
                 {/* List Skeleton */}
                 <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div>
                 </div>
              </div>

              <div className="flex flex-col items-center justify-center text-center pt-4">
                  <div className="w-8 h-8 border-4 border-orange-100 dark:border-gray-700 border-t-orange-500 dark:border-t-orange-500 rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">AI is reading the article...</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Using {settings.summaryModel} with Search Grounding</p>
              </div>
            </div>
          ) : errorMsg ? (
            <div className="p-8 flex flex-col items-center justify-center h-full text-center">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500 mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">{errorMsg}</p>
                <button onClick={handleRegenerate} className="text-orange-600 hover:text-orange-700 font-medium text-sm underline">Try Again</button>
            </div>
          ) : summary ? (
            <div className="p-6 sm:p-8 space-y-8">
              
              {/* 1. TL;DR Hero Section - Visual Start Point */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 dark:from-orange-900/20 dark:to-amber-900/10 rounded-xl p-6 border border-orange-100/80 dark:border-orange-900/30 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-orange-100 dark:bg-orange-800/20 rounded-full opacity-50 blur-xl"></div>
                
                <div className="relative z-10">
                  <h4 className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    TL;DR
                  </h4>
                  <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 leading-snug">
                    {summary.tldr}
                  </p>
                </div>
              </div>

              {/* 2. Key Points Section */}
              <div>
                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600"></span>
                   Key Takeaways
                </h4>
                <ul className="space-y-4">
                  {summary.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex gap-3 items-start group">
                      <div className="mt-1 w-5 h-5 rounded-full bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-900 text-orange-500 flex items-center justify-center shrink-0 shadow-sm group-hover:border-orange-400 dark:group-hover:border-orange-700 transition-colors">
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Deep Dive Section */}
              <div>
                 <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600"></span>
                   Deep Dive
                </h4>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                   <ReactMarkdown>{summary.analysis}</ReactMarkdown>
                </div>
              </div>

            </div>
          ) : null}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500 flex justify-between items-center sticky bottom-0 z-20">
            <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${settings.summaryModel.includes('pro') ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                  {settings.summaryModel}
                </span>
                {!loading && (
                   <button 
                     onClick={handleRegenerate}
                     className="text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-500 flex items-center gap-1 transition-colors ml-2 pl-2 border-l border-gray-200 dark:border-gray-700"
                     title="Force Regenerate Summary"
                   >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                      Regenerate
                   </button>
                )}
            </div>
            <button onClick={() => onClose()} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 font-medium px-2">
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryModal;