
import { type NextRequest, NextResponse } from 'next/server';

const PEXELS_API_BASE_URL = 'https://api.pexels.com/v1';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const page = searchParams.get('page') || '1';
  const per_page = searchParams.get('per_page') || '20';
  const orientation = searchParams.get('orientation');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const pexelsApiKey = process.env.PEXELS_API_KEY;
  if (!pexelsApiKey) {
    console.error('[API/PEXELS/SEARCH] PEXELS_API_KEY is not set or accessible on the server. CRITICAL: Check deployment environment variables.');
    return NextResponse.json({ error: 'Server configuration error: Pexels API Key missing or not configured in the deployment environment.' }, { status: 500 });
  }

  let pexelsApiUrl = `${PEXELS_API_BASE_URL}/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}`;
  if (orientation) {
    pexelsApiUrl += `&orientation=${orientation}`;
  }

  try {
    const pexelsResponse = await fetch(pexelsApiUrl, {
      headers: {
        Authorization: pexelsApiKey,
      },
      cache: 'default', 
    });

    if (!pexelsResponse.ok) {
      const errorBody = await pexelsResponse.text().catch(() => 'Could not read Pexels error body.');
      console.error(`[API/PEXELS/SEARCH] Pexels API error: ${pexelsResponse.status} ${pexelsResponse.statusText}`, errorBody.substring(0, 500));
      return NextResponse.json({ error: `Pexels API error: ${pexelsResponse.status}` }, { status: pexelsResponse.status });
    }

    const data = await pexelsResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API/PEXELS/SEARCH] Error fetching from Pexels API:', error);
    return NextResponse.json({ error: 'Failed to search photos from Pexels.' }, { status: 500 });
  }
}
