
import type { PexelsCuratedResponse, PexelsSearchResponse, PexelsPhoto } from '@/types/pexels';

const FALLBACK_PEXELS_API_KEY = "lc7gpWWi2bcrekjM32zdi1s68YDYmEWMeudlsDNNMVEicIIke3G8Iamw";
const PEXELS_API_KEY_ENV = process.env.PEXELS_API_KEY;

// Determine if a valid environment variable API key was provided
const envKeyIsProvidedAndValid = PEXELS_API_KEY_ENV && PEXELS_API_KEY_ENV.trim() !== "";
const ACTIVE_PEXELS_API_KEY = envKeyIsProvidedAndValid ? PEXELS_API_KEY_ENV.trim() : FALLBACK_PEXELS_API_KEY;

const PEXELS_API_URL = 'https://api.pexels.com/v1';

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


async function fetchPexelsAPI<T>(endpoint: string, isSearch: boolean = false): Promise<T | null> {
  // Warn if the environment variable was not properly set, leading to fallback.
  if (!envKeyIsProvidedAndValid) {
    if (PEXELS_API_KEY_ENV === undefined) {
      // This warning is for when the PEXELS_API_KEY is not set at all.
      // console.warn("PEXELS_API_KEY environment variable is not set. Using fallback API key for Pexels API calls from src/lib/pexels.ts.");
    } else {
      // This warning is for when PEXELS_API_KEY is set but is an empty string or only whitespace.
      // console.warn("PEXELS_API_KEY environment variable is empty or whitespace. Using fallback API key for Pexels API calls from src/lib/pexels.ts.");
    }
  }
  
  // This check ensures that if somehow FALLBACK_PEXELS_API_KEY was also empty, we wouldn't proceed.
  // Given FALLBACK_PEXELS_API_KEY is hardcoded and non-empty, ACTIVE_PEXELS_API_KEY should always have a value.
  if (!ACTIVE_PEXELS_API_KEY) {
    console.error("Pexels API key is effectively missing (this indicates an issue with the fallback key configuration). Cannot make API calls.");
    return null;
  }

  try {
    const response = await fetch(`${PEXELS_API_URL}${endpoint}`, {
      headers: {
        Authorization: ACTIVE_PEXELS_API_KEY,
      },
      cache: 'no-store', 
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Pexels API Error: ${response.status} ${response.statusText}`, errorBody);
      return null;
    }
    return response.json() as Promise<T>;
  } catch (error) {
    console.error("Failed to fetch from Pexels API:", error);
    return null;
  }
}

export async function getCuratedPhotos(page: number = 1, perPage: number = 20): Promise<PexelsCuratedResponse | null> {
  return fetchPexelsAPI<PexelsCuratedResponse>(`/curated?page=${page}&per_page=${perPage}`);
}

export async function searchPhotos(query: string, page: number = 1, perPage: number = 20): Promise<PexelsSearchResponse | null> {
  return fetchPexelsAPI<PexelsSearchResponse>(`/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`, true);
}

export async function getPhotoById(id: string): Promise<PexelsPhoto | null> {
  return fetchPexelsAPI<PexelsPhoto>(`/photos/${id}`);
}
