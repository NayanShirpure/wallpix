'use client';

import type { PexelsPhoto, DeviceOrientationCategory } from '@/types/pexels';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Download } from 'lucide-react';

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
  orientation,
  onWallpaperClick,
  itemCount = 8, // Default to 8 items for carousels
}: WallpaperSectionProps) {
  const aspectRatio = orientation === 'desktop' ? 'aspect-video' : 'aspect-[9/16]';
  // Define image container width based on orientation for better responsive behavior in a carousel
  const imageContainerClass = orientation === 'desktop' 
    ? 'w-60 xs:w-64 sm:w-72 md:w-80 lg:w-[340px]' // Wider for desktop carousels
    : 'w-28 xs:w-32 sm:w-36 md:w-40 lg:w-44';   // Narrower for phone carousels

  const displayedWallpapers = wallpapers.slice(0, itemCount);

  const getSrc = (photo: PexelsPhoto) => {
    // For carousels, medium or large is usually sufficient and loads faster.
    // For desktop, landscape or large2x. For phone, portrait or large.
    if (orientation === 'desktop') {
      return photo.src.landscape || photo.src.large2x || photo.src.original;
    }
    return photo.src.portrait || photo.src.large || photo.src.original;
  };

  return (
    <section>
      <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-3 sm:mb-4 px-1">{title}</h2>
      {loading ? (
        <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-4 pt-1 px-1 -mx-1">
          {[...Array(Math.min(itemCount, 5))].map((_, i) => ( // Show up to 5 skeletons
            <div key={`skeleton-${title}-${i}`} className={`flex-shrink-0 ${imageContainerClass}`}>
              <Skeleton className={`${aspectRatio} w-full rounded-lg`} />
            </div>
          ))}
        </div>
      ) : wallpapers.length > 0 ? (
        <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-4 pt-1 px-1 -mx-1"> {/* Added small padding for scrollbar */}
          {displayedWallpapers.map((wallpaper) => (
            <div
              key={`${wallpaper.id}-${orientation}-${title}`}
              className={`relative ${imageContainerClass} ${aspectRatio} flex-shrink-0 rounded-lg overflow-hidden cursor-pointer group shadow-md hover:shadow-xl focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background transition-all duration-300 ease-in-out hover:scale-[1.02] focus-within:scale-[1.02]`}
              onClick={() => onWallpaperClick(wallpaper)}
              role="button"
              aria-label={`View wallpaper: ${wallpaper.alt || `by ${wallpaper.photographer}`}`}
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onWallpaperClick(wallpaper)}
            >
              <Image
                src={getSrc(wallpaper)}
                alt={wallpaper.alt || `Wallpaper by ${wallpaper.photographer}`}
                fill
                sizes={`${imageContainerClass.split(' ').find(c => c.startsWith('lg:w-'))?.replace('lg:w-','').replace('[','').replace(']','') || imageContainerClass.split(' ').find(c => c.startsWith('md:w-'))?.replace('md:w-','') || imageContainerClass.split(' ').find(c => c.startsWith('sm:w-'))?.replace('sm:w-','') || imageContainerClass.split(' ').find(c => c.startsWith('xs:w-'))?.replace('xs:w-','') || imageContainerClass.split(' ')[0].replace('w-','')}px`}
                className="object-cover transition-transform duration-300 group-hover:scale-105" // Inner image scale for zoom effect
                placeholder="blur"
                blurDataURL={wallpaper.src.tiny}
                data-ai-hint={`${orientation === 'desktop' ? 'desktop abstract' : 'phone nature'} ${wallpaper.alt ? wallpaper.alt.split(' ').slice(0,2).join(' ') : 'wallpaper image'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-1.5 sm:p-2">
                <p className="text-white text-[10px] xs:text-xs font-medium truncate drop-shadow-sm leading-tight">
                  {wallpaper.alt || `Wallpaper by ${wallpaper.photographer}`}
                </p>
                <div className="flex justify-between items-center mt-0.5">
                    <p className="text-gray-300 text-[9px] xs:text-[10px] truncate drop-shadow-sm">
                        {wallpaper.photographer}
                    </p>
                    <Download size={12} className="text-white/70 shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground px-1 text-sm">No wallpapers available for this section right now.</p>
      )}
    </section>
  );
}
