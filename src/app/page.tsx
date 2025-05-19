
'use client';

import type { PexelsPhoto } from '@/types/pexels';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';
import { GlobalHeader } from '@/components/layout/GlobalHeader';
import { searchPhotos as searchPhotosLib } from '@/lib/pexels';
import { cn } from '@/lib/utils';
// Removed import for InfiniteScroll

const DEFAULT_HOME_SEARCH_TERM = 'Wallpaper';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [wallpapers, setWallpapers] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const currentSearchTerm = DEFAULT_HOME_SEARCH_TERM;

  // Intersection Observer for infinite scrolling
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
        description: `Failed to fetch wallpapers for "${currentSearchTerm}". Check server logs for Pexels API key status or API errors.`,
        variant: "default",
        duration: 7000
      });
    }
    setLoading(false);
  }, [toast, currentSearchTerm]);


  useEffect(() => {
    setPage(1);
    setWallpapers([]);
    setHasMore(true);
    fetchWallpapers(1, false);
  }, [fetchWallpapers]);


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

  const loadingSkeleton = (
    <div className="text-center py-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={`loading-skeleton-wrapper-${i}`} className="mb-3 sm:mb-4 break-inside-avoid-column">
          <Skeleton className="w-full h-72 rounded-lg bg-muted/70" />
        </div>
      ))}
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

        {loading && wallpapers.length === 0 && (
             <div
                className="columns-2 xs:columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-3 sm:gap-4 [column-fill:auto]"
                aria-busy="true"
                aria-live="polite"
              >
                {[...Array(12)].map((_, i) => (
                  <div key={`initial-skeleton-wrapper-${i}`} className="mb-3 sm:mb-4 break-inside-avoid-column">
                    <Skeleton className="w-full h-72 rounded-lg bg-muted/70" />
                  </div>
                ))}
            </div>
        )}

        <WallpaperGrid photos={wallpapers} />
        
        {/* Sentinel for Intersection Observer */}
        {hasMore && !loading && (
          <div ref={lastWallpaperElementRef} style={{ height: '1px', marginTop: '1rem' }} />
        )}

        {loading && wallpapers.length > 0 && loadingSkeleton}

        {!loading && !hasMore && wallpapers.length > 0 && (
          <p className="text-center text-muted-foreground py-6">You've reached the end!</p>
        )}
      </main>
    </>
  );
}
