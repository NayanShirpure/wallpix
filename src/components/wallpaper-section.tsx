
'use client';

import type { PexelsPhoto, DeviceOrientationCategory } from '@/types/pexels';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card'; // Added Card and CardContent
import { cn } from '@/lib/utils'; // Added cn

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

  // Attempt to parse a single width for the 'sizes' attribute from the Tailwind classes.
  // This is a simplified approach for fixed-width items in a carousel.
  const imageWidthForSizes = () => {
    const widthClasses = imageContainerClass.split(' ');
    let baseW = widthClasses.find(c => c.startsWith('w-') && !c.includes(':'))?.replace('w-', '');
    if (baseW?.startsWith('[')) baseW = baseW.replace('[', '').replace('px]', ''); // Handles w-[340px]
    // For classes like w-60 (meaning 15rem), convert to a rough pixel estimate if needed, or use a large enough default.
    // Here, we'll just return a common large size if direct px isn't found, letting browser optimize.
    return baseW && !isNaN(parseInt(baseW)) ? `${baseW}px` : '320px'; // Fallback width for sizes
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
        <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-4 pt-1 px-1 -mx-1">
          {displayedWallpapers.map((wallpaper) => (
            <Card
              key={`${wallpaper.id}-${orientation}-${title}`}
              className={cn(
                "flex-shrink-0 overflow-hidden cursor-pointer group hover:shadow-xl focus-within:shadow-xl transition-shadow duration-300 ease-in-out",
                imageContainerClass // Applies width classes like w-60, sm:w-72 etc.
              )}
              onClick={() => onWallpaperClick(wallpaper)}
              role="button"
              aria-label={`View wallpaper: ${wallpaper.alt || `by ${wallpaper.photographer}`}`}
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onWallpaperClick(wallpaper)}
            >
              <CardContent className={cn("p-0 relative", aspectRatio)}>
                <Image
                  src={getSrc(wallpaper)}
                  alt={wallpaper.alt || `Wallpaper by ${wallpaper.photographer}`}
                  fill
                  sizes={imageWidthForSizes()}
                  className="object-cover transition-transform duration-300 group-hover:scale-105 group-focus-within:scale-105"
                  placeholder="blur"
                  blurDataURL={wallpaper.src.tiny}
                  data-ai-hint={`${orientation === 'desktop' ? 'desktop abstract' : 'phone nature'} ${wallpaper.alt ? wallpaper.alt.split(' ').slice(0,2).join(' ') : 'wallpaper image'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-1.5 sm:p-2">
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
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground px-1 text-sm">No wallpapers available for this section right now.</p>
      )}
    </section>
  );
}
