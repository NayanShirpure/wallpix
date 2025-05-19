
'use client';

import type { PexelsPhoto } from '@/types/pexels';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button'; // Added Button import

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
  const cardAriaLabel = `View wallpaper: ${imageAltText}`;
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
        title: "Manual Copy Needed",
        description: `Could not copy link automatically. Please copy this link: ${url}`,
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
    
    const query = encodeURIComponent(imageAltText);
    const shareUrl = `${window.location.origin}/search?query=${query}`;

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
        const err = error as Error;
        if (err.name !== 'AbortError') { 
            if (err.message && err.message.toLowerCase().includes('permission denied')) {
                 toast({
                    title: "Share Permission Denied",
                    description: "Browser prevented sharing. Trying to copy link instead. Check site permissions if this persists.",
                    variant: "default",
                    duration: 7000,
                });
            } else {
                console.error("Error sharing:", error); 
                toast({
                    title: "Sharing via App Failed",
                    description: "Could not share. Trying to copy link to clipboard instead...",
                    variant: "default",
                });
            }
            await copyToClipboard(shareData.url, shareTitle);
        }
      }
    } else {
      toast({
        title: "Web Share Not Supported",
        description: "Trying to copy link to clipboard instead...",
        variant: "default",
      });
      await copyToClipboard(shareData.url, shareTitle);
    }
  };
  
  const dataAiHintForImage = (photo.alt || "wallpaper abstract").split(' ').slice(0,2).join(' ');

  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer group transition-all duration-300 ease-in-out",
        "bg-card border-border shadow-md hover:shadow-xl focus-within:shadow-xl", // Enhanced shadow
        "rounded-lg break-inside-avoid-column mb-4" // Consistent rounded-lg and mb-4
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      aria-label={cardAriaLabel}
    >
      <CardContent className={cn('p-0 relative w-full')}>
        <div className="overflow-hidden rounded-lg"> {/* Added for scale effect containment */}
          <Image
            src={imageSrc}
            alt={imageAltText}
            width={imageWidth}
            height={imageHeight}
            className="w-full h-auto object-cover transition-transform duration-300 ease-in-out group-hover:scale-105 group-focus-within:scale-105" // Changed brightness to scale
            priority={photo.id < 3000000} 
            placeholder="blur"
            blurDataURL={photo.src.tiny}
            data-ai-hint={dataAiHintForImage}
          />
        </div>
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 flex items-center justify-between p-2 sm:p-3", // Aligned items
            "bg-gradient-to-t from-black/70 via-black/50 to-transparent", // Standardized gradient
            "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 ease-in-out"
          )}
        >
          <div className="text-white drop-shadow-md flex-grow min-w-0"> {/* Allow title to truncate */}
            <p className="text-xs xxs:text-sm font-semibold truncate leading-snug" title={overlayTitle}>
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
          <Button
            variant="ghost"
            size="icon"
            className="p-1.5 sm:p-2 bg-white/20 hover:bg-white/30 text-white rounded-full h-auto w-auto shrink-0 ml-2" // Adjusted styling
            onClick={handleShareClick}
            aria-label="Share wallpaper"
          >
            <Share2 size={16} className="sm:size-[18px]" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
