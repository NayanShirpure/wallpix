
import { type NextRequest, NextResponse } from 'next/server';

const PEXELS_API_BASE_URL = 'https://api.pexels.com/v1';

interface Context {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, context: Context) {
  const { id } = context.params;

  const pexelsApiKey = process.env.PEXELS_API_KEY;
  const maskedApiKey = pexelsApiKey
    ? `${pexelsApiKey.substring(0, 4)}...${pexelsApiKey.substring(pexelsApiKey.length - 4)}`
    : 'NOT SET OR MISSING';

  console.log(`[API/PEXELS/PHOTOS/${id}] Handler invoked. Photo ID: ${id}. Using Pexels API Key (masked): ${maskedApiKey}`);

  if (!id) {
    console.error(`[API/PEXELS/PHOTOS] Error: Photo ID is missing in the request context.`);
    return NextResponse.json(
      { error: 'Photo ID is required' },
      { status: 400 }
    );
  }

  if (!pexelsApiKey) {
    const errorMessage = `[API/PEXELS/PHOTOS/${id}] PEXELS_API_KEY IS MISSING ON THE SERVER. CRITICAL: Check deployment environment variables.`;
    console.error(errorMessage);
    return NextResponse.json(
      { error: 'Server configuration error: Pexels API Key missing.' },
      { status: 500 }
    );
  }

  const pexelsApiUrl = `${PEXELS_API_BASE_URL}/photos/${id}`;
  console.log(`[API/PEXELS/PHOTOS/${id}] Constructed Pexels API URL: ${pexelsApiUrl}`);

  const headers = {
    Authorization: pexelsApiKey,
  };
  console.log(`[API/PEXELS/PHOTOS/${id}] Request Headers (Authorization masked): Authorization: ${maskedApiKey}`);

  try {
    console.log(`[API/PEXELS/PHOTOS/${id}] Attempting to fetch from Pexels API.`);
    const pexelsResponse = await fetch(pexelsApiUrl, {
      headers,
      cache: 'default',
    });

    console.log(`[API/PEXELS/PHOTOS/${id}] Pexels API response status: ${pexelsResponse.status}`);

    if (!pexelsResponse.ok) {
      const pexelsErrorBody = await pexelsResponse.text().catch(() => 'Could not read Pexels error body.');
      const errorMessage = `[API/PEXELS/PHOTOS/${id}] Pexels API error: ${pexelsResponse.status} ${pexelsResponse.statusText}. Raw Body: ${pexelsErrorBody.substring(0, 500)}`;
      console.error(errorMessage);
      return NextResponse.json(
        { error: 'Pexels API error', status: pexelsResponse.status, details: pexelsErrorBody.substring(0, 200) },
        { status: pexelsResponse.status }
      );
    }

    const data = await pexelsResponse.json();
    console.log(`[API/PEXELS/PHOTOS/${id}] Successfully fetched data from Pexels.`);
    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = `[API/PEXELS/PHOTOS/${id}] Error fetching from Pexels API: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMessage);
    return NextResponse.json(
      { error: `Failed to fetch photo details from Pexels for ID ${id}.`, details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
