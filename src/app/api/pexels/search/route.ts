
import { type NextRequest, NextResponse } from 'next/server';

const PEXELS_API_BASE_URL = 'https://api.pexels.com/v1';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const page = searchParams.get('page') || '1';
  const per_page = searchParams.get('per_page') || '20';
  const orientation = searchParams.get('orientation'); // Get orientation

  const imageApiKey = process.env.IMAGE_API_KEY;
  const maskedApiKey = imageApiKey
    ? `${imageApiKey.substring(0, 4)}...${imageApiKey.substring(imageApiKey.length - 4)}`
    : 'NOT SET OR MISSING';
  
  // console.log(`[API/IMAGES/SEARCH] Handler invoked. Query: ${query}, Orientation: ${orientation}. Using Image API Key (masked): ${maskedApiKey}`);

  if (!query) {
     return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  if (!imageApiKey) {
    console.error('[API/IMAGES/SEARCH] IMAGE_API_KEY IS MISSING ON THE SERVER. CRITICAL: Check deployment environment variables.');
    return NextResponse.json(
      { error: 'Server configuration error: Image API Key missing on server.' },
      { status: 500 }
    );
  }

  const pexelsApiParams = new URLSearchParams({
    query: encodeURIComponent(query),
    page: page,
    per_page: per_page,
  });
  if (orientation) {
    pexelsApiParams.append('orientation', orientation);
  }

  const pexelsApiUrl = `${PEXELS_API_BASE_URL}/search?${pexelsApiParams.toString()}`;
  // console.log(`[API/IMAGES/SEARCH] Fetching from Pexels URL: ${pexelsApiUrl}`);
  
  const headers = {
    Authorization: imageApiKey,
  };
  // console.log(`[API/IMAGES/SEARCH] Request Headers (Authorization masked): Authorization: ${maskedApiKey}`);

  try {
    const pexelsResponse = await fetch(pexelsApiUrl, {
      headers,
      next: { revalidate: 3600 }, // Cache Pexels API response for 1 hour
    });

    // console.log(`[API/IMAGES/SEARCH] Pexels API response status: ${pexelsResponse.status}`);

    if (!pexelsResponse.ok) {
      const pexelsErrorBody = await pexelsResponse.text().catch(() => 'Could not read Pexels error body.');
      console.error(`[API/IMAGES/SEARCH] Image API error: ${pexelsResponse.status} ${pexelsResponse.statusText}. Raw Body: ${pexelsErrorBody.substring(0, 500)}`);
      return NextResponse.json(
        { error: 'Image API error', image_api_status: pexelsResponse.status, image_api_details: pexelsErrorBody.substring(0, 200) },
        { status: pexelsResponse.status }
      );
    }

    const data = await pexelsResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = `[API/IMAGES/SEARCH] Error fetching from Image API: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMessage);
     return NextResponse.json(
      { error: 'Failed to search photos from Image API.', details: error instanceof Error ? error.message : String(error) },
      { status: 503 } // Service Unavailable
    );
  }
}
