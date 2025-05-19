
'use client';

import type { PexelsPhoto } from '@/types/pexels';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';
import { GlobalHeader } from '@/components/layout/GlobalHeader';
// Removed Button import
import { searchPhotos as searchPhotosLib } from '@/lib/pexels';
import { cn } from '@/lib/utils';

interface SearchPageContentProps {
  initialQuery: string;
}

export function SearchPageContent({ initialQuery }: SearchPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [currentSearchTerm, setCurrentSearchTerm] = useState<string>(initialQuery);
  const [wallpapers, setWallpapers] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

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

  useEffect(() => {
    const queryFromUrl = searchParams.get('query');
    const termToUse = queryFromUrl || initialQuery || 'Wallpaper';
    if (termToUse !== currentSearchTerm) {
        setCurrentSearchTerm(termToUse);
        // Reset page and wallpapers when search term changes
        setPage(1);
        setWallpapers([]);
        setHasMore(true);
    }
  }, [searchParams, initialQuery, currentSearchTerm]);


  const fetchWallpapers = useCallback(async (query: string, pageNum: number = 1, append: boolean = false) => {
    setLoading(true);
    const finalQuery = query.trim() || 'Wallpaper'; 

    try {
      const data = await searchPhotosLib(finalQuery, pageNum, 30);
      if (data && data.photos) {
        const newPhotos = data.photos;
        setWallpapers((prev: PexelsPhoto[]): PexelsPhoto[] => {
          const combined = append ? [...prev, ...newPhotos] : newPhotos;
          const uniqueMap = new Map(combined.map((item: PexelsPhoto) => [item.id, item]));
          return Array.from(uniqueMap.values()) as PexelsPhoto[];
        });
        setHasMore(!!data.next_page && newPhotos.length > 0 && newPhotos.length === 30);
      } else {
        setWallpapers(prev => append ? prev : []);
        setHasMore(false);
        toast({
          title: "API Fetch Issue (Search)",
          description: `Failed to fetch wallpapers for "${finalQuery}" or no results. Check server logs for Pexels API key status or API errors.`,
          variant: "default",
          duration: 7000
        });
      }
    } catch (error) {
      console.error("Error fetching wallpapers for search:", error);
      toast({ title: "Error", description: "Failed to fetch wallpapers. Check connection.", variant: "destructive" });
      setWallpapers(prev => append ? prev : []);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // Only fetch if currentSearchTerm is defined and page is 1 (initial load for this term)
    // or if wallpapers array is empty (ensuring initial fetch if term hasn't changed but was cleared)
    if (currentSearchTerm && (page === 1 || wallpapers.length === 0)) {
      fetchWallpapers(currentSearchTerm, 1, false);
    }
  }, [currentSearchTerm, fetchWallpapers]); // Removed page dependency here to prevent re-fetch on page increment by observer


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
    if (!loading && hasMore && currentSearchTerm) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchWallpapers(currentSearchTerm, nextPage, true);
    }
  };

  return (
    <>
      <GlobalHeader
        onWallpaperCategorySelect={handleWallpaperCategorySelect}
        onSearchSubmit={handleSearchSubmit}
        initialSearchTerm={currentSearchTerm}
        navigateToSearchPage={false} 
      />

      <main className="flex-grow container mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6" aria-busy={loading && wallpapers.length === 0} aria-live="polite">
        <div className="my-4 sm:my-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary">
            {currentSearchTerm === "Wallpaper" || !currentSearchTerm ? "Search Wallpapers" : `Results for: "${currentSearchTerm}"`}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Displaying wallpapers from Pexels.
          </p>
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
            {[...Array(18)].map((_, i) => (
              <Skeleton key={`search-content-skeleton-${i}`} className="w-full h-72 mb-2 sm:mb-3 md:mb-4 rounded-lg bg-muted/70 break-inside-avoid-column" />
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
              <Skeleton key={`search-content-loading-more-${i}`} className="w-full h-72 mb-2 sm:mb-3 md:mb-4 rounded-lg bg-muted/70 break-inside-avoid-column" />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
