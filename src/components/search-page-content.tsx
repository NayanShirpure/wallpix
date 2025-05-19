
'use client';

import type { PexelsPhoto, DeviceOrientationCategory } from '@/types/pexels';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// PreviewDialog is removed
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';
import { GlobalHeader } from '@/components/layout/GlobalHeader'; 
import { Button } from '@/components/ui/button';
import { searchPhotos as searchPhotosLib } from '@/lib/pexels';
import { StructuredData } from '@/components/structured-data';
// MinimalWithContext and other schema types are no longer needed here as preview is on a new page
import { cn } from '@/lib/utils';

interface SearchPageContentProps {
  initialQuery: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wallpix.vercel.app/';

export function SearchPageContent({ initialQuery }: SearchPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [currentSearchTerm, setCurrentSearchTerm] = useState<string>(initialQuery);
  const [currentDeviceOrientation, setCurrentDeviceOrientation] = useState<DeviceOrientationCategory>('smartphone');
  const [wallpapers, setWallpapers] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  // Removed selectedWallpaper and isModalOpen state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const queryFromUrl = searchParams.get('query');
    const termToUse = queryFromUrl || initialQuery || 'Wallpaper';
    if (termToUse !== currentSearchTerm) {
        setCurrentSearchTerm(termToUse);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, initialQuery]);


  const fetchWallpapers = useCallback(async (query: string, deviceCategory: DeviceOrientationCategory, pageNum: number = 1, append: boolean = false) => {
    setLoading(true);
    const orientationFilter = deviceCategory === 'desktop' ? 'landscape' : 'portrait';
    const finalQuery = query.trim() || 'Wallpaper';

    try {
      const data = await searchPhotosLib(finalQuery, pageNum, 30, orientationFilter);
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
        if (process.env.NODE_ENV === 'development') {
             toast({ title: "API Issue (Search)", description: "Failed to fetch wallpapers or no results. Check API key and query.", variant: "default", duration: 7000 });
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPage(1);
    setWallpapers([]);
    setHasMore(true);
    fetchWallpapers(currentSearchTerm, currentDeviceOrientation, 1, false);
  }, [currentSearchTerm, currentDeviceOrientation, fetchWallpapers]);

  const handleDeviceOrientationChange = (newCategory: DeviceOrientationCategory) => {
    if (newCategory !== currentDeviceOrientation) {
      setCurrentDeviceOrientation(newCategory);
    }
  };

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
      fetchWallpapers(currentSearchTerm, currentDeviceOrientation, nextPage, true);
    }
  };

  // openModal and closeModal are removed.
  // StructuredData for selectedWallpaper is removed.

  return (
    <>
      {/* Removed StructuredData for selectedWallpaper */}
      <GlobalHeader
        currentDeviceOrientation={currentDeviceOrientation}
        onDeviceOrientationChange={handleDeviceOrientationChange}
        onWallpaperCategorySelect={handleWallpaperCategorySelect}
        onSearchSubmit={handleSearchSubmit}
        initialSearchTerm={currentSearchTerm} 
        navigateToSearchPage={false} 
      />

      <main className="flex-grow container mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6" aria-busy={loading && wallpapers.length === 0} aria-live="polite">
        <div className="my-4 sm:my-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary">
            {currentSearchTerm === "Wallpaper" ? "Search Wallpapers" : `Results for: "${currentSearchTerm}"`}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Displaying {currentDeviceOrientation} optimized wallpapers.
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
              <Skeleton key={`search-content-skeleton-${i}`} className="w-full h-72 mb-3 sm:mb-4 rounded-lg bg-muted/70" />
            ))}
          </div>
        ) : (
          <WallpaperGrid
            photos={wallpapers}
            // onPhotoClick is removed
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
              <Skeleton key={`search-content-loading-more-${i}`} className="w-full h-64 mb-3 sm:mb-4 rounded-lg bg-muted/70" />
            ))}
          </div>
        )}
      </main>
      {/* Removed PreviewDialog component usage */}
    </>
  );
}
