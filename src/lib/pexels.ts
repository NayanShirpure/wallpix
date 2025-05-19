
import type { PexelsResponse, PexelsPhoto } from '@/types/pexels';

// Helper function to fetch data from our internal Pexels API proxy routes
async function fetchFromInternalAPI<T>(endpoint: string, params?: URLSearchParams): Promise<T | null> {
  const baseURL = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:9002'); // Fallback for local dev if NEXT_PUBLIC_SITE_URL is not set
  
  // Ensure endpoint starts with a slash if it's meant to be an internal API route
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Construct the full URL
  let fullUrl = `${baseURL.replace(/\/$/, '')}${path}`; // Remove trailing slash from baseURL before appending path

  if (params) {
    fullUrl += `?${params.toString()}`;
  }
  
  try {
    const response = await fetch(fullUrl, {
      cache: 'default', // Let Next.js handle caching for internal API routes
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      console.error(`Error fetching from internal API ${fullUrl}: ${response.status}`, errorData);
      return null;
    }
    return response.json() as T;
  } catch (error) {
    console.error(`Network error fetching from internal API ${fullUrl}:`, error);
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

