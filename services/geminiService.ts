import { GoogleGenAI, Type } from "@google/genai";
import { HnStory, TranslationResult, TranslationStyle, AiModel, ArticleSummary } from "../types";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

// Cache helpers
const getFromCache = <T>(key: string): T | null => {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn("Cache read error", e);
  }
  return null;
};

const saveToCache = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    // Handle quota exceeded or other errors silently
    console.warn("Cache write error", e);
  }
};

const getStylePrompt = (style: TranslationStyle): string => {
  switch (style) {
    case 'concise':
      return "Translate strictly and concisely. Remove unnecessary words. Keep it short.";
    case 'professional':
      return "Use formal, professional Chinese (Business/Academic tone).";
    case 'fun':
      return "Translate in a witty, engaging, slightly clickbaity style suitable for social media.";
    case 'tech':
    default:
      return "Keep technical terms in English (e.g., LLM, Rust, CI/CD). Use standard terminology used by Chinese developers.";
  }
};

/**
 * Translates a batch of English titles to Chinese.
 * Uses structured JSON output. Checks cache first.
 */
export const translateTitlesBatch = async (
  stories: HnStory[], 
  style: TranslationStyle = 'tech',
  forceRefresh: boolean = false
): Promise<TranslationResult[]> => {
  if (!apiKey) {
    console.warn("No API KEY provided");
    return [];
  }

  // 1. Check Cache
  const results: TranslationResult[] = [];
  const storiesToTranslate: { id: number; title: string }[] = [];

  stories.forEach(story => {
    const cacheKey = `hn_title_${story.id}_${style}`;
    const cachedTitle = !forceRefresh ? getFromCache<string>(cacheKey) : null;
    
    if (cachedTitle) {
      results.push({ id: story.id, translatedTitle: cachedTitle });
    } else {
      storiesToTranslate.push({ id: story.id, title: story.title });
    }
  });

  if (storiesToTranslate.length === 0) {
    return results;
  }

  // 2. Fetch missing translations
  const styleInstruction = getStylePrompt(style);
  const prompt = `
    Translate the following Hacker News titles from English to Chinese (Simplified).
    Style Guide: ${styleInstruction}
    
    Return a JSON array where each object has the original 'id' and the 'translatedTitle'.
    
    Input Data:
    ${JSON.stringify(storiesToTranslate)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.NUMBER },
              translatedTitle: { type: Type.STRING }
            },
            required: ["id", "translatedTitle"]
          }
        }
      }
    });

    if (response.text) {
      const newTranslations = JSON.parse(response.text) as TranslationResult[];
      
      // 3. Save to cache and merge
      newTranslations.forEach(t => {
        const cacheKey = `hn_title_${t.id}_${style}`;
        saveToCache(cacheKey, t.translatedTitle);
        results.push(t);
      });
    }
  } catch (error) {
    console.error("Translation error:", error);
  }

  return results;
};

/**
 * Summarizes a specific URL using Search Grounding.
 * Supports model selection and caching. Returns structured data.
 */
export const summarizeArticle = async (
  url: string, 
  title: string,
  model: AiModel = 'gemini-2.5-flash',
  style: TranslationStyle = 'tech',
  forceRefresh: boolean = false
): Promise<ArticleSummary | null> => {
  if (!apiKey) return null;

  // 1. Check Cache (v2 for structured data)
  const cacheKey = `hn_summary_v2_${btoa(url).slice(0, 32)}_${model}_${style}`;
  
  if (!forceRefresh) {
    const cachedSummary = getFromCache<ArticleSummary>(cacheKey);
    if (cachedSummary) {
      return cachedSummary;
    }
  }

  const styleInstruction = getStylePrompt(style);
  // Updated prompt to request raw JSON since we cannot use responseMimeType with googleSearch
  const prompt = `
    Analyze the following article from the link provided:
    Title: ${title}
    URL: ${url}

    Provide a structured summary in Chinese (Simplified).
    Style: ${styleInstruction}

    If you cannot access the content directly, use the Google Search tool to find information about this specific article/topic.

    Output ONLY valid JSON without Markdown code blocks.
    Format:
    {
      "tldr": "A single, powerful sentence summarizing the core value or news. Make it catchy.",
      "keyPoints": ["Key point 1", "Key point 2", "Key point 3 (Max 5 points)"],
      "analysis": "A short paragraph (approx 100 words) explaining the background, significance, or technical details."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model, 
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Note: responseMimeType and responseSchema are NOT supported when using googleSearch tool.
        // We must parse the text manually.
      }
    });

    if (response.text) {
      let jsonStr = response.text.trim();
      // Clean up markdown code blocks if the model includes them
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?/, '').replace(/```$/, '');
      }

      const summaryData = JSON.parse(jsonStr) as ArticleSummary;
      
      // Basic validation
      if (summaryData.tldr && Array.isArray(summaryData.keyPoints) && summaryData.analysis) {
        saveToCache(cacheKey, summaryData);
        return summaryData;
      } else {
        console.error("Invalid summary format received", summaryData);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error("Summary error:", error);
    return null;
  }
};
