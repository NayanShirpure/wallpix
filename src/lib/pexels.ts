
import type { PexelsResponse, PexelsPhoto } from '@/types/pexels';

// Helper function to fetch data from our internal Pexels API proxy routes
async function fetchFromInternalAPI<T>(endpoint: string, params?: URLSearchParams): Promise<T | null> {
  const url = params ? `${endpoint}?${params.toString()}` : endpoint;
  try {
    const response = await fetch(url, {
      cache: 'default', // Let Next.js handle caching for internal API routes
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      console.error(`Error fetching from internal API ${url}: ${response.status}`, errorData);
      return null;
    }
    return response.json() as T;
  } catch (error) {
    console.error(`Network error fetching from internal API ${url}:`, error);
    return null;
  }
}

export async function getCuratedPhotos(page: number = 1, perPage: number = 20): Promise<PexelsResponse | null> {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });
  return fetchFromInternalAPI<PexelsResponse>('/api/pexels/curated', params);
}

export async function searchPhotos(
  query: string,
  page: number = 1,
  perPage: number = 20,
  orientation?: 'landscape' | 'portrait' | 'square'
): Promise<PexelsResponse | null> {
  const params = new URLSearchParams({
    query,
    page: page.toString(),
    per_page: perPage.toString(),
  });
  if (orientation) {
    params.append('orientation', orientation);
  }
  return fetchFromInternalAPI<PexelsResponse>('/api/pexels/search', params);
}

export async function getPhotoById(id: string): Promise<PexelsPhoto | null> {
   // The ID is part of the path, so we don't use URLSearchParams here for the ID itself.
  return fetchFromInternalAPI<PexelsPhoto>(`/api/pexels/photos/${id}`);
}
