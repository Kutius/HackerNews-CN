import { HnStory } from '../types';

const BASE_URL = 'https://hacker-news.firebaseio.com/v0';

// Fetch all top story IDs (returns ~500 IDs)
export const fetchTopStoryIds = async (): Promise<number[]> => {
  try {
    const response = await fetch(`${BASE_URL}/topstories.json`);
    if (!response.ok) throw new Error('Failed to fetch top stories');
    const ids = await response.json();
    return ids;
  } catch (error) {
    console.error('Error fetching top story IDs:', error);
    return [];
  }
};

export const fetchStoryDetails = async (id: number): Promise<HnStory | null> => {
  try {
    const response = await fetch(`${BASE_URL}/item/${id}.json`);
    if (!response.ok) throw new Error(`Failed to fetch story ${id}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching story ${id}:`, error);
    return null;
  }
};

// Fetch details for a specific list of IDs
export const fetchStoriesByIds = async (ids: number[]): Promise<HnStory[]> => {
  const storyPromises = ids.map(id => fetchStoryDetails(id));
  const stories = await Promise.all(storyPromises);
  return stories.filter((story): story is HnStory => story !== null && story.type === 'story' && !!story.url);
};

// Deprecated but kept for compatibility if needed, though App.tsx will switch to the above
export const fetchTopStories = async (limit: number = 20): Promise<HnStory[]> => {
  const ids = await fetchTopStoryIds();
  const subset = ids.slice(0, limit);
  return fetchStoriesByIds(subset);
};