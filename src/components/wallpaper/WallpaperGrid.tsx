
'use client';

import type { PexelsPhoto } from '@/types/pexels';
import { WallpaperCard } from './WallpaperCard';
import Masonry from 'react-masonry-css';
import { cn } from '@/lib/utils';

interface WallpaperGridProps {
  photos: PexelsPhoto[];
}

const breakpointColumnsObj = {
  default: 6, // More columns for a denser Pinterest feel
  1536: 5,    // 2xl
  1280: 4,    // xl
  1024: 3,    // lg
  768: 3,     // md
  640: 2,     // sm
  480: 2,     // xs
  380: 2,     // xxs
};


export function WallpaperGrid({ photos }: WallpaperGridProps) {
  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground">No wallpapers found.</p>
      </div>
    );
  }

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="my-masonry-grid" // Use the class for custom styles
      columnClassName="my-masonry-grid_column" // Use the class for custom styles
    >
      {photos.map((photo, index) => (
        // The div wrapper with margin is handled by the masonry CSS
        <WallpaperCard
          key={`${photo.id}-grid-item-${index}`}
          photo={photo}
          isPriority={index < 8} // Prioritize first few images
        />
      ))}
    </Masonry>
  );
}
