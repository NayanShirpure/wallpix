
'use client';

import type { PexelsPhoto, PexelsResponse, DeviceOrientationCategory } from '@/types/pexels';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link'; 
import { Button } from '@/components/ui/button';
import { Download, Menu, Camera } from 'lucide-react'; 
import { Dialog } from '@/components/ui/dialog';
import { PreviewDialog } from '@/components/wallpaper/PreviewDialog'; 
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { downloadFile } from '@/lib/utils'; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { wallpaperFilterCategoryGroups, deviceOrientationTabs } from '@/config/categories';
import { StructuredData } from '@/components/structured-data';
// Updated import for local minimal types, including specific schema types
import type { ImageObject as SchemaImageObject, WebPage as SchemaWebPage, MinimalWithContext, Person as SchemaPerson, Organization as SchemaOrganization } from '@/types/schema-dts';
import { WallpaperSection } from '@/components/wallpaper-section';
import { WallpaperOfTheDay } from '@/components/wallpaper-of-the-day';
import { ThemeToggle } from '@/components/theme-toggle'; 
import { SearchBar } from '@/components/wallpaper/SearchBar'; 
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';


const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY || "lc7gpWWi2bcrekjM32zdi1s68YDYmEWMeudlsDNNMVEicIIke3G8Iamw";
const PEXELS_API_URL = 'https://api.pexels.com/v1';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nayanshirpure.github.io/Wallify/';


