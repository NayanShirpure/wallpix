
'use client';

import type { PexelsPhoto } from '@/types/pexels';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Share2 } from 'lucide-react'; // Changed from Download to Share2
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

  const copyToClipboard = async (url: string, title: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied!",
        description: `${title} link copied to clipboard.`,
      });
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast({
        title: "Copy Link Manually",
        description: `Web Share and clipboard copy failed. Please copy this link: ${url}`,
        duration: 9000,
        variant: "default",
      });
    }
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); 

    if (!photo) return;

    const shareTitle = imageAltText;
    const shareText = `Check out this amazing wallpaper on Wallify: "${imageAltText}" by ${photo.photographer}.`;
    const shareUrl = window.location.href; // Ideally, this would be a direct link to the image details if available

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
        if ((error as Error).name !== 'AbortError') { // User didn't cancel
          console.error("Error sharing:", error); // Log the actual error (e.g., Permission denied)
          toast({
            title: "Sharing via App Failed",
            description: "Trying to copy link to clipboard instead...",
            variant: "default",
          });
          await copyToClipboard(shareUrl, shareTitle);
        }
        // If AbortError, do nothing as the user cancelled.
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      await copyToClipboard(shareUrl, shareTitle);
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
            "bg-gradient-to-t from-black/70 via-black/30 to-transparent", // Adjusted gradient for better text visibility
            "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 ease-in-out"
          )}
        >
          <div className="flex justify-end items-start gap-1.5">
            <button
              className="p-1.5 sm:p-2 bg-black/50 hover:bg-black/70 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              onClick={handleShareClick}
              aria-label="Share wallpaper"
            >
              <Share2 size={16} className="sm:size-5" />
            </button>
          </div>

          <div className="text-white drop-shadow-md">
            <p className="text-xs xxs:text-sm sm:text-base font-semibold truncate leading-snug" title={overlayTitle}>
              {overlayTitle}
            </p>
            <a
              href={photo.photographer_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-200 text-[10px] xxs:text-xs hover:text-accent focus:text-accent focus:outline-none focus:underline truncate block mt-0.5 leading-snug"
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
