
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

interface SearchPageContentProps {
  initialQueryFromServer?: string;
}

export function SearchPageContent({ initialQueryFromServer }: SearchPageContentProps) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const { toast } = useToast();

  const [currentSearchTerm, setCurrentSearchTerm] = useState<string>(() => {
    const queryFromUrl = searchParamsHook.get('query');
    return queryFromUrl || initialQueryFromServer || 'Wallpaper';
  });
  
  const [wallpapers, setWallpapers] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver>();
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
          description: `Failed to fetch wallpapers for "${finalQuery}". Check server logs for Pexels API key status or API errors.`,
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
    const queryFromUrl = searchParamsHook.get('query');
    const termToUse = queryFromUrl || initialQueryFromServer || 'Wallpaper';
    
    if (termToUse !== currentSearchTerm || (termToUse === currentSearchTerm && wallpapers.length === 0 && !loading)) {
      setCurrentSearchTerm(termToUse);
      setPage(1); 
      setWallpapers([]); 
      setHasMore(true); 
      fetchWallpapers(termToUse, 1, false);
    }
  }, [searchParamsHook, initialQueryFromServer, fetchWallpapers, currentSearchTerm, wallpapers.length, loading]);


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

        {loading && wallpapers.length === 0 && (
          <div
             className={cn(
                "columns-2 xs:columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6",
                "gap-2 sm:gap-3 md:gap-4",
                "[column-fill:auto]"
              )}
            aria-busy="true"
            aria-live="polite"
          >
            {[...Array(18)].map((_, i) => (
               <div key={`search-content-skeleton-column-wrapper-${i}`} className="mb-2 sm:mb-3 md:mb-4 break-inside-avoid-column">
                <Skeleton className="w-full h-72 rounded-lg bg-muted/70" />
              </div>
            ))}
          </div>
        )}
        
        <WallpaperGrid photos={wallpapers} />

        {loading && wallpapers.length > 0 && (
          <div className={cn(
            "columns-2 xs:columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6",
            "gap-2 sm:gap-3 md:gap-4",
            "mt-4 [column-fill:auto]"
          )}>
            {[...Array(6)].map((_, i) => (
              <div key={`search-loading-skeleton-column-wrapper-${i}`} className="mb-2 sm:mb-3 md:mb-4 break-inside-avoid-column">
                <Skeleton className="w-full h-72 rounded-lg bg-muted/70" />
              </div>
            ))}
          </div>
        )}

        {!loading && hasMore && wallpapers.length > 0 && (
           <div ref={lastWallpaperElementRef} className="h-10"></div> // Sentinel
        )}
        
        {!loading && !hasMore && wallpapers.length > 0 && (
           <p className="text-center text-muted-foreground py-6">You've reached the end!</p>
        )}
      </main>
    </>
  );
}
