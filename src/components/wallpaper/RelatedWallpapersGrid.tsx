
'use client';

import type { PexelsPhoto } from '@/types/pexels';
import React, { useState, useEffect, useCallback } from 'react';
import { WallpaperGrid } from './WallpaperGrid';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { searchPhotos } from '@/lib/pexels';
import { cn } from '@/lib/utils';

interface RelatedWallpapersGridProps {
  initialQuery: string;
  currentPhotoId: number; // To exclude the current photo from related results
}

export function RelatedWallpapersGrid({ initialQuery, currentPhotoId }: RelatedWallpapersGridProps) {
  const [relatedWallpapers, setRelatedWallpapers] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchRelatedWallpapers = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (!initialQuery) {
      setHasMore(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Fetch without orientation filter
    const response = await searchPhotos(initialQuery, pageNum, 15);

    if (response && response.photos && response.photos.length > 0) {
      const newPhotos = response.photos.filter(photo => photo.id !== currentPhotoId);
      setRelatedWallpapers(prev => {
        const combined = append ? [...prev, ...newPhotos] : newPhotos;
        const uniqueMap = new Map(combined.map(item => [item.id, item]));
        return Array.from(uniqueMap.values());
      });
      setHasMore(!!response.next_page && response.photos.length === 15);
    } else {
      if (!append) {
        setRelatedWallpapers([]);
      }
      setHasMore(false);
    }
    setLoading(false);
  }, [initialQuery, currentPhotoId]);

  useEffect(() => {
    setPage(1);
    setRelatedWallpapers([]);
    setHasMore(true);
    if (initialQuery) {
      fetchRelatedWallpapers(1, false);
    } else {
      setLoading(false);
      setHasMore(false);
    }
  }, [initialQuery, fetchRelatedWallpapers]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchRelatedWallpapers(nextPage, true);
    }
  };

  if (!initialQuery && !loading) {
    return <p className="text-center text-muted-foreground py-4">Cannot load related wallpapers without a query.</p>;
  }
  
  if (!initialQuery && !loading && relatedWallpapers.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 pt-8 border-t border-border">
      <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6 text-center">Related Wallpapers</h2>
      {loading && relatedWallpapers.length === 0 ? (
        <div
          className={cn(
            "p-1",
            "columns-2 xs:columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6",
            "gap-2 sm:gap-3 md:gap-4"
          )}
          aria-busy="true"
          aria-live="polite"
        >
          {[...Array(12)].map((_, i) => (
            <Skeleton key={`related-skeleton-${i}`} className="w-full aspect-[3/4] mb-3 sm:mb-4 rounded-lg bg-muted/70 break-inside-avoid-column" />
          ))}
        </div>
      ) : relatedWallpapers.length > 0 ? (
        <WallpaperGrid photos={relatedWallpapers} />
      ) : !loading && initialQuery ? (
         <p className="text-center text-muted-foreground py-4">No related wallpapers found for "{initialQuery}".</p>
      ) : null}

      {hasMore && !loading && relatedWallpapers.length > 0 && (
        <div className="flex justify-center mt-6 sm:mt-8 mb-4">
          <Button onClick={handleLoadMore} variant="outline" size="lg" className="text-sm px-6 py-2.5">
            Load More Related
          </Button>
        </div>
      )}

      {loading && relatedWallpapers.length > 0 && (
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
            <Skeleton key={`loading-more-related-${i}`} className="w-full aspect-[3/4] mb-3 sm:mb-4 rounded-lg bg-muted/70 break-inside-avoid-column" />
          ))}
        </div>
      )}
    </div>
  );
}
