
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

  return (
    <Card
      className="overflow-hidden cursor-pointer group hover:shadow-xl transition-shadow duration-300 rounded-lg"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      aria-label={`View wallpaper: ${photo.alt || 'Untitled'}`}
    >
      <CardContent className={cn('p-0 relative', aspectRatio)}>
        <Image
          src={imageSrc}
          alt={photo.alt || 'Wallpaper thumbnail'}
          fill
          style={{ objectFit: 'cover' }}
          sizes={orientation === 'desktop' 
            ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" 
            : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"}
          className="transition-transform duration-300 group-hover:scale-105"
          priority={photo.id < 3000000} // Prioritize first few images based on typical Pexels ID range
          placeholder="blur"
          blurDataURL={photo.src.tiny}
          data-ai-hint={photo.alt ? photo.alt.split(' ').slice(0,2).join(' ') : "wallpaper abstract"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end">
          <div className="p-2 sm:p-3">
            <p className="text-white text-xs sm:text-sm font-medium truncate">{photo.alt || 'Untitled Wallpaper'}</p>
            <p className="text-[10px] sm:text-xs text-gray-300 truncate">by {photo.photographer}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
