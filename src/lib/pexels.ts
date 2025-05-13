
import type { PexelsCuratedResponse, PexelsSearchResponse, PexelsPhoto } from '@/types/pexels';

const PEXELS_API_URL = 'https://api.pexels.com/v1';

// Mock photo generation logic is commented out as it's not currently used.
// const mockPhoto = (id: number): PexelsPhoto => ({
//   id,
//   width: 1920,
//   height: 1080,
//   url: `https://www.pexels.com/photo/${id}/`,
//   photographer: 'Mock Photographer',
//   photographer_url: 'https://www.pexels.com/@mock',
//   photographer_id: id * 100,
//   avg_color: '#7E7F7E',
//   src: {
//     original: `https://picsum.photos/seed/${id}/1920/1080`,
//     large2x: `https://picsum.photos/seed/${id}/1920/1080`,
//     large: `https://picsum.photos/seed/${id}/1280/720`,
//     medium: `https://picsum.photos/seed/${id}/640/480`,
//     small: `https://picsum.photos/seed/${id}/320/240`,
//     portrait: `https://picsum.photos/seed/${id}/720/1280`,
//     landscape: `https://picsum.photos/seed/${id}/1280/720`,
//     tiny: `https://picsum.photos/seed/${id}/200/100`,
//   },
//   liked: false,
//   alt: `Mock Photo ${id}`,
// });

// const getMockPhotos = (count: number): PexelsPhoto[] => {
//   return Array.from({ length: count }, (_, i) => mockPhoto(i + 1));
// };

async function fetchPexelsAPI<T>(endpoint: string): Promise<T | null> {
  // Use the environment variable if available and valid (not an empty string), otherwise use the fallback.
  const apiKeyFromEnv = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
  const fallbackApiKey = "lc7gpWWi2bcrekjM32zdi1s68YDYmEWMeudlsDNNMVEicIIke3G8Iamw";

  const apiKeyToUse = (apiKeyFromEnv && apiKeyFromEnv.trim() !== "")
    ? apiKeyFromEnv
    : fallbackApiKey;

  if (!apiKeyToUse) { // Should ideally not happen if fallback is always a valid string
    console.error("Pexels API key is effectively missing. Cannot make API calls.");
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
        console.warn("Failed to read error response body from Pexels:", textError);
      }
      const detailedErrorMessage = `Pexels API Error: ${response.status} ${response.statusText}. Endpoint: ${PEXELS_API_URL}${endpoint}. Body: ${errorBodyText}`;
      console.error(detailedErrorMessage);
      return null;
    }

    // Get response as text first to handle potential non-JSON responses gracefully
    const responseText = await response.text();
    try {
      return JSON.parse(responseText) as T;
    } catch (jsonError) {
      console.error(`Pexels API Error: Failed to parse JSON response. Endpoint: ${PEXELS_API_URL}${endpoint}. Status: ${response.status}. Response text (first 500 chars): ${responseText.substring(0,500)}`, jsonError);
      return null;
    }

  } catch (error) { // Catches network errors or other unexpected errors during the fetch process
    console.error(`Failed to fetch from Pexels API. Endpoint: ${PEXELS_API_URL}${endpoint}. Error:`, error);
    return null;
  }
}

export async function getCuratedPhotos(page: number = 1, perPage: number = 20): Promise<PexelsCuratedResponse | null> {
  return fetchPexelsAPI<PexelsCuratedResponse>(`/curated?page=${page}&per_page=${perPage}`);
}

export async function searchPhotos(query: string, page: number = 1, perPage: number = 20): Promise<PexelsSearchResponse | null> {
  return fetchPexelsAPI<PexelsSearchResponse>(`/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`);
}

export async function getPhotoById(id: string): Promise<PexelsPhoto | null> {
  return fetchPexelsAPI<PexelsPhoto>(`/photos/${id}`);
}