export default function ExplorerPage() {
  const [searchTerm, setSearchTerm] = useState('Explore'); 
  const [currentCategory, setCurrentCategory] = useState<DeviceOrientationCategory>('smartphone');
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
    if (!PEXELS_API_KEY) {
      console.error("Pexels API key is missing.");
       // Display mock data or a specific message if API key is missing
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
      return isSingleItem ? [mockPhoto] : Array(10).fill(mockPhoto).map((p,i)=>({...p, id: p.id+i}));
    }

    const queryParams = new URLSearchParams();
    for (const key in params) {
      queryParams.append(key, String(params[key]));
    }
    
    const apiUrl = `${PEXELS_API_URL}/${endpoint}?${queryParams.toString()}`;

    try {
      const response = await fetch(apiUrl, { headers: { Authorization: PEXELS_API_KEY } });
      if (!response.ok) {
        if (response.status === 401) throw new Error("Pexels API key invalid");
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: PexelsResponse = await response.json();
      const photos = data.photos || [];
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
    if (!PEXELS_API_KEY) {
      setLoading(false);
      setHasMore(false);
      // Mock data handled by genericFetchWallpapers if key is missing
      // Fallback for direct call:
      const mockPhotos: PexelsPhoto[] = Array.from({ length: 15 }).map((_, i) => ({
        id: i + pageNum * 100, // semi-unique id
        width: 1080, height: 1920, url: `https://picsum.photos/seed/${query}${category}${i}/1080/1920`,
        photographer: 'Mock Photographer', photographer_url: 'https://example.com', photographer_id: i,
        avg_color: '#000000',
        src: { original: `https://picsum.photos/seed/${query}${category}${i}/1080/1920`, large2x: `https://picsum.photos/seed/${query}${category}${i}/1080/1920`, large: `https://picsum.photos/seed/${query}${category}${i}/800/1200`, medium: `https://picsum.photos/seed/${query}${category}${i}/400/600`, small: `https://picsum.photos/seed/${query}${category}${i}/200/300`, portrait: `https://picsum.photos/seed/${query}${category}${i}/800/1200`, landscape: `https://picsum.photos/seed/${query}${category}${i}/1200/800`, tiny: `https://picsum.photos/seed/${query}${category}${i}/20/30` },
        liked: false, alt: `Mock wallpaper for ${query} ${i}`,
      }));
      setWallpapers(prev => append ? [...prev, ...mockPhotos] : mockPhotos);
      if (process.env.NODE_ENV === 'development') {
        toast({ title: "API Key Missing", description: "Displaying mock data for main grid.", variant: "default" });
      }
      return;
    }

    setLoading(true);
    const orientation = category === 'desktop' ? 'landscape' : 'portrait';
    let finalQuery = query.trim() || 'Popular Wallpaper'; 

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
    fetchBrowseAllWallpapers(searchTerm, currentCategory, 1, false);
  }, [searchTerm, currentCategory, fetchBrowseAllWallpapers]);

  useEffect(() => {
    const loadFeaturedSections = async () => {
      const orientationParam = currentCategory === 'desktop' ? 'landscape' : 'portrait';

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
      genericFetchWallpapers('search', { query: "Daily Inspiration", orientation: orientationParam, per_page: 1 }, true)
        .then(photos => setWallpaperOfTheDay(photos.length > 0 ? photos[0] : null))
        .catch(err => console.error("Wallpaper of the Day fetch error:", err))
        .finally(() => setWallpaperOfTheDayLoading(false));
    };

    loadFeaturedSections();
  }, [currentCategory, genericFetchWallpapers]);

  const handleDeviceCategoryChange = (newCategory: DeviceOrientationCategory) => {
       if (newCategory !== currentCategory) {
           setCurrentCategory(newCategory); 
           setSearchTerm('Explore'); 
       }
   };

   const handleWallpaperCategorySelect = (categoryValue: string) => {
    setSearchTerm(categoryValue);
  };


  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBrowseAllWallpapers(searchTerm, currentCategory, nextPage, true);
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

   const gridAspectRatio = currentCategory === 'desktop' ? 'aspect-video' : 'aspect-[9/16]';
   
  // Correctly typed with MinimalWithContext<SchemaImageObject>
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

  // Correctly typed with MinimalWithContext<SchemaWebPage>
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
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-4">
          <Link href="/" className="mr-3 flex items-center space-x-2 sm:mr-6">
            <Camera className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-primary">Wallify</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
            <div className="w-full flex-1 sm:w-auto sm:flex-none">
               <SearchBar />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto max-w-7xl p-4 md:p-6">
        <div className="my-6 sm:my-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary">Explore Wallpapers</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">Discover trending, popular, and new wallpapers. Use the filters below or search in the header.</p>
        </div>
        
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 p-2 rounded-lg bg-muted/50">
              <Tabs value={currentCategory} onValueChange={(value) => handleDeviceCategoryChange(value as DeviceOrientationCategory)} className="w-auto">
                <TabsList className="grid grid-cols-2 h-9 text-xs sm:h-10 sm:text-sm">
                  {deviceOrientationTabs.map(opt => (
                    <TabsTrigger key={opt.value} value={opt.value} className="px-3 py-1.5 sm:px-4 sm:py-2">{opt.label}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-9 text-xs sm:h-10 sm:text-sm">
                    <Menu className="mr-1.5 h-4 w-4" />
                    Categories
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-64 max-h-96 overflow-y-auto">
                  <DropdownMenuLabel>Filter Wallpapers By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {wallpaperFilterCategoryGroups.map((group, groupIndex) => (
                    <React.Fragment key={group.groupLabel}>
                      <DropdownMenuLabel className="text-xs text-muted-foreground px-2 pt-2">{group.groupLabel}</DropdownMenuLabel>
                      {group.categories.map((cat) => (
                        <DropdownMenuItem key={cat.value} onSelect={() => handleWallpaperCategorySelect(cat.value)}>
                          {cat.label}
                        </DropdownMenuItem>
                      ))}
                       {groupIndex < wallpaperFilterCategoryGroups.length - 1 && <DropdownMenuSeparator />}
                    </React.Fragment>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
        </div>


        <WallpaperOfTheDay
          wallpaper={wallpaperOfTheDay}
          loading={wallpaperOfTheDayLoading}
          orientation={currentCategory}
          onViewClick={openModal} 
          onDownloadClick={handleWotdDownload} 
        />

        <WallpaperSection
          title="Trending Wallpapers"
          wallpapers={trendingWallpapers}
          loading={trendingLoading}
          orientation={currentCategory}
          onWallpaperClick={openModal} 
          itemCount={8}
        />

        <WallpaperSection
          title="Editor's Picks"
          wallpapers={editorsPicks}
          loading={editorsPicksLoading}
          orientation={currentCategory}
          onWallpaperClick={openModal} 
          itemCount={8}
        />
        
        <WallpaperSection
          title="Popular Choices" 
          wallpapers={mostDownloaded}
          loading={mostDownloadedLoading}
          orientation={currentCategory}
          onWallpaperClick={openModal} 
          itemCount={8}
        />

        <WallpaperSection
          title="Fresh Finds" 
          wallpapers={recentlyAdded}
          loading={recentlyAddedLoading}
          orientation={currentCategory}
          onWallpaperClick={openModal} 
          itemCount={8}
        />
        
        <h2 className="text-xl sm:text-2xl font-semibold text-primary mt-8 mb-3 sm:mb-4 px-1">
          {searchTerm === "Explore" ? "Browse All" : `Browsing: "${searchTerm}"`} 
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
                orientation={currentCategory}
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
