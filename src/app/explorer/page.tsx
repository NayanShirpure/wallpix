
'use client';

import type { PexelsPhoto, PexelsResponse, DeviceOrientationCategory } from '@/types/pexels';
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PreviewDialog } from '@/components/wallpaper/PreviewDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { downloadFile } from '@/lib/utils';
import { StructuredData } from '@/components/structured-data';
import type { ImageObject as SchemaImageObject, WebPage as SchemaWebPage, MinimalWithContext, Person as SchemaPerson, Organization as SchemaOrganization } from '@/types/schema-dts';
import { WallpaperSection } from '@/components/wallpaper-section';
import { WallpaperOfTheDay } from '@/components/wallpaper-of-the-day';
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';
import { GlobalHeader } from '@/components/layout/GlobalHeader';
import { cn } from '@/lib/utils';


const PEXELS_API_URL = 'https://api.pexels.com/v1';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nayanshirpure.github.io/Wallify/';
const FALLBACK_PEXELS_API_KEY = "lc7gpWWi2bcrekjM32zdi1s68YDYmEWMeudlsDNNMVEicIIke3G8Iamw";

// Query lists for featured sections to enhance freshness
const editorPickQueries = ["Creative Art", "Artistic Design", "Unique Wallpaper", "Visually Stunning", "Inspiring Background", "Abstract Masterpiece", "Digital Painting"];
const popularChoiceQueries = ["Popular Backgrounds", "Most Liked Wallpapers", "Top Rated Images", "Community Favorites", "Highly Downloaded Art", "Fan Picks", "Trending Now"];
const freshFindQueries = ["New Digital Art", "Latest Uploads Wallpaper", "Recent Additions Pexels", "Newly Discovered Images", "Fresh Content Backgrounds", "Just Added", "Hot Off The Press"];

// Helper function to get a random item from an array
const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];


