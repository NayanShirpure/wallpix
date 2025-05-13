
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { PexelsPhoto, PexelsResponse, DeviceOrientationCategory } from '@/types/pexels';
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';
import { PreviewDialog } from '@/components/wallpaper/PreviewDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AlertCircle, SearchIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PEXELS_API_URL = 'https://api.pexels.com/v1';
const FALLBACK_PEXELS_API_KEY = "lc7gpWWi2bcrekjM32zdi1s68YDYmEWMeudlsDNNMVEicIIke3G8Iamw"; // Fallback key

interface DiscoverSectionConfig {
  id: string;
  title: string;
  query: string;
  orientation: 'landscape' | 'portrait' | 'square' | undefined; // Pexels API orientation
  displayOrientation: DeviceOrientationCategory; // For WallpaperGrid: 'desktop' or 'smartphone'
  perPage?: number;
}

const discoverSectionsConfig: DiscoverSectionConfig[] = [
  { id: 'featured', title: 'Featured Collections', query: 'Minimalist Aesthetic', orientation: undefined, displayOrientation: 'desktop', perPage: 12 },
  { id: 'nature', title: 'Trending in Nature', query: 'Nature Landscape', orientation: 'landscape', displayOrientation: 'desktop', perPage: 12 },
  { id: 'abstract', title: 'Abstract Wonders', query: 'Abstract Art Colorful', orientation: undefined, displayOrientation: 'desktop', perPage: 12 },
  { id: 'phone_vibes', title: 'Vibrant Phone Backgrounds', query: 'Vibrant Pattern', orientation: 'portrait', displayOrientation: 'smartphone', perPage: 12 },
  { id: 'dark_moods', title: 'Dark & Moody Desktop', query: 'Dark Moody Forest', orientation: 'landscape', displayOrientation: 'desktop', perPage: 12 },
];

interface SectionWallpapers {
  [sectionId: string]: PexelsPhoto[];
}

interface SectionLoadingState {
  [sectionId: string]: boolean;
}

