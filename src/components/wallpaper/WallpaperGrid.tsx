
'use client';

import type { PexelsPhoto } from '@/types/pexels';
import { WallpaperCard } from './WallpaperCard';
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

  return (
    <div className={cn(
      "columns-2 xs:columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6",
      "gap-2 sm:gap-3 md:gap-4",
      "[column-fill:auto]" // May help with reflow, can be removed if causing issues
    )}>
      {photos.map((photo, index) => (
        <div key={`${photo.id}-grid-item-${index}`} className="mb-2 sm:mb-3 md:mb-4 break-inside-avoid-column">
          <WallpaperCard
            photo={photo}
            isPriority={index < 8} // Prioritize first few images
          />
        </div>
      ))}
    </div>
  );
}
