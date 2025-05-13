'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { searchPhotos as pexelsSearchPhotos } from '@/lib/pexels';
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';
import type { PexelsPhoto, DeviceOrientationCategory } from '@/types/pexels';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search as SearchIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PreviewDialog } from '@/components/wallpaper/PreviewDialog';
import { useToast } from '@/hooks/use-toast';
import { StructuredData } from '@/components/structured-data';
import type { SearchResultsPage as SchemaSearchResultsPage, MinimalWithContext } from '@/types/schema-dts';
import { GlobalHeader } from '@/components/layout/GlobalHeader';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nayanshirpure.github.io/Wallify/';

export default function SearchPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedWallpaper, setSelectedWallpaper] = useState<PexelsPhoto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');
  const [decodedQueryDisplay, setDecodedQueryDisplay] = useState('');
  const [errorState, setErrorState] = useState<string | null>(null);
  const [currentDeviceOrientation, setCurrentDeviceOrientation] = useState<DeviceOrientationCategory>('smartphone');

  useEffect(() => {
    const rawQueryParam = typeof params.query === 'string' ? params.query : Array.isArray(params.query) ? params.query[0] : '';
    let decoded = '';
    if (rawQueryParam) {
      try {
        decoded = decodeURIComponent(rawQueryParam);
        if (!decoded.trim()) {
          setErrorState("Empty search query.");
          setDecodedQueryDisplay("Search");
        } else {
          setDecodedQueryDisplay(decoded);
          setErrorState(null);
        }
      } catch (e) {
        console.error("Failed to decode query parameter:", rawQueryParam, e);
        setErrorState("Invalid search query.");
        setDecodedQueryDisplay("Invalid Search");
        decoded = ''; // Ensure currentSearchQuery isn't set to invalid param
      }
    } else {
      setErrorState("Empty search query.");
      setDecodedQueryDisplay("Search");
    }
    setCurrentSearchQuery(decoded); // This will be the actual query used for fetching
    setPhotos([]);
    setPage(1);
    setHasMore(true);
  }, [params.query]);

  const fetchSearchResults = useCallback(async (query: string, pageNum: number, deviceOrientation: DeviceOrientationCategory, append: boolean = false) => {
    if (!query.trim() || errorState) {
      setLoading(false);
      setHasMore(false);
      if (!errorState && !query.trim()) setErrorState("Empty search query.");
      return;
    }

    setLoading(true);
    const pexelsOrientation = deviceOrientation === 'desktop' ? 'landscape' : 'portrait';
    try {
      const data = await pexelsSearchPhotos(query, pageNum, 30, pexelsOrientation);
      const clientApiKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
      const isClientApiKeyMissingOrPlaceholder = !clientApiKey || /your_actual_pexels_api_key/i.test(clientApiKey);

      if (data && data.photos) {
        setPhotos(prevPhotos => {
          const newPhotos = data.photos || [];
          const combined = append ? [...prevPhotos, ...newPhotos] : newPhotos;
          const uniqueMap = new Map(combined.map(item => [`${item.id}-${deviceOrientation}`, item]));
          return Array.from(uniqueMap.values());
        });
        setHasMore(!!data.next_page && data.photos.length > 0 && data.photos.length === 30);
      } else {
        setPhotos(prevPhotos => append ? prevPhotos : []);
        setHasMore(false);
        if (isClientApiKeyMissingOrPlaceholder) {
          if (process.env.NODE_ENV === 'development') {
            toast({
              title: "PEXELS API Key Notice",
              description: "Pexels API key (NEXT_PUBLIC_PEXELS_API_KEY) is not configured or is a placeholder. Displaying mock data for search. Please set PEXELS_API_KEY in .env.local.",
              variant: "default",
              duration: 10000,
            });
          }
          const mockPhotosData: PexelsPhoto[] = Array.from({ length: 15 }).map((_, i) => ({
            id: i + pageNum * 1000 + Date.now() + Math.random(), width: 1080, height: 1920, url: `https://picsum.photos/seed/search${query.replace(/\s+/g, '')}${deviceOrientation}${i}${pageNum}${Math.random()}/1080/1920`,
            photographer: 'Mock Photographer', photographer_url: 'https://example.com', photographer_id: i, avg_color: '#123456',
            src: { original: `https://picsum.photos/seed/search${query.replace(/\s+/g, '')}${deviceOrientation}${i}${pageNum}${Math.random()}/1080/1920`, large2x: `https://picsum.photos/seed/search${query.replace(/\s+/g, '')}${deviceOrientation}${i}${pageNum}${Math.random()}/1080/1920`, large: `https://picsum.photos/seed/search${query.replace(/\s+/g, '')}${deviceOrientation}${i}${pageNum}${Math.random()}/800/1200`, medium: `https://picsum.photos/seed/search${query.replace(/\s+/g, '')}${deviceOrientation}${i}${pageNum}${Math.random()}/400/600`, small: `https://picsum.photos/seed/search${query.replace(/\s+/g, '')}${deviceOrientation}${i}${pageNum}${Math.random()}/200/300`, portrait: `https://picsum.photos/seed/search${query.replace(/\s+/g, '')}${deviceOrientation}${i}${pageNum}${Math.random()}/800/1200`, landscape: `https://picsum.photos/seed/search${query.replace(/\s+/g, '')}${deviceOrientation}${i}${pageNum}${Math.random()}/1200/800`, tiny: `https://picsum.photos/seed/search${query.replace(/\s+/g, '')}${deviceOrientation}${i}${pageNum}${Math.random()}/20/30` },
            liked: false, alt: `Mock search result for ${query} ${deviceOrientation} ${i} page ${pageNum}`,
          }));
          setPhotos(prevPhotos => append ? [...prevPhotos, ...mockPhotosData] : mockPhotosData);
          setHasMore(pageNum < 2);
        } else if (!data && !isClientApiKeyMissingOrPlaceholder) {
          toast({ title: "API Error", description: "Could not fetch search results from Pexels. The API key might be invalid or there was a network issue.", variant: "destructive" });
        }
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      toast({ title: "Error", description: "Failed to fetch search results.", variant: "destructive" });
      setPhotos(prevPhotos => append ? prevPhotos : []);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [toast, errorState]);

  useEffect(() => {
    if (currentSearchQuery && !errorState) {
      setPage(1);
      setPhotos([]);
      setHasMore(true);
      fetchSearchResults(currentSearchQuery, 1, currentDeviceOrientation, false);
    } else if (errorState) {
      setLoading(false);
      setPhotos([]);
      setHasMore(false);
    }
  }, [currentSearchQuery, currentDeviceOrientation, errorState, fetchSearchResults]);

  const handleLoadMore = () => {
    if (!loading && hasMore && currentSearchQuery && !errorState) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchSearchResults(currentSearchQuery, nextPage, currentDeviceOrientation, true);
    }
  };

  const openModal = (wallpaper: PexelsPhoto) => {
    setSelectedWallpaper(wallpaper);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedWallpaper(null), 300);
  };

  const handleDeviceOrientationChange = (newCategory: DeviceOrientationCategory) => {
    if (newCategory !== currentDeviceOrientation) {
      setCurrentDeviceOrientation(newCategory);
      setPage(1);
      setPhotos([]);
      setHasMore(true);
      // fetchSearchResults will be called by the useEffect due to currentDeviceOrientation change
    }
  };

  const handleWallpaperCategorySelect = (categoryValue: string) => {
    router.push(`/search/${encodeURIComponent(categoryValue)}`);
  };

  const handleSearchSubmit = (newSearchTerm: string) => {
    const trimmedQuery = newSearchTerm.trim();
    if (trimmedQuery && trimmedQuery !== currentSearchQuery) {
      router.push(`/search/${encodeURIComponent(trimmedQuery)}`);
    } else if (trimmedQuery && trimmedQuery === currentSearchQuery) {
      // If search term is the same, maybe re-fetch or do nothing
      setPage(1);
      setPhotos([]);
      setHasMore(true);
      fetchSearchResults(trimmedQuery, 1, currentDeviceOrientation, false);
    }
  };

  const gridAspectRatio = currentDeviceOrientation === 'desktop' ? 'aspect-video' : 'aspect-[9/16]';

  const searchPageSchema: MinimalWithContext<SchemaSearchResultsPage> = {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: `Search results for "${decodedQueryDisplay}" on Wallify`,
    url: `${BASE_URL}search/${params.query || ''}`,
    description: `Find high-quality wallpapers matching "${decodedQueryDisplay}" on Wallify.`,
  };

  return (
    <>
      <StructuredData data={searchPageSchema} />
      <GlobalHeader
        currentDeviceOrientation={currentDeviceOrientation}
        onDeviceOrientationChange={handleDeviceOrientationChange}
        onWallpaperCategorySelect={handleWallpaperCategorySelect}
        onSearchSubmit={handleSearchSubmit}
        initialSearchTerm={decodedQueryDisplay}
        showExplorerLink={true}
      />
      <main className="flex-grow container mx-auto max-w-7xl p-4 md:p-6">
        <div className="my-4 sm:my-6 text-center">
          {errorState ? (
            <>
              <SearchIcon className={`mx-auto h-12 w-12 mb-3 ${errorState === "Invalid search query." ? "text-destructive" : "text-muted-foreground"}`} />
              <h1 className={`text-2xl sm:text-3xl font-bold ${errorState === "Invalid search query." ? "text-destructive" : "text-primary"}`}>{errorState}</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                {errorState === "Invalid search query."
                  ? "The search query was malformed or could not be processed."
                  : "Please enter a search term to find wallpapers."}
              </p>
              <Button asChild variant="outline" className="mt-4 text-sm">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Link>
              </Button>
            </>
          ) : (
            <>
              <h1 className="text-3xl sm:text-4xl font-bold text-primary">
                Results for: <span className="text-accent">{decodedQueryDisplay}</span>
              </h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                Browsing {currentDeviceOrientation} wallpapers related to &quot;{decodedQueryDisplay}&quot;.
              </p>
            </>
          )}
        </div>

        {!errorState && (
          <>
            {loading && photos.length === 0 ? (
              <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4`}>
                {[...Array(15)].map((_, i) => (
                  <Skeleton key={`search-skeleton-${i}`} className={`${gridAspectRatio} w-full rounded-lg`} />
                ))}
              </div>
            ) : photos.length > 0 ? (
              <WallpaperGrid photos={photos} onPhotoClick={openModal} orientation={currentDeviceOrientation} />
            ) : !loading && photos.length === 0 ? (
              <div className="text-center py-10 mt-8">
                <SearchIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">
                  No wallpapers found for &quot;{decodedQueryDisplay}&quot;.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try a different search term or explore our curated collections.
                </p>
                <Button variant="outline" asChild className="mt-6">
                  <Link href="/explorer"><SearchIcon className="mr-2 h-4 w-4" /> Explore Wallpapers</Link>
                </Button>
              </div>
            ) : null}

            {hasMore && !loading && photos.length > 0 && (
              <div className="flex justify-center mt-6 sm:mt-8 mb-4">
                <Button onClick={handleLoadMore} variant="outline" size="lg" className="text-sm px-6 py-2.5" disabled={loading}>
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}

            {loading && photos.length > 0 && (
              <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mt-4`}>
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={`search-loading-more-skeleton-${i}`} className={`${gridAspectRatio} w-full rounded-lg`} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <PreviewDialog photo={selectedWallpaper} isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}

    