export default function DiscoverPage() {
  const [wallpapersBySection, setWallpapersBySection] = useState<SectionWallpapers>({});
  const [loadingStates, setLoadingStates] = useState<SectionLoadingState>({});
  const [selectedWallpaper, setSelectedWallpaper] = useState<PexelsPhoto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const pexelsSearchPhotos = useCallback(async (
    query: string,
    pageNum: number,
    perPage: number,
    orientation: 'landscape' | 'portrait' | 'square' | undefined
  ): Promise<PexelsResponse | null> => {
    let effectiveApiKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
    const isEnvKeyMissingOrPlaceholder = !effectiveApiKey || /your_actual_pexels_api_key/i.test(effectiveApiKey || "");

    if (isEnvKeyMissingOrPlaceholder) {
      effectiveApiKey = FALLBACK_PEXELS_API_KEY;
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[Discover Page] Pexels API key (NEXT_PUBLIC_PEXELS_API_KEY) is not configured or is a placeholder. Using default fallback key for query "${query}".`);
      }
    }

    if (!effectiveApiKey || /your_actual_pexels_api_key/i.test(effectiveApiKey)) {
      console.warn(`[Discover Page] No valid Pexels API key available for query "${query}". Returning mock data structure.`);
      if (process.env.NODE_ENV === 'development') {
          toast({
            title: "PEXELS API Key Notice",
            description: `Mock data for "${query}" due to API key issue.`,
            variant: "default", duration: 7000,
          });
      }
      const mockPhotosData: PexelsPhoto[] = Array.from({ length: perPage }).map((_, i) => ({
        id: Math.random() * 1000000 + i, width: orientation === 'portrait' ? 1080 : 1920, height: orientation === 'portrait' ? 1920 : 1080,
        url: `https://picsum.photos/seed/discover_${query.replace(/\s+/g, '')}_${i}/${orientation === 'portrait' ? 1080 : 1920}/${orientation === 'portrait' ? 1920 : 1080}`,
        photographer: 'Mock Photographer', photographer_url: 'https://example.com', photographer_id: i, avg_color: '#123456',
        src: { original: `https://picsum.photos/seed/discover_${query.replace(/\s+/g, '')}_${i}_o/${orientation === 'portrait' ? 1080 : 1920}/${orientation === 'portrait' ? 1920 : 1080}`, large2x: `https://picsum.photos/seed/discover_${query.replace(/\s+/g, '')}_${i}_l2x/${orientation === 'portrait' ? 1080 : 1920}/${orientation === 'portrait' ? 1920 : 1080}`, large: `https://picsum.photos/seed/discover_${query.replace(/\s+/g, '')}_${i}_l/${orientation === 'portrait' ? 800 : 1200}/${orientation === 'portrait' ? 1200 : 800}`, medium: `https://picsum.photos/seed/discover_${query.replace(/\s+/g, '')}_${i}_m/400/600`, small: `https://picsum.photos/seed/discover_${query.replace(/\s+/g, '')}_${i}_s/200/300`, portrait: `https://picsum.photos/seed/discover_${query.replace(/\s+/g, '')}_${i}_p/800/1200`, landscape: `https://picsum.photos/seed/discover_${query.replace(/\s+/g, '')}_${i}_land/1200/800`, tiny: `https://picsum.photos/seed/discover_${query.replace(/\s+/g, '')}_${i}_t/20/30` },
        liked: false, alt: `Mock discover image for ${query} ${i}`,
      }));
      return { photos: mockPhotosData, page: pageNum, per_page: perPage, total_results: mockPhotosData.length * 2, next_page: pageNum < 2 ? "mock_next_page" : undefined };
    }

    let endpoint = `/search?query=${encodeURIComponent(query)}&page=${pageNum}&per_page=${perPage}`;
    if (orientation) {
      endpoint += `&orientation=${orientation}`;
    }
    
    try {
      const response = await fetch(`${PEXELS_API_URL}${endpoint}`, { headers: { Authorization: effectiveApiKey! } });
      if (!response.ok) {
        if (response.status === 401) {
          toast({ title: "API Key Invalid", description: `Pexels API key is invalid for query "${query}".`, variant: "destructive" });
        } else {
          console.error(`HTTP error! status: ${response.status} for query "${query}"`);
          toast({ title: "API Error", description: `Failed to fetch: ${response.statusText} for query "${query}"`, variant: "destructive" });
        }
        // Fallback to mock if primary key was missing and fallback also failed
        if (isEnvKeyMissingOrPlaceholder && effectiveApiKey === FALLBACK_PEXELS_API_KEY) {
          const mockPhotosData: PexelsPhoto[] = Array.from({ length: perPage }).map((_, i) => ({ /* ... mock photo structure ... */ id: Math.random() * 1000000 + i + 100, width: 1080, height: 1920, url: `https://picsum.photos/seed/discover_fail_${query.replace(/\s+/g, '')}_${i}/1080/1920`, photographer: 'Mock Photographer', photographer_url: 'https://example.com', photographer_id: i, avg_color: '#123456', src: { original: `https://picsum.photos/seed/discover_fail_${query.replace(/\s+/g, '')}_${i}_o/1080/1920`, large2x: `https://picsum.photos/seed/discover_fail_${query.replace(/\s+/g, '')}_${i}_l2x/1080/1920`, large: `https://picsum.photos/seed/discover_fail_${query.replace(/\s+/g, '')}_${i}_l/800/1200`, medium: `https://picsum.photos/seed/discover_fail_${query.replace(/\s+/g, '')}_${i}_m/400/600`, small: `https://picsum.photos/seed/discover_fail_${query.replace(/\s+/g, '')}_${i}_s/200/300`, portrait: `https://picsum.photos/seed/discover_fail_${query.replace(/\s+/g, '')}_${i}_p/800/1200`, landscape: `https://picsum.photos/seed/discover_fail_${query.replace(/\s+/g, '')}_${i}_land/1200/800`, tiny: `https://picsum.photos/seed/discover_fail_${query.replace(/\s+/g, '')}_${i}_t/20/30` }, liked: false, alt: `Mock discover fail image for ${query} ${i}` }));
          return { photos: mockPhotosData, page: pageNum, per_page: perPage, total_results: mockPhotosData.length * 2, next_page: pageNum < 2 ? "mock_next_page" : undefined };
        }
        return null;
      }
      return await response.json() as PexelsResponse;
    } catch (error: any) {
      console.error(`Error fetching Pexels search for "${query}":`, error.message);
      if (!error.message.includes("API Key Invalid")) { // Avoid double toast for key issues
          toast({ title: "Fetch Error", description: `Failed to fetch results for "${query}".`, variant: "destructive" });
      }
      // Fallback to mock data on general fetch error if primary key was missing
      if (isEnvKeyMissingOrPlaceholder) {
          const mockPhotosData: PexelsPhoto[] = Array.from({ length: perPage }).map((_, i) => ({ /* ... mock photo structure ... */ id: Math.random() * 1000000 + i + 200, width: 1080, height: 1920, url: `https://picsum.photos/seed/discover_err_${query.replace(/\s+/g, '')}_${i}/1080/1920`, photographer: 'Mock Photographer', photographer_url: 'https://example.com', photographer_id: i, avg_color: '#123456', src: { original: `https://picsum.photos/seed/discover_err_${query.replace(/\s+/g, '')}_${i}_o/1080/1920`, large2x: `https://picsum.photos/seed/discover_err_${query.replace(/\s+/g, '')}_${i}_l2x/1080/1920`, large: `https://picsum.photos/seed/discover_err_${query.replace(/\s+/g, '')}_${i}_l/800/1200`, medium: `https://picsum.photos/seed/discover_err_${query.replace(/\s+/g, '')}_${i}_m/400/600`, small: `https://picsum.photos/seed/discover_err_${query.replace(/\s+/g, '')}_${i}_s/200/300`, portrait: `https://picsum.photos/seed/discover_err_${query.replace(/\s+/g, '')}_${i}_p/800/1200`, landscape: `https://picsum.photos/seed/discover_err_${query.replace(/\s+/g, '')}_${i}_land/1200/800`, tiny: `https://picsum.photos/seed/discover_err_${query.replace(/\s+/g, '')}_${i}_t/20/30` }, liked: false, alt: `Mock discover error image for ${query} ${i}` }));
          return { photos: mockPhotosData, page: pageNum, per_page: perPage, total_results: mockPhotosData.length * 2, next_page: pageNum < 2 ? "mock_next_page" : undefined };
      }
      return null;
    }
  }, [toast]);

  useEffect(() => {
    const initialLoadingStates: SectionLoadingState = {};
    discoverSectionsConfig.forEach(section => {
      initialLoadingStates[section.id] = true;
    });
    setLoadingStates(initialLoadingStates);

    discoverSectionsConfig.forEach(async (section) => {
      const data = await pexelsSearchPhotos(section.query, 1, section.perPage || 12, section.orientation);
      if (data && data.photos) {
        setWallpapersBySection(prev => ({ ...prev, [section.id]: data.photos }));
      } else {
        setWallpapersBySection(prev => ({ ...prev, [section.id]: [] })); // Ensure empty array on failure
      }
      setLoadingStates(prev => ({ ...prev, [section.id]: false }));
    });
  }, [pexelsSearchPhotos]);

  const openModal = (wallpaper: PexelsPhoto) => {
    setSelectedWallpaper(wallpaper);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedWallpaper(null), 300);
  };

  const renderSectionSkeletons = (count: number, displayOrientation: DeviceOrientationCategory) => {
    const aspectRatio = displayOrientation === 'desktop' ? 'aspect-video' : 'aspect-[9/16]';
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {[...Array(count)].map((_, i) => (
          <Skeleton key={`section-skeleton-${i}`} className={`${aspectRatio} w-full rounded-lg`} />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="space-y-10 sm:space-y-16"> {/* Increased spacing between sections */}
        {discoverSectionsConfig.map(section => (
          <section key={section.id} className="bg-card p-4 sm:p-6 rounded-xl shadow-lg"> {/* Added card styling to sections */}
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6">{section.title}</h2>
            {loadingStates[section.id] ? (
              renderSectionSkeletons(section.perPage || 12, section.displayOrientation)
            ) : wallpapersBySection[section.id] && wallpapersBySection[section.id].length > 0 ? (
              <WallpaperGrid
                photos={wallpapersBySection[section.id]}
                orientation={section.displayOrientation}
                onPhotoClick={openModal}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-8 px-4 bg-muted/50 rounded-lg min-h-[200px]">
                <SearchIcon className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-lg">No wallpapers found for &quot;{section.title}&quot; right now.</p>
                <p className="text-sm text-muted-foreground mt-1">Try checking back later or explore other sections.</p>
              </div>
            )}
          </section>
        ))}
      </div>
      <PreviewDialog photo={selectedWallpaper} isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
