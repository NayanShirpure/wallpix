
import type { PexelsPhoto } from '@/types/pexels';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Share2, Download } from 'lucide-react'; // Keep Download if it was there before or intended
import { useToast } from '@/hooks/use-toast';

interface WallpaperCardProps {
  photo: PexelsPhoto;
  onClick: () => void;
}

export function WallpaperCard({ photo, onClick }: WallpaperCardProps) {
  const { toast } = useToast();
  const imageSrc = photo.src.large || photo.src.medium || photo.src.original;
  const imageWidth = photo.width;
  const imageHeight = photo.height;

  const imageAltText = (photo.alt && photo.alt.trim() !== '') ? photo.alt : `Wallpaper by ${photo.photographer}`;
  const cardAriaLabel = imageAltText;
  const overlayTitle = (photo.alt && photo.alt.trim() !== '') ? photo.alt : `Wallpaper by ${photo.photographer}`;

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from triggering modal

    if (!photo) return;

    const shareTitle = imageAltText;
    const shareText = `Check out this amazing wallpaper on Wallify: "${imageAltText}" by ${photo.photographer}.`;
    // For now, shares the current page URL. Ideally, this would be a direct link to the image if available.
    const shareUrl = window.location.href;

    const shareData = {
      title: shareTitle,
      text: shareText,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully!",
          description: "The wallpaper link has been shared.",
        });
      } catch (error) {
        // Don't show an error if the user actively canceled the share dialog
        if ((error as Error).name !== 'AbortError') {
          console.error("Error sharing:", error);
          toast({
            title: "Sharing failed",
            description: "Could not share the wallpaper. Please try again.",
            variant: "destructive",
          });
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied!",
          description: "Wallpaper page link copied to clipboard.",
        });
      } catch (err) {
        console.error("Failed to copy link:", err);
        // Provide the link in the toast if clipboard copy also fails (e.g. due to permissions or non-HTTPS)
        toast({
          title: "Copy Link Manually",
          description: `Web Share is not available. Please copy this link: ${shareUrl}`,
          duration: 9000, // Give user time to copy
          variant: "default",
        });
      }
    }
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
          src={imageSrc}
          alt={imageAltText}
          width={imageWidth}
          height={imageHeight}
          className="w-full h-auto object-cover transition-transform duration-300 ease-in-out group-hover:brightness-75 group-focus-within:brightness-75"
          priority={photo.id < 3000000}
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
          <div className="flex justify-end items-start gap-1.5">
             {/* Optional: If you want a download icon here as well for quick access, add it.
             <button
              className="p-1.5 sm:p-2 bg-black/40 hover:bg-black/60 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              onClick={(e) => {
                e.stopPropagation();
                // Trigger download logic directly or open modal and trigger download
                alert(`Quick download for: ${photo.id} (coming soon)`);
              }}
              aria-label="Download wallpaper"
            >
              <Download size={16} className="sm:size-5" />
            </button>
            */}
            <button
              className="p-1.5 sm:p-2 bg-black/40 hover:bg-black/60 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              onClick={handleShareClick}
              aria-label="Share wallpaper"
            >
              <Share2 size={16} className="sm:size-5" />
            </button>
          </div>

          <div className="text-white drop-shadow-md">
            <p className="text-sm sm:text-base font-semibold truncate leading-snug" title={overlayTitle}>
              {overlayTitle}
            </p>
            <a
              href={photo.photographer_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-200 text-xs hover:text-accent focus:text-accent focus:outline-none focus:underline truncate block mt-0.5 leading-snug"
              onClick={(e) => e.stopPropagation()} // Prevent card click when clicking photographer link
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
