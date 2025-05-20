
import { type NextRequest, NextResponse } from 'next/server';

const PEXELS_API_BASE_URL = 'https://api.pexels.com/v1';

interface Context {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, context: Context) {
  const { id } = context.params;

  if (!id) {
    return new Response(
      JSON.stringify({ error: 'Photo ID is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const pexelsApiKey = process.env.PEXELS_API_KEY;
  if (!pexelsApiKey) {
    const errorMessage = `[API/PEXELS/PHOTOS/${id}] PEXELS_API_KEY is not set or accessible on the server. CRITICAL: Check deployment environment variables.`;
    console.error(errorMessage);
    return new Response(
      JSON.stringify({ error: 'Server configuration error: Pexels API Key missing or not configured in the deployment environment.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const pexelsApiUrl = `${PEXELS_API_BASE_URL}/photos/${id}`;

  try {
    const pexelsResponse = await fetch(pexelsApiUrl, {
      headers: {
        Authorization: pexelsApiKey,
      },
      cache: 'default',
    });

    if (!pexelsResponse.ok) {
      const pexelsErrorBody = await pexelsResponse.text().catch(() => 'Could not read Pexels error body.');
      const errorMessage = `[API/PEXELS/PHOTOS/${id}] Pexels API error: ${pexelsResponse.status} ${pexelsResponse.statusText}. Body: ${pexelsErrorBody.substring(0, 500)}`;
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
    const errorMessage = `[API/PEXELS/PHOTOS/${id}] Error fetching from Pexels API: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMessage);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch photo details from Pexels. Check server logs.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
