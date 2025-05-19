
'use client';

import type { PexelsPhoto } from '@/types/pexels';
import { WallpaperCard } from './WallpaperCard';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { cn } from '@/lib/utils';

interface WallpaperGridProps {
  photos: PexelsPhoto[];
}

export function WallpaperGrid({ photos }: WallpaperGridProps) {

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground">No wallpapers found.</p>
      </div>
    );
  }

  const gridClasses = cn(
    "columns-2 xs:columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6", 
    "gap-2 sm:gap-3 md:gap-4" 
  );

  return (
    <>
      <div className={gridClasses}>
        {photos.map((photo, index) => (
          <div key={`${photo.id}-masonry`} className="mb-2 sm:mb-3 md:mb-4 break-inside-avoid-column">
            <WallpaperCard
              photo={photo}
              isPriority={index < 4} // Prioritize the first 4 images in the grid
            />
          </div>
        ))}
      </div>
    </>
  );
}
