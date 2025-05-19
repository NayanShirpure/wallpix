
'use client';

import type { PexelsPhoto } from '@/types/pexels';
import { WallpaperCard } from './WallpaperCard';
// Removed import for Masonry from 'react-masonry-css';
import { cn } from '@/lib/utils';

interface WallpaperGridProps {
  photos: PexelsPhoto[];
}

// Reverted to Tailwind CSS multi-column approach
export function WallpaperGrid({ photos }: WallpaperGridProps) {
  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground">No wallpapers found.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'columns-2 xs:columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-3 sm:gap-4 [column-fill:auto]'
      )}
    >
      {photos.map((photo, index) => (
        <div key={`${photo.id}-grid-item-${index}`} className="mb-3 sm:mb-4 break-inside-avoid-column">
          <WallpaperCard
            photo={photo}
            isPriority={index < 8}
          />
        </div>
      ))}
    </div>
  );
}
