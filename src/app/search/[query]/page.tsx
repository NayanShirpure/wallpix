
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
// Removed direct import of pexelsSearchPhotos, will use local fetch logic
// import { searchPhotos as pexelsSearchPhotos } from '@/lib/pexels'; 
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';
import type { PexelsPhoto, DeviceOrientationCategory, PexelsResponse } from '@/types/pexels';
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
const PEXELS_API_URL = 'https://api.pexels.com/v1';
const FALLBACK_PEXELS_API_KEY = "lc7gpWWi2bcrekjM32zdi1s68YDYmEWMeudlsDNNMVEicIIke3G8Iamw";

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
          setDecodedQueryDisplay("Search"); // Display "Search" in header if query is empty after decode
        } else {
          setDecodedQueryDisplay(decoded);
          setErrorState(null);
        }
      } catch (e) {
        console.error("Failed to decode query parameter:", rawQueryParam, e);
        setErrorState("Invalid search query.");
        setDecodedQueryDisplay("Invalid Search"); // Display "Invalid Search" in header
        decoded = ''; 
      }
    } else {
      setErrorState("Empty search query.");
      setDecodedQueryDisplay("Search"); // Display "Search" in header if no query param
    }
    setCurrentSearchQuery(decoded); 
    setPhotos([]);
    setPage(1);
    setHasMore(true);
  }, [params.query]);

  const pexelsSearchPhotos = useCallback(async (
    query: string, 
    pageNum: number, 
    perPage: number, 
    orientation: 'landscape' | 'portrait' | 'square' | undefined
  ): Promise<PexelsResponse | null> => {
      let effectiveApiKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
      const isEnvKeyMissingOrPlaceholder = !effectiveApiKey || /your_actual_pexels_api_key/i.test(effectiveApiKey || "");

      if (isEnvKeyMissingOrPlaceholder) {
          effectiveApiKey = FALLBACK_PEXELS_API_KEY;
          if (process.env.NODE_ENV === 'development') {
               console.warn(`[Search Page] Pexels API key (NEXT_PUBLIC_PEXELS_API_KEY) is not configured or is a placeholder. Using default fallback key for search "${query}".`);
          }
      }
      
      if (!effectiveApiKey || /your_actual_pexels_api_key/i.test(effectiveApiKey)) {
        console.warn(`[Search Page] No valid Pexels API key available for search "${query}". Displaying mock data.`);
        if (process.env.NODE_ENV === 'development') {
            toast({
              title: "PEXELS API Key Notice",
              description: `Pexels API key and fallback are not configured or valid for search "${query}". Displaying mock data.`,
              variant: "default", duration: 10000,
            });
        }
        // Return structure compatible with PexelsSearchResponse containing mock photos
        const mockPhotosData: PexelsPhoto[] = Array.from({ length: perPage }).map((_, i) => ({
            id: i + pageNum * 1000 + Date.now() + Math.random(), width: 1080, height: 1920, url: `https://picsum.photos/seed/search${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/1080/1920`,
            photographer: 'Mock Photographer', photographer_url: 'https://example.com', photographer_id: i, avg_color: '#123456',
            src: { original: `https://picsum.photos/seed/search${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/1080/1920`, large2x: `https://picsum.photos/seed/search${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/1080/1920`, large: `https://picsum.photos/seed/search${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/800/1200`, medium: `https://picsum.photos/seed/search${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/400/600`, small: `https://picsum.photos/seed/search${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/200/300`, portrait: `https://picsum.photos/seed/search${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/800/1200`, landscape: `https://picsum.photos/seed/search${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/1200/800`, tiny: `https://picsum.photos/seed/search${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/20/30` },
            liked: false, alt: `Mock search result for ${query} ${orientation || 'any'} ${i} page ${pageNum}`,
        }));
        return { photos: mockPhotosData, page: pageNum, per_page: perPage, total_results: mockPhotosData.length * (pageNum < 2 ? 2 : 1) , next_page: pageNum < 2 ? "mock_next_page" : undefined };
      }

      let endpoint = `/search?query=${encodeURIComponent(query)}&page=${pageNum}&per_page=${perPage}`;
      if (orientation) {
        endpoint += `&orientation=${orientation}`;
      }
      
      try {
        const response = await fetch(`${PEXELS_API_URL}${endpoint}`, { headers: { Authorization: effectiveApiKey! } });
        if (!response.ok) {
            if (response.status === 401) {
                toast({ title: "API Key Invalid", description: `Pexels API key is invalid for search "${query}".`, variant: "destructive" });
            } else {
                throw new Error(`HTTP error! status: ${response.status} for search "${query}"`);
            }
            if (isEnvKeyMissingOrPlaceholder && effectiveApiKey === FALLBACK_PEXELS_API_KEY) {
                console.warn(`[Search Page] Fallback API key failed for search "${query}". Displaying mock data.`);
                 if (process.env.NODE_ENV === 'development') {
                     toast({ title: "PEXELS API Key Notice", description: `Fallback Pexels API key failed for search "${query}". Displaying mock data.`, variant: "default", duration: 10000 });
                 }
                const mockPhotosData: PexelsPhoto[] = Array.from({ length: perPage }).map((_, i) => ({
                    id: i + pageNum * 1000 + Date.now() + Math.random(), width: 1080, height: 1920, url: `https://picsum.photos/seed/searchfail${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/1080/1920`,
                    photographer: 'Mock Photographer', photographer_url: 'https://example.com', photographer_id: i, avg_color: '#123456',
                    src: { original: `https://picsum.photos/seed/searchfail${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/1080/1920`, large2x: `https://picsum.photos/seed/searchfail${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/1080/1920`, large: `https://picsum.photos/seed/searchfail${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/800/1200`, medium: `https://picsum.photos/seed/searchfail${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/400/600`, small: `https://picsum.photos/seed/searchfail${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/200/300`, portrait: `https://picsum.photos/seed/searchfail${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/800/1200`, landscape: `https://picsum.photos/seed/searchfail${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/1200/800`, tiny: `https://picsum.photos/seed/searchfail${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/20/30` },
                    liked: false, alt: `Mock search fail result for ${query} ${orientation || 'any'} ${i} page ${pageNum}`,
                }));
                return { photos: mockPhotosData, page: pageNum, per_page: perPage, total_results: mockPhotosData.length * (pageNum < 2 ? 2 : 1) , next_page: pageNum < 2 ? "mock_next_page" : undefined };
            }
            return null;
        }
        return await response.json() as PexelsResponse;
      } catch (error: any) {
        console.error(`Error fetching Pexels search for "${query}":`, error.message);
        if (!error.message.includes("API Key Invalid")) {
            toast({ title: "Fetch Error", description: `Failed to fetch search results for "${query}".`, variant: "destructive" });
        }
        if (isEnvKeyMissingOrPlaceholder) {
             console.warn(`[Search Page] Fetch error for search "${query}" (likely with fallback key). Displaying mock data.`);
             if (process.env.NODE_ENV === 'development') {
                toast({ title: "PEXELS API Notice", description: `Error fetching search "${query}". Displaying mock data.`, variant: "default", duration: 10000 });
             }
            const mockPhotosData: PexelsPhoto[] = Array.from({ length: perPage }).map((_, i) => ({
                 id: i + pageNum * 1000 + Date.now() + Math.random(), width: 1080, height: 1920, url: `https://picsum.photos/seed/searcherr${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/1080/1920`,
                photographer: 'Mock Photographer', photographer_url: 'https://example.com', photographer_id: i, avg_color: '#123456',
                src: { original: `https://picsum.photos/seed/searcherr${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/1080/1920`, large2x: `https://picsum.photos/seed/searcherr${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/1080/1920`, large: `https://picsum.photos/seed/searcherr${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/800/1200`, medium: `https://picsum.photos/seed/searcherr${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/400/600`, small: `https://picsum.photos/seed/searcherr${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/200/300`, portrait: `https://picsum.photos/seed/searcherr${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/800/1200`, landscape: `https://picsum.photos/seed/searcherr${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/1200/800`, tiny: `https://picsum.photos/seed/searcherr${query.replace(/\s+/g, '')}${orientation || 'any'}${i}${pageNum}${Math.random()}/20/30` },
                liked: false, alt: `Mock search error result for ${query} ${orientation || 'any'} ${i} page ${pageNum}`,
            }));
            return { photos: mockPhotosData, page: pageNum, per_page: perPage, total_results: mockPhotosData.length * (pageNum < 2 ? 2 : 1) , next_page: pageNum < 2 ? "mock_next_page" : undefined };
        }
        return null;
      }
  }, [toast]);


  const fetchSearchResults = useCallback(async (query: string, pageNum: number, deviceOrientation: DeviceOrientationCategory, append: boolean = false) => {
    if (!query.trim() || errorState) {
      setLoading(false);
      setHasMore(false);
      if (!errorState && !query.trim()) setErrorState("Empty search query.");
      return;
    }

    setLoading(true);
    const pexelsOrientation = deviceOrientation === 'desktop' ? 'landscape' : 'portrait';
    
    const data = await pexelsSearchPhotos(query, pageNum, 30, pexelsOrientation);
    
    if (data && data.photos) {
      setPhotos(prevPhotos => {
        const newPhotos = data.photos || [];
        const combined = append ? [...prevPhotos, ...newPhotos] : newPhotos;
        // Deduplicate based on ID and current device orientation context
        const uniqueMap = new Map(combined.map(item => [`${item.id}-${deviceOrientation}`, item]));
        return Array.from(uniqueMap.values());
      });
      setHasMore(!!data.next_page && data.photos.length > 0 && data.photos.length === 30);
    } else {
      // If data is null (error handled in pexelsSearchPhotos, possibly mock data returned)
      // or data.photos is missing, ensure current photos are cleared if not appending
      if (!append) setPhotos([]);
      setHasMore(false);
    }
    setLoading(false);
  }, [toast, errorState, pexelsSearchPhotos]); // Added pexelsSearchPhotos to dependencies

  useEffect(() => {
    if (currentSearchQuery && !errorState) {
      setPage(1); // Reset page on new search or orientation change
      setPhotos([]); // Clear old photos
      setHasMore(true); // Assume there are more initially
      fetchSearchResults(currentSearchQuery, 1, currentDeviceOrientation, false);
    } else if (errorState) {
      setLoading(false);
      setPhotos([]);
      setHasMore(false);
    }
  // currentDeviceOrientation is a dependency now for re-fetching
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
      // fetchSearchResults will be called by the useEffect due to currentDeviceOrientation change
    }
  };

  const handleWallpaperCategorySelect = (categoryValue: string) => {
    // For search page, selecting a category means initiating a new search for that category
    router.push(`/search/${encodeURIComponent(categoryValue)}`);
  };

  const handleSearchSubmit = (newSearchTerm: string) => {
    const trimmedQuery = newSearchTerm.trim();
    if (trimmedQuery && trimmedQuery !== currentSearchQuery) { // Only push if new and different
      router.push(`/search/${encodeURIComponent(trimmedQuery)}`);
    } else if (trimmedQuery && trimmedQuery === currentSearchQuery) {
      // If search term is the same, re-fetch from page 1
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
    url: `${BASE_URL}search/${params.query || ''}`, // Use raw param for URL
    description: `Find high-quality wallpapers matching "${decodedQueryDisplay}" on Wallify.`,
  };

  return (
    <>
      <StructuredData data={searchPageSchema} />
      <GlobalHeader
        currentDeviceOrientation={currentDeviceOrientation}
        onDeviceOrientationChange={handleDeviceOrientationChange}
        onWallpaperCategorySelect={handleWallpaperCategorySelect} // This will trigger new search
        onSearchSubmit={handleSearchSubmit} // This will also trigger new search
        initialSearchTerm={decodedQueryDisplay} // Use decoded for display in header
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
            ) : !loading && photos.length === 0 ? ( // Explicitly check !loading here
              <div className="text-center py-10 mt-8">
                <SearchIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">
                  No wallpapers found for &quot;{decodedQueryDisplay}&quot;.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try a different search term.
                </p>
                <Button asChild variant="outline" className="mt-4 text-sm">
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                  </Link>
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

            {/* Skeleton for loading more items */}
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

    

