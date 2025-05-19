
'use client';

import type { PexelsPhoto } from '@/types/pexels';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';
import { GlobalHeader } from '@/components/layout/GlobalHeader';
import { Button } from '@/components/ui/button';
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

  useEffect(() => {
    const queryFromUrl = searchParams.get('query');
    const termToUse = queryFromUrl || initialQuery || 'Wallpaper';
    if (termToUse !== currentSearchTerm) {
        setCurrentSearchTerm(termToUse);
    }
  }, [searchParams, initialQuery, currentSearchTerm]);


  const fetchWallpapers = useCallback(async (query: string, pageNum: number = 1, append: boolean = false) => {
    setLoading(true);
    const finalQuery = query.trim() || 'Wallpaper'; // Fallback search term

    try {
      // Fetch without orientation filter
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
    setPage(1);
    setWallpapers([]);
    setHasMore(true);
    // Fetch initial data when component mounts or when currentSearchTerm changes
    if (currentSearchTerm) {
      fetchWallpapers(currentSearchTerm, 1, false);
    }
  }, [currentSearchTerm, fetchWallpapers]);


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
              "p-1",
              "columns-2 xs:columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6",
              "gap-2 sm:gap-3 md:gap-4"
            )}
            aria-busy="true"
            aria-live="polite"
          >
            {[...Array(18)].map((_, i) => (
              <Skeleton key={`search-content-skeleton-${i}`} className="w-full aspect-[3/4] mb-3 sm:mb-4 rounded-lg bg-muted/70 break-inside-avoid-column" />
            ))}
          </div>
        ) : (
          <WallpaperGrid
            photos={wallpapers}
          />
        )}

        {hasMore && !loading && wallpapers.length > 0 && (
          <div className="flex justify-center mt-6 sm:mt-8 mb-4">
            <Button onClick={handleLoadMore} variant="outline" size="lg" className="text-sm px-6 py-2.5">
              Load More
            </Button>
          </div>
        )}

        {loading && wallpapers.length > 0 && (
          <div
            className={cn(
              "p-1 mt-4",
              "columns-2 xs:columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6",
              "gap-2 sm:gap-3 md:gap-4"
            )}
            aria-busy="true"
            aria-live="polite"
          >
            {[...Array(6)].map((_, i) => (
              <Skeleton key={`search-content-loading-more-${i}`} className="w-full aspect-[3/4] mb-3 sm:mb-4 rounded-lg bg-muted/70 break-inside-avoid-column" />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
