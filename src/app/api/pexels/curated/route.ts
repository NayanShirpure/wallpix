
import { type NextRequest, NextResponse } from 'next/server';

const PEXELS_API_BASE_URL = 'https://api.pexels.com/v1';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const per_page = searchParams.get('per_page') || '20';

  const pexelsApiKey = process.env.PEXELS_API_KEY;
  if (!pexelsApiKey) {
    const errorMessage = '[API/PEXELS/CURATED] PEXELS_API_KEY is not set or accessible on the server. CRITICAL: Check deployment environment variables.';
    console.error(errorMessage);
    return new Response(
      JSON.stringify({ error: 'Server configuration error: Pexels API Key missing or not configured in the deployment environment.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const pexelsApiUrl = `${PEXELS_API_BASE_URL}/curated?page=${page}&per_page=${per_page}`;

  try {
    const pexelsResponse = await fetch(pexelsApiUrl, {
      headers: {
        Authorization: pexelsApiKey,
      },
      cache: 'default',
    });

    if (!pexelsResponse.ok) {
      const pexelsErrorBody = await pexelsResponse.text().catch(() => 'Could not read Pexels error body.');
      const errorMessage = `[API/PEXELS/CURATED] Pexels API error: ${pexelsResponse.status} ${pexelsResponse.statusText}. Body: ${pexelsErrorBody.substring(0, 500)}`;
      console.error(errorMessage);
      // Return a plain text error for easier debugging by fetchFromInternalAPI
      return new Response(
        `Pexels API error: ${pexelsResponse.status}. Check server logs for details. Pexels response: ${pexelsErrorBody.substring(0, 200)}`,
        { status: pexelsResponse.status, headers: { 'Content-Type': 'text/plain' } }
      );
    }

    const data = await pexelsResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = `[API/PEXELS/CURATED] Error fetching from Pexels API: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMessage);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch curated photos from Pexels. Check server logs.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
