
'use client';

import type { PexelsPhoto } from '@/types/pexels';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';
import { GlobalHeader } from '@/components/layout/GlobalHeader';
import { searchPhotos as searchPhotosLib } from '@/lib/pexels';
import InfiniteScroll from 'react-infinite-scroll-component';

interface SearchPageContentProps {
  initialQueryFromServer?: string;
}

export function SearchPageContent({ initialQueryFromServer }: SearchPageContentProps) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const { toast } = useToast();

  const [currentSearchTerm, setCurrentSearchTerm] = useState<string>('');
  
  const [wallpapers, setWallpapers] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const queryFromUrl = searchParamsHook.get('query');
    const newEffectiveSearchTerm = queryFromUrl?.trim() || initialQueryFromServer?.trim() || 'Wallpaper';
    setCurrentSearchTerm(newEffectiveSearchTerm);
  }, [searchParamsHook, initialQueryFromServer]);

  const fetchWallpapers = useCallback(async (query: string, pageNum: number = 1, append: boolean = false) => {
    setLoading(true);
    const finalQuery = query.trim() || 'Wallpaper'; 

    try {
      const data = await searchPhotosLib(finalQuery, pageNum, 30);
      if (data && data.photos) {
        const newPhotos = data.photos;
        setWallpapers((prev: PexelsPhoto[]) => {
          const combined = append ? [...prev, ...newPhotos] : newPhotos;
          const uniqueMap = new Map(combined.map((item: PexelsPhoto) => [item.id, item]));
          return Array.from(uniqueMap.values());
        });
        setHasMore(!!data.next_page && newPhotos.length > 0 && newPhotos.length === 30);
      } else {
        setWallpapers(prev => append ? prev : []);
        setHasMore(false);
        if (data === null) {
            toast({
                title: "API Fetch Issue (Search)",
                description: `Failed to fetch wallpapers for "${finalQuery}". Check server logs for Pexels API key status or API errors.`,
                variant: "default",
                duration: 7000
            });
        }
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
    if (currentSearchTerm) {
      setPage(1);
      setWallpapers([]);
      setHasMore(true);
      fetchWallpapers(currentSearchTerm, 1, false);
    } else {
      setWallpapers([]);
      setHasMore(false);
      setLoading(false);
    }
  }, [currentSearchTerm, fetchWallpapers]);


  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && currentSearchTerm) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchWallpapers(currentSearchTerm, nextPage, true);
    }
  }, [loading, hasMore, currentSearchTerm, page, fetchWallpapers]);

  const handleWallpaperCategorySelect = useCallback((categoryValue: string) => {
    if (categoryValue.trim()) {
      router.push(`/search?query=${encodeURIComponent(categoryValue.trim())}`);
    }
  }, [router]);

  const handleSearchSubmit = useCallback((newSearchTerm: string) => {
    console.log("Search submitted from SearchPageContent header, navigating to /search:", newSearchTerm);
    // Navigation is handled by SearchBar component itself
  }, []);

  const initialLoadingSkeletons = (
    <div className="my-masonry-grid">
      {[...Array(12)].map((_, i) => (
        <div key={`search-content-initial-skeleton-column-wrapper-${i}`} className="my-masonry-grid_column">
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
            {currentSearchTerm === "Wallpaper" || !currentSearchTerm ? "Search Wallpapers" : `Results for: "${currentSearchTerm}"`}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Displaying wallpapers from Pexels.
          </p>
        </div>

        {(loading && wallpapers.length === 0 && currentSearchTerm) && initialLoadingSkeletons}
        
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
         {!loading && !hasMore && wallpapers.length === 0 && currentSearchTerm && (
             <p className="text-center text-muted-foreground py-6">No wallpapers found for "{currentSearchTerm}". Try a different search!</p>
        )}
         {!loading && !hasMore && wallpapers.length === 0 && !currentSearchTerm && (
            <p className="text-center text-muted-foreground py-6">Enter a search term to find wallpapers.</p>
        )}
      </main>
    </>
  );
}
