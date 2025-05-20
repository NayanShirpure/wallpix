
import type { PexelsResponse, PexelsPhoto, PexelsPhotoOrientation } from '@/types/pexels';

// Helper function to fetch data from our internal Pexels API proxy routes
async function fetchFromInternalAPI<T>(endpoint: string, params?: URLSearchParams): Promise<T | null> {
  let requestUrl: string;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const isClientSide = typeof window !== 'undefined';

  if (isClientSide) {
    // Client-side: relative URL is fine
    requestUrl = path;
  } else {
    // Server-side: needs an absolute URL
    const host = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}` // Vercel deployment
      : process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:${process.env.PORT || 9002}`; // Local dev or other server environments
    requestUrl = `${host}${path}`;
  }

  if (params) {
    requestUrl += `?${params.toString()}`;
  }
  
  // Note: A 429 error from this log means Pexels API rate limiting.
  try {
    const response = await fetch(requestUrl, {
      cache: 'default', 
    });

    if (!response.ok) {
      let errorBody = `Status: ${response.status} ${response.statusText}. URL: ${requestUrl}.`;
      try {
        const jsonError = await response.json();
        errorBody += ` Body: ${JSON.stringify(jsonError)}`;
      } catch (jsonParseError) {
        try {
          const textError = await response.text();
          errorBody += ` Body (text): ${textError.substring(0, 200)}`; // Limit length
        } catch (textParseError) {
          errorBody += ' Could not read error response body (text or json).';
        }
      }
      console.error(`[fetchFromInternalAPI ${isClientSide ? 'Client' : 'Server'}] Error fetching from internal API ${requestUrl}. Response: ${errorBody.substring(0, 1000)}`);
      return null;
    }
    
    try {
      const data = await response.json();
      return data as T;
    } catch (e) {
      const responseText = await response.text().catch(() => "Could not read response text.");
      console.error(`[fetchFromInternalAPI ${isClientSide ? 'Client' : 'Server'}] Failed to parse JSON response from ${requestUrl}. Response text: ${responseText.substring(0,500)}`, e);
      return null;
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[fetchFromInternalAPI ${isClientSide ? 'Client' : 'Server'}] Network error or other issue fetching from internal API ${requestUrl}:`, errorMessage);
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
  orientation?: PexelsPhotoOrientation, // Added orientation parameter
): Promise<PexelsResponse | null> {
  if (!query || query.trim() === "") {
    console.warn("[Pexels Lib] searchPhotos called with an empty query. Returning null.");
    return null;
  }
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
  if (!id) {
     console.warn("[Pexels Lib] getPhotoById called with no ID. Returning null.");
    return null;
  }
  return fetchFromInternalAPI<PexelsPhoto>(`/api/pexels/photos/${id}`);
}
