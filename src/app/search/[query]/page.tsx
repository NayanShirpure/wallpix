
import { searchPhotos } from '@/lib/pexels';
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';
import type { PexelsPhoto } from '@/types/pexels';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search as SearchIcon } from 'lucide-react';
// ThemeToggle removed, it's in global Header now.
// import { ThemeToggle } from '@/components/theme-toggle';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  params: {
    query: string;
  };
}

export async function generateMetadata({ params }: SearchPageProps) {
  const rawQueryParam = typeof params.query === 'string' ? params.query : '';
  let queryDisplay = "Invalid Search";
  const canonicalQuery = rawQueryParam;

  try {
    const decodedQuery = decodeURIComponent(rawQueryParam);
    if (!decodedQuery.trim()) {
      queryDisplay = "Search"; 
    } else {
      queryDisplay = decodedQuery;
    }
  } catch (e) {
    console.warn("Failed to decode query for metadata:", rawQueryParam, e);
  }

  return {
    title: `Search: ${queryDisplay} - Wallify`,
    description: `Find high-quality wallpapers matching "${queryDisplay}" on Wallify, your source for stunning backgrounds.`,
    keywords: queryDisplay === "Invalid Search" || queryDisplay === "Search" 
      ? ['Wallify search', 'wallpapers', 'backgrounds'] 
      : [queryDisplay, 'wallpapers', 'backgrounds', `${queryDisplay} backgrounds`, 'Wallify search'],
    alternates: {
        canonical: `/search/${canonicalQuery || 'query'}`,
    }
  };
}

export default async function SearchPage({ params }: SearchPageProps) {
  const rawQueryParam = typeof params.query === 'string' ? params.query : '';
  let query: string;

  try {
    query = decodeURIComponent(rawQueryParam);
  } catch (e) {
    console.error("Failed to decode query parameter in SearchPage:", rawQueryParam, e);
    return (
      <>
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm print:hidden"> {/* z-index lower than global header */}
          <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6">
            <Link href="/" className="flex items-center gap-1 sm:gap-1.5 text-sm sm:text-base font-semibold text-primary hover:text-accent transition-colors" aria-label="Back to Wallify homepage">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="hidden sm:inline">Back to Wallify</span>
              <span className="sm:hidden">Home</span>
            </Link>
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-primary whitespace-nowrap px-2">
              Invalid Search
            </h1>
            {/* ThemeToggle removed */}
            <div className="w-8 h-8"></div> {/* Placeholder for alignment */}
          </div>
        </header>
        <main className="flex-grow container mx-auto max-w-5xl p-4 py-8 md:p-6 md:py-12 text-center">
          <SearchIcon className="mx-auto h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold text-destructive mb-4">Invalid Search Query</h2>
          <p className="text-muted-foreground mb-6">The search query was malformed or could not be processed.</p>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </Button>
        </main>
      </>
    );
  }

  if (!query.trim()) {
     return (
      <>
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm print:hidden"> {/* z-index lower than global header */}
          <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6">
            <Link href="/" className="flex items-center gap-1 sm:gap-1.5 text-sm sm:text-base font-semibold text-primary hover:text-accent transition-colors" aria-label="Back to Wallify homepage">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="hidden sm:inline">Back to Wallify</span>
              <span className="sm:hidden">Home</span>
            </Link>
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-primary whitespace-nowrap px-2">
              Empty Search
            </h1>
            {/* ThemeToggle removed */}
            <div className="w-8 h-8"></div> {/* Placeholder for alignment */}
          </div>
        </header>
        <main className="flex-grow container mx-auto max-w-5xl p-4 py-8 md:p-6 md:py-12 text-center">
          <SearchIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-4">Empty Search Query</h2>
          <p className="text-muted-foreground mb-6">Please enter a search term to find wallpapers.</p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/explorer">
              <SearchIcon className="mr-2 h-4 w-4" /> Explore Wallpapers
            </Link>
          </Button>
        </main>
      </>
    );
  }

  const data = await searchPhotos(query, 1, 30); 
  const photos: PexelsPhoto[] = data?.photos || [];

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm print:hidden"> {/* z-index lower than global header */}
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6">
          <Link href="/" className="flex items-center gap-1 sm:gap-1.5 text-sm sm:text-base font-semibold text-primary hover:text-accent transition-colors" aria-label="Back to Wallify homepage">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="hidden sm:inline">Back to Wallify</span>
            <span className="sm:hidden">Home</span>
          </Link>
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-primary whitespace-nowrap px-2 truncate max-w-[calc(100%-180px)] sm:max-w-[calc(100%-220px)] md:max-w-[calc(100%-260px)]">
            Results for: <span className="text-accent">{query}</span>
          </h1>
          {/* ThemeToggle removed */}
           <div className="w-8 h-8"></div> {/* Placeholder for alignment */}
        </div>
      </header>
      <main className="flex-grow container mx-auto max-w-7xl p-4 md:p-6">
        {photos.length > 0 ? (
          <WallpaperGrid photos={photos} />
        ) : (
          <div className="text-center py-10 mt-8">
            <SearchIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">
              No wallpapers found for &quot;{query}&quot;.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Try a different search term or explore our curated collections.
            </p>
            <Button variant="outline" asChild className="mt-6">
              <Link href="/explorer">
                <SearchIcon className="mr-2 h-4 w-4" /> Explore Wallpapers
              </Link>
            </Button>
          </div>
        )}
      </main>
    </>
  );
}
