
import type { PexelsPhoto } from '@/types/pexels';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Share2 } from 'lucide-react'; // Changed from Download, Bookmark to Share2

interface WallpaperCardProps {
  photo: PexelsPhoto;
  onClick: () => void;
}

export function WallpaperCard({ photo, onClick }: WallpaperCardProps) {
  const previewSrc = photo.src.large || photo.src.medium || photo.src.original;
  const imageWidth = photo.width;
  const imageHeight = photo.height;

  const imageAlt = (photo.alt && photo.alt.trim() !== '') ? photo.alt : 'Wallpaper thumbnail';
  const cardAriaLabel = (photo.alt && photo.alt.trim() !== '') ? photo.alt : `Wallpaper by ${photo.photographer}`;
  const overlayTitle = (photo.alt && photo.alt.trim() !== '') ? photo.alt : `Wallpaper by ${photo.photographer}`;

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking button
    // In a real app, this would trigger the Web Share API or a custom share modal
    const shareUrl = typeof window !== 'undefined' ? window.location.href : ''; // Or a direct link to the image if available
    alert(`Share functionality coming soon! You could share: ${shareUrl} (Image ID: ${photo.id})`);
  };

  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer group transition-all duration-300 ease-in-out",
        "bg-card border-border shadow-sm hover:shadow-lg focus-within:shadow-lg",
        "rounded-md md:rounded-lg break-inside-avoid-column mb-3 sm:mb-4"
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      aria-label={`View wallpaper: ${cardAriaLabel}`}
    >
      <CardContent className="p-0 relative w-full">
        <Image
          src={previewSrc}
          alt={imageAlt}
          width={imageWidth}
          height={imageHeight}
          className="w-full h-auto object-cover transition-transform duration-300 ease-in-out group-hover:brightness-75 group-focus-within:brightness-75"
          priority={photo.id < 3000000} // Example priority, adjust as needed
          placeholder="blur"
          blurDataURL={photo.src.tiny}
          data-ai-hint={photo.alt ? photo.alt.split(' ').slice(0,2).join(' ') : "wallpaper image"}
        />
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-between p-2 sm:p-3",
            "bg-gradient-to-t from-black/70 via-transparent to-black/30",
            "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 ease-in-out"
          )}
        >
          {/* Top right actions */}
          <div className="flex justify-end">
            <button
              className="p-1.5 sm:p-2 bg-black/40 hover:bg-black/60 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              onClick={handleShareClick}
              aria-label="Share wallpaper"
            >
              <Share2 size={16} className="sm:size-5" />
            </button>
          </div>

          {/* Bottom details */}
          <div className="text-white drop-shadow-md">
            <p className="text-sm sm:text-base font-semibold truncate leading-snug" title={overlayTitle}>
              {overlayTitle}
            </p>
            <a
              href={photo.photographer_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-200 text-xs hover:text-accent focus:text-accent focus:outline-none focus:underline truncate block mt-0.5 leading-snug"
              onClick={(e) => e.stopPropagation()}
              aria-label={`View photographer ${photo.photographer} on Pexels (opens in new tab)`}
            >
              by {photo.photographer}
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
