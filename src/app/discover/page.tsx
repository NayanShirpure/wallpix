
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// Removed Card, CardContent, CardHeader, CardTitle as category display is simplified
import { ArrowRight } from 'lucide-react';
import { GlobalHeader } from '@/components/layout/GlobalHeader';
import type { DeviceOrientationCategory, PexelsPhoto, PexelsResponse } from '@/types/pexels';
import { WallpaperOfTheDay } from '@/components/wallpaper-of-the-day';
import { WallpaperSection } from '@/components/wallpaper-section';
import { PreviewDialog } from '@/components/wallpaper/PreviewDialog';
import { useToast } from '@/hooks/use-toast';
import { downloadFile } from '@/lib/utils';
import { getCuratedPhotos, searchPhotos as pexelsSearchPhotosLib } from '@/lib/pexels';

interface DiscoverCategory {
  id: string;
  title: string;
  description: string;
  query: string;
  imageUrl: string;
  dataAiHint: string;
  imageWidth: number; // Added for explicit image dimensions
  imageHeight: number; // Added for explicit image dimensions
}

const discoverPageCategories: DiscoverCategory[] = [
  { id: 'abstract', title: 'Abstract Art', description: 'Explore mind-bending patterns and colors.', query: 'Abstract Art', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'abstract colorful', imageWidth: 600, imageHeight: 400 },
  { id: 'nature', title: 'Nature Escapes', description: 'Breathtaking landscapes and serene wilderness.', query: 'Nature Landscape', imageUrl: 'https://placehold.co/500x700.png', dataAiHint: 'nature forest', imageWidth: 500, imageHeight: 700 },
  { id: 'space', title: 'Cosmic Wonders', description: 'Journey through galaxies and nebulae.', query: 'Outer Space Galaxy', imageUrl: 'https://placehold.co/600x450.png', dataAiHint: 'space galaxy', imageWidth: 600, imageHeight: 450 },
  { id: 'minimalist', title: 'Minimalist Vibes', description: 'Clean lines and simple elegance.', query: 'Minimalist Design', imageUrl: 'https://placehold.co/400x600.png', dataAiHint: 'minimalist white', imageWidth: 400, imageHeight: 600 },
  { id: 'animals', title: 'Wild Encounters', description: 'Majestic creatures from around the globe.', query: 'Wildlife Animals', imageUrl: 'https://placehold.co/700x500.png', dataAiHint: 'wildlife animal', imageWidth: 700, imageHeight: 500 },
  { id: 'cityscapes', title: 'Urban Dreams', description: 'Iconic city skylines and vibrant streets.', query: 'Cityscape Night', imageUrl: 'https://placehold.co/600x350.png', dataAiHint: 'city night', imageWidth: 600, imageHeight: 350 },
  { id: 'dark_moody', title: 'Dark & Moody', description: 'Atmospheric and intriguing dark themes.', query: 'Dark Moody Forest', imageUrl: 'https://placehold.co/450x600.png', dataAiHint: 'dark abstract', imageWidth: 450, imageHeight: 600 },
  { id: 'vibrant', title: 'Vibrant Hues', description: 'Explosions of color to energize your screen.', query: 'Vibrant Colorful Pattern', imageUrl: 'https://placehold.co/600x600.png', dataAiHint: 'colorful vibrant', imageWidth: 600, imageHeight: 600 },
];

