'use client';

import type { PexelsPhoto } from '@/types/pexels';
import { WallpaperCard } from './WallpaperCard';
import { PreviewDialog } from './PreviewDialog';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface WallpaperGridProps {
  photos: PexelsPhoto[];
  initialSelectedPhotoId?: string;
}

export function WallpaperGrid({ photos, initialSelectedPhotoId }: WallpaperGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PexelsPhoto | null>(() => {
    if (initialSelectedPhotoId) {
      return photos.find(p => p.id.toString() === initialSelectedPhotoId) || null;
    }
    return null;
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(!!initialSelectedPhotoId);

  const handleCardClick = (photo: PexelsPhoto) => {
    setSelectedPhoto(photo);
    setIsPreviewOpen(true);
    // Update URL without navigation for better UX (optional)
    // window.history.pushState({}, '', `/?photoId=${photo.id}`);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    // Update URL without navigation (optional)
    // window.history.pushState({}, '', window.location.pathname); 
  };
  
  // Updated condition: check photos.length > 0 before photos.every
  if (!process.env.NEXT_PUBLIC_PEXELS_API_KEY && photos && photos.length > 0 && photos.every(p => p.photographer === 'Mock Photographer')) {
     return (
        <Alert variant="default" className="bg-primary/10 border-primary/30 text-primary-foreground">
          <Info className="h-5 w-5 text-primary" />
          <AlertTitle className="text-primary">Pexels API Key Missing</AlertTitle>
          <AlertDescription className="text-primary/80">
            The Pexels API key is not configured. Displaying mock data. Please set the PEXELS_API_KEY environment variable in a .env.local file to fetch real wallpapers.
            <br />
            Example: <code className="bg-primary/20 px-1 rounded">PEXELS_API_KEY=YOUR_ACTUAL_PEXELS_API_KEY</code>
          </AlertDescription>
        </Alert>
     );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground">No wallpapers found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {photos.map((photo) => (
          <WallpaperCard
            key={photo.id}
            photo={photo}
            onClick={() => handleCardClick(photo)}
          />
        ))}
      </div>
      <PreviewDialog
        photo={selectedPhoto}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
      />
    </>
  );
}

