
import { type NextRequest, NextResponse } from 'next/server';

const PEXELS_API_BASE_URL = 'https://api.pexels.com/v1';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const per_page = searchParams.get('per_page') || '20';

  const pexelsApiKey = process.env.PEXELS_API_KEY; // Changed from IMAGE_API_KEY
  const maskedApiKey = pexelsApiKey
    ? `${pexelsApiKey.substring(0, 4)}...${pexelsApiKey.substring(pexelsApiKey.length - 4)}`
    : 'NOT SET OR MISSING';

  // console.log(`[API/PEXELS/CURATED] Handler invoked. Using Pexels API Key (masked): ${maskedApiKey}`);

  if (!pexelsApiKey) {
    console.error('[API/PEXELS/CURATED] PEXELS_API_KEY IS MISSING ON THE SERVER. CRITICAL: Check deployment environment variables.');
    return NextResponse.json(
      { error: 'Server configuration error: Pexels API Key missing on server.' },
      { status: 500 }
    );
  }

  const pexelsApiUrl = `${PEXELS_API_BASE_URL}/curated?page=${page}&per_page=${per_page}`;
  // console.log(`[API/PEXELS/CURATED] Fetching from Pexels URL: ${pexelsApiUrl}`);

  const headers = {
    Authorization: pexelsApiKey,
  };
  // console.log(`[API/PEXELS/CURATED] Request Headers (Authorization masked): Authorization: ${maskedApiKey}`);

  try {
    const pexelsResponse = await fetch(pexelsApiUrl, {
      headers,
      next: { revalidate: 3600 }, // Cache Pexels API response for 1 hour
    });

    // console.log(`[API/PEXELS/CURATED] Pexels API response status: ${pexelsResponse.status}`);

    if (!pexelsResponse.ok) {
      const pexelsErrorBody = await pexelsResponse.text().catch(() => 'Could not read Pexels error body.');
      console.error(`[API/PEXELS/CURATED] Pexels API error: ${pexelsResponse.status} ${pexelsResponse.statusText}. Raw Body: ${pexelsErrorBody.substring(0, 500)}`);
      return NextResponse.json(
        { error: 'Pexels API error', pexels_status: pexelsResponse.status, pexels_details: pexelsErrorBody.substring(0, 200) },
        { status: pexelsResponse.status }
      );
    }

    const data = await pexelsResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = `[API/PEXELS/CURATED] Error fetching from Pexels API: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMessage);
    return NextResponse.json(
      { error: 'Failed to fetch curated photos from Pexels API.', details: error instanceof Error ? error.message : String(error) },
      { status: 503 } // Service Unavailable
    );
  }
}
