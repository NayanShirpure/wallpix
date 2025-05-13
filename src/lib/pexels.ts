
import type { PexelsCuratedResponse, PexelsSearchResponse, PexelsPhoto } from '@/types/pexels';

const PEXELS_API_URL = 'https://api.pexels.com/v1';
const FALLBACK_API_KEY = "lc7gpWWi2bcrekjM32zdi1s68YDYmEWMeudlsDNNMVEicIIke3G8Iamw";
const PLACEHOLDER_TEXT_PATTERN = /your_actual_pexels_api_key/i;

function getApiKey(): string | null {
  const context = typeof window === 'undefined' ? 'Server' : 'Client';
  let envApiKey: string | undefined;

  if (context === 'Server') {
    envApiKey = process.env.PEXELS_API_KEY;
  } else {
    // Client-side, Next.js exposes env vars prefixed with NEXT_PUBLIC_
    // next.config.js maps PEXELS_API_KEY to NEXT_PUBLIC_PEXELS_API_KEY for client
    envApiKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
  }

  // Check 1: Is the environment variable API key valid?
  if (envApiKey && envApiKey.trim() !== "" && !PLACEHOLDER_TEXT_PATTERN.test(envApiKey)) {
    // Log if the env var happens to be the same as the hardcoded fallback, which is fine.
    if (envApiKey === FALLBACK_API_KEY && process.env.NODE_ENV === 'development') {
      // console.info(`[lib/pexels ${context}] Using PEXELS_API_KEY from environment, which matches the hardcoded fallback value.`);
    }
    return envApiKey;
  }

  // Check 2: If env var is not valid, try the hardcoded FALLBACK_API_KEY
  if (process.env.NODE_ENV === 'development') {
    const expectedKeyName = context === 'Server' ? 'PEXELS_API_KEY' : 'NEXT_PUBLIC_PEXELS_API_KEY';
    // Provide more context in the warning
    let problem = "missing";
    if (envApiKey && envApiKey.trim() === "") problem = "empty";
    else if (envApiKey && PLACEHOLDER_TEXT_PATTERN.test(envApiKey)) problem = "a placeholder";
    
    console.warn(`[lib/pexels ${context}] Environment variable ${expectedKeyName} is ${problem}. Attempting to use hardcoded fallback PEXELS_API_KEY.`);
  }

  if (FALLBACK_API_KEY && FALLBACK_API_KEY.trim() !== "" && !PLACEHOLDER_TEXT_PATTERN.test(FALLBACK_API_KEY)) {
    return FALLBACK_API_KEY;
  }

  // Check 3: If both environment variable and fallback are invalid
  console.error(`[lib/pexels ${context}] Critical: No valid PEXELS_API_KEY found. Both environment variable and hardcoded fallback are invalid or missing. API calls will likely fail.`);
  return null;
}

async function fetchPexelsAPI<T>(endpoint: string): Promise<T | null> {
  const apiKeyToUse = getApiKey();

  if (!apiKeyToUse) {
    const context = typeof window === 'undefined' ? 'Server' : 'Client';
    const errorMessage = `[ ${context} ] PEXELS API key is not configured or available in src/lib/pexels.ts. Cannot make API calls. Ensure PEXELS_API_KEY is set in your .env.local file and the server is restarted.`;
    console.error(errorMessage);
    // For client-side development, allow mock data flow by returning null
    // For server-side, this is a critical failure if not handled by the caller
    return null;
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
      const detailedErrorMessage = `Pexels API Error: ${response.status} ${response.statusText}. Endpoint: ${PEXELS_API_URL}${endpoint}. Response (first 200 chars): ${errorBodyText.substring(0, 200)}`;
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
