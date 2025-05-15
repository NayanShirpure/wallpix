
import type { PexelsPhoto, DeviceOrientationCategory } from '@/types/pexels';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WallpaperCardProps {
  photo: PexelsPhoto;
  onClick: () => void;
  orientation: DeviceOrientationCategory;
}

export function WallpaperCard({ photo, onClick, orientation }: WallpaperCardProps) {
  const aspectRatio = orientation === 'desktop' ? 'aspect-video' : 'aspect-[9/16]';
  
  const imageSrc = orientation === 'desktop' 
    ? (photo.src.landscape || photo.src.large2x || photo.src.large || photo.src.original)
    : (photo.src.portrait || photo.src.large || photo.src.medium || photo.src.original);

  const imageSizes = 
    orientation === 'desktop'
    ? "(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.6vw"
    : "(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.6vw";

  const imageAlt = (photo.alt && photo.alt.trim() !== '') ? photo.alt : 'Wallpaper thumbnail';
  const cardAriaLabel = (photo.alt && photo.alt.trim() !== '') ? photo.alt : `by ${photo.photographer}`;
  const overlayTitle = (photo.alt && photo.alt.trim() !== '') ? photo.alt : `Wallpaper by ${photo.photographer}`;

  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer group transition-all duration-300 ease-in-out",
        "bg-card border-border shadow-sm hover:shadow-lg focus-within:shadow-lg",
        "rounded-md md:rounded-lg"
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      aria-label={`View wallpaper: ${cardAriaLabel}`}
    >
      <CardContent className={cn('p-0 relative w-full', aspectRatio)}>
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          style={{ objectFit: 'cover' }}
          sizes={imageSizes}
          className="transition-transform duration-300 ease-in-out group-hover:scale-105 group-focus-within:scale-105"
          priority={photo.id < 3000000} 
          placeholder="blur"
          blurDataURL={photo.src.tiny}
          data-ai-hint={photo.alt ? photo.alt.split(' ').slice(0,2).join(' ') : "wallpaper abstract"}
        />
        <div 
          className={cn(
            "absolute inset-0 flex flex-col justify-end p-1.5 sm:p-2",
            "bg-gradient-to-t from-black/70 via-black/20 to-transparent",
            "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 ease-in-out"
          )}
        >
          <p className="text-white text-xs font-semibold truncate drop-shadow-sm leading-snug">
            {overlayTitle}
          </p>
          <p className="text-gray-300 text-xs truncate drop-shadow-sm mt-0.5 leading-snug">
            by {photo.photographer}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
