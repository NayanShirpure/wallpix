
'use client';

import type { PexelsPhoto } from '@/types/pexels';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';
import { GlobalHeader } from '@/components/layout/GlobalHeader';
import { searchPhotos as searchPhotosLib } from '@/lib/pexels';
import { cn } from '@/lib/utils';

const DEFAULT_HOME_SEARCH_TERM = 'Wallpaper';

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();

  const [wallpapers, setWallpapers] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  // currentSearchTerm is effectively always DEFAULT_HOME_SEARCH_TERM for this page now
  const currentSearchTerm = DEFAULT_HOME_SEARCH_TERM;

  const observer = useRef<IntersectionObserver | null>(null);
  const lastWallpaperElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          handleLoadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore] 
  );

  const fetchWallpapers = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    setLoading(true);
    
    const response = await searchPhotosLib(currentSearchTerm, pageNum, 30); 

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
      toast({
        title: "API Fetch Issue (Home)",
        description: `Failed to fetch wallpapers for "${currentSearchTerm}" or no results. Check server logs for Pexels API key status or API errors.`,
        variant: "default",
        duration: 7000
      });
    }
    setLoading(false);
  }, [toast, currentSearchTerm]);


  useEffect(() => {
    // Initial fetch for the homepage
    setPage(1);
    setWallpapers([]);
    setHasMore(true);
    fetchWallpapers(1, false);
  }, [fetchWallpapers]); // Only depends on fetchWallpapers, which depends on currentSearchTerm (constant)


  const handleWallpaperCategorySelect = (categoryValue: string) => {
    router.push(`/search?query=${encodeURIComponent(categoryValue)}`);
  };

  const handleSearchSubmit = (newSearchTerm: string) => {
    const trimmedNewSearchTerm = newSearchTerm.trim();
    if (trimmedNewSearchTerm) {
      router.push(`/search?query=${encodeURIComponent(trimmedNewSearchTerm)}`);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchWallpapers(nextPage, true);
    }
  };

  return (
    <>
      <GlobalHeader
        onWallpaperCategorySelect={handleWallpaperCategorySelect}
        onSearchSubmit={handleSearchSubmit}
        // initialSearchTerm is no longer explicitly passed as GlobalHeader handles its display logic
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

        {loading && wallpapers.length === 0 ? (
             <div
                className={cn(
                  "columns-2 xs:columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6",
                  "gap-2 sm:gap-3 md:gap-4"
                )}
                aria-busy="true"
                aria-live="polite"
              >
                {[...Array(12)].map((_, i) => (
                  <div key={`initial-skeleton-wrapper-${i}`} className="mb-2 sm:mb-3 md:mb-4 break-inside-avoid-column">
                    <Skeleton className="w-full h-72 rounded-lg bg-muted/70" />
                  </div>
                ))}
            </div>
        ) : (
          <WallpaperGrid
            photos={wallpapers}
          />
        )}

        {/* Sentinel for infinite scroll */}
        {hasMore && !loading && wallpapers.length > 0 && (
            <div ref={lastWallpaperElementRef} style={{ height: '1px' }} />
        )}

          {loading && wallpapers.length > 0 && (
              <div
                className={cn(
                  "mt-4",
                  "columns-2 xs:columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6",
                  "gap-2 sm:gap-3 md:gap-4"
                )}
                aria-busy="true"
                aria-live="polite"
              >
                {[...Array(6)].map((_, i) => (
                  <div key={`loading-skeleton-wrapper-${i}`} className="mb-2 sm:mb-3 md:mb-4 break-inside-avoid-column">
                    <Skeleton className="w-full h-72 rounded-lg bg-muted/70" />
                  </div>
                ))}
            </div>
          )}
      </main>
    </>
  );
}
