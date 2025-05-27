
import { type NextRequest, NextResponse } from 'next/server';

const PEXELS_API_BASE_URL = 'https://api.pexels.com/v1';

interface Context {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, context: Context) {
  const { id } = context.params;
  // console.log(`[API/IMAGES/PHOTOS/${id}] Route handler invoked. Photo ID from context: ${id}`);

  const imageApiKey = process.env.IMAGE_API_KEY;
  const maskedApiKey = imageApiKey
    ? `${imageApiKey.substring(0, 4)}...${imageApiKey.substring(imageApiKey.length - 4)}`
    : 'NOT SET OR MISSING - CRITICAL FOR DEPLOYMENT';
  // console.log(`[API/IMAGES/PHOTOS/${id}] Using Image API Key (masked): ${maskedApiKey}`);


  if (!id) {
    console.error(`[API/IMAGES/PHOTOS] Error: Photo ID is missing in the request context.`);
    return NextResponse.json(
      { error: 'Photo ID is required' },
      { status: 400 }
    );
  }

  if (!imageApiKey) {
    console.error(`[API/IMAGES/PHOTOS/${id}] IMAGE_API_KEY IS MISSING ON THE SERVER. CRITICAL: Check deployment environment variables.`);
    return NextResponse.json(
      { error: 'Server configuration error: Image API Key missing on server.' },
      { status: 500 }
    );
  }

  const pexelsApiUrl = `${PEXELS_API_BASE_URL}/photos/${id}`;
  // console.log(`[API/IMAGES/PHOTOS/${id}] Constructed Pexels API URL: ${pexelsApiUrl}`);

  const headers = {
    Authorization: imageApiKey,
  };
  // console.log(`[API/IMAGES/PHOTOS/${id}] Request Headers (Authorization masked): Authorization: ${maskedApiKey}`);
  
  try {
    // console.log(`[API/IMAGES/PHOTOS/${id}] Attempting to fetch from Pexels API.`);
    const pexelsResponse = await fetch(pexelsApiUrl, {
      headers,
      next: { revalidate: 86400 }, // Cache individual photo details for 24 hours
    });

    // console.log(`[API/IMAGES/PHOTOS/${id}] Pexels API response status: ${pexelsResponse.status}`);

    if (!pexelsResponse.ok) {
      let pexelsErrorBody = 'Could not read Pexels error body.';
      try {
        // Attempt to get text, as Pexels might not always return JSON for errors
        pexelsErrorBody = await pexelsResponse.text();
      } catch (e) {
        console.error(`[API/IMAGES/PHOTOS/${id}] Failed to parse Pexels error body as text:`, e);
      }
      console.error(`[API/IMAGES/PHOTOS/${id}] Image API error: ${pexelsResponse.status} ${pexelsResponse.statusText}. Raw Body: ${pexelsErrorBody.substring(0, 500)}`);
      // Ensure the response from this internal API route is always valid JSON
      return NextResponse.json(
        { error: 'Image API error', image_api_status: pexelsResponse.status, image_api_details: pexelsErrorBody.substring(0, 200) },
        { status: pexelsResponse.status } 
      );
    }

    const data = await pexelsResponse.json();
    // console.log(`[API/IMAGES/PHOTOS/${id}] Successfully fetched data from Pexels.`);
    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = `[API/IMAGES/PHOTOS/${id}] Error fetching from Image API: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMessage);
    // Ensure the response from this internal API route is always valid JSON
    return NextResponse.json(
      { error: `Failed to fetch photo details from Image API for ID ${id}.`, details: error instanceof Error ? error.message : String(error) },
      { status: 503 } // Service Unavailable
    );
  }
}
