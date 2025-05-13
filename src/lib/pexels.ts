
import type { PexelsCuratedResponse, PexelsSearchResponse, PexelsPhoto } from '@/types/pexels';

const PEXELS_API_URL = 'https://api.pexels.com/v1';

async function fetchPexelsAPI<T>(endpoint: string): Promise<T | null> {
  const envApiKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
  const actualFallbackKey = "lc7gpWWi2bcrekjM32zdi1s68YDYmEWMeudlsDNNMVEicIIke3G8Iamw";
  const placeholderTextPattern = /your_actual_pexels_api_key/i; // Case-insensitive check for "YOUR_ACTUAL_PEXELS_API_KEY"

  let apiKeyToUse: string;

  if (envApiKey && envApiKey.trim() !== "" && !placeholderTextPattern.test(envApiKey) && envApiKey !== actualFallbackKey) {
    apiKeyToUse = envApiKey;
  } else {
    apiKeyToUse = actualFallbackKey; // Default to actual fallback key
    if (!envApiKey) {
      // This warning is useful if the key is expected to be set via env var
      // console.warn(`[Server/lib/pexels] NEXT_PUBLIC_PEXELS_API_KEY is not set. Using hardcoded fallback Pexels API key.`);
    } else if (placeholderTextPattern.test(envApiKey)) {
      console.warn(`[Server/lib/pexels] NEXT_PUBLIC_PEXELS_API_KEY is set to a placeholder text. Using hardcoded fallback Pexels API key.`);
    } else if (envApiKey.trim() === "") {
       console.warn(`[Server/lib/pexels] NEXT_PUBLIC_PEXELS_API_KEY is empty. Using hardcoded fallback Pexels API key.`);
    }
    // If envApiKey === actualFallbackKey, it's using the fallback, which is intended in this branch. No special warning needed.
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
        console.warn("Failed to read error response body from Pexels:", textError);
      }
      const detailedErrorMessage = `Pexels API Error: ${response.status} ${response.statusText}. Endpoint: ${PEXELS_API_URL}${endpoint}. Body: ${errorBodyText}`;
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
