
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
    return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
  }

  const pexelsApiKey = process.env.PEXELS_API_KEY;
  if (!pexelsApiKey) {
    console.error(`[API/PEXELS/PHOTOS/${id}] PEXELS_API_KEY is not set or accessible on the server. CRITICAL: Check deployment environment variables.`);
    return NextResponse.json({ error: 'Server configuration error: Pexels API Key missing or not configured in the deployment environment.' }, { status: 500 });
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
      const errorBody = await pexelsResponse.text().catch(() => 'Could not read Pexels error body.');
      console.error(`[API/PEXELS/PHOTOS/${id}] Pexels API error: ${pexelsResponse.status} ${pexelsResponse.statusText}`, errorBody.substring(0, 500));
      return NextResponse.json({ error: `Pexels API error: ${pexelsResponse.status}` }, { status: pexelsResponse.status });
    }

    const data = await pexelsResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`[API/PEXELS/PHOTOS/${id}] Error fetching from Pexels API:`, error);
    return NextResponse.json({ error: 'Failed to fetch photo details from Pexels.' }, { status: 500 });
  }
}
