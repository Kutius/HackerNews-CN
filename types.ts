export interface HnStory {
  id: number;
  title: string;
  url?: string;
  by: string;
  time: number;
  score: number;
  descendants?: number; // comment count
  kids?: number[];
  type: string;
  // Added fields for app logic
  titleZh?: string;
  translationStatus?: 'pending' | 'done' | 'failed';
}

export interface TranslationResult {
  id: number;
  translatedTitle: string;
}

export interface ArticleSummary {
  tldr: string;
  keyPoints: string[];
  analysis: string;
}

export type TranslationStyle = 'tech' | 'concise' | 'professional' | 'fun';
export type AiModel = 'gemini-2.5-flash' | 'gemini-3-pro-preview';

export interface AppSettings {
  translationStyle: TranslationStyle;
  summaryModel: AiModel;
  theme: 'light' | 'dark';
}