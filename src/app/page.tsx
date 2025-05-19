
'use client';

import type { PexelsPhoto, DeviceOrientationCategory } from '@/types/pexels';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PreviewDialog } from '@/components/wallpaper/PreviewDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { StructuredData } from '@/components/structured-data';
import type { ImageObject as SchemaImageObject, MinimalWithContext, Person as SchemaPerson, Organization as SchemaOrganization } from '@/types/schema-dts';
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';
import { GlobalHeader } from '@/components/layout/GlobalHeader';
import { Button } from '@/components/ui/button';
import { searchPhotos as searchPhotosLib } from '@/lib/pexels';
import { cn } from '@/lib/utils';


export default function Home() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('Wallpaper');
  const [currentDeviceOrientation, setCurrentDeviceOrientation] = useState<DeviceOrientationCategory>('smartphone');
  const [wallpapers, setWallpapers] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWallpaper, setSelectedWallpaper] = useState<PexelsPhoto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  const fetchWallpapers = useCallback(async (query: string, deviceCategory: DeviceOrientationCategory, pageNum: number = 1, append: boolean = false) => {
    setLoading(true);
    const orientation = deviceCategory === 'desktop' ? 'landscape' : 'portrait';
    const finalQuery = query.trim() || 'Wallpaper';

    const response = await searchPhotosLib(finalQuery, pageNum, 30, orientation);

    if (response && response.photos && response.photos.length > 0) {
      const newPhotos = response.photos;
      setWallpapers(prev => {
        const combined = append ? [...prev, ...newPhotos] : newPhotos;
        // Deduplication based on ID only, as orientation is now handled by card's aspect ratio
        const uniqueMap = new Map(combined.map(item => [item.id, item]));
        return Array.from(uniqueMap.values());
      });
      setHasMore(!!response.next_page && newPhotos.length > 0 && newPhotos.length === 30);
    } else {
      if (!append) {
        setWallpapers([]);
      }
      setHasMore(false);

      if (process.env.NODE_ENV === 'development') {
        console.warn(`[Home Page] Failed to fetch wallpapers for "${finalQuery}" or no results returned from Pexels. Attempting to display mock data.`);
        // Mock data generation can be removed or simplified if API key handling is robust server-side
        // For now, ensure Pexels API key (server-side) is correctly set for real data.
        const mockPhotos: PexelsPhoto[] = Array.from({ length: 15 }).map((_, i) => {
          const photoId = parseInt(`${pageNum}${i}${Date.now() % 10000}`);
          // Generic placeholder sizes, actual image aspect ratio will determine display
          const mockWidth = 1000 + Math.floor(Math.random() * 500); 
          const mockHeight = 1200 + Math.floor(Math.random() * 800); 
          const placeholderUrl = (w: number, h: number) => `https://placehold.co/${w}x${h}.png`;
          
          return {
            id: photoId,
            width: mockWidth,
            height: mockHeight,
            url: `https://example.com/mock-photo/${photoId}`, 
            photographer: 'Mock Photographer',
            photographer_url: 'https://example.com/mock-photographer',
            photographer_id: i,
            avg_color: '#7F7F7F',
            src: { 
              original: placeholderUrl(mockWidth, mockHeight),
              large2x: placeholderUrl(mockWidth, mockHeight), // Keep consistent for simplicity
              large: placeholderUrl(Math.round(mockWidth * 0.75), Math.round(mockHeight * 0.75)),
              medium: placeholderUrl(Math.round(mockWidth * 0.5), Math.round(mockHeight * 0.5)),
              small: placeholderUrl(Math.round(mockWidth * 0.25), Math.round(mockHeight * 0.25)),
              portrait: placeholderUrl(1080, 1920),
              landscape: placeholderUrl(1920, 1080),
              tiny: placeholderUrl(Math.round(mockWidth * 0.05), Math.round(mockHeight * 0.05))
            },
            liked: false,
            alt: `Mock wallpaper for ${finalQuery}, item ${i}, page ${pageNum}`,
          };
        });
        setWallpapers(prev => append ? [...prev, ...mockPhotos] : mockPhotos);
        setHasMore(pageNum < 3); 
      } else if (!append) {
         setWallpapers([]);
      }
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    setPage(1);
    setWallpapers([]);
    setHasMore(true);
    fetchWallpapers(searchTerm, currentDeviceOrientation, 1, false);
  }, [searchTerm, currentDeviceOrientation, fetchWallpapers]);

  const handleDeviceOrientationChange = (newCategory: DeviceOrientationCategory) => {
       if (newCategory !== currentDeviceOrientation) {
           setCurrentDeviceOrientation(newCategory);
           setSearchTerm('Wallpaper'); 
           setPage(1);
           setWallpapers([]);
           setHasMore(true);
       }
   };

   const handleWallpaperCategorySelect = (categoryValue: string) => {
    router.push(`/search?query=${encodeURIComponent(categoryValue)}`);
  };

  const handleSearchSubmit = (newSearchTerm: string) => {
    if (newSearchTerm.trim()) {
      router.push(`/search?query=${encodeURIComponent(newSearchTerm.trim())}`);
    }
  };


  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchWallpapers(searchTerm, currentDeviceOrientation, nextPage, true);
    }
  };


  const openModal = (wallpaper: PexelsPhoto) => {
    setSelectedWallpaper(wallpaper);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedWallpaper(null), 300); 
  };

   const imageSchema: MinimalWithContext<SchemaImageObject> | null = selectedWallpaper ? {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: selectedWallpaper.alt || `Wallpaper by ${selectedWallpaper.photographer}`,
    description: selectedWallpaper.alt || `High-resolution wallpaper by ${selectedWallpaper.photographer}. Dimensions: ${selectedWallpaper.width}x${selectedWallpaper.height}.`,
    contentUrl: selectedWallpaper.src.original,
    thumbnailUrl: selectedWallpaper.src.medium,
    width: { '@type': 'Distance', value: selectedWallpaper.width.toString(), unitCode: 'E37' },
    height: { '@type': 'Distance', value: selectedWallpaper.height.toString(), unitCode: 'E37' },
    author: {
      '@type': 'Person',
      name: selectedWallpaper.photographer,
      url: selectedWallpaper.photographer_url,
    } as SchemaPerson,
    copyrightHolder: {
      '@type': 'Person',
      name: selectedWallpaper.photographer,
      url: selectedWallpaper.photographer_url,
    } as SchemaPerson,
    license: 'https://www.pexels.com/license/',
    acquireLicensePage: selectedWallpaper.url,
    provider: {
      '@type': 'Organization',
      name: 'Pexels',
      url: 'https://www.pexels.com',
    } as SchemaOrganization,
  } : null;


  return (
    <>
      {imageSchema && <StructuredData data={imageSchema} />}
      <GlobalHeader
        currentDeviceOrientation={currentDeviceOrientation}
        onDeviceOrientationChange={handleDeviceOrientationChange}
        onWallpaperCategorySelect={handleWallpaperCategorySelect}
        onSearchSubmit={handleSearchSubmit}
        initialSearchTerm={searchTerm}
        navigateToSearchPage={true} 
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
                {[...Array(12)].map((_, i) => (
                 <Skeleton key={`initial-skeleton-${i}`} className="w-full h-72 mb-3 sm:mb-4 rounded-lg bg-muted/70" />
                ))}
            </div>
        ) : (
          <WallpaperGrid
            photos={wallpapers}
            onPhotoClick={openModal}
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
                  <Skeleton key={`loading-skeleton-${i}`} className="w-full h-64 mb-3 sm:mb-4 rounded-lg bg-muted/70" />
                ))}
            </div>
          )}
      </main>

      <PreviewDialog
        photo={selectedWallpaper}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}
