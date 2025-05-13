
import type { PexelsCuratedResponse, PexelsSearchResponse, PexelsPhoto } from '@/types/pexels';

// The API key is now expected to be set in next.config.ts as NEXT_PUBLIC_PEXELS_API_KEY
// and will be available here via process.env.NEXT_PUBLIC_PEXELS_API_KEY.
const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
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
  if (!PEXELS_API_KEY) {
    console.error("PEXELS API key (NEXT_PUBLIC_PEXELS_API_KEY) is not configured or available in src/lib/pexels.ts. Cannot make API calls.");
    return null;
  }

  try {
    const response = await fetch(`${PEXELS_API_URL}${endpoint}`, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
      cache: 'no-store', 
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let detailedErrorMessage = `Pexels API Error: ${response.status} ${response.statusText}. Endpoint: ${PEXELS_API_URL}${endpoint}.`;
      if (response.status === 401 || response.status === 403) {
        detailedErrorMessage += " This might be due to an invalid or unauthorized API key.";
      }
      detailedErrorMessage += ` Body: ${errorBody}`;
      console.error(detailedErrorMessage);
      return null;
    }
    return response.json() as Promise<T>;
  } catch (error) {
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
