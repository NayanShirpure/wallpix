

'use client';

import type { PexelsPhoto, DeviceOrientationCategory } from '@/types/pexels';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { WallpaperCard } from './wallpaper/WallpaperCard'; // Import WallpaperCard for consistent item rendering

interface WallpaperSectionProps {
  title: string;
  wallpapers: PexelsPhoto[];
  loading: boolean;
  orientation: DeviceOrientationCategory;
  onWallpaperClick: (wallpaper: PexelsPhoto) => void;
  itemCount?: number;
}

export function WallpaperSection({
  title,
  wallpapers,
  loading,
  orientation, // This orientation is for the *type* of content (desktop/phone)
  onWallpaperClick,
  itemCount = 10, // Default to 10 items for carousels
}: WallpaperSectionProps) {
  // For carousel display, items are typically landscape-like or square-ish for better fit.
  // We'll use a fixed aspect ratio for carousel items, e.g., 16:9 or 4:3 for desktop, 3:4 for phone items in carousel
  const carouselItemOrientation = orientation === 'desktop' ? 'desktop' : 'smartphone'; // This will determine the card's aspect ratio.

  const displayedWallpapers = wallpapers.slice(0, itemCount);

  // Skeleton item width should match card width in carousel
  const skeletonItemWidth = orientation === 'desktop' 
    ? 'w-60 xs:w-64 sm:w-72 md:w-80 lg:w-[340px]'
    : 'w-28 xs:w-32 sm:w-36 md:w-40 lg:w-44';

  return (
    <section className="py-2"> {/* Added padding for better separation */}
      <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-3 sm:mb-4 px-1">{title}</h2>
      {loading ? (
        <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-4 pt-1 px-1 -mx-1">
          {[...Array(Math.min(itemCount, 6))].map((_, i) => ( // Show up to 6 skeletons
            <div key={`skeleton-${title}-${i}`} className={cn("flex-shrink-0", skeletonItemWidth)}>
              {/* The skeleton should mimic the aspect ratio of the WallpaperCard */}
              <Skeleton className={cn(
                "w-full rounded-md md:rounded-lg shadow-sm",
                carouselItemOrientation === 'desktop' ? 'aspect-video' : 'aspect-[9/16]' 
                )} />
            </div>
          ))}
        </div>
      ) : wallpapers.length > 0 ? (
        <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-4 pt-1 px-1 -mx-1">
          {displayedWallpapers.map((wallpaper) => (
            <div 
              key={`${wallpaper.id}-${carouselItemOrientation}-${title}`} 
              className={cn("flex-shrink-0", skeletonItemWidth)} // Apply width classes here
            >
              <WallpaperCard
                photo={wallpaper}
                onClick={() => onWallpaperClick(wallpaper)}
                orientation={carouselItemOrientation} // Pass orientation for aspect ratio
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground px-1 text-sm">No wallpapers available for this section right now.</p>
      )}
    </section>
  );
}