export default function DiscoverPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentDeviceOrientation, setCurrentDeviceOrientation] = useState<DeviceOrientationCategory>('smartphone');
  
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

  const [selectedWallpaper, setSelectedWallpaper] = useState<PexelsPhoto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSectionPhotos = useCallback(async (
    query: string,
    setter: React.Dispatch<React.SetStateAction<PexelsPhoto[]>>,
    loader: React.Dispatch<React.SetStateAction<boolean>>,
    orientation?: 'landscape' | 'portrait' | 'square',
    perPage: number = 10
  ) => {
    loader(true);
    const response = await pexelsSearchPhotosLib(query, 1, perPage, orientation);
    if (response && response.photos) {
      setter(response.photos);
    } else {
      setter([]);
      console.warn(`Failed to fetch photos for query: ${query}`);
    }
    loader(false);
  }, []);

  useEffect(() => {
    const orientationParam = currentDeviceOrientation === 'desktop' ? 'landscape' : 'portrait';

    setLoadingWOTD(true);
    getCuratedPhotos(1, 1).then(data => {
      if (data && data.photos && data.photos.length > 0) {
        setWallpaperOfTheDay(data.photos[0]);
      } else {
        setWallpaperOfTheDay(null);
        console.warn("Failed to fetch wallpaper of the day.");
      }
      setLoadingWOTD(false);
    });

    fetchSectionPhotos("Trending Abstract", setTrendingWallpapers, setLoadingTrending, orientationParam);
    fetchSectionPhotos("Editor's Choice Serene Landscapes", setEditorsPicks, setLoadingEditorsPicks, orientationParam);
    fetchSectionPhotos("Autumn Forest", setSeasonalWallpapers, setLoadingSeasonal, orientationParam);
    fetchSectionPhotos("Cyberpunk City", setThemeCollectionCyberpunk, setLoadingThemeCyberpunk, orientationParam);
    fetchSectionPhotos("Vintage Cars", setThemeCollectionVintage, setLoadingThemeVintage, orientationParam);

  }, [currentDeviceOrientation, fetchSectionPhotos]);

  const handleDeviceOrientationChange = (newCategory: DeviceOrientationCategory) => {
    setCurrentDeviceOrientation(newCategory);
  };

  const handleWallpaperCategorySelect = (categoryValue: string) => {
    router.push(`/search?query=${encodeURIComponent(categoryValue)}`);
  };

  const handleSearchSubmit = (searchTerm: string) => {
    if (searchTerm.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleViewWallpaper = (photo: PexelsPhoto) => {
    setSelectedWallpaper(photo);
    setIsModalOpen(true);
  };

  const handleDownloadWallpaper = async (photo: PexelsPhoto | null) => {
    if (!photo) return;
    const photographerName = photo.photographer.replace(/[^a-zA-Z0-9_-\s]/g, '').replace(/\s+/g, '_');
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

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedWallpaper(null), 300);
  };

  return (
    <>
      <GlobalHeader
        currentDeviceOrientation={currentDeviceOrientation}
        onDeviceOrientationChange={handleDeviceOrientationChange}
        onWallpaperCategorySelect={handleWallpaperCategorySelect}
        onSearchSubmit={handleSearchSubmit}
        initialSearchTerm="Discover" 
        navigateToSearchPage={true}
      />
      <main className="flex-grow container mx-auto max-w-7xl p-4 py-8 md:p-6 md:py-12 space-y-10 sm:space-y-12">
        
        <WallpaperOfTheDay
          wallpaper={wallpaperOfTheDay}
          loading={loadingWOTD}
          orientation={currentDeviceOrientation}
          onViewClick={handleViewWallpaper}
          onDownloadClick={handleDownloadWallpaper}
        />

        <WallpaperSection
          title="Trending Wallpapers"
          wallpapers={trendingWallpapers}
          loading={loadingTrending}
          orientation={currentDeviceOrientation}
          onWallpaperClick={handleViewWallpaper}
          itemCount={8}
        />

        <WallpaperSection
          title="Editor's Picks"
          wallpapers={editorsPicks}
          loading={loadingEditorsPicks}
          orientation={currentDeviceOrientation}
          onWallpaperClick={handleViewWallpaper}
          itemCount={8}
        />
        
        <WallpaperSection
          title="Autumn Vibes"
          wallpapers={seasonalWallpapers}
          loading={loadingSeasonal}
          orientation={currentDeviceOrientation}
          onWallpaperClick={handleViewWallpaper}
          itemCount={8}
        />

        <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary px-1">Theme-Based Collections</h2>
            <WallpaperSection
              title="Cyberpunk Worlds"
              wallpapers={themeCollectionCyberpunk}
              loading={loadingThemeCyberpunk}
              orientation={currentDeviceOrientation}
              onWallpaperClick={handleViewWallpaper}
              itemCount={6}
            />
            <WallpaperSection
              title="Vintage Rides"
              wallpapers={themeCollectionVintage}
              loading={loadingThemeVintage}
              orientation={currentDeviceOrientation}
              onWallpaperClick={handleViewWallpaper}
              itemCount={6}
            />
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6 px-1">Explore Popular Categories</h2>
          <div className="columns-1 xs:columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-4 gap-4 sm:gap-6">
            {discoverPageCategories.map((category) => (
              <Link key={category.id} href={`/search?query=${encodeURIComponent(category.query)}`} passHref legacyBehavior>
                <a className="block group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl focus-within:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus-within:-translate-y-1 mb-4 sm:mb-6 break-inside-avoid-column">
                  <Image
                    src={category.imageUrl}
                    alt={`Preview for ${category.title} category`}
                    width={category.imageWidth}
                    height={category.imageHeight}
                    className="object-cover w-full h-auto transition-transform duration-300 ease-in-out group-hover:scale-105"
                    data-ai-hint={category.dataAiHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4">
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
                </a>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <PreviewDialog
        photo={selectedWallpaper}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}
