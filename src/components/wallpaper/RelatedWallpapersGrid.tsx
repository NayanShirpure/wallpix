
'use client';

import type { PexelsPhoto } from '@/types/pexels';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WallpaperGrid } from './WallpaperGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { searchPhotos } from '@/lib/pexels';
import { cn } from '@/lib/utils';

interface RelatedWallpapersGridProps {
  initialQuery: string;
  currentPhotoId: number; 
}

export function RelatedWallpapersGrid({ initialQuery, currentPhotoId }: RelatedWallpapersGridProps) {
  const [relatedWallpapers, setRelatedWallpapers] = useState<PexelsPhoto[]>([]);
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

  const fetchRelatedWallpapers = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (!initialQuery) {
      setHasMore(false);
      setLoading(false);
      return;
    }
    setLoading(true);
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
  
  if (!initialQuery && !loading && relatedWallpapers.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 pt-8 border-t border-border">
      <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6 text-center">Related Wallpapers</h2>
      {loading && relatedWallpapers.length === 0 && (
        <div
          className={cn(
            "columns-2 xs:columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6",
            "gap-2 sm:gap-3 md:gap-4",
            "[column-fill:auto]"
          )}
          aria-busy="true"
          aria-live="polite"
        >
          {[...Array(12)].map((_, i) => (
            <div key={`related-initial-skeleton-column-wrapper-${i}`} className="mb-2 sm:mb-3 md:mb-4 break-inside-avoid-column">
              <Skeleton className="w-full h-72 rounded-lg bg-muted/70" />
            </div>
          ))}
        </div>
      )}
      
      <WallpaperGrid photos={relatedWallpapers} />

      {loading && relatedWallpapers.length > 0 && (
         <div className={cn(
            "columns-2 xs:columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6",
            "gap-2 sm:gap-3 md:gap-4",
            "mt-4 [column-fill:auto]"
          )}>
          {[...Array(6)].map((_, i) => (
            <div key={`related-loading-skeleton-column-wrapper-${i}`} className="mb-2 sm:mb-3 md:mb-4 break-inside-avoid-column">
              <Skeleton className="w-full h-72 rounded-lg bg-muted/70" />
            </div>
          ))}
        </div>
      )}

      {!loading && hasMore && relatedWallpapers.length > 0 && (
        <div ref={lastWallpaperElementRef} className="h-10"></div> // Sentinel
      )}

      {!loading && !hasMore && relatedWallpapers.length > 0 ? (
         <p className="text-center text-muted-foreground py-4">No more related wallpapers found for "{initialQuery}".</p>
      ) : !loading && !hasMore && relatedWallpapers.length === 0 && initialQuery ? (
         <p className="text-center text-muted-foreground py-4">No related wallpapers found for "{initialQuery}".</p>
      ): null}
    </div>
  );
}
