
'use client';

import type { PexelsPhoto } from '@/types/pexels';
import { WallpaperCard } from './WallpaperCard';
import Masonry from 'react-masonry-css';

interface WallpaperGridProps {
  photos: PexelsPhoto[];
}

const breakpointColumnsObj = {
  default: 5, // Default to 5 columns
  1280: 4,    // xl: 4 columns
  1024: 3,    // lg: 3 columns
  768: 3,     // md: 3 columns
  640: 2,     // sm: 2 columns
  480: 2,     // xs: 2 columns
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
      className="my-masonry-grid" // Defined in globals.css
      columnClassName="my-masonry-grid_column" // Defined in globals.css
    >
      {photos.map((photo, index) => (
        // The div wrapper is for react-masonry-css to apply its column styles
        // Spacing (margin-bottom) is handled by .my-masonry-grid_column > div in globals.css
        <div key={`${photo.id}-grid-item-${index}`}>
          <WallpaperCard
            photo={photo}
            isPriority={index < 8} // Prioritize first few images
          />
        </div>
      ))}
    </Masonry>
  );
}
