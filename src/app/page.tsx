
'use client';

import type { PexelsPhoto } from '@/types/pexels';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';
import { GlobalHeader } from '@/components/layout/GlobalHeader';
import { searchPhotos as searchPhotosLib } from '@/lib/pexels';
import InfiniteScroll from 'react-infinite-scroll-component';

const DEFAULT_HOME_SEARCH_TERM = 'Wallpaper';

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();

  const [wallpapers, setWallpapers] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const currentFetchTerm = DEFAULT_HOME_SEARCH_TERM;

  const fetchWallpapers = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    setLoading(true);
    const response = await searchPhotosLib(currentFetchTerm, pageNum, 30);

    if (response && response.photos && response.photos.length > 0) {
      const newPhotos = response.photos;
      setWallpapers(prev => {
        const combined = append ? [...prev, ...newPhotos] : newPhotos;
        const uniqueMap = new Map(combined.map(item => [item.id, item]));
        return Array.from(uniqueMap.values());
      });
      setHasMore(!!response.next_page && newPhotos.length > 0 && newPhotos.length === 30);
    } else {
      if (!append) {
        setWallpapers([]);
      }
      setHasMore(false);
      if (response === null) { // Only toast if the API call itself failed (e.g. key issue)
        toast({
          title: "API Fetch Issue (Home)",
          description: `Failed to fetch wallpapers for "${currentFetchTerm}". Check server logs for Pexels API key status or API errors.`,
          variant: "default",
          duration: 7000
        });
      }
    }
    setLoading(false);
  }, [toast, currentFetchTerm]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchWallpapers(nextPage, true);
    }
  }, [loading, hasMore, page, fetchWallpapers]);

  useEffect(() => {
    setPage(1);
    setWallpapers([]);
    setHasMore(true);
    fetchWallpapers(1, false);
  }, [fetchWallpapers]);

  const handleWallpaperCategorySelect = useCallback((categoryValue: string) => {
    if (categoryValue.trim()) {
      router.push(`/search?query=${encodeURIComponent(categoryValue.trim())}`);
    }
  }, [router]);

  const handleSearchSubmit = useCallback((newSearchTerm: string) => {
    console.log("Search submitted on Home page, SearchBar component will handle navigation:", newSearchTerm);
    // Navigation is handled by SearchBar component itself due to navigateToSearchPage={true}
  }, []);


  const initialLoadingSkeletons = (
    <div className="my-masonry-grid" aria-busy="true" aria-live="polite">
      {[...Array(12)].map((_, i) => (
        <div key={`initial-skeleton-column-wrapper-${i}`} className="my-masonry-grid_column">
          <div style={{ marginBottom: '1rem' }}> {/* Matches masonry item margin */}
            <Skeleton className="w-full h-72 rounded-lg bg-muted/70" />
          </div>
        </div>
      ))}
    </div>
  );
  
  const infiniteScrollLoader = (
    <div className="text-center py-4 col-span-full">
      <p className="text-muted-foreground">Loading more wallpapers...</p>
    </div>
  );

  return (
    <>
      <GlobalHeader 
        onWallpaperCategorySelect={handleWallpaperCategorySelect}
        onSearchSubmit={handleSearchSubmit}
      />
      <main className="flex-grow container mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6" aria-busy={loading && wallpapers.length === 0} aria-live="polite">
        <div className="my-4 sm:my-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary">
            Discover Your Next Wallpaper
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-2xl mx-auto">
            Wallify is your premier destination for stunning, high-quality wallpapers for desktop and mobile.
            Explore our vast collection from Pexels to personalize your digital space.
          </p>
          <h2 className="sr-only">Extensive Collection of High-Quality Wallpapers</h2>
        </div>

        {(loading && wallpapers.length === 0) && initialLoadingSkeletons}

        {wallpapers.length > 0 && (
          <InfiniteScroll
            dataLength={wallpapers.length}
            next={handleLoadMore}
            hasMore={hasMore}
            loader={infiniteScrollLoader}
            className="w-full" 
          >
            <WallpaperGrid photos={wallpapers} />
          </InfiniteScroll>
        )}
        
        {!loading && !hasMore && wallpapers.length > 0 && (
          <p className="text-center text-muted-foreground py-6">You've reached the end!</p>
        )}
        {!loading && !hasMore && wallpapers.length === 0 && currentFetchTerm && (
          <p className="text-center text-muted-foreground py-6">No wallpapers found for "{currentFetchTerm}". Try a different search!</p>
        )}
      </main>
    </>
  );
}
