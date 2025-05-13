import type { PexelsCuratedResponse, PexelsSearchResponse, PexelsPhoto } from '@/types/pexels';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PEXELS_API_URL = 'https://api.pexels.com/v1';

const mockPhoto = (id: number): PexelsPhoto => ({
  id,
  width: 1920,
  height: 1080,
  url: `https://www.pexels.com/photo/${id}/`,
  photographer: 'Mock Photographer',
  photographer_url: 'https://www.pexels.com/@mock',
  photographer_id: id * 100,
  avg_color: '#7E7F7E',
  src: {
    original: `https://picsum.photos/seed/${id}/1920/1080`,
    large2x: `https://picsum.photos/seed/${id}/1920/1080`,
    large: `https://picsum.photos/seed/${id}/1280/720`,
    medium: `https://picsum.photos/seed/${id}/640/480`,
    small: `https://picsum.photos/seed/${id}/320/240`,
    portrait: `https://picsum.photos/seed/${id}/720/1280`,
    landscape: `https://picsum.photos/seed/${id}/1280/720`,
    tiny: `https://picsum.photos/seed/${id}/200/100`,
  },
  liked: false,
  alt: `Mock Photo ${id}`,
});

const getMockPhotos = (count: number): PexelsPhoto[] => {
  return Array.from({ length: count }, (_, i) => mockPhoto(i + 1));
};


async function fetchPexelsAPI<T>(endpoint: string, isSearch: boolean = false): Promise<T | null> {
  if (!PEXELS_API_KEY) {
    console.warn("PEXELS_API_KEY is not set. Returning mock data.");
    // Return mock data structure similar to Pexels API
    if (endpoint.startsWith('/curated')) {
      return {
        page: 1,
        per_page: 15,
        photos: getMockPhotos(15),
        next_page: 'mock_next_page_curated'
      } as unknown as T;
    } else if (endpoint.startsWith('/search')) {
       return {
        page: 1,
        per_page: 15,
        photos: getMockPhotos(15),
        total_results: 15,
        next_page: 'mock_next_page_search'
      } as unknown as T;
    }
    return null;
  }

  try {
    const response = await fetch(`${PEXELS_API_URL}${endpoint}`, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
      cache: 'no-store', // Or 'force-cache' / 'default' depending on needs
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
  if (!PEXELS_API_KEY) {
    console.warn("PEXELS_API_KEY is not set. Returning mock data for getPhotoById.");
    return mockPhoto(parseInt(id, 10) || 1) as PexelsPhoto;
  }
  return fetchPexelsAPI<PexelsPhoto>(`/photos/${id}`);
}
