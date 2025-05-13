
import type { Metadata, ResolvingMetadata } from 'next';
import type { ReactNode } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nayanshirpure.github.io/Wallify/';

export async function generateMetadata(
  { params: paramsPromise }: { params: Promise<{ query: string }> }, // Changed to expect a Promise
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await paramsPromise; // Await the promise to get the resolved params
  let decodedQuery = "Wallpapers";
  let rawQuery = params?.query || ""; // Use resolved params

  if (params?.query) {
    try {
      decodedQuery = decodeURIComponent(params.query);
    } catch (e) {
      console.warn(`[SearchLayout] Failed to decode query parameter for metadata: "${params.query}". Using raw value.`, e);
      decodedQuery = params.query; // Use raw query if decoding fails
    }
  }
  
  const queryForTitle = decodedQuery && decodedQuery.toLowerCase() !== 'wallpaper' ? `"${decodedQuery}"` : "Wallpapers";
  const title = `Search results for ${queryForTitle} | Wallify`;
  const description = `Find stunning ${decodedQuery || 'wallpapers'} on Wallify. High-quality backgrounds for desktop and smartphone, curated from Pexels.`;
  
  const parentOpenGraph = await parent;
  const previousImages = parentOpenGraph?.openGraph?.images || [];
  const searchOgImage = `${BASE_URL}opengraph-image.png`; // Generic OG image for search results

  return {
    title,
    description,
    keywords: params?.query ? [decodedQuery, 'wallpapers', 'backgrounds', 'search', 'Pexels', 'Wallify'] : ['wallpapers', 'search', 'Wallify'],
    alternates: {
      canonical: `${BASE_URL}search/${rawQuery}`, // Use raw (encoded) query for canonical URL
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}search/${rawQuery}`,
      type: 'website', // or 'object' if more appropriate for search results
      images: [
        {
          url: searchOgImage,
          width: 1200,
          height: 630,
          alt: `Search results for ${queryForTitle} on Wallify`,
        },
        ...previousImages,
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [searchOgImage],
    },
  };
}

export default function SearchLayout({
  children,
}: {
  children: ReactNode;
}) {
  // The GlobalHeader is now part of the SearchPage component itself for better state management.
  // This layout remains for metadata and potentially other shared structural elements if needed in the future.
  return <>{children}</>;
}
