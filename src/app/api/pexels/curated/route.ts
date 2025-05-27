
import { type NextRequest, NextResponse } from 'next/server';

const PEXELS_API_BASE_URL = 'https://api.pexels.com/v1';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const per_page = searchParams.get('per_page') || '20';

  const imageApiKey = process.env.IMAGE_API_KEY;
  const maskedApiKey = imageApiKey
    ? `${imageApiKey.substring(0, 4)}...${imageApiKey.substring(imageApiKey.length - 4)}`
    : 'NOT SET OR MISSING';

  // console.log(`[API/IMAGES/CURATED] Handler invoked. Using Image API Key (masked): ${maskedApiKey}`);

  if (!imageApiKey) {
    console.error('[API/IMAGES/CURATED] IMAGE_API_KEY IS MISSING ON THE SERVER. CRITICAL: Check deployment environment variables.');
    return NextResponse.json(
      { error: 'Server configuration error: Image API Key missing on server.' },
      { status: 500 }
    );
  }

  const pexelsApiUrl = `${PEXELS_API_BASE_URL}/curated?page=${page}&per_page=${per_page}`;
  // console.log(`[API/IMAGES/CURATED] Fetching from Pexels URL: ${pexelsApiUrl}`);

  const headers = {
    Authorization: imageApiKey,
  };
  // console.log(`[API/IMAGES/CURATED] Request Headers (Authorization masked): Authorization: ${maskedApiKey}`);

  try {
    const pexelsResponse = await fetch(pexelsApiUrl, {
      headers,
      next: { revalidate: 3600 }, // Cache Pexels API response for 1 hour
    });

    // console.log(`[API/IMAGES/CURATED] Pexels API response status: ${pexelsResponse.status}`);

    if (!pexelsResponse.ok) {
      const pexelsErrorBody = await pexelsResponse.text().catch(() => 'Could not read Pexels error body.');
      console.error(`[API/IMAGES/CURATED] Image API error: ${pexelsResponse.status} ${pexelsResponse.statusText}. Raw Body: ${pexelsErrorBody.substring(0, 500)}`);
      return NextResponse.json(
        { error: 'Image API error', image_api_status: pexelsResponse.status, image_api_details: pexelsErrorBody.substring(0, 200) },
        { status: pexelsResponse.status }
      );
    }

    const data = await pexelsResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = `[API/IMAGES/CURATED] Error fetching from Image API: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMessage);
    return NextResponse.json(
      { error: 'Failed to fetch curated photos from Image API.', details: error instanceof Error ? error.message : String(error) },
      { status: 503 } // Service Unavailable
    );
  }
}
