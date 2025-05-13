
'use client';

import type { PexelsPhoto, DeviceOrientationCategory } from '@/types/pexels';
import { WallpaperCard } from './WallpaperCard';
// PreviewDialog and related state are now managed by the parent page (e.g., page.tsx or explorer/page.tsx)
// import { PreviewDialog } from './PreviewDialog'; 
// import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface WallpaperGridProps {
  photos: PexelsPhoto[];
  orientation: DeviceOrientationCategory; // Added orientation prop
  onPhotoClick: (photo: PexelsPhoto) => void; // Callback for when a photo is clicked
  // initialSelectedPhotoId?: string; // This logic will be handled by parent
}

export function WallpaperGrid({ photos, orientation, onPhotoClick }: WallpaperGridProps) {
  // State for selectedPhoto and isPreviewOpen is removed. Parent will manage this.
  
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {photos.map((photo) => (
          <WallpaperCard
            key={`${photo.id}-${orientation}`} // Ensure key is unique if orientation changes content significantly
            photo={photo}
            onClick={() => onPhotoClick(photo)} // Call the passed-in handler
            orientation={orientation} // Pass orientation to WallpaperCard
          />
        ))}
      </div>
      {/* PreviewDialog is no longer rendered here. Parent component (page.tsx / explorer.tsx) will render it. */}
    </>
  );
}
