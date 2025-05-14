
import { use } from 'react';
import { SearchPageContent } from '@/components/search-page-content';
import { StructuredData } from '@/components/structured-data';
import type { SearchResultsPage as SchemaSearchResultsPage, WebPage as SchemaWebPage, MinimalWithContext } from '@/types/schema-dts';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nayanshirpure.github.io/Wallify/';

export async function generateStaticParams() {
  // For a search page, it's often not feasible to pre-render all possible search queries.
  // Returning an empty array means no specific search paths will be pre-rendered at build time.
  return [];
}

interface SearchPageServerProps {
  params: Promise<{ query: string }>;
}

// This page is now a Server Component
export default function SearchPage({ params: paramsPromise }: SearchPageServerProps) {
  const params = use(paramsPromise); // Resolve the promise to get actual params
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
      <SearchPageContent initialQuery={initialDecodedQuery} />
    </>
  );
}
