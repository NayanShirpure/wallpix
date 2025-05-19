
import type { PexelsPhoto } from '@/types/pexels';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Download, Bookmark } from 'lucide-react'; // Added Bookmark icon

interface WallpaperCardProps {
  photo: PexelsPhoto;
  onClick: () => void;
  // Orientation prop is no longer needed as card adapts to image ratio
}

export function WallpaperCard({ photo, onClick }: WallpaperCardProps) {
  // Use photo.src.large for preview, and its dimensions to maintain aspect ratio
  // Fallback to medium or original if large isn't available or suitable
  const previewSrc = photo.src.large || photo.src.medium || photo.src.original;
  // Use actual image dimensions for width/height attributes for next/image
  // This helps maintain aspect ratio before JS loads, and for layout calculations
  const imageWidth = photo.width;
  const imageHeight = photo.height;

  // Determine a suitable height for the card in the masonry grid,
  // while letting width be full. This helps with initial rendering.
  // A common approach is to scale height based on a fixed width,
  // but for CSS columns, we let width be 100% of column and height be auto.

  const imageAlt = (photo.alt && photo.alt.trim() !== '') ? photo.alt : 'Wallpaper thumbnail';
  const cardAriaLabel = (photo.alt && photo.alt.trim() !== '') ? photo.alt : `Wallpaper by ${photo.photographer}`;
  const overlayTitle = (photo.alt && photo.alt.trim() !== '') ? photo.alt : `Wallpaper by ${photo.photographer}`;

  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer group transition-all duration-300 ease-in-out",
        "bg-card border-border shadow-sm hover:shadow-lg focus-within:shadow-lg",
        "rounded-md md:rounded-lg break-inside-avoid-column mb-3 sm:mb-4" // Added break-inside-avoid and bottom margin for masonry
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
          width={imageWidth} // Use actual image width
          height={imageHeight} // Use actual image height
          className="w-full h-auto object-cover transition-transform duration-300 ease-in-out group-hover:brightness-75 group-focus-within:brightness-75"
          // Removed fixed sizes, using width/height props with w-full h-auto
          priority={photo.id < 3000000}
          placeholder="blur"
          blurDataURL={photo.src.tiny}
          data-ai-hint={photo.alt ? photo.alt.split(' ').slice(0,2).join(' ') : "wallpaper image"}
        />
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-between p-2 sm:p-3", // Changed to justify-between
            "bg-gradient-to-t from-black/70 via-transparent to-black/30", // Adjusted gradient
            "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 ease-in-out"
          )}
        >
          {/* Top right actions */}
          <div className="flex justify-end">
            <button
              className="p-1.5 sm:p-2 bg-black/40 hover:bg-black/60 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click when clicking button
                // Placeholder for Save action
                alert('Save feature coming soon!');
              }}
              aria-label="Save wallpaper (coming soon)"
            >
              <Bookmark size={16} className="sm:size-5" />
            </button>
          </div>

          {/* Bottom details */}
          <div className="text-white drop-shadow-md">
            <p className="text-xs sm:text-sm font-semibold truncate leading-snug">
              {overlayTitle}
            </p>
            <a
              href={photo.photographer_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-200 text-xs hover:text-accent focus:text-accent focus:outline-none focus:underline truncate block mt-0.5 leading-snug"
              onClick={(e) => e.stopPropagation()} // Prevent card click when clicking link
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
