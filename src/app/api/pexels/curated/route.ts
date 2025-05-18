
import { type NextRequest, NextResponse } from 'next/server';

const PEXELS_API_BASE_URL = 'https://api.pexels.com/v1';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const per_page = searchParams.get('per_page') || '20';

  const pexelsApiKey = process.env.PEXELS_API_KEY;
  if (!pexelsApiKey) {
    console.error('[API/PEXELS/CURATED] PEXELS_API_KEY is not set on the server.');
    return NextResponse.json({ error: 'Server configuration error: Pexels API Key missing.' }, { status: 500 });
  }

  const pexelsApiUrl = `${PEXELS_API_BASE_URL}/curated?page=${page}&per_page=${per_page}`;

  try {
    const pexelsResponse = await fetch(pexelsApiUrl, {
      headers: {
        Authorization: pexelsApiKey,
      },
      cache: 'default', // Or 'no-store' if fresh data is always needed
    });

    if (!pexelsResponse.ok) {
      const errorBody = await pexelsResponse.text().catch(() => 'Could not read Pexels error body.');
      console.error(`[API/PEXELS/CURATED] Pexels API error: ${pexelsResponse.status}`, errorBody.substring(0, 500));
      return NextResponse.json({ error: `Pexels API error: ${pexelsResponse.status}` }, { status: pexelsResponse.status });
    }

    const data = await pexelsResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API/PEXELS/CURATED] Error fetching from Pexels API:', error);
    return NextResponse.json({ error: 'Failed to fetch curated photos from Pexels.' }, { status: 500 });
  }
}
