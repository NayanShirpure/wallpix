
import type { PexelsResponse, PexelsPhoto } from '@/types/pexels';

// Helper function to fetch data from our internal Pexels API proxy routes
async function fetchFromInternalAPI<T>(endpoint: string, params?: URLSearchParams): Promise<T | null> {
  let requestUrl: string;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (typeof window === 'undefined') {
    // Server-side: needs an absolute URL to the currently running instance
    // process.env.PORT is typically set by Node.js environments or Next.js dev server
    const port = process.env.PORT || 9002; // Default to 9002 if PORT is not set, as per user's dev setup
    const host = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}` // Vercel deployment
      : `http://localhost:${port}`; // Local dev or other server environments
    requestUrl = `${host}${path}`;
  } else {
    // Client-side: relative URL is fine and avoids CORS issues if NEXT_PUBLIC_SITE_URL is different from current origin
    requestUrl = path;
  }

  if (params) {
    requestUrl += `?${params.toString()}`;
  }
  
  try {
    const response = await fetch(requestUrl, {
      cache: 'default', // Let Next.js handle caching for internal API routes
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `Failed to parse error response from ${requestUrl}` }));
      console.error(`Error fetching from internal API ${requestUrl}: ${response.status}`, errorData);
      return null;
    }
    return response.json() as T;
  } catch (error) {
    console.error(`Network error fetching from internal API ${requestUrl}:`, error);
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
