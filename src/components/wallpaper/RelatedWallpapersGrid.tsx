
'use client';

import type { PexelsPhoto, PexelsPhotoOrientation } from '@/types/pexels';
import type { DeviceOrientationCategory } from '@/config/categories';
import React, { useState, useEffect, useCallback } from 'react';
import { WallpaperGrid } from './WallpaperGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { searchPhotos } from '@/lib/pexels';
import InfiniteScroll from 'react-infinite-scroll-component';

interface RelatedWallpapersGridProps {
  initialQuery: string;
  currentPhotoId: number; 
  currentDeviceOrientation: DeviceOrientationCategory;
}

export function RelatedWallpapersGrid({ initialQuery, currentPhotoId, currentDeviceOrientation }: RelatedWallpapersGridProps) {
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
    const pexelsOrientation: PexelsPhotoOrientation = currentDeviceOrientation === 'smartphone' ? 'portrait' : 'landscape';
    const response = await searchPhotos(initialQuery, pageNum, 15, pexelsOrientation); 

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
  }, [initialQuery, currentPhotoId, currentDeviceOrientation]);

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
  }, [initialQuery, fetchRelatedWallpapers, currentDeviceOrientation]); // Add currentDeviceOrientation to dependencies

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchRelatedWallpapers(nextPage, true);
    }
  }, [loading, hasMore, page, fetchRelatedWallpapers]);
  
  if (!initialQuery && !loading && relatedWallpapers.length === 0) {
    return null;
  }

  const loadingSkeletons = (
    <div className="my-masonry-grid">
      {[...Array(6)].map((_, i) => ( 
        <div key={`related-initial-skeleton-column-wrapper-${i}`} className="my-masonry-grid_column">
          <div style={{ marginBottom: '1rem' }}> 
            <Skeleton className="w-full h-72 rounded-lg bg-muted/70" />
          </div>
        </div>
      ))}
    </div>
  );

  const infiniteScrollLoader = (
     <div className="text-center py-4 col-span-full">
      <p className="text-muted-foreground">Loading more related...</p>
    </div>
  );


  return (
    <div className="mt-10 pt-8 border-t border-border">
      <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6 text-center">Related Wallpapers</h2>
      {(loading && relatedWallpapers.length === 0) && loadingSkeletons}
      
      {relatedWallpapers.length > 0 && (
        <InfiniteScroll
          dataLength={relatedWallpapers.length}
          next={handleLoadMore}
          hasMore={hasMore}
          loader={infiniteScrollLoader}
          className="w-full"
        >
          <WallpaperGrid photos={relatedWallpapers} />
        </InfiniteScroll>
      )}

      {!loading && !hasMore && relatedWallpapers.length > 0 ? (
         <p className="text-center text-muted-foreground py-4">No more related wallpapers found for "{initialQuery}".</p>
      ) : !loading && !hasMore && relatedWallpapers.length === 0 && initialQuery ? (
         <p className="text-center text-muted-foreground py-4">No related wallpapers found for "{initialQuery}".</p>
      ): null}
    </div>
  );
}
