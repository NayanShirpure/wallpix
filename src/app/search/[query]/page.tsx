
'use client';

import type { PexelsPhoto, DeviceOrientationCategory } from '@/types/pexels';
import React, { useState, useEffect, useCallback, use } from 'react'; // Added 'use'
import { useRouter } from 'next/navigation';
import { PreviewDialog } from '@/components/wallpaper/PreviewDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';
import { GlobalHeader } from '@/components/layout/GlobalHeader';
import { Button } from '@/components/ui/button';
import { searchPhotos as searchPhotosLib } from '@/lib/pexels';
import { StructuredData } from '@/components/structured-data';
import type { SearchResultsPage as SchemaSearchResultsPage, WebPage as SchemaWebPage, MinimalWithContext, ImageObject as SchemaImageObject, Person as SchemaPerson, Organization as SchemaOrganization } from '@/types/schema-dts';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nayanshirpure.github.io/Wallify/';

interface SearchPageProps {
  params: Promise<{ query: string }>; // Changed to Promise
}

export default function SearchPage({ params: paramsPromise }: SearchPageProps) { // Renamed prop
  const params = use(paramsPromise); // Unwrap params using React.use()
  const router = useRouter();
  const { toast } = useToast();

  let initialDecodedQuery = 'Wallpaper';
  if (params && params.query) { // params is now resolved
    try {
      initialDecodedQuery = decodeURIComponent(params.query);
    } catch (e) {
      console.warn(`[SearchPage] Failed to decode query parameter from URL: "${params.query}". Using raw value.`, e);
      initialDecodedQuery = params.query;
    }
  }
  
  const [currentSearchTerm, setCurrentSearchTerm] = useState<string>(initialDecodedQuery);
  const [currentDeviceOrientation, setCurrentDeviceOrientation] = useState<DeviceOrientationCategory>('smartphone');
  const [wallpapers, setWallpapers] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWallpaper, setSelectedWallpaper] = useState<PexelsPhoto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchWallpapers = useCallback(async (query: string, category: DeviceOrientationCategory, pageNum: number = 1, append: boolean = false) => {
    setLoading(true);
    const orientation = category === 'desktop' ? 'landscape' : 'portrait';
    const finalQuery = query.trim() || 'Wallpaper';

    try {
      const data = await searchPhotosLib(finalQuery, pageNum, 30, orientation);
      if (data && data.photos) {
        const newPhotos = data.photos;
        setWallpapers(prev => {
          const combined = append ? [...prev, ...newPhotos] : newPhotos;
          const uniqueMap = new Map(combined.map(item => [`${item.id}-${category}`, item]));
          return Array.from(uniqueMap.values());
        });
        setHasMore(!!data.next_page && newPhotos.length > 0 && newPhotos.length === 30);
      } else {
        setWallpapers(prev => append ? prev : []);
        setHasMore(false);
        if (process.env.NODE_ENV === 'development') {
             toast({ title: "API Issue", description: "Failed to fetch wallpapers or no results. Ensure API key is valid and query is correct.", variant: "default" });
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
    // params is the resolved object here due to React.use()
    let queryFromParams = 'Wallpaper';
    if (params && params.query) {
      try {
        queryFromParams = decodeURIComponent(params.query);
      } catch (e) {
        console.warn(`[SearchPage useEffect] Failed to decode query: "${params.query}". Using raw.`, e);
        queryFromParams = params.query;
      }
    }
    
    if (queryFromParams !== currentSearchTerm) {
        setCurrentSearchTerm(queryFromParams);
    }
    setPage(1);
    setWallpapers([]);
    setHasMore(true);
    fetchWallpapers(queryFromParams, currentDeviceOrientation, 1, false);
  }, [params, currentDeviceOrientation, fetchWallpapers, currentSearchTerm]); // Added currentSearchTerm to dependencies as it's compared


  const handleDeviceOrientationChange = (newCategory: DeviceOrientationCategory) => {
    if (newCategory !== currentDeviceOrientation) {
      setCurrentDeviceOrientation(newCategory);
      setPage(1);
      setWallpapers([]);
      setHasMore(true);
    }
  };

  const handleWallpaperCategorySelect = (categoryValue: string) => {
    router.push(`/search/${encodeURIComponent(categoryValue)}`);
  };

  const handleSearchSubmit = (newSearchTerm: string) => {
    if (newSearchTerm.trim() && newSearchTerm.trim() !== currentSearchTerm) {
        router.push(`/search/${encodeURIComponent(newSearchTerm.trim())}`);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchWallpapers(currentSearchTerm, currentDeviceOrientation, nextPage, true);
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

  const gridAspectRatio = currentDeviceOrientation === 'desktop' ? 'aspect-video' : 'aspect-[9/16]';
  
  // params used for schema should be the resolved one
  const searchResultsSchema: MinimalWithContext<SchemaSearchResultsPage> | null = params?.query ? {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: `Search results for "${currentSearchTerm}"`,
    url: `${BASE_URL}search/${params.query}`, 
    description: `Find stunning ${currentSearchTerm} wallpapers on Wallify.`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}search/${params.query}`,
    } as SchemaWebPage,
  } : null;

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
      {searchResultsSchema && <StructuredData data={searchResultsSchema} />}
      {imageSchema && isModalOpen && <StructuredData data={imageSchema} />}
      
      <GlobalHeader
        currentDeviceOrientation={currentDeviceOrientation}
        onDeviceOrientationChange={handleDeviceOrientationChange}
        onWallpaperCategorySelect={handleWallpaperCategorySelect}
        onSearchSubmit={handleSearchSubmit}
        initialSearchTerm={currentSearchTerm}
        navigateToSearchPage={true} 
      />

      <main className="flex-grow container mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="my-4 sm:my-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary">
            {currentSearchTerm === "Wallpaper" ? "Search Wallpapers" : `Results for: "${currentSearchTerm}"`}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Displaying {currentDeviceOrientation} optimized wallpapers.
          </p>
        </div>

        {loading && wallpapers.length === 0 ? (
          <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4`}>
            {[...Array(15)].map((_, i) => (
              <Skeleton key={`search-skeleton-${i}`} className={`${gridAspectRatio} w-full rounded-lg`} />
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

        {loading && wallpapers.length > 0 && (
          <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mt-4`}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={`search-loading-more-${i}`} className={`${gridAspectRatio} w-full rounded-lg`} />
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
