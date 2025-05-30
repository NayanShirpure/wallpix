
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Monitor, Smartphone } from 'lucide-react';
import { GlobalHeader } from '@/components/layout/GlobalHeader';
import type { PexelsPhoto, PexelsPhotoOrientation } from '@/types/pexels';
import { WallpaperOfTheDay } from '@/components/wallpaper-of-the-day';
import { WallpaperSection } from '@/components/wallpaper-section';
import { useToast } from '@/hooks/use-toast';
import { downloadFile } from '@/lib/utils';
import { getCuratedPhotos, searchPhotos as pexelsSearchPhotosLib } from '@/lib/pexels';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface DiscoverCategory {
  id: string;
  title: string;
  description: string;
  query: string;
  imageUrl: string; // This will be the placehold.co URL
  dataAiHint: string;
  imageWidth: number;
  imageHeight: number;
  fetchedImageUrl?: string | null;
  imageLoading?: boolean;
}

const initialDiscoverPageCategories: DiscoverCategory[] = [
  { id: 'abstract', title: 'Abstract Art', description: 'Explore mind-bending patterns and colors.', query: 'Abstract Art', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'abstract colorful', imageWidth: 600, imageHeight: 400, imageLoading: true },
  { id: 'nature', title: 'Nature Escapes', description: 'Breathtaking landscapes and serene wilderness.', query: 'Nature Landscape', imageUrl: 'https://placehold.co/500x700.png', dataAiHint: 'nature forest', imageWidth: 500, imageHeight: 700, imageLoading: true },
  { id: 'space', title: 'Cosmic Wonders', description: 'Journey through galaxies and nebulae.', query: 'Outer Space Galaxy', imageUrl: 'https://placehold.co/600x450.png', dataAiHint: 'space galaxy', imageWidth: 600, imageHeight: 450, imageLoading: true },
  { id: 'minimalist', title: 'Minimalist Vibes', description: 'Clean lines and simple elegance.', query: 'Minimalist Design', imageUrl: 'https://placehold.co/400x600.png', dataAiHint: 'minimalist white', imageWidth: 400, imageHeight: 600, imageLoading: true },
  { id: 'animals', title: 'Wild Encounters', description: 'Majestic creatures from around the globe.', query: 'Wildlife Animals', imageUrl: 'https://placehold.co/700x500.png', dataAiHint: 'wildlife animal', imageWidth: 700, imageHeight: 500, imageLoading: true },
  { id: 'cityscapes', title: 'Urban Dreams', description: 'Iconic city skylines and vibrant streets.', query: 'Cityscape Night', imageUrl: 'https://placehold.co/600x350.png', dataAiHint: 'city night', imageWidth: 600, imageHeight: 350, imageLoading: true },
  { id: 'dark_moody', title: 'Dark & Moody', description: 'Atmospheric and intriguing dark themes.', query: 'Dark Moody Forest', imageUrl: 'https://placehold.co/450x600.png', dataAiHint: 'dark abstract', imageWidth: 450, imageHeight: 600, imageLoading: true },
  { id: 'vibrant', title: 'Vibrant Hues', description: 'Explosions of color to energize your screen.', query: 'Vibrant Colorful Pattern', imageUrl: 'https://placehold.co/600x600.png', dataAiHint: 'colorful vibrant', imageWidth: 600, imageHeight: 600, imageLoading: true },
];