export default function ExplorerPage() {
  const [searchTerm, setSearchTerm] = useState('Explore');
  const [currentDeviceOrientation, setCurrentDeviceOrientation] = useState<DeviceOrientationCategory>('smartphone');
  const [wallpapers, setWallpapers] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [selectedWallpaper, setSelectedWallpaper] = useState<PexelsPhoto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { toast } = useToast();

  const [trendingWallpapers, setTrendingWallpapers] = useState<PexelsPhoto[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  const [editorsPicks, setEditorsPicks] = useState<PexelsPhoto[]>([]);
  const [editorsPicksLoading, setEditorsPicksLoading] = useState(true);

  const [mostDownloaded, setMostDownloaded] = useState<PexelsPhoto[]>([]);
  const [mostDownloadedLoading, setMostDownloadedLoading] = useState(true);

  const [recentlyAdded, setRecentlyAdded] = useState<PexelsPhoto[]>([]);
  const [recentlyAddedLoading, setRecentlyAddedLoading] = useState(true);

  const [wallpaperOfTheDay, setWallpaperOfTheDay] = useState<PexelsPhoto | null>(null);
  const [wallpaperOfTheDayLoading, setWallpaperOfTheDayLoading] = useState(true);


  const genericFetchWallpapers = useCallback(async (
    endpoint: string,
    params: Record<string, string | number>,
    isSingleItem: boolean = false
  ): Promise<PexelsPhoto[]> => {
    let effectiveApiKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
    const isEnvKeyMissingOrPlaceholder = !effectiveApiKey || /your_actual_pexels_api_key/i.test(effectiveApiKey);

    if (isEnvKeyMissingOrPlaceholder) {
      effectiveApiKey = FALLBACK_PEXELS_API_KEY;
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[Explorer Page] Pexels API key (NEXT_PUBLIC_PEXELS_API_KEY) is not configured or is a placeholder. Using default fallback key for ${endpoint}.`);
      }
    }
    
    if (!effectiveApiKey || /your_actual_pexels_api_key/i.test(effectiveApiKey)) {
      console.warn(`[Explorer Page] No valid Pexels API key available (checked env & fallback) for ${endpoint}. Displaying mock data.`);
      const mockPhoto: PexelsPhoto = {
        id: Date.now() + Math.random(),
        width: 1080, height: 1920,
        url: `https://picsum.photos/seed/${endpoint}${Object.values(params).join('')}${Math.random()}/1080/1920`,
        photographer: 'Mock Photographer', photographer_url: 'https://example.com', photographer_id: 1, avg_color: '#000000',
        src: { original: `https://picsum.photos/seed/${endpoint}${Object.values(params).join('')}${Math.random()}/1080/1920`, large2x: `https://picsum.photos/seed/${endpoint}${Object.values(params).join('')}${Math.random()}/1080/1920`, large: `https://picsum.photos/seed/${endpoint}${Object.values(params).join('')}${Math.random()}/800/1200`, medium: `https://picsum.photos/seed/${endpoint}${Object.values(params).join('')}${Math.random()}/400/600`, small: `https://picsum.photos/seed/${endpoint}${Object.values(params).join('')}${Math.random()}/200/300`, portrait: `https://picsum.photos/seed/${endpoint}${Object.values(params).join('')}${Math.random()}/800/1200`, landscape: `https://picsum.photos/seed/${endpoint}${Object.values(params).join('')}${Math.random()}/1200/800`, tiny: `https://picsum.photos/seed/${endpoint}${Object.values(params).join('')}${Math.random()}/20/30` },
        liked: false, alt: `Mock wallpaper for ${endpoint}`,
      };
      if (process.env.NODE_ENV === 'development') {
          toast({
            title: "PEXELS API Key Notice",
            description: `Pexels API key (NEXT_PUBLIC_PEXELS_API_KEY) is not configured or is a placeholder. Using default fallback key for ${endpoint}.`,
            variant: "default",
            duration: 10000,
          });
      }
      return isSingleItem ? [mockPhoto] : Array(10).fill(null).map((_,i)=>({...mockPhoto, id: mockPhoto.id+i, url: `https://picsum.photos/seed/${endpoint}${Object.values(params).join('')}${Math.random() + i}/1080/1920`, alt: `${mockPhoto.alt} ${i}`}));
    }


    const queryParams = new URLSearchParams();
    for (const key in params) {
      queryParams.append(key, String(params[key]));
    }

    const apiUrl = `${PEXELS_API_URL}/${endpoint}?${queryParams.toString()}`;

    try {
      const response = await fetch(apiUrl, { headers: { Authorization: effectiveApiKey! } });
      if (!response.ok) {
        if (response.status === 401) {
            toast({ title: "API Key Invalid", description: `Pexels API key is invalid for ${endpoint}. Please check .env.local or the fallback.`, variant: "destructive" });
        } else {
            throw new Error(`HTTP error! status: ${response.status} for ${endpoint}`);
        }
        if (isEnvKeyMissingOrPlaceholder && effectiveApiKey === FALLBACK_PEXELS_API_KEY) {
            console.warn(`[Explorer Page] Fallback API key failed for ${endpoint}. Displaying mock data.`);
            const mockPhoto: PexelsPhoto = {
                id: Date.now() + Math.random(), width: 1080, height: 1920, url: `https://picsum.photos/seed/fallbackfail${endpoint}/1080/1920`, photographer: 'Mock FallbackFail Photographer', photographer_url: 'https://example.com', photographer_id: 1, avg_color: '#111111', src: { original: `https://picsum.photos/seed/fallbackfail${endpoint}/1080/1920`, large2x: `https://picsum.photos/seed/fallbackfail${endpoint}/1080/1920`, large: `https://picsum.photos/seed/fallbackfail${endpoint}/800/1200`, medium: `https://picsum.photos/seed/fallbackfail${endpoint}/400/600`, small: `https://picsum.photos/seed/fallbackfail${endpoint}/200/300`, portrait: `https://picsum.photos/seed/fallbackfail${endpoint}/800/1200`, landscape: `https://picsum.photos/seed/fallbackfail${endpoint}/1200/800`, tiny: `https://picsum.photos/seed/fallbackfail${endpoint}/20/30` }, liked: false, alt: `Mock fallback-failed wallpaper for ${endpoint}`
            };
            if (process.env.NODE_ENV === 'development') {
                toast({ title: "PEXELS API Key Notice", description: `The fallback Pexels API key also failed for ${endpoint}. Displaying mock data.`, variant: "default", duration: 10000 });
            }
            return isSingleItem ? [mockPhoto] : Array(10).fill(null).map((_,i)=>({...mockPhoto, id: mockPhoto.id+i, url: `https://picsum.photos/seed/fallbackfail${endpoint}${i}/1080/1920`, alt: `${mockPhoto.alt} ${i}`}));
        }
        return [];
      }
      const data = await response.json();
      const photos = endpoint === 'photos' && data && 'id' in data ? [data as PexelsPhoto] : (data as PexelsResponse)?.photos || [];

      return photos;
    } catch (error: any) {
      console.error(`Error fetching from ${endpoint}:`, error.message);
      if (!error.message.includes("API Key Invalid")) {
        toast({ title: "Fetch Error", description: `Failed to fetch ${endpoint} content. Displaying mock data if applicable or check console.`, variant: "destructive" });
      }
      if (isEnvKeyMissingOrPlaceholder) {
        console.warn(`[Explorer Page] Fetch error occurred for ${endpoint} (likely with fallback key). Displaying mock data.`);
        const mockPhoto: PexelsPhoto = {
            id: Date.now() + Math.random(), width: 1080, height: 1920, url: `https://picsum.photos/seed/error${endpoint}/1080/1920`, photographer: 'Mock Error Photographer', photographer_url: 'https://example.com', photographer_id: 1, avg_color: '#111111', src: { original: `https://picsum.photos/seed/error${endpoint}/1080/1920`, large2x: `https://picsum.photos/seed/error${endpoint}/1080/1920`, large: `https://picsum.photos/seed/error${endpoint}/800/1200`, medium: `https://picsum.photos/seed/error${endpoint}/400/600`, small: `https://picsum.photos/seed/error${endpoint}/200/300`, portrait: `https://picsum.photos/seed/error${endpoint}/800/1200`, landscape: `https://picsum.photos/seed/error${endpoint}/1200/800`, tiny: `https://picsum.photos/seed/error${endpoint}/20/30` }, liked: false, alt: `Mock error wallpaper for ${endpoint}`
        };
        if (process.env.NODE_ENV === 'development') {
            toast({ title: "PEXELS API Notice", description: `An error occurred fetching ${endpoint}. Displaying mock data.`, variant: "default", duration: 10000 });
        }
        return isSingleItem ? [mockPhoto] : Array(10).fill(null).map((_,i)=>({...mockPhoto, id: mockPhoto.id+i, url: `https://picsum.photos/seed/error${endpoint}${i}/1080/1920`, alt: `${mockPhoto.alt} ${i}`}));
      }
      return [];
    }
  }, [toast]);


   const fetchBrowseAllWallpapers = useCallback(async (query: string, category: DeviceOrientationCategory, pageNum: number = 1, append: boolean = false) => {
    setLoading(true);
    const orientation = category === 'desktop' ? 'landscape' : 'portrait';
    let finalQuery = query.trim() || (category === 'desktop' ? 'Desktop Wallpaper' : 'Phone Wallpaper');
    if (finalQuery === 'Explore') finalQuery = (category === 'desktop' ? 'Desktop Wallpaper' : 'Phone Wallpaper');

    try {
      const photos = await genericFetchWallpapers('search', {
        query: finalQuery,
        orientation,
        per_page: 30, 
        page: pageNum,
      });

      setWallpapers(prev => {
        const combined = append ? [...prev, ...photos] : photos;
        const uniqueMap = new Map(combined.map(item => [`${item.id}-${category}`, item]));
        return Array.from(uniqueMap.values());
      });
      setHasMore(photos.length === 30);
    } catch (error) {
      setHasMore(false); 
    } finally {
      setLoading(false);
    }
   }, [genericFetchWallpapers]);


  useEffect(() => {
    setPage(1);
    setWallpapers([]);
    setHasMore(true);
    fetchBrowseAllWallpapers(searchTerm, currentDeviceOrientation, 1, false);
  }, [searchTerm, currentDeviceOrientation, fetchBrowseAllWallpapers]);

  useEffect(() => {
    const loadFeaturedSections = async () => {
      const orientationParam = currentDeviceOrientation === 'desktop' ? 'landscape' : 'portrait';
      const perPageFeatured = 10; // Increased item count for carousels

      setTrendingLoading(true);
      genericFetchWallpapers('curated', { orientation: orientationParam, per_page: perPageFeatured })
        .then(setTrendingWallpapers)
        .finally(() => setTrendingLoading(false));

      setEditorsPicksLoading(true);
      const randomEditorPickQuery = getRandomItem(editorPickQueries);
      genericFetchWallpapers('search', { query: randomEditorPickQuery, orientation: orientationParam, per_page: perPageFeatured })
        .then(setEditorsPicks)
        .finally(() => setEditorsPicksLoading(false));

      setMostDownloadedLoading(true);
      const randomPopularChoiceQuery = getRandomItem(popularChoiceQueries);
      genericFetchWallpapers('search', { query: randomPopularChoiceQuery, orientation: orientationParam, per_page: perPageFeatured })
        .then(setMostDownloaded)
        .finally(() => setMostDownloadedLoading(false));

      setRecentlyAddedLoading(true);
      const randomFreshFindQuery = getRandomItem(freshFindQueries);
      genericFetchWallpapers('search', { query: randomFreshFindQuery, orientation: orientationParam, per_page: perPageFeatured })
        .then(setRecentlyAdded)
        .finally(() => setRecentlyAddedLoading(false));

      setWallpaperOfTheDayLoading(true);
      genericFetchWallpapers('search', { query: "Daily Inspiration Wallpaper", orientation: orientationParam, per_page: 5 }) 
        .then(photos => {
          if (photos.length > 0) {
            const randomIndex = Math.floor(Math.random() * photos.length);
            setWallpaperOfTheDay(photos[randomIndex]);
          } else {
            setWallpaperOfTheDay(null);
          }
        })
        .finally(() => setWallpaperOfTheDayLoading(false));
    };

    loadFeaturedSections();
  }, [currentDeviceOrientation, genericFetchWallpapers]);

  const handleDeviceOrientationChange = (newCategory: DeviceOrientationCategory) => {
       if (newCategory !== currentDeviceOrientation) {
           setCurrentDeviceOrientation(newCategory);
           setSearchTerm('Explore'); 
           setPage(1);
           setWallpapers([]);
           setHasMore(true);
       }
   };

   const handleWallpaperCategorySelect = (categoryValue: string) => {
    setSearchTerm(categoryValue);
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
      fetchBrowseAllWallpapers(searchTerm, currentDeviceOrientation, nextPage, true);
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

  const handleWotdDownload = async (wallpaperToDownload: PexelsPhoto | null) => {
    if (!wallpaperToDownload) return;
    const photographerName = wallpaperToDownload.photographer.replace(/[^a-zA-Z0-9_-\s]/g, '').replace(/\s+/g, '_');
    const filename = `wallify_wotd_${photographerName}_${wallpaperToDownload.id}.jpg`;
    toast({
        title: "Download Starting",
        description: `Preparing ${filename} for download...`,
      });
    try {
      await downloadFile(wallpaperToDownload.src.original, filename);
      toast({
        title: "Download Complete",
        description: `${filename} has been downloaded.`,
      });
    } catch (error) {
      console.error('Error downloading wallpaper:', error);
       toast({
        title: "Download Failed",
        description: "Could not download the wallpaper. Please try again.",
        variant: "destructive",
      });
    }
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

  const explorerPageSchema: MinimalWithContext<SchemaWebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Explore Wallpapers - Wallify',
    url: `${BASE_URL}explorer`,
    description: 'Discover a vast collection of stunning, high-quality wallpapers. Explore different categories and find the perfect background for your desktop or smartphone on Wallify.',
    keywords: 'explore wallpapers, wallpaper gallery, Pexels wallpapers, discover backgrounds, new wallpapers, wallpaper categories, Wallify explorer, trending wallpapers, editor picks, daily wallpaper',
  };


  return (
    <>
      <StructuredData data={explorerPageSchema} />
      {imageSchema && <StructuredData data={imageSchema} />}
       <GlobalHeader
        currentDeviceOrientation={currentDeviceOrientation}
        onDeviceOrientationChange={handleDeviceOrientationChange}
        onWallpaperCategorySelect={handleWallpaperCategorySelect}
        onSearchSubmit={handleSearchSubmit}
        initialSearchTerm={searchTerm}
        showExplorerLink={false} 
      />

      <main className={cn(
          "flex-grow container mx-auto max-w-full px-2 py-6 sm:px-4 sm:py-8 md:px-6 lg:px-8",
          "space-y-10 md:space-y-12 lg:space-y-16" // Added more generous vertical spacing
        )}>
        <div className="mt-0 mb-4 sm:my-8 text-center px-2"> {/* Reduced top margin for title section */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary tracking-tight">Wallpaper Explorer</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
                Discover trending, popular, and new wallpapers. Use the filters in the header or search to find your perfect background.
            </p>
        </div>

        {/* Featured Content Section */}
        <div className="space-y-10 md:space-y-12 lg:space-y-14"> {/* Consistent spacing for featured sections */}
            <WallpaperOfTheDay
            wallpaper={wallpaperOfTheDay}
            loading={wallpaperOfTheDayLoading}
            orientation={currentDeviceOrientation}
            onViewClick={openModal}
            onDownloadClick={handleWotdDownload}
            />

            <WallpaperSection
            title="Trending Wallpapers"
            wallpapers={trendingWallpapers}
            loading={trendingLoading}
            orientation={currentDeviceOrientation}
            onWallpaperClick={openModal}
            itemCount={10} // Increased count for carousels
            />

            <WallpaperSection
            title="Editor's Picks"
            wallpapers={editorsPicks}
            loading={editorsPicksLoading}
            orientation={currentDeviceOrientation}
            onWallpaperClick={openModal}
            itemCount={10}
            />

            <WallpaperSection
            title="Popular Choices"
            wallpapers={mostDownloaded}
            loading={mostDownloadedLoading}
            orientation={currentDeviceOrientation}
            onWallpaperClick={openModal}
            itemCount={10}
            />

            <WallpaperSection
            title="Fresh Finds"
            wallpapers={recentlyAdded}
            loading={recentlyAddedLoading}
            orientation={currentDeviceOrientation}
            onWallpaperClick={openModal}
            itemCount={10}
            />
        </div>

        {/* Browse All Section - Title moved below the grid */}
        <section className="mt-10 md:mt-12 lg:mt-16">
            {loading && wallpapers.length === 0 ? (
                <div className={`grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 p-1`}>
                    {[...Array(18)].map((_, i) => ( // Show more skeletons for initial load
                    <Skeleton key={`initial-skeleton-${i}`} className={`${gridAspectRatio} w-full rounded-lg shadow-sm`} />
                    ))}
                </div>
            ) : (
                <WallpaperGrid
                    photos={wallpapers}
                    orientation={currentDeviceOrientation}
                    onPhotoClick={openModal}
                />
            )}

            <h2 className="text-xl sm:text-2xl font-semibold text-center text-primary mt-6 sm:mt-8 mb-4 sm:mb-6 px-1">
            {searchTerm === "Explore" ? `Browse All ${currentDeviceOrientation === 'desktop' ? 'Desktop' : 'Phone'} Wallpapers` : `Results for "${searchTerm}"`}
            </h2>


            {hasMore && !loading && wallpapers.length > 0 && (
                <div className="flex justify-center mt-6 sm:mt-8 mb-4">
                    <Button onClick={handleLoadMore} variant="outline" size="lg" className="text-sm px-6 py-2.5">
                    Load More
                    </Button>
                </div>
            )}

            {loading && wallpapers.length > 0 && (
                 <div className={`grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 p-1 mt-4`}>
                    {[...Array(6)].map((_, i) => (
                    <Skeleton key={`loading-skeleton-${i}`} className={`${gridAspectRatio} w-full rounded-lg shadow-sm`} />
                    ))}
                </div>
            )}
        </section>
      </main>

      <PreviewDialog
        photo={selectedWallpaper}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}
