
'use client';

import type { PexelsPhoto } from '@/types/pexels';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Share2, Bookmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadFile } from '@/lib/utils';

export function PhotoActions({ photo }: { photo: PexelsPhoto }) {
  const { toast } = useToast();

  const copyToClipboardLocal = async (url: string, title: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied!",
        description: `${title} link copied to clipboard.`,
      });
    } catch (copyErr) {
      console.error("Failed to copy link to clipboard:", copyErr);
      toast({
        title: "Manual Copy Needed",
        description: `Could not copy link automatically. Please copy this link: ${url}`,
        duration: 9000,
        variant: "default",
      });
    }
  };

  const handleDownload = async () => {
    if (!photo || !photo.src || !photo.src.original) {
      toast({ title: "Error", description: "Photo data is incomplete for download.", variant: "destructive" });
      return;
    }
    const photographerName = photo.photographer.replace(/[^a-zA-Z0-9_\\-\\s]/g, '').replace(/\s+/g, '_');
    const filename = `wallify_${photographerName}_${photo.id}_original.jpg`;
    toast({
      title: "Download Starting",
      description: `Preparing ${filename} for download...`,
    });
    try {
      await downloadFile(photo.src.original, filename);
      toast({
        title: "Download Complete",
        description: `${filename} has been downloaded.`,
      });
    } catch (error) {
      console.error('Error downloading wallpaper:', error);
      toast({
        title: "Download Failed",
        description: "Could not download the wallpaper. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!photo) {
       toast({ title: "Error", description: "Photo data is incomplete for sharing.", variant: "destructive" });
       return;
    }
    const displayAlt = (photo.alt && photo.alt.trim() !== '') ? photo.alt : `Wallpaper by ${photo.photographer}`;
    const shareTitle = displayAlt;
    const shareText = `Check out this amazing wallpaper on Wallify: "${displayAlt}" by ${photo.photographer}.`;
    const shareUrl = `${window.location.origin}/photo/${photo.id}`; // Link to the dedicated photo page

    const shareData = { title: shareTitle, text: shareText, url: shareUrl };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({ title: "Shared successfully!" });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
            if (err.message && err.message.toLowerCase().includes('permission denied')) {
                 toast({
                    title: "Share Permission Denied",
                    description: "Browser prevented sharing. Trying to copy link instead. Check site permissions if this persists.",
                    variant: "default",
                    duration: 7000,
                });
                await copyToClipboardLocal(shareData.url, shareTitle);
            } else {
                console.error("Error sharing via navigator.share:", err); // Log other errors
                toast({ title: "Sharing via App Failed", description: "Trying to copy link instead.", variant: "default"});
                await copyToClipboardLocal(shareData.url, shareTitle);
            }
        }
      }
    } else {
      toast({ title: "Web Share Not Supported", description: "Trying to copy link instead.", variant: "default" });
      await copyToClipboardLocal(shareData.url, shareTitle);
    }
  };
  
  const handleSave = () => {
    toast({
      title: "Save Feature",
      description: "Saving wallpapers will be available soon!",
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-4 md:mt-0">
      <Button onClick={handleShare} variant="outline" size="sm" className="h-9 text-sm">
        <Share2 className="mr-2 h-4 w-4" /> Share
      </Button>
      <Button onClick={handleSave} variant="outline" size="sm" className="h-9 text-sm">
        <Bookmark className="mr-2 h-4 w-4" /> Save
      </Button>
      <Button onClick={handleDownload} size="sm" className="h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90">
        <Download className="mr-2 h-4 w-4" /> Download Original
      </Button>
      {photo.url && (photo.url.trim() !== '') && (
        <Button variant="outline" size="sm" asChild className="h-9 text-sm">
          <a href={photo.url} target="_blank" rel="noopener noreferrer" aria-label="View original image on Pexels (opens in new tab)">
            Pexels <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      )}
    </div>
  );
}
