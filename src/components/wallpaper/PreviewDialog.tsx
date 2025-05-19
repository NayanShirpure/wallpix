
'use client';

import React, { useState, useEffect } from 'react';
import type { PexelsPhoto } from '@/types/pexels';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Download, ExternalLink, User, X, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { downloadFile } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PreviewDialogProps {
  photo: PexelsPhoto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewDialog({ photo, isOpen, onClose }: PreviewDialogProps) {
  const [selectedDownloadUrl, setSelectedDownloadUrl] = useState<string>('');
  const [selectedResolutionLabel, setSelectedResolutionLabel] = useState<string>('Original');
  const { toast } = useToast();

  useEffect(() => {
    if (photo) {
      setSelectedDownloadUrl(photo.src.original);
      setSelectedResolutionLabel('Original');
    } else {
      setSelectedDownloadUrl('');
      setSelectedResolutionLabel('Original');
    }
  }, [photo]);

  if (!photo) return null;

  const isAiGenerated = photo.photographer === 'AI Generator (Wallify)';

  const downloadOptions = isAiGenerated ? [] : [
    { label: 'Original', url: photo.src.original, resolution: `${photo.width}x${photo.height}` },
    { label: 'Large (2x)', url: photo.src.large2x, resolution: 'Approx 1920px wide' },
    { label: 'Large', url: photo.src.large, resolution: 'Approx 1280px wide' },
    { label: 'Medium', url: photo.src.medium, resolution: 'Approx 640px wide' },
    // { label: 'Small', url: photo.src.small, resolution: 'Approx 320px wide' }, // Often too small for wallpaper
    { label: 'Portrait Optimized', url: photo.src.portrait, resolution: 'Optimized for Portrait' },
    { label: 'Landscape Optimized', url: photo.src.landscape, resolution: 'Optimized for Landscape' },
  ].filter(opt => opt.url);

  const handleDownload = async () => {
    if (!selectedDownloadUrl || !photo) return;
    const photographerName = photo.photographer.replace(/[^a-zA-Z0-9_-\s]/g, '').replace(/\s+/g, '_');
    const simpleResLabel = selectedResolutionLabel.split(' ')[0].replace('(', '').replace(')', '');
    const filenameSuffix = isAiGenerated ? 'ai_generated' : photographerName;
    const filename = `wallify_${filenameSuffix}_${photo.id}_${simpleResLabel}.jpg`;

    toast({
      title: "Download Starting",
      description: `Preparing ${filename} for download...`,
    });
    try {
      await downloadFile(selectedDownloadUrl, filename);
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

  const handleSelectChange = (value: string) => {
    const selectedOpt = downloadOptions.find(opt => opt.url === value);
    if (selectedOpt) {
      setSelectedDownloadUrl(selectedOpt.url);
      setSelectedResolutionLabel(selectedOpt.label);
    }
  };

  const displayAlt = (photo.alt && photo.alt.trim() !== '') ? photo.alt : (isAiGenerated ? 'AI Generated Wallpaper' : `Wallpaper by ${photo.photographer}`);
  const imageAlt = (photo.alt && photo.alt.trim() !== '') ? photo.alt : 'Full-size wallpaper preview';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "p-0 border-none !rounded-lg shadow-2xl bg-background/80 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "w-[95vw] h-[90vh] sm:w-[90vw] sm:h-[90vh] md:w-[80vw] md:h-[90vh] lg:w-[70vw] xl:w-[60vw]" // Responsive sizing
      )}>
        <DialogHeader className="sr-only">
          <DialogTitle>{displayAlt}</DialogTitle>
          <DialogDescription>
            Full-size preview of the selected wallpaper. Actions to download or view source are available.
          </DialogDescription>
        </DialogHeader>
        <div className="relative w-full h-full flex flex-col">
          {/* Close Button - Top Right Overlay */}
          <DialogClose
            onClick={onClose}
            className="absolute top-2 right-2 z-20 text-white bg-black/40 hover:bg-black/60 rounded-full p-1.5 sm:p-2 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/30 transition-colors"
            aria-label="Close preview"
          >
            <X size={18} className="sm:size-5" />
          </DialogClose>

          {/* Image Display Area */}
          <div className="relative flex-grow w-full h-full bg-black/30 flex items-center justify-center overflow-hidden rounded-t-lg">
            <Image
              src={photo.src.large2x || photo.src.original} // Prefer higher res for preview
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 90vw, (max-width: 1280px) 80vw, 70vw"
              className="object-contain" // Ensure image fits without cropping
              priority
              placeholder="blur"
              blurDataURL={photo.src.tiny}
              data-ai-hint={photo.alt ? photo.alt.split(' ').slice(0,2).join(' ') : "wallpaper image detail"}
            />
          </div>

          {/* Information and Actions Overlay - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10 rounded-b-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              {/* Left side: Title and Photographer */}
              <div className="text-white overflow-hidden flex-shrink min-w-0">
                <h2 className="text-sm sm:text-base font-semibold truncate" title={displayAlt}>
                  {displayAlt}
                </h2>
                {!isAiGenerated && (
                  <a
                    href={photo.photographer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-300 hover:text-accent focus:text-accent focus:outline-none focus:underline flex items-center gap-1 truncate"
                    aria-label={`View profile of photographer ${photo.photographer} (opens in new tab)`}
                  >
                    <User size={12} /> {photo.photographer}
                  </a>
                )}
                 {isAiGenerated && (
                  <p className="text-xs text-gray-300 flex items-center gap-1">
                    <User size={12} /> AI Generator (Wallify)
                  </p>
                )}
              </div>

              {/* Right side: Actions */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {!isAiGenerated && (
                  <Button variant="outline" size="sm" asChild className="h-8 sm:h-9 text-xs sm:text-sm bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm px-2 sm:px-3">
                    <a
                      href={photo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="View original image on Pexels (opens in new tab)"
                    >
                      Pexels <ExternalLink className="ml-1 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </a>
                  </Button>
                )}

                {!isAiGenerated && downloadOptions.length > 0 && (
                  <Select value={selectedDownloadUrl} onValueChange={handleSelectChange}>
                    <SelectTrigger 
                      className="h-8 sm:h-9 text-xs sm:text-sm bg-white/10 hover:bg-white/20 border-white/30 text-white focus:ring-accent focus:ring-offset-black/30 focus:border-accent backdrop-blur-sm w-auto min-w-[120px] sm:min-w-[150px] pr-2"
                      aria-label="Select download resolution"
                    >
                      <span className="truncate mr-1">
                        <Download className="inline mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        {selectedResolutionLabel.split(' ')[0]}
                      </span>
                      {/* Custom chevron, default is hidden via SelectTrigger style */}
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      {downloadOptions.map(opt => (
                        <SelectItem key={opt.label} value={opt.url} disabled={!opt.url} className="text-xs sm:text-sm">
                          {opt.label} <span className="text-muted-foreground ml-1">({opt.resolution})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                 {(isAiGenerated || (!isAiGenerated && downloadOptions.length === 0) || (!isAiGenerated && selectedDownloadUrl)) && ( // Show download button for AI, or if Pexels image and options are available/selected
                    <Button
                        onClick={handleDownload}
                        className="h-8 sm:h-9 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md text-xs sm:text-sm px-3"
                        disabled={!selectedDownloadUrl}
                        aria-label={isAiGenerated ? "Download AI generated wallpaper" : `Download wallpaper in ${selectedResolutionLabel} resolution`}
                    >
                        <Download className="mr-1.5 h-3.5 w-3.5" /> {isAiGenerated ? "Download" : "Download"}
                    </Button>
                 )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

