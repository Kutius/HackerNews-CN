import React, { useEffect, useState, useCallback } from 'react';
import { fetchTopStoryIds, fetchStoriesByIds } from './services/hnService';
import { translateTitlesBatch } from './services/geminiService';
import { HnStory, AppSettings } from './types';
import { Header } from './components/Header';
import NewsCard from './components/NewsCard';
import SummaryModal from './components/SummaryModal';
import SettingsModal from './components/SettingsModal';
import { SkeletonCard } from './components/LoadingSpinner';

const BATCH_SIZE = 24;

const App: React.FC = () => {
  const [allStoryIds, setAllStoryIds] = useState<number[]>([]);
  const [stories, setStories] = useState<HnStory[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  
  const [selectedStory, setSelectedStory] = useState<HnStory | null>(null);
  const [translating, setTranslating] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  // Default settings
  const [settings, setSettings] = useState<AppSettings>(() => {
      const saved = localStorage.getItem('hn_app_settings');
      if (saved) {
        return JSON.parse(saved);
      }
      // Default based on system preference if not saved
      const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return {
          translationStyle: 'tech',
          summaryModel: 'gemini-2.5-flash',
          theme: prefersDark ? 'dark' : 'light'
      };
  });

  // Persist settings and Apply Theme
  useEffect(() => {
      localStorage.setItem('hn_app_settings', JSON.stringify(settings));
      
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
  }, [settings]);

  const toggleTheme = () => {
    setSettings(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  // Trigger translation logic
  const triggerTranslation = useCallback(async (currentStories: HnStory[], forceRetranslate = false) => {
    setTranslating(true);
    
    // Filter stories:
    let toTranslate = [];
    if (forceRetranslate) {
        toTranslate = currentStories;
    } else {
        // Only translate those that don't have it yet
        toTranslate = currentStories.filter(s => !s.titleZh);
    }
    
    if (toTranslate.length === 0) {
        setTranslating(false);
        return;
    }

    const translations = await translateTitlesBatch(toTranslate, settings.translationStyle, forceRetranslate);
    
    setStories(prevStories => {
      const newStories = [...prevStories];
      translations.forEach(t => {
        const index = newStories.findIndex(s => s.id === t.id);
        if (index !== -1) {
          newStories[index] = { 
              ...newStories[index], 
              titleZh: t.translatedTitle,
              translationStatus: 'done'
          };
        }
      });
      return newStories;
    });
    
    setTranslating(false);
  }, [settings.translationStyle]);

  // Single Translation Refresh
  const handleRefreshTranslation = async (e: React.MouseEvent, story: HnStory) => {
      e.stopPropagation();
      const result = await translateTitlesBatch([story], settings.translationStyle, true);
      if (result.length > 0) {
          setStories(prev => prev.map(s => s.id === story.id ? { ...s, titleZh: result[0].translatedTitle } : s));
      }
  };

  // Initial Load
  useEffect(() => {
    let isMounted = true;

    const loadInitialStories = async () => {
      setLoading(true);
      // 1. Get all IDs
      const ids = await fetchTopStoryIds();
      if (!isMounted) return;
      
      setAllStoryIds(ids);

      // 2. Fetch details for first batch
      const firstBatchIds = ids.slice(0, BATCH_SIZE);
      const storiesData = await fetchStoriesByIds(firstBatchIds);
      
      if (isMounted) {
        setStories(storiesData);
        setLoadedCount(BATCH_SIZE);
        setLoading(false);
        // Trigger initial translation
        triggerTranslation(storiesData);
      }
    };

    loadInitialStories();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Load More Action
  const handleLoadMore = async () => {
      if (loadingMore || loadedCount >= allStoryIds.length) return;

      setLoadingMore(true);
      const nextBatchIds = allStoryIds.slice(loadedCount, loadedCount + BATCH_SIZE);
      const newStoriesData = await fetchStoriesByIds(nextBatchIds);

      setStories(prev => [...prev, ...newStoriesData]);
      setLoadedCount(prev => prev + BATCH_SIZE);
      setLoadingMore(false);
      
      triggerTranslation(newStoriesData);
  };

  // Handle Settings Change
  const handleSaveSettings = (newSettings: AppSettings) => {
      const styleChanged = newSettings.translationStyle !== settings.translationStyle;
      setSettings(newSettings);
      
      // If style changed, we need to re-translate visible stories
      if (styleChanged) {
          triggerTranslation(stories, true);
      }
  };

  return (
    <div className="min-h-screen bg-[#f6f6ef]/50 dark:bg-gray-900 pb-12 transition-colors duration-200">
      <Header 
        onOpenSettings={() => setShowSettings(true)} 
        theme={settings.theme}
        onToggleTheme={toggleTheme}
      />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex justify-between items-end mb-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Top Stories</h2>
                <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {translating ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-3 w-3 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Translating ({settings.translationStyle})...
                            </span>
                        ) : (
                            <span>Updated just now • Style: <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{settings.translationStyle}</span></span>
                        )}
                    </p>
                </div>
            </div>
            <button 
                onClick={() => window.location.reload()}
                className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 font-medium"
            >
                Refresh All
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {loading ? (
            // Skeleton Loading State
            Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            // Story Cards
            stories.map((story, index) => (
              <NewsCard 
                key={story.id} 
                story={story} 
                rank={index + 1} 
                onClick={(s) => setSelectedStory(s)}
                onRefreshTranslation={handleRefreshTranslation}
              />
            ))
          )}
        </div>

        {!loading && stories.length > 0 && loadedCount < allStoryIds.length && (
            <div className="flex justify-center">
                <button 
                    onClick={handleLoadMore} 
                    disabled={loadingMore}
                    className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm text-gray-700 dark:text-gray-300 font-medium rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-orange-300 dark:hover:border-orange-600 hover:text-orange-600 dark:hover:text-orange-500 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loadingMore ? (
                        <>
                            <div className="animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                            Loading...
                        </>
                    ) : (
                        "Load More Stories"
                    )}
                </button>
            </div>
        )}
      </main>

      {selectedStory && (
        <SummaryModal 
          story={selectedStory} 
          onClose={() => setSelectedStory(null)} 
          settings={settings}
        />
      )}

      {showSettings && (
        <SettingsModal 
            settings={settings} 
            onClose={() => setShowSettings(false)} 
            onSave={handleSaveSettings}
        />
      )}
    </div>
  );
};

export default App;