
'use client';

import type { PexelsPhoto } from '@/types/pexels';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';
import { GlobalHeader } from '@/components/layout/GlobalHeader';
import { searchPhotos as searchPhotosLib } from '@/lib/pexels';
import { cn } from '@/lib/utils';
import InfiniteScroll from 'react-infinite-scroll-component';

const DEFAULT_HOME_SEARCH_TERM = 'Wallpaper';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams(); // For reading URL params
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
      if (response === null) {
        toast({
          title: "API Fetch Issue (Home)",
          description: `Failed to fetch wallpapers. Check server logs for Pexels API key status or API errors.`,
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

  const handleSearchSubmit = useCallback((newSearchTerm: string) => {
    const trimmedNewSearchTerm = newSearchTerm.trim();
    if (trimmedNewSearchTerm) {
      router.push(`/search?query=${encodeURIComponent(trimmedNewSearchTerm)}`);
    }
  }, [router]);

  const loadingSkeletons = (
    <div className="my-masonry-grid mt-4 w-full">
      {[...Array(6)].map((_, i) => (
        <div key={`loading-skeleton-column-${i}`} className="my-masonry-grid_column">
           <div style={{ marginBottom: '1rem' }}> {/* Mimic masonry item wrapper margin */}
            <Skeleton className="w-full h-72 rounded-lg bg-muted/70" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <GlobalHeader />
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

        {(loading && wallpapers.length === 0) && (
           <div
            className="my-masonry-grid"
            aria-busy="true"
            aria-live="polite"
          >
            {[...Array(12)].map((_, i) => (
              <div key={`initial-skeleton-column-wrapper-${i}`} className="my-masonry-grid_column">
                <div style={{ marginBottom: '1rem' }}>
                  <Skeleton className="w-full h-72 rounded-lg bg-muted/70" />
                </div>
              </div>
            ))}
          </div>
        )}

        <InfiniteScroll
          dataLength={wallpapers.length}
          next={handleLoadMore}
          hasMore={hasMore}
          loader={loadingSkeletons}
          className="w-full"
        >
          {wallpapers.length > 0 && <WallpaperGrid photos={wallpapers} />}
        </InfiniteScroll>
        
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
