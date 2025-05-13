
'use client';

import type { PexelsPhoto, PexelsResponse, DeviceOrientationCategory } from '@/types/pexels';
import React, { useState, useEffect, useCallback } from 'react';
// Image component is used within WallpaperGrid and PreviewDialog
import Link from 'next/link'; 
// useRouter is not directly used here anymore for search, SearchBar handles it
import { Button } from '@/components/ui/button';
import { Menu, Camera } from 'lucide-react'; 
// Dialog related imports are for the main PreviewDialog
import { Dialog } from '@/components/ui/dialog'; // Only Dialog root, content is PreviewDialog
import { PreviewDialog } from '@/components/wallpaper/PreviewDialog'; // Import the enhanced PreviewDialog
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
// downloadFile utility is now primarily used within PreviewDialog
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
import type { MinimalThing, MinimalWithContext } from '@/types/schema-dts';
import { ThemeToggle } from '@/components/theme-toggle'; 
import { SearchBar } from '@/components/wallpaper/SearchBar'; 
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';


const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY || "lc7gpWWi2bcrekjM32zdi1s68YDYmEWMeudlsDNNMVEicIIke3G8Iamw";
const PEXELS_API_URL = 'https://api.pexels.com/v1';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('Wallpaper'); 
  const [currentCategory, setCurrentCategory] = useState<DeviceOrientationCategory>('smartphone');
  const [wallpapers, setWallpapers] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWallpaper, setSelectedWallpaper] = useState<PexelsPhoto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  // const router = useRouter(); // Not used directly

   const fetchWallpapers = useCallback(async (query: string, category: DeviceOrientationCategory, pageNum: number = 1, append: boolean = false) => {
    if (!PEXELS_API_KEY) {
      console.error("Pexels API key is missing.");
      if (process.env.NODE_ENV === 'development') {
          toast({
            title: "API Key Error",
            description: "Pexels API key is not configured. Please add NEXT_PUBLIC_PEXELS_API_KEY to your environment variables.",
            variant: "destructive",
          });
      } else {
         toast({
            title: "Configuration Error",
            description: "Could not fetch wallpapers due to a configuration issue.",
            variant: "destructive",
         });
      }
      setLoading(false);
      setHasMore(false);
      return;
    }

    setLoading(true);
    const orientation = category === 'desktop' ? 'landscape' : 'portrait';
    let finalQuery = query.trim() || 'Wallpaper'; 

    try {
      const apiUrl = `${PEXELS_API_URL}/search?query=${encodeURIComponent(finalQuery)}&orientation=${orientation}&per_page=30&page=${pageNum}`;
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      });

      if (!response.ok) {
         if (response.status === 401) {
            console.error("Pexels API key is invalid or unauthorized.");
            if (process.env.NODE_ENV === 'development') {
                 toast({
                    title: "API Key Invalid",
                    description: "The configured Pexels API key is invalid or unauthorized.",
                    variant: "destructive",
                 });
             } else {
                  toast({
                    title: "Authentication Error",
                    description: "Could not authenticate with the image provider.",
                    variant: "destructive",
                });
             }
             setHasMore(false);
         } else {
             console.error(`HTTP error! status: ${response.status}, URL: ${apiUrl}`);
             toast({ title: "API Error", description: `Failed to fetch: ${response.statusText}`, variant: "destructive" });
             setHasMore(false); // set hasMore to false on API error
         }
      } else {
            const data: PexelsResponse = await response.json();
            const newPhotos = data.photos || [];

            setWallpapers(prev => {
              const combined = append ? [...prev, ...newPhotos] : newPhotos;
              const uniqueMap = new Map(combined.map(item => [`${item.id}-${category}`, item])); // Key includes category for uniqueness
              return Array.from(uniqueMap.values());
            });
            setHasMore(!!data.next_page && newPhotos.length > 0 && newPhotos.length === 30); // Check if next_page exists and if we got a full page
      }

    } catch (error) {
      console.error("Error fetching wallpapers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch wallpapers. Please check your connection and try again.",
        variant: "destructive",
      });
       setHasMore(false);
    } finally {
      setLoading(false);
    }
   }, [toast]); // Removed PEXELS_API_KEY from dependency array as it's a const at module level


  useEffect(() => {
    setPage(1);
    setWallpapers([]);
    setHasMore(true); 
    fetchWallpapers(searchTerm, currentCategory, 1, false);
  }, [searchTerm, currentCategory, fetchWallpapers]);

  const handleDeviceCategoryChange = (newCategory: DeviceOrientationCategory) => {
       if (newCategory !== currentCategory) {
           setCurrentCategory(newCategory);
       }
   };

   const handleWallpaperCategorySelect = (categoryValue: string) => {
    setSearchTerm(categoryValue); 
  };


  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchWallpapers(searchTerm, currentCategory, nextPage, true);
    }
  };


  const openModal = (wallpaper: PexelsPhoto) => {
    setSelectedWallpaper(wallpaper);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Delay clearing selectedWallpaper to allow for exit animation of dialog
    setTimeout(() => setSelectedWallpaper(null), 300); 
  };

  // handleDownload function specific to this page's direct download (if any) is removed.
  // PreviewDialog now handles its own download logic.

   const gridAspectRatio = currentCategory === 'desktop' ? 'aspect-video' : 'aspect-[9/16]';

  const imageSchema: MinimalWithContext<MinimalThing> | null = selectedWallpaper ? {
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
    },
    copyrightHolder: { 
      '@type': 'Person',
      name: selectedWallpaper.photographer,
      url: selectedWallpaper.photographer_url,
    },
    license: 'https://www.pexels.com/license/',
    acquireLicensePage: selectedWallpaper.url, 
    provider: {
      '@type': 'Organization',
      name: 'Pexels',
      url: 'https://www.pexels.com',
    },
  } : null;


  return (
    <>
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
            <h1 className="text-3xl sm:text-4xl font-bold text-primary">
              {searchTerm === "Wallpaper" ? "Discover Your Next Wallpaper" : `Displaying: "${searchTerm}"`}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">Browse our collection or use the search in the header.</p>
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

      {/* Use the enhanced PreviewDialog component */}
      <PreviewDialog
        photo={selectedWallpaper}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}
