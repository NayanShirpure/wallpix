
// This file is now a Server Component

import { SearchPageContent } from '@/components/search-page-content';
import { StructuredData } from '@/components/structured-data';
import type { SearchResultsPage as SchemaSearchResultsPage, WebPage as SchemaWebPage, MinimalWithContext } from '@/types/schema-dts';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nayanshirpure.github.io/Wallify/';

// Explicitly type the return for generateStaticParams
export async function generateStaticParams(): Promise<{ query: string }[]> {
  // For a search page, it's often not feasible to pre-render all possible search queries.
  // Returning an empty array means no specific search paths will be pre-rendered at build time.
  return [];
}

interface SearchPageServerProps {
  params: Promise<{ query: string }>; 
}

// This page is a Server Component
export default async function SearchPage({ params: paramsPromise }: SearchPageServerProps) {
  const params = await paramsPromise; // Await the promise to get the resolved params

  let initialDecodedQuery = 'Wallpaper';
  let rawQueryForUrl = '';

  if (params && params.query) {
    rawQueryForUrl = params.query;
    try {
      initialDecodedQuery = decodeURIComponent(params.query);
    } catch (e) {
      console.warn(`[SearchPage SC] Failed to decode query parameter from URL: "${params.query}". Using raw value.`, e);
      initialDecodedQuery = params.query; // Use raw query if decoding fails
    }
  }
  
  const searchResultsSchema: MinimalWithContext<SchemaSearchResultsPage> | null = rawQueryForUrl ? {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: `Search results for "${initialDecodedQuery}"`,
    url: `${BASE_URL}search/${rawQueryForUrl}`,
    description: `Find stunning ${initialDecodedQuery} wallpapers on Wallify.`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}search/${rawQueryForUrl}`,
    } as SchemaWebPage,
  } : null;

  return (
    <>
      {searchResultsSchema && <StructuredData data={searchResultsSchema} />}
      {/* Pass the resolved initialQuery to the Client Component */}
      <SearchPageContent initialQuery={initialDecodedQuery} />
    </>
  );
}

