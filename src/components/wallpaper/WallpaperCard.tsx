import type { PexelsPhoto } from '@/types/pexels';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

interface WallpaperCardProps {
  photo: PexelsPhoto;
  onClick: () => void;
}

export function WallpaperCard({ photo, onClick }: WallpaperCardProps) {
  return (
    <Card
      className="overflow-hidden cursor-pointer group hover:shadow-xl transition-shadow duration-300"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      aria-label={`View wallpaper: ${photo.alt || 'Untitled'}`}
    >
      <CardContent className="p-0 aspect-[3/4] relative">
        <Image
          src={photo.src.large} // Using large for better quality preview in card
          alt={photo.alt || 'Wallpaper thumbnail'}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="transition-transform duration-300 group-hover:scale-105"
          priority={photo.id < 10} // Prioritize loading for first few images
          data-ai-hint={photo.alt ? photo.alt.split(' ').slice(0,2).join(' ') : "wallpaper abstract"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 p-3">
            <p className="text-white text-sm font-medium truncate">{photo.alt || 'Untitled Wallpaper'}</p>
            <p className="text-xs text-gray-300 truncate">by {photo.photographer}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
