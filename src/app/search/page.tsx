
// No 'use client' - this is now a Server Component
import React, { Suspense } from 'react';
import { SearchPageContent } from '@/components/search-page-content';
import { StructuredData } from '@/components/structured-data';
import type { SearchResultsPage as SchemaSearchResultsPage, WebPage as SchemaWebPage, MinimalWithContext } from '@/types/schema-dts';
import { Skeleton } from '@/components/ui/skeleton';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wallpix.vercel.app/';

interface SearchPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Fallback UI for Suspense - simplified as GlobalHeader is now inside SearchPageContent
function SearchLoadingFallback() {
  const gridAspectRatio = 'aspect-[9/16]'; // Default to phone for loading skeleton
  return (
     <main className="flex-grow container mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="my-4 sm:my-6 text-center">
          <Skeleton className="h-10 w-3/4 mx-auto sm:w-1/2" /> {/* Title Skeleton */}
          <Skeleton className="h-5 w-1/2 mx-auto mt-2 sm:w-1/3" /> {/* Subtitle Skeleton */}
        </div>
        <div className={'grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4'}>
            {[...Array(18)].map((_, i) => ( // Show a decent number of skeletons
              <Skeleton key={`search-fallback-skeleton-${i}`} className={`${gridAspectRatio} w-full rounded-lg`} />
            ))}
        </div>
      </main>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = typeof searchParams?.query === 'string' ? searchParams.query : 'Wallpaper';

  const searchResultsSchema: MinimalWithContext<SchemaSearchResultsPage> | null = query ? {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: `Search results for "${query}"`,
    url: `${BASE_URL}search?query=${encodeURIComponent(query)}`,
    description: `Find stunning ${query} wallpapers on Wallify.`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}search?query=${encodeURIComponent(query)}`,
    } as SchemaWebPage,
  } : null;

  return (
    <Suspense fallback={<SearchLoadingFallback />}>
      {searchResultsSchema && <StructuredData data={searchResultsSchema} />}
      {/* SearchPageContent will now include GlobalHeader and manage its own state */}
      <SearchPageContent initialQuery={query} />
    </Suspense>
  );
}
