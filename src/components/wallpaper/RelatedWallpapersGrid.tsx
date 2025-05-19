
'use client';

import type { PexelsPhoto } from '@/types/pexels';
import React, { useState, useEffect, useCallback } from 'react';
import { WallpaperGrid } from './WallpaperGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { searchPhotos } from '@/lib/pexels';
import { cn } from '@/lib/utils';
import InfiniteScroll from 'react-infinite-scroll-component';

interface RelatedWallpapersGridProps {
  initialQuery: string;
  currentPhotoId: number; 
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

  const loadingSkeletonItems = (
    <div className="my-masonry-grid">
      {[...Array(6)].map((_, i) => (
        <div key={`related-loading-skeleton-column-wrapper-${i}`} className="my-masonry-grid_column">
          <div className="mb-3"> {/* This div acts as the masonry item */}
            <Skeleton className="w-full h-72 rounded-lg bg-muted/70" />
          </div>
        </div>
      ))}
    </div>
  );
  
  if (!initialQuery && !loading && relatedWallpapers.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 pt-8 border-t border-border">
      <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6 text-center">Related Wallpapers</h2>
      {loading && relatedWallpapers.length === 0 && (
        <div
          className="my-masonry-grid"
          aria-busy="true"
          aria-live="polite"
        >
          {[...Array(12)].map((_, i) => (
            <div key={`related-initial-skeleton-column-wrapper-${i}`} className="my-masonry-grid_column">
               <div className="mb-3"> {/* This div acts as the masonry item */}
                <Skeleton className="w-full h-72 rounded-lg bg-muted/70" />
              </div>
            </div>
          ))}
        </div>
      )}
      
      <InfiniteScroll
        dataLength={relatedWallpapers.length}
        next={handleLoadMore}
        hasMore={hasMore}
        loader={loadingSkeletonItems}
        scrollThreshold="200px"
        className="w-full"
      >
        <WallpaperGrid photos={relatedWallpapers} />
      </InfiniteScroll>

      {!loading && !hasMore && relatedWallpapers.length > 0 ? (
         <p className="text-center text-muted-foreground py-4">No more related wallpapers found for "{initialQuery}".</p>
      ) : !loading && !hasMore && relatedWallpapers.length === 0 && initialQuery ? (
         <p className="text-center text-muted-foreground py-4">No related wallpapers found for "{initialQuery}".</p>
      ): null}
    </div>
  );
}
