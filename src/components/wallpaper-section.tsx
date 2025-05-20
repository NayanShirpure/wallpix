
'use client';

import type { PexelsPhoto } from '@/types/pexels';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { WallpaperCard } from './wallpaper/WallpaperCard';

interface WallpaperSectionProps {
  title: string;
  wallpapers: PexelsPhoto[];
  loading: boolean;
  onWallpaperClick: (wallpaper: PexelsPhoto) => void; 
  itemCount?: number;
}

export function WallpaperSection({
  title,
  wallpapers,
  loading,
  onWallpaperClick, 
  itemCount = 6, 
}: WallpaperSectionProps) {

  const displayedWallpapers = wallpapers.slice(0, itemCount);

  const skeletonItemWidth = 'w-36 xs:w-40 sm:w-44 md:w-48 lg:w-52';

  return (
    <section className="py-2" aria-busy={loading} aria-live={loading ? "polite" : "off"}>
      <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6 px-1">{title}</h2>
      {loading ? (
        <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-4 pt-1 px-1 -mx-1">
          {[...Array(Math.min(itemCount, 5))].map((_, i) => (
            <div key={`skeleton-${title}-${i}`} className={cn("flex-shrink-0", skeletonItemWidth)}>
              <Skeleton className={cn(
                "w-full rounded-md md:rounded-lg shadow-sm aspect-[3/4]" 
                )} />
            </div>
          ))}
        </div>
      ) : wallpapers.length > 0 ? (
        <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-4 pt-1 px-1 -mx-1">
          {displayedWallpapers.map((wallpaper, index) => (
            <div
              key={`${wallpaper.id}-${title}`}
              className={cn("flex-shrink-0", skeletonItemWidth)}
            >
              <WallpaperCard
                photo={wallpaper}
                isPriority={index < 3} 
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
