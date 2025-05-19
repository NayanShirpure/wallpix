
import React, { Suspense } from 'react';
import { SearchPageContent } from '@/components/search-page-content';
import { StructuredData } from '@/components/structured-data';
import type { SearchResultsPage as SchemaSearchResultsPage, WebPage as SchemaWebPage, MinimalWithContext } from '@/types/schema-dts';
import { Skeleton } from '@/components/ui/skeleton';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wallpix.vercel.app/';

interface SearchPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

function SearchLoadingFallback() {
  return (
     <main className="flex-grow container mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
        {/* Header Skeleton Part */}
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md mb-4">
          <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between gap-x-2 px-3 sm:px-4">
            <Skeleton className="h-7 w-24" /> {/* Logo */}
            <div className="flex-1 flex justify-center items-center px-2 sm:px-4">
              <Skeleton className="h-9 w-full max-w-xs sm:max-w-sm md:max-w-md rounded-md" /> {/* Search Bar */}
            </div>
            <div className="flex items-center shrink-0 gap-x-1.5 sm:gap-x-2">
              <Skeleton className="h-9 w-24 rounded-md hidden sm:flex" /> {/* Categories Button */}
              <Skeleton className="h-9 w-9 rounded-md hidden sm:flex" /> {/* More Options Button */}
              <Skeleton className="h-9 w-9 rounded-md sm:hidden" /> {/* Mobile Menu Button */}
              <Skeleton className="h-9 w-9 rounded-md" /> {/* Theme Toggle */}
            </div>
          </div>
        </header>
        
        {/* Content Skeleton Part */}
        <div className="my-4 sm:my-6 text-center">
          <Skeleton className="h-10 w-3/4 mx-auto sm:w-1/2" /> {/* Title Skeleton */}
          <Skeleton className="h-5 w-1/2 mx-auto mt-2 sm:w-1/3" /> {/* Subtitle Skeleton */}
        </div>
        <div className={'columns-2 xs:columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-2 sm:gap-3 md:gap-4'}>
            {[...Array(18)].map((_, i) => (
              <div key={`search-fallback-skeleton-wrapper-${i}`} className="mb-2 sm:mb-3 md:mb-4 break-inside-avoid-column">
                <Skeleton key={`search-fallback-skeleton-${i}`} className={`h-72 w-full rounded-lg`} />
              </div>
            ))}
        </div>
      </main>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Access searchParams directly. It's an object, not a promise here for page components.
  const query = typeof searchParams?.query === 'string' ? searchParams.query : undefined;

  const searchResultsSchema: MinimalWithContext<SchemaSearchResultsPage> | null = query ? {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: `Search results for "${query}" on Wallify`,
    url: `${BASE_URL}search?query=${encodeURIComponent(query)}`,
    description: `Find stunning ${query} wallpapers on Wallify.`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}search?query=${encodeURIComponent(query)}`,
    } as SchemaWebPage,
  } : { // Generic schema for /search if no query
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: `Search Wallpapers on Wallify`,
    url: `${BASE_URL}search`,
    description: `Find stunning wallpapers on Wallify.`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}search`,
    } as SchemaWebPage,
  };

  return (
    <Suspense fallback={<SearchLoadingFallback />}>
      {searchResultsSchema && <StructuredData data={searchResultsSchema} />}
      <SearchPageContent initialQueryFromServer={query} />
    </Suspense>
  );
}
