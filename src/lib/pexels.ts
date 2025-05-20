
import type { PexelsResponse, PexelsPhoto } from '@/types/pexels';

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
  
  // Note: A 429 error from Pexels API indicates rate limiting.
  // This function handles responses from our *internal* API routes.
  try {
    const response = await fetch(requestUrl, {
      cache: 'default', 
    });

    if (!response.ok) {
      let errorBodyContent = `Status: ${response.status} ${response.statusText}. URL: ${requestUrl}.`;
      try {
        // Try to parse as JSON first, as our internal routes should now consistently return JSON errors
        const jsonError = await response.json();
        errorBodyContent += ` Body: ${JSON.stringify(jsonError)}`;
      } catch (jsonParseError) {
        // If JSON parsing fails, try to get text
        try {
          const textError = await response.text();
          errorBodyContent += ` Body (text): ${textError}`;
        } catch (textParseError) {
          errorBodyContent += ' Could not read error response body (text or json).';
        }
      }
      console.error(`[fetchFromInternalAPI ${isClientSide ? 'Client' : 'Server'}] Error fetching from internal API ${requestUrl}. Response: ${errorBodyContent.substring(0, 1000)}`);
      return null;
    }
    
    // If response is OK, attempt to parse as JSON
    try {
      const data = await response.json();
      return data as T;
    } catch (e) {
      // Handle cases where response is OK but body is not valid JSON
      const responseText = await response.text().catch(() => "Could not read response text.");
      console.error(`[fetchFromInternalAPI ${isClientSide ? 'Client' : 'Server'}] Failed to parse JSON response from ${requestUrl}. Response text: ${responseText.substring(0,500)}`, e);
      return null;
    }

  } catch (error) {
    console.error(`[fetchFromInternalAPI ${isClientSide ? 'Client' : 'Server'}] Network error or other issue fetching from internal API ${requestUrl}:`, error);
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
  return fetchFromInternalAPI<PexelsResponse>('/api/pexels/search', params);
}

export async function getPhotoById(id: string): Promise<PexelsPhoto | null> {
  if (!id) {
     console.warn("[Pexels Lib] getPhotoById called with no ID. Returning null.");
    return null;
  }
  return fetchFromInternalAPI<PexelsPhoto>(`/api/pexels/photos/${id}`);
}
