
'use client';

import type { PexelsPhoto, PexelsResponse, DeviceOrientationCategory } from '@/types/pexels';
import React, { useState, useEffect, useCallback } from 'react';
import { PreviewDialog } from '@/components/wallpaper/PreviewDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { StructuredData } from '@/components/structured-data';
import type { ImageObject as SchemaImageObject, MinimalWithContext, Person as SchemaPerson, Organization as SchemaOrganization } from '@/types/schema-dts';
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';
import { GlobalHeader } from '@/components/layout/GlobalHeader';
import { Button } from '@/components/ui/button';


const PEXELS_API_URL = 'https://api.pexels.com/v1';
const FALLBACK_PEXELS_API_KEY = "lc7gpWWi2bcrekjM32zdi1s68YDYmEWMeudlsDNNMVEicIIke3G8Iamw";


export default function Home() {
  const [searchTerm, setSearchTerm] = useState('Wallpaper');
  const [currentDeviceOrientation, setCurrentDeviceOrientation] = useState<DeviceOrientationCategory>('smartphone');
  const [wallpapers, setWallpapers] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWallpaper, setSelectedWallpaper] = useState<PexelsPhoto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

   const fetchWallpapers = useCallback(async (query: string, category: DeviceOrientationCategory, pageNum: number = 1, append: boolean = false) => {
    let effectiveApiKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
    const isEnvKeyMissingOrPlaceholder = !effectiveApiKey || /your_actual_pexels_api_key/i.test(effectiveApiKey || "");

    if (isEnvKeyMissingOrPlaceholder) {
        effectiveApiKey = FALLBACK_PEXELS_API_KEY;
        if (process.env.NODE_ENV === 'development') {
             console.warn("[Home Page] Pexels API key (NEXT_PUBLIC_PEXELS_API_KEY) is not configured or is a placeholder. Using default fallback key.");
        }
    }

    if (!effectiveApiKey || /your_actual_pexels_api_key/i.test(effectiveApiKey)) {
      console.warn("[Home Page] No valid Pexels API key available (checked env & fallback). Displaying mock data.");
      const mockPhotos: PexelsPhoto[] = Array.from({ length: 15 }).map((_, i) => ({
        id: i + pageNum * 1000 + Date.now(),
        width: 1080, height: 1920,
        url: `https://picsum.photos/seed/${query}${category}${i}${pageNum}${Math.random()}/1080/1920`,
        photographer: 'Mock Photographer', photographer_url: 'https://example.com', photographer_id: i, avg_color: '#000000',
        src: { original: `https://picsum.photos/seed/${query}${category}${i}${pageNum}${Math.random()}/1080/1920`, large2x: `https://picsum.photos/seed/${query}${category}${i}${pageNum}${Math.random()}/1080/1920`, large: `https://picsum.photos/seed/${query}${category}${i}${pageNum}${Math.random()}/800/1200`, medium: `https://picsum.photos/seed/${query}${category}${i}${pageNum}${Math.random()}/400/600`, small: `https://picsum.photos/seed/${query}${category}${i}${pageNum}${Math.random()}/200/300`, portrait: `https://picsum.photos/seed/${query}${category}${i}${pageNum}${Math.random()}/800/1200`, landscape: `https://picsum.photos/seed/${query}${category}${i}${pageNum}${Math.random()}/1200/800`, tiny: `https://picsum.photos/seed/${query}${category}${i}${pageNum}${Math.random()}/20/30` },
        liked: false, alt: `Mock wallpaper for ${query} ${i} page ${pageNum}`,
      }));
      setWallpapers(prev => append ? [...prev, ...mockPhotos] : mockPhotos);
      setLoading(false);
      setHasMore(pageNum < 3);
      if (process.env.NODE_ENV === 'development') {
          toast({
            title: "PEXELS API Key Notice",
            description: "Pexels API key (NEXT_PUBLIC_PEXELS_API_KEY) and fallback are not configured or valid. Displaying mock data. Set NEXT_PUBLIC_PEXELS_API_KEY in .env.local.",
            variant: "default",
            duration: 10000,
          });
      }
      return;
    }
    
    setLoading(true);
    const orientation = category === 'desktop' ? 'landscape' : 'portrait';
    let finalQuery = query.trim() || 'Wallpaper';

    try {
      const apiUrl = `${PEXELS_API_URL}/search?query=${encodeURIComponent(finalQuery)}&orientation=${orientation}&per_page=30&page=${pageNum}`;
      const response = await fetch(apiUrl, { headers: { Authorization: effectiveApiKey! } });

      if (!response.ok) {
         if (response.status === 401) {
            console.error("Pexels API key is invalid or unauthorized.");
             toast({ title: "API Key Invalid", description: "The Pexels API key is invalid or unauthorized.", variant: "destructive" });
         } else {
             console.error(`HTTP error! status: ${response.status}, URL: ${apiUrl}`);
             toast({ title: "API Error", description: `Failed to fetch: ${response.statusText}`, variant: "destructive" });
         }
         setHasMore(false);
         // If API call fails and it was due to bad primary env key (so fallback was used and also failed) -> show mock.
         if (isEnvKeyMissingOrPlaceholder && effectiveApiKey === FALLBACK_PEXELS_API_KEY) {
            console.warn("[Home Page] Fallback API key also failed. Displaying mock data.");
            // Re-invoke mock data logic from above
            const mockPhotos: PexelsPhoto[] = Array.from({ length: 15 }).map((_, i) => ({ id: i + pageNum * 1000 + Date.now() + 100, width: 1080, height: 1920, url: `https://picsum.photos/seed/fail${query}${category}${i}${pageNum}${Math.random()}/1080/1920`, photographer: 'Mock Photographer', photographer_url: 'https://example.com', photographer_id: i, avg_color: '#000000', src: { original: `https://picsum.photos/seed/fail${query}${category}${i}${pageNum}${Math.random()}/1080/1920`, large2x: `https://picsum.photos/seed/fail${query}${category}${i}${pageNum}${Math.random()}/1080/1920`, large: `https://picsum.photos/seed/fail${query}${category}${i}${pageNum}${Math.random()}/800/1200`, medium: `https://picsum.photos/seed/fail${query}${category}${i}${pageNum}${Math.random()}/400/600`, small: `https://picsum.photos/seed/fail${query}${category}${i}${pageNum}${Math.random()}/200/300`, portrait: `https://picsum.photos/seed/fail${query}${category}${i}${pageNum}${Math.random()}/800/1200`, landscape: `https://picsum.photos/seed/fail${query}${category}${i}${pageNum}${Math.random()}/1200/800`, tiny: `https://picsum.photos/seed/fail${query}${category}${i}${pageNum}${Math.random()}/20/30` }, liked: false, alt: `Mock fail wallpaper ${query} ${i} pg ${pageNum}` }));
            setWallpapers(prev => append ? [...prev, ...mockPhotos] : mockPhotos);
            setHasMore(pageNum < 2); // Limit mock pagination
         } else {
            setWallpapers(prev => append ? prev : []);
         }
      } else {
            const data: PexelsResponse = await response.json();
            const newPhotos = data.photos || [];
            setWallpapers(prev => {
              const combined = append ? [...prev, ...newPhotos] : newPhotos;
              const uniqueMap = new Map(combined.map(item => [`${item.id}-${category}`, item]));
              return Array.from(uniqueMap.values());
            });
            setHasMore(!!data.next_page && newPhotos.length > 0 && newPhotos.length === 30);
      }

    } catch (error) {
      console.error("Error fetching wallpapers:", error);
      toast({ title: "Error", description: "Failed to fetch wallpapers. Check connection.", variant: "destructive" });
       setHasMore(false);
       if (isEnvKeyMissingOrPlaceholder) { // If error and primary key was bad, consider mock
            console.warn("[Home Page] Fetch error occurred (likely with fallback key). Displaying mock data.");
             const mockPhotos: PexelsPhoto[] = Array.from({ length: 15 }).map((_, i) => ({ id: i + pageNum * 1000 + Date.now() + 200, width: 1080, height: 1920, url: `https://picsum.photos/seed/err${query}${category}${i}${pageNum}${Math.random()}/1080/1920`, photographer: 'Mock Photographer', photographer_url: 'https://example.com', photographer_id: i, avg_color: '#000000', src: { original: `https://picsum.photos/seed/err${query}${category}${i}${pageNum}${Math.random()}/1080/1920`, large2x: `https://picsum.photos/seed/err${query}${category}${i}${pageNum}${Math.random()}/1080/1920`, large: `https://picsum.photos/seed/err${query}${category}${i}${pageNum}${Math.random()}/800/1200`, medium: `https://picsum.photos/seed/err${query}${category}${i}${pageNum}${Math.random()}/400/600`, small: `https://picsum.photos/seed/err${query}${category}${i}${pageNum}${Math.random()}/200/300`, portrait: `https://picsum.photos/seed/err${query}${category}${i}${pageNum}${Math.random()}/800/1200`, landscape: `https://picsum.photos/seed/err${query}${category}${i}${pageNum}${Math.random()}/1200/800`, tiny: `https://picsum.photos/seed/err${query}${category}${i}${pageNum}${Math.random()}/20/30` }, liked: false, alt: `Mock err wallpaper ${query} ${i} pg ${pageNum}` }));
            setWallpapers(prev => append ? [...prev, ...mockPhotos] : mockPhotos);
            setHasMore(pageNum < 2);
       } else {
         setWallpapers(prev => append ? prev : []);
       }
    } finally {
      setLoading(false);
    }
   }, [toast]);


  useEffect(() => {
    setPage(1);
    setWallpapers([]);
    setHasMore(true);
    fetchWallpapers(searchTerm, currentDeviceOrientation, 1, false);
  }, [searchTerm, currentDeviceOrientation, fetchWallpapers]);

  const handleDeviceOrientationChange = (newCategory: DeviceOrientationCategory) => {
       if (newCategory !== currentDeviceOrientation) {
           setCurrentDeviceOrientation(newCategory);
           setSearchTerm('Wallpaper'); // Reset search term to default on orientation change for home
           setPage(1);
           setWallpapers([]);
           setHasMore(true);
       }
   };

   const handleWallpaperCategorySelect = (categoryValue: string) => {
    setSearchTerm(categoryValue); // Update search term to the selected category
    setPage(1);
    setWallpapers([]);
    setHasMore(true);
  };

  const handleSearchSubmit = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setPage(1);
    setWallpapers([]);
    setHasMore(true);
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
    setTimeout(() => setSelectedWallpaper(null), 300); // Delay for modal close animation
  };


   const gridAspectRatio = currentDeviceOrientation === 'desktop' ? 'aspect-video' : 'aspect-[9/16]';

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
      />

      <main className="flex-grow container mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="my-4 sm:my-6 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary">
              {searchTerm === "Wallpaper" ? "Discover Your Next Wallpaper" : `Displaying: "${searchTerm}"`}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">Browse our collection or use the search and filters in the header.</p>
        </div>

        {loading && wallpapers.length === 0 ? (
             <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4`}>
                {[...Array(15)].map((_, i) => (
                 <Skeleton key={`initial-skeleton-${i}`} className={`${gridAspectRatio} w-full rounded-lg`} />
                ))}
            </div>
        ) : (
          <WallpaperGrid
            photos={wallpapers}
            orientation={currentDeviceOrientation}
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

          {/* Skeleton for loading more items */}
          {loading && wallpapers.length > 0 && (
              <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mt-4`}>
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={`loading-skeleton-${i}`} className={`${gridAspectRatio} w-full rounded-lg`} />
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

