
'use client';

import type { PexelsPhoto } from '@/types/pexels';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface WallpaperCardProps {
  photo: PexelsPhoto;
}

export function WallpaperCard({ photo }: WallpaperCardProps) {
  const { toast } = useToast();
  const router = useRouter();

  if (!photo || !photo.src || !photo.src.large || !photo.src.tiny || !photo.width || !photo.height) {
    console.warn('[WallpaperCard] Missing essential photo data, rendering placeholder or nothing.', photo);
    return (
        <Card className="overflow-hidden rounded-lg bg-muted/30 shadow-md">
            <CardContent className="p-0 relative aspect-[3/4] flex items-center justify-center">
                <p className="text-xs text-muted-foreground p-2">Image data unavailable</p>
            </CardContent>
        </Card>
    );
  }

  const imageSrc = photo.src.large || photo.src.medium || photo.src.original;
  const imageAltText = (photo.alt && photo.alt.trim() !== '') ? photo.alt : `Wallpaper by ${photo.photographer}`;
  const cardAriaLabel = `View wallpaper: ${imageAltText}`;
  const overlayTitle = (photo.alt && photo.alt.trim() !== '') ? photo.alt : `Wallpaper by ${photo.photographer}`;
  
  const dataAiHintForImage = (photo.alt || "wallpaper abstract").split(' ').slice(0,2).join(' ');

  const handleCardClick = () => {
    router.push(`/photo/${photo.id}`);
  };

  async function copyToClipboard(url: string, title: string) {
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
  }

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    const displayAlt = (photo.alt && photo.alt.trim() !== '') ? photo.alt : `Wallpaper by ${photo.photographer}`;
    const shareTitle = displayAlt;
    const shareText = `Check out this amazing wallpaper on Wallify: "${displayAlt}" by ${photo.photographer}.`;
    
    const query = encodeURIComponent(displayAlt);
    const shareUrl = `${window.location.origin}/search?query=${query}`; 

    const shareData = { title: shareTitle, text: shareText, url: shareUrl };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({ title: "Shared successfully!", description: "The wallpaper link has been shared." });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          if (error.message && error.message.toLowerCase().includes('permission denied')) {
            toast({
              title: "Share Permission Denied",
              description: "Browser prevented sharing. Trying to copy link instead. Check site permissions if this persists.",
              variant: "default",
              duration: 7000,
            });
          } else {
            console.error("Web Share API error:", error); 
            toast({ title: "Sharing via App Failed", description: "Trying to copy link to clipboard instead...", variant: "default" });
          }
          await copyToClipboard(shareData.url, shareTitle);
        }
      }
    } else {
      toast({ title: "Web Share Not Supported", description: "Trying to copy link to clipboard instead...", variant: "default" });
      await copyToClipboard(shareData.url, shareTitle);
    }
  };
  
  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer group transition-all duration-300 ease-in-out",
        "bg-card border-border shadow-md hover:shadow-xl focus-within:shadow-xl",
        "rounded-lg"
      )}
      onClick={handleCardClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick()}
      aria-label={cardAriaLabel}
    >
      <CardContent className="p-0 relative">
        <div className="relative w-full"> {/* Container for image to maintain aspect ratio with h-auto on Image */}
          <Image
            src={imageSrc}
            alt={imageAltText}
            width={photo.width} 
            height={photo.height}
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="w-full h-auto object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            priority={photo.id < 3000000} 
            placeholder="blur"
            blurDataURL={photo.src.tiny}
            data-ai-hint={dataAiHintForImage}
          />
        </div>
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 flex items-end justify-between p-2 sm:p-3",
            "bg-gradient-to-t from-black/70 via-black/50 to-transparent",
            "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 ease-in-out"
          )}
        >
          <div className="text-white drop-shadow-md flex-grow min-w-0">
            <p className="text-xs xxs:text-sm font-semibold truncate leading-snug" title={overlayTitle}>
              {overlayTitle}
            </p>
            {photo.photographer && (
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
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-2">
            <Button
              variant="ghost"
              size="icon"
              className="p-1.5 sm:p-2 bg-white/20 hover:bg-white/30 text-white rounded-full h-auto w-auto"
              onClick={handleShareClick}
              aria-label="Share wallpaper"
            >
              <Share2 size={16} className="sm:size-[18px]" />
            </Button>
            {/* Save button removed */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
