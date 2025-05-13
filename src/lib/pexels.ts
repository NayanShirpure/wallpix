
import type { PexelsCuratedResponse, PexelsSearchResponse, PexelsPhoto } from '@/types/pexels';

const PEXELS_API_URL = 'https://api.pexels.com/v1';
const FALLBACK_API_KEY = "lc7gpWWi2bcrekjM32zdi1s68YDYmEWMeudlsDNNMVEicIIke3G8Iamw";
const PLACEHOLDER_TEXT_PATTERN = /your_actual_pexels_api_key/i;

function getApiKey(): string {
  let apiKey: string | undefined;
  const context = typeof window === 'undefined' ? 'Server' : 'Client';

  if (context === 'Server') {
    apiKey = process.env.PEXELS_API_KEY;
  } else {
    apiKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
  }

  if (apiKey && apiKey.trim() !== "" && !PLACEHOLDER_TEXT_PATTERN.test(apiKey) && apiKey !== FALLBACK_API_KEY) {
    return apiKey;
  }

  // If no valid user-provided key, log a warning in development and use fallback.
  if (process.env.NODE_ENV === 'development') {
    const envVarName = context === 'Server' ? 'PEXELS_API_KEY' : 'NEXT_PUBLIC_PEXELS_API_KEY';
    if (!apiKey) {
      console.warn(`[lib/pexels ${context}] ${envVarName} is not set. Using fallback API key.`);
    } else if (PLACEHOLDER_TEXT_PATTERN.test(apiKey)) {
      console.warn(`[lib/pexels ${context}] ${envVarName} is set to a placeholder. Using fallback API key.`);
    } else if (apiKey.trim() === "") {
      console.warn(`[lib/pexels ${context}] ${envVarName} is empty. Using fallback API key.`);
    } else if (apiKey === FALLBACK_API_KEY) {
      // This case means the environment variable was explicitly set to the fallback key,
      // or it was the only key available. No warning needed if it's intentional.
      // console.log(`[lib/pexels ${context}] Using configured fallback API key.`);
    }
  }
  return FALLBACK_API_KEY;
}

async function fetchPexelsAPI<T>(endpoint: string): Promise<T | null> {
  const apiKeyToUse = getApiKey();

  try {
    const response = await fetch(`${PEXELS_API_URL}${endpoint}`, {
      headers: {
        Authorization: apiKeyToUse,
      },
      cache: 'no-store', // Ensures fresh data, can be configured based on needs
    });

    if (!response.ok) {
      let errorBodyText = "Could not read error body.";
      try {
        errorBodyText = await response.text();
      } catch (textError) {
        // Non-critical, just for logging
      }
      const detailedErrorMessage = `Pexels API Error: ${response.status} ${response.statusText}. Endpoint: ${PEXELS_API_URL}${endpoint}. Body: ${errorBodyText.substring(0, 200)}`;
      console.error(detailedErrorMessage);
      return null;
    }

    // It's good practice to check content-type before parsing JSON, but Pexels API should be consistent.
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
