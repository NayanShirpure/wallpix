
'use client';

import React, { useState, useEffect } from 'react'; // Added useState, useEffect import
import type { PexelsPhoto } from '@/types/pexels';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Download, ExternalLink, User, Image as ImageIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PreviewDialogProps {
  photo: PexelsPhoto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewDialog({ photo, isOpen, onClose }: PreviewDialogProps) {
  // Initialize selectedDownloadUrl safely, considering photo might be null
  const [selectedDownloadUrl, setSelectedDownloadUrl] = useState<string>(photo?.src.original || '');

  // useEffect to update selectedDownloadUrl when the photo prop changes
  useEffect(() => {
    if (photo) {
      setSelectedDownloadUrl(photo.src.original);
    } else {
      // Reset if photo becomes null after being set
      setSelectedDownloadUrl('');
    }
  }, [photo]);

  if (!photo) return null;

  const downloadOptions = [
    { label: 'Original', url: photo.src.original, resolution: `${photo.width}x${photo.height}` },
    { label: 'Large (1920px wide)', url: photo.src.large2x, resolution: '1920x...' },
    { label: 'Medium (1280px wide)', url: photo.src.large, resolution: '1280x...' },
    { label: 'Small (640px wide)', url: photo.src.medium, resolution: '640x...' },
  ];

  const handleDownload = () => {
    if (selectedDownloadUrl) { // Ensure URL is not empty
      window.open(selectedDownloadUrl, '_blank');
    }
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="truncate">{photo.alt || 'Wallpaper Preview'}</DialogTitle>
          <DialogDescription className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center"><User className="mr-1 h-4 w-4" /> {photo.photographer}</span>
            <span className="flex items-center"><ImageIcon className="mr-1 h-4 w-4" /> {photo.width} x {photo.height} px</span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow relative overflow-hidden p-6 pt-2">
          <Image
            src={photo.src.large2x}
            alt={photo.alt || 'Wallpaper'}
            fill
            style={{ objectFit: 'contain' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
            data-ai-hint={photo.alt ? photo.alt.split(' ').slice(0,2).join(' ') : "wallpaper image"}
            priority // Consider adding priority if this dialog opens frequently with new images
          />
        </div>
        <DialogFooter className="p-6 pt-2 border-t bg-background/80 flex-col sm:flex-row items-center">
          <Button variant="outline" asChild>
            <a href={photo.url} target="_blank" rel="noopener noreferrer">
              View on Pexels <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Select value={selectedDownloadUrl} onValueChange={setSelectedDownloadUrl}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Select resolution" />
              </SelectTrigger>
              <SelectContent>
                {downloadOptions.map(opt => (
                  <SelectItem key={opt.label} value={opt.url} disabled={!opt.url}>
                    {opt.label} ({opt.resolution})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleDownload} className="w-full sm:w-auto" disabled={!selectedDownloadUrl}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
