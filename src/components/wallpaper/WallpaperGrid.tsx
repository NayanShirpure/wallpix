
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
      "columns-2 md:columns-3 lg:columns-4 xl:columns-5", // Simplified responsive columns
      "gap-3 md:gap-4" // Adjusted gaps to match simplification
    )}>
      {photos.map((photo, index) => (
        <div key={`${photo.id}-grid-item-${index}`} className="mb-3 md:mb-4 break-inside-avoid-column">
          <WallpaperCard
            photo={photo}
            isPriority={index < 8} 
          />
        </div>
      ))}
    </div>
  );
}
