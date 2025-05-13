
import type { PexelsCuratedResponse, PexelsSearchResponse, PexelsPhoto } from '@/types/pexels';

const PEXELS_API_URL = 'https://api.pexels.com/v1';
const FALLBACK_API_KEY = "lc7gpWWi2bcrekjM32zdi1s68YDYmEWMeudlsDNNMVEicIIke3G8Iamw";
const PLACEHOLDER_TEXT_PATTERN = /your_actual_pexels_api_key/i;

function getApiKey(): string | null {
  const context = typeof window === 'undefined' ? 'Server' : 'Client';
  let apiKey: string | undefined;

  if (context === 'Server') {
    apiKey = process.env.PEXELS_API_KEY;
  } else {
    // Client-side, Next.js exposes env vars prefixed with NEXT_PUBLIC_
    // next.config.js maps PEXELS_API_KEY to NEXT_PUBLIC_PEXELS_API_KEY for client
    apiKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
  }

  // Check if the retrieved API key is valid (not undefined, not empty, not placeholder, not the fallback key itself unless intended)
  if (apiKey && apiKey.trim() !== "" && !PLACEHOLDER_TEXT_PATTERN.test(apiKey) && apiKey !== FALLBACK_API_KEY) {
    return apiKey;
  }
  
  // If the intended API key (server or client) is missing or invalid, try the fallback.
  // This handles cases where PEXELS_API_KEY might be set to the fallback directly,
  // or if NEXT_PUBLIC_PEXELS_API_KEY isn't properly propagated but PEXELS_API_KEY (fallback) exists.
  
  // Use FALLBACK_API_KEY if the primary key is problematic or if it IS the fallback key.
  // Log a warning in development if the primary key was expected but faulty.
  if (process.env.NODE_ENV === 'development') {
    const expectedKeyName = context === 'Server' ? 'PEXELS_API_KEY' : 'NEXT_PUBLIC_PEXELS_API_KEY';
    if (!apiKey || apiKey.trim() === "" || PLACEHOLDER_TEXT_PATTERN.test(apiKey)) {
      if (apiKey !== FALLBACK_API_KEY) { // Avoid warning if apiKey is already the fallback
         console.warn(`[lib/pexels ${context}] ${expectedKeyName} is missing, empty, or a placeholder. Attempting to use fallback key.`);
      }
    }
  }
  
  // If the fallback key itself is a placeholder, then we have no valid key.
  if (PLACEHOLDER_TEXT_PATTERN.test(FALLBACK_API_KEY) || FALLBACK_API_KEY.trim() === "") {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[lib/pexels ${context}] Critical: Fallback API key is also invalid or placeholder. API calls will likely fail.`);
      }
      return null; // No valid key available
  }

  return FALLBACK_API_KEY; // Return fallback if primary key checks fail or if it's the intended fallback
}

async function fetchPexelsAPI<T>(endpoint: string): Promise<T | null> {
  const apiKeyToUse = getApiKey();

  if (!apiKeyToUse) {
    const context = typeof window === 'undefined' ? 'Server' : 'Client';
    const errorMessage = `[ ${context} ] PEXELS API key (PEXELS_API_KEY / NEXT_PUBLIC_PEXELS_API_KEY) is not configured or available in src/lib/pexels.ts. Cannot make API calls.`;
    console.error(errorMessage);
    if (process.env.NODE_ENV === 'development' && context === 'Client') {
        // Avoid throwing for client-side mock data to still render UI
        console.warn("Displaying mock data due to missing API key on client.");
    } else if (context === 'Server'){
        // On server, this is a more critical failure if not handled.
        // Consider if throwing here is the right approach or if mock data should be returned.
        // For now, we'll allow it to proceed to return null, and pages should handle null response.
    }
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
      let errorBodyText = "Could not read error body.";
      try {
        errorBodyText = await response.text();
      } catch (textError) {
        // Non-critical
      }
      const detailedErrorMessage = `Pexels API Error: ${response.status} ${response.statusText}. Endpoint: ${PEXELS_API_URL}${endpoint}. Body: ${errorBodyText.substring(0, 200)}`;
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
