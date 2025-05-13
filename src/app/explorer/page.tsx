
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


const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY || "lc7gpWWi2bcrekjM32zdi1s68YDYmEWMeudlsDNNMVEicIIke3G8Iamw";
const PEXELS_API_URL = 'https://api.pexels.com/v1';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nayanshirpure.github.io/Wallify/';


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
    const effectiveApiKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
    const placeholderKey = "lc7gpWWi2bcrekjM32zdi1s68YDYmEWMeudlsDNNMVEicIIke3G8Iamw";
    const isApiKeyMissing = !effectiveApiKey || effectiveApiKey === placeholderKey;

    if (isApiKeyMissing) {
      console.warn(`Pexels API key is missing or placeholder for ${endpoint}. Displaying mock data.`);
      const mockPhoto: PexelsPhoto = {
        id: Date.now(),
        width: 1080,
        height: 1920,
        url: `https://picsum.photos/seed/${endpoint}${Object.values(params).join('')}/1080/1920`,
        photographer: 'Mock Photographer',
        photographer_url: 'https://example.com',
        photographer_id: 1,
        avg_color: '#000000',
        src: {
          original: `https://picsum.photos/seed/${endpoint}${Object.values(params).join('')}/1080/1920`,
          large2x: `https://picsum.photos/seed/${endpoint}${Object.values(params).join('')}/1080/1920`,
          large: `https://picsum.photos/seed/${endpoint}${Object.values(params).join('')}/800/1200`,
          medium: `https://picsum.photos/seed/${endpoint}${Object.values(params).join('')}/400/600`,
          small: `https://picsum.photos/seed/${endpoint}${Object.values(params).join('')}/200/300`,
          portrait: `https://picsum.photos/seed/${endpoint}${Object.values(params).join('')}/800/1200`,
          landscape: `https://picsum.photos/seed/${endpoint}${Object.values(params).join('')}/1200/800`,
          tiny: `https://picsum.photos/seed/${endpoint}${Object.values(params).join('')}/20/30`,
        },
        liked: false,
        alt: `Mock wallpaper for ${endpoint}`,
      };
      if (process.env.NODE_ENV === 'development') {
          toast({
            title: "API Key Missing",
            description: `Pexels API key not found for ${endpoint}. Displaying mock data.`,
            variant: "default",
          });
      }
      return isSingleItem ? [mockPhoto] : Array(10).fill(null).map((_,i)=>({...mockPhoto, id: mockPhoto.id+i, alt: `${mockPhoto.alt} ${i}`}));
    }

    const queryParams = new URLSearchParams();
    for (const key in params) {
      queryParams.append(key, String(params[key]));
    }
    
    const apiUrl = `${PEXELS_API_URL}/${endpoint}?${queryParams.toString()}`;

    try {
      const response = await fetch(apiUrl, { headers: { Authorization: effectiveApiKey } });
      if (!response.ok) {
        if (response.status === 401) throw new Error("Pexels API key invalid");
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: PexelsResponse = await response.json();
      const photos = data.photos || (isSingleItem && data && 'id' in data ? [data as PexelsPhoto] : []); 
      return isSingleItem && photos.length > 0 ? [photos[0]] : photos;
    } catch (error: any) {
      console.error(`Error fetching from ${endpoint}:`, error.message);
      if (error.message === "Pexels API key invalid") {
          if (process.env.NODE_ENV === 'development') {
            toast({ title: "API Key Invalid", description: "Pexels API key is invalid.", variant: "destructive" });
          } else {
            toast({ title: "Auth Error", description: "Could not authenticate for featured content.", variant: "destructive" });
          }
      } else {
        toast({ title: "Fetch Error", description: `Failed to fetch ${endpoint} content.`, variant: "destructive" });
      }
      return [];
    }
  }, [toast]);


   const fetchBrowseAllWallpapers = useCallback(async (query: string, category: DeviceOrientationCategory, pageNum: number = 1, append: boolean = false) => {
    const effectiveApiKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
    const placeholderKey = "lc7gpWWi2bcrekjM32zdi1s68YDYmEWMeudlsDNNMVEicIIke3G8Iamw";
    const isApiKeyMissing = !effectiveApiKey || effectiveApiKey === placeholderKey;
    
    if (isApiKeyMissing) {
      setLoading(false);
      setHasMore(pageNum < 3); 
      const mockPhotos: PexelsPhoto[] = Array.from({ length: 15 }).map((_, i) => ({
        id: i + pageNum * 100, 
        width: 1080, height: 1920, url: `https://picsum.photos/seed/${query}${category}${i}${pageNum}/1080/1920`,
        photographer: 'Mock Photographer', photographer_url: 'https://example.com', photographer_id: i,
        avg_color: '#000000',
        src: { original: `https://picsum.photos/seed/${query}${category}${i}${pageNum}/1080/1920`, large2x: `https://picsum.photos/seed/${query}${category}${i}${pageNum}/1080/1920`, large: `https://picsum.photos/seed/${query}${category}${i}${pageNum}/800/1200`, medium: `https://picsum.photos/seed/${query}${category}${i}${pageNum}/400/600`, small: `https://picsum.photos/seed/${query}${category}${i}${pageNum}/200/300`, portrait: `https://picsum.photos/seed/${query}${category}${i}${pageNum}/800/1200`, landscape: `https://picsum.photos/seed/${query}${category}${i}${pageNum}/1200/800`, tiny: `https://picsum.photos/seed/${query}${category}${i}${pageNum}/20/30` },
        liked: false, alt: `Mock wallpaper for ${query} ${i} page ${pageNum}`,
      }));
      setWallpapers(prev => append ? [...prev, ...mockPhotos] : mockPhotos);
      if (process.env.NODE_ENV === 'development') {
        toast({ title: "API Key Missing", description: "Displaying mock data for main grid.", variant: "default" });
      }
      return;
    }

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
      toast({ title: "Error", description: "Failed to fetch main wallpapers.", variant: "destructive" });
      setHasMore(false);
    } finally {
      setLoading(false);
    }
   }, [toast, genericFetchWallpapers]); 


  useEffect(() => {
    setPage(1); 
    setWallpapers([]); 
    setHasMore(true); 
    fetchBrowseAllWallpapers(searchTerm, currentDeviceOrientation, 1, false);
  }, [searchTerm, currentDeviceOrientation, fetchBrowseAllWallpapers]);

  useEffect(() => {
    const loadFeaturedSections = async () => {
      const orientationParam = currentDeviceOrientation === 'desktop' ? 'landscape' : 'portrait';

      setTrendingLoading(true);
      genericFetchWallpapers('curated', { orientation: orientationParam, per_page: 10 })
        .then(setTrendingWallpapers)
        .catch(err => console.error("Trending fetch error:", err))
        .finally(() => setTrendingLoading(false));

      setEditorsPicksLoading(true);
      genericFetchWallpapers('search', { query: "Creative Art", orientation: orientationParam, per_page: 10 })
        .then(setEditorsPicks)
        .catch(err => console.error("Editor's Picks fetch error:", err))
        .finally(() => setEditorsPicksLoading(false));
      
      setMostDownloadedLoading(true);
      genericFetchWallpapers('search', { query: "Popular Backgrounds", orientation: orientationParam, per_page: 10 })
        .then(setMostDownloaded)
        .catch(err => console.error("Most Downloaded fetch error:", err))
        .finally(() => setMostDownloadedLoading(false));

      setRecentlyAddedLoading(true);
      genericFetchWallpapers('search', { query: "New Digital Art", orientation: orientationParam, per_page: 10 })
        .then(setRecentlyAdded)
        .catch(err => console.error("Recently Added fetch error:", err))
        .finally(() => setRecentlyAddedLoading(false));
        
      setWallpaperOfTheDayLoading(true);
      genericFetchWallpapers('search', { query: "Daily Inspiration Wallpaper", orientation: orientationParam, per_page: 1 }, true)
        .then(photos => setWallpaperOfTheDay(photos.length > 0 ? photos[0] : null))
        .catch(err => console.error("Wallpaper of the Day fetch error:", err))
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
        showExplorerLink={false} // Hide "Explorer" link on the Explorer page itself
      />

      <main className="flex-grow container mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="my-4 sm:my-6 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary">Explore Wallpapers</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">Discover trending, popular, and new wallpapers. Use the filters in the header or search to find your perfect wallpaper.</p>
        </div>
        
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
          itemCount={8}
        />

        <WallpaperSection
          title="Editor's Picks"
          wallpapers={editorsPicks}
          loading={editorsPicksLoading}
          orientation={currentDeviceOrientation}
          onWallpaperClick={openModal} 
          itemCount={8}
        />
        
        <WallpaperSection
          title="Popular Choices" 
          wallpapers={mostDownloaded}
          loading={mostDownloadedLoading}
          orientation={currentDeviceOrientation}
          onWallpaperClick={openModal} 
          itemCount={8}
        />

        <WallpaperSection
          title="Fresh Finds" 
          wallpapers={recentlyAdded}
          loading={recentlyAddedLoading}
          orientation={currentDeviceOrientation}
          onWallpaperClick={openModal} 
          itemCount={8}
        />
        
        <h2 className="text-xl sm:text-2xl font-semibold text-primary mt-8 mb-3 sm:mb-4 px-1">
          {searchTerm === "Explore" ? `Browse All ${currentDeviceOrientation === 'desktop' ? 'Desktop' : 'Phone'} Wallpapers` : `Browsing: "${searchTerm}"`} 
        </h2>

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
