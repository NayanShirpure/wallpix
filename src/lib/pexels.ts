
import type { PexelsCuratedResponse, PexelsSearchResponse, PexelsPhoto } from '@/types/pexels';

const PEXELS_API_URL = 'https://api.pexels.com/v1';
// This is a fallback key and should ideally not be used in production if a proper key is set via .env.local
const FALLBACK_API_KEY_CONSTANT = "lc7gpWWi2bcrekjM32zdi1s68YDYmEWMeudlsDNNMVEicIIke3G8Iamw";
const PLACEHOLDER_TEXT_PATTERN = /your_actual_pexels_api_key/i;

function getApiKey(): string | null {
  const context = typeof window === 'undefined' ? 'Server' : 'Client';
  let apiKey: string | undefined;

  if (context === 'Server') {
    apiKey = process.env.PEXELS_API_KEY;
  } else {
    // Client-side: next.config.js maps PEXELS_API_KEY to NEXT_PUBLIC_PEXELS_API_KEY
    apiKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
  }

  // Check 1: Is the environment variable API key valid and not a placeholder?
  if (apiKey && apiKey.trim() !== "" && !PLACEHOLDER_TEXT_PATTERN.test(apiKey)) {
    return apiKey;
  }

  // Check 2: If env var is not valid, log a warning (dev only) and try the hardcoded FALLBACK_API_KEY_CONSTANT.
  // This fallback should only be used if the env var is truly missing or placeholder.
  const envKeyName = context === 'Server' ? 'PEXELS_API_KEY' : 'NEXT_PUBLIC_PEXELS_API_KEY';
  let problem = "missing or placeholder";
  if (apiKey && apiKey.trim() === "") problem = "empty";
  else if (apiKey && PLACEHOLDER_TEXT_PATTERN.test(apiKey)) problem = "a placeholder";
  
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[lib/pexels ${context}] Environment variable ${envKeyName} is ${problem}. Attempting to use hardcoded fallback PEXELS API key.`);
  }
  
  // Use the hardcoded fallback if the env var was invalid.
  if (FALLBACK_API_KEY_CONSTANT && FALLBACK_API_KEY_CONSTANT.trim() !== "" && !PLACEHOLDER_TEXT_PATTERN.test(FALLBACK_API_KEY_CONSTANT)) {
    return FALLBACK_API_KEY_CONSTANT;
  }

  // Check 3: If both environment variable and fallback are invalid
  console.error(`[lib/pexels ${context}] Critical: No valid PEXELS_API_KEY found. Both environment variable and hardcoded fallback are invalid or missing. API calls will likely fail or use mock data.`);
  return null; // Indicates no valid key is available
}

async function fetchPexelsAPI<T>(endpoint: string): Promise<T | null> {
  const apiKeyToUse = getApiKey();

  if (!apiKeyToUse) {
    const context = typeof window === 'undefined' ? 'Server' : 'Client';
    const errorMessage = `[${context}] Pexels API key is not configured or available. Cannot make API calls. Ensure ${context === 'Server' ? 'PEXELS_API_KEY' : 'NEXT_PUBLIC_PEXELS_API_KEY'} is set in your .env.local file. Displaying mock data or failing.`;
    console.error(errorMessage);
    return null; // Return null to allow callers to handle mock data
  }

  try {
    const response = await fetch(`${PEXELS_API_URL}${endpoint}`, {
      headers: {
        Authorization: apiKeyToUse,
      },
      cache: 'no-store', 
    });

    if (!response.ok) {
      let errorBodyText = "Could not read error body from Pexels API response.";
      try {
        errorBodyText = await response.text();
      } catch (textError) {
        // Non-critical if reading error body fails
      }
      const detailedErrorMessage = `Pexels API Error: ${response.status} ${response.statusText}. Endpoint: ${PEXELS_API_URL}${endpoint}. Key Used: ${apiKeyToUse.substring(0,5)}... . Response (first 200 chars): ${errorBodyText.substring(0, 200)}`;
      console.error(detailedErrorMessage);
      return null;
    }

    const responseText = await response.text();
    try {
      return JSON.parse(responseText) as T;
    } catch (jsonError) {
      console.error(`Pexels API Error: Failed to parse JSON response. Endpoint: ${PEXELS_API_URL}${endpoint}. Status: ${response.status}. Response text (first 500 chars): ${responseText.substring(0,500)}`, jsonError);
      return null;
    }

  } catch (error) {
    console.error(`Failed to fetch from Pexels API. Endpoint: ${PEXELS_API_URL}${endpoint}. Error:`, error);
    return null;
  }
}

export async function getCuratedPhotos(page: number = 1, perPage: number = 20): Promise<PexelsCuratedResponse | null> {
  return fetchPexelsAPI<PexelsCuratedResponse>(`/curated?page=${page}&per_page=${perPage}`);
}

export async function searchPhotos(
  query: string,
  page: number = 1,
  perPage: number = 20,
  orientation?: 'landscape' | 'portrait' | 'square'
): Promise<PexelsSearchResponse | null> {
  let endpoint = `/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
  if (orientation) {
    endpoint += `&orientation=${orientation}`;
  }
  return fetchPexelsAPI<PexelsSearchResponse>(endpoint);
}

export async function getPhotoById(id: string): Promise<PexelsPhoto | null> {
  return fetchPexelsAPI<PexelsPhoto>(`/photos/${id}`);
}