export default function DiscoverPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [currentDeviceOrientation, setCurrentDeviceOrientation] = useState<'smartphone' | 'desktop'>('desktop');

  const [wallpaperOfTheDay, setWallpaperOfTheDay] = useState<PexelsPhoto | null>(null);
  const [loadingWOTD, setLoadingWOTD] = useState(true);

  const [trendingWallpapers, setTrendingWallpapers] = useState<PexelsPhoto[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  const [editorsPicks, setEditorsPicks] = useState<PexelsPhoto[]>([]);
  const [loadingEditorsPicks, setLoadingEditorsPicks] = useState(true);

  const [seasonalWallpapers, setSeasonalWallpapers] = useState<PexelsPhoto[]>([]);
  const [loadingSeasonal, setLoadingSeasonal] = useState(true);

  const [themeCollectionCyberpunk, setThemeCollectionCyberpunk] = useState<PexelsPhoto[]>([]);
  const [loadingThemeCyberpunk, setLoadingThemeCyberpunk] = useState(true);

  const [themeCollectionVintage, setThemeCollectionVintage] = useState<PexelsPhoto[]>([]);
  const [loadingThemeVintage, setLoadingThemeVintage] = useState(true);

  const [categories, setCategories] = useState<DiscoverCategory[]>(
    initialDiscoverPageCategories.map(cat => ({ ...cat, imageLoading: true, fetchedImageUrl: null }))
  );

  useEffect(() => {
    const orientationFromUrl = searchParams.get('orientation') as 'smartphone' | 'desktop';
    if (orientationFromUrl && (orientationFromUrl === 'smartphone' || orientationFromUrl === 'desktop')) {
      setCurrentDeviceOrientation(orientationFromUrl);
    }
  }, [searchParams]);

  const fetchSectionPhotos = useCallback(async (
    query: string,
    setter: React.Dispatch<React.SetStateAction<PexelsPhoto[]>>,
    loader: React.Dispatch<React.SetStateAction<boolean>>,
    perPage: number = 6
  ) => {
    loader(true);
    const pexelsOrientation: PexelsPhotoOrientation = currentDeviceOrientation === 'smartphone' ? 'portrait' : 'landscape';
    const response = await pexelsSearchPhotosLib(query, 1, perPage, pexelsOrientation);
    if (response && response.photos) {
      setter(response.photos);
    } else {
      setter([]);
      console.warn(`[Discover Page] Failed to fetch section photos for query: "${query}". Response was null or had no photos. This might be due to Pexels API issues (e.g., rate limits). Check console for more specific errors from 'fetchFromInternalAPI'.`);
    }
    loader(false);
  }, [currentDeviceOrientation]);

  useEffect(() => {
    setLoadingWOTD(true);
    getCuratedPhotos(1, 1).then(data => { 
      if (data && data.photos && data.photos.length > 0) {
        setWallpaperOfTheDay(data.photos[0]);
      } else {
        setWallpaperOfTheDay(null);
        console.warn("[Discover Page] Failed to fetch wallpaper of the day.");
      }
      setLoadingWOTD(false);
    });

    fetchSectionPhotos("Trending Abstract", setTrendingWallpapers, setLoadingTrending);
    fetchSectionPhotos("Editor's Choice Serene Landscapes", setEditorsPicks, setLoadingEditorsPicks);
    fetchSectionPhotos("Autumn Forest", setSeasonalWallpapers, setLoadingSeasonal);
    fetchSectionPhotos("Cyberpunk City", setThemeCollectionCyberpunk, setLoadingThemeCyberpunk);
    fetchSectionPhotos("Vintage Cars", setThemeCollectionVintage, setLoadingThemeVintage);

  }, [fetchSectionPhotos]);

  useEffect(() => {
    const pexelsOrientation: PexelsPhotoOrientation = currentDeviceOrientation === 'smartphone' ? 'portrait' : 'landscape';

    initialDiscoverPageCategories.forEach(catDefinition => { // Fetch for all categories
      setCategories(prev => prev.map(c => c.id === catDefinition.id ? { ...c, imageLoading: true } : c));
      pexelsSearchPhotosLib(catDefinition.query, 1, 1, pexelsOrientation)
        .then(response => {
          let imageUrl: string | null = null;
          if (response && response.photos && response.photos.length > 0) {
            const photo = response.photos[0];
            imageUrl = photo.src.large || photo.src.medium || photo.src.original;
          } else {
            console.warn(`[Discover Page] No image found for category "${catDefinition.title}" from Pexels. Falling back to placeholder.`);
          }
          setCategories(prevCategories =>
            prevCategories.map(c =>
              c.id === catDefinition.id
                ? { ...c, fetchedImageUrl: imageUrl, imageLoading: false }
                : c
            )
          );
        })
        .catch(error => {
          console.error(`[Discover Page] Error fetching image for category ${catDefinition.title}:`, error);
          setCategories(prevCategories =>
            prevCategories.map(c =>
              c.id === catDefinition.id ? { ...c, fetchedImageUrl: null, imageLoading: false } : c
            )
          );
        });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDeviceOrientation]); 

  const handleDeviceOrientationChange = useCallback((newOrientation: 'smartphone' | 'desktop') => {
    setCurrentDeviceOrientation(newOrientation);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('orientation', newOrientation);
    router.push(`/discover?${newSearchParams.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const handleWallpaperCategorySelect = useCallback((categoryValue: string) => {
    if (categoryValue.trim()) {
      const newSearchParams = new URLSearchParams();
      newSearchParams.set('query', categoryValue.trim());
      newSearchParams.set('orientation', currentDeviceOrientation); 
      router.push(`/search?${newSearchParams.toString()}`);
    }
  }, [router, currentDeviceOrientation]);

  const handleSearchSubmit = useCallback((searchTerm: string) => {
    console.log("Search submitted on Discover page, SearchBar will navigate:", searchTerm);
  }, []);

  const handleViewWallpaper = (photo: PexelsPhoto) => {
    const currentOrientationParam = searchParams.get('orientation') || 'desktop';
    router.push(`/photo/${photo.id}?orientation=${currentOrientationParam}`);
  };

  const handleDownloadWallpaper = async (photo: PexelsPhoto | null) => {
    if (!photo) return;
    const photographerName = photo.photographer.replace(/[^a-zA-Z0-9_\\-\\s]/g, '').replace(/\s+/g, '_');
    const filename = `wallify_${photographerName}_${photo.id}_original.jpg`;

    toast({
      title: "Download Starting",
      description: `Preparing ${filename} for download...`,
    });
    try {
      await downloadFile(photo.src.original, filename);
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

  return (
    <>
      <GlobalHeader
        currentDeviceOrientation={currentDeviceOrientation}
        onDeviceOrientationChange={handleDeviceOrientationChange}
        onWallpaperCategorySelect={handleWallpaperCategorySelect}
        // onSearchSubmit is handled by SearchBar
      />
      <main className="flex-grow container mx-auto max-w-7xl p-4 py-8 md:p-6 md:py-12 space-y-10 sm:space-y-12" aria-busy={loadingWOTD || loadingTrending || loadingEditorsPicks || loadingSeasonal || loadingThemeCyberpunk || loadingThemeVintage || categories.some(c => c.imageLoading)}>

        <WallpaperOfTheDay
          wallpaper={wallpaperOfTheDay}
          loading={loadingWOTD}
          onDownloadClick={handleDownloadWallpaper}
        />

        <WallpaperSection
          title="Trending Wallpapers"
          wallpapers={trendingWallpapers}
          loading={loadingTrending}
          onWallpaperClick={handleViewWallpaper}
          itemCount={6}
        />

        <WallpaperSection
          title="Editor's Picks"
          wallpapers={editorsPicks}
          loading={loadingEditorsPicks}
          onWallpaperClick={handleViewWallpaper}
          itemCount={6}
        />

        <WallpaperSection
          title="Autumn Vibes"
          wallpapers={seasonalWallpapers}
          loading={loadingSeasonal}
          onWallpaperClick={handleViewWallpaper}
          itemCount={6}
        />

        <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary px-1">Theme-Based Collections</h2>
            <WallpaperSection
              title="Cyberpunk Worlds"
              wallpapers={themeCollectionCyberpunk}
              loading={loadingThemeCyberpunk}
              onWallpaperClick={handleViewWallpaper}
              itemCount={6}
            />
            <WallpaperSection
              title="Vintage Rides"
              wallpapers={themeCollectionVintage}
              loading={loadingThemeVintage}
              onWallpaperClick={handleViewWallpaper}
              itemCount={6}
            />
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6 px-1">Explore Popular Categories</h2>
          <div className="columns-1 xs:columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-4 gap-4 sm:gap-6">
            {categories.map((category, index) => {
              const imageToDisplay = category.fetchedImageUrl || category.imageUrl; 
              const imageAltText = `Preview for ${category.title} category, showing ${category.dataAiHint}`;
              
              return (
                <div key={category.id} className="mb-4 sm:mb-6 break-inside-avoid-column">
                  <Link
                    href={`/search?query=${encodeURIComponent(category.query)}&orientation=${currentDeviceOrientation}`}
                    aria-label={`Explore ${category.title} wallpapers`}
                    className="block group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl focus-within:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus-within:-translate-y-1 aspect-[3/4]"
                  >
                      {category.imageLoading ? (
                        <Skeleton className="w-full h-full" />
                      ) : (
                        <Image
                          src={imageToDisplay}
                          alt={imageAltText}
                          fill
                          sizes="(max-width: 479px) 100vw, (max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
                          className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                          data-ai-hint={category.dataAiHint}
                          priority={index < 4} // Prioritize only the first few dynamically loaded category images
                        />
                      )}
                      <div className={cn(
                        "absolute inset-0 flex flex-col justify-end p-3 sm:p-4",
                        "bg-gradient-to-t from-black/70 via-black/40 to-transparent",
                        "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300"
                      )}>
                        <h3 className="text-white text-md sm:text-lg font-semibold line-clamp-2 leading-tight">
                          {category.title}
                        </h3>
                        <p className="text-gray-200 text-xs sm:text-sm mt-1 line-clamp-2 leading-snug">
                          {category.description}
                        </p>
                        <div className="mt-2 text-xs sm:text-sm font-medium text-accent flex items-center opacity-90 group-hover:opacity-100 group-hover:underline">
                          Explore <ArrowRight className="ml-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                      </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}

    