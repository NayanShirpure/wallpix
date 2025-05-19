
'use client';

import type { PexelsPhoto, DeviceOrientationCategory } from '@/types/pexels'; // DeviceOrientationCategory might not be needed here anymore
import { WallpaperCard } from './WallpaperCard';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { cn } from '@/lib/utils';

interface WallpaperGridProps {
  photos: PexelsPhoto[];
  // orientation prop is removed as card adapts to image aspect ratio for masonry
  onPhotoClick: (photo: PexelsPhoto) => void;
}

export function WallpaperGrid({ photos, onPhotoClick }: WallpaperGridProps) {

  const isLikelyUsingMockData =
    photos &&
    photos.length > 0 &&
    photos.every(p => p.photographer === 'Mock Photographer');

  // NEXT_PUBLIC_PEXELS_API_KEY is removed, so this check is simplified
  const isApiKeyMissingOrPlaceholder = !process.env.PEXELS_API_KEY || /your_actual_pexels_api_key/i.test(process.env.PEXELS_API_KEY || "");


  if (isLikelyUsingMockData && isApiKeyMissingOrPlaceholder && process.env.NODE_ENV === 'development') {
     return (
        <Alert variant="default" className="bg-primary/10 border-primary/30 text-primary-foreground my-4 mx-auto max-w-3xl">
          <Info className="h-5 w-5 text-primary" />
          <AlertTitle className="text-primary font-semibold">PEXELS API Key Notice</AlertTitle>
          <AlertDescription className="text-primary/90">
            The Pexels API key (PEXELS_API_KEY) is not configured correctly or is using a placeholder.
            Displaying mock data. To fetch real wallpapers, please set this server-side environment variable 
            (e.g., in your .env.local file or Vercel settings) and restart your development server.
            <br />
            Example: <code className="bg-primary/20 px-1 rounded mx-0.5">PEXELS_API_KEY=YOUR_ACTUAL_PEXELS_API_KEY</code>
          </AlertDescription>
        </Alert>
     );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground">No wallpapers found.</p>
        {process.env.NODE_ENV === 'development' && isApiKeyMissingOrPlaceholder && (
            <p className="text-sm text-muted-foreground mt-2">Is your PEXELS_API_KEY (server-side) set correctly?</p>
        )}
      </div>
    );
  }

  // Use CSS multi-column layout for masonry effect
  const gridClasses = cn(
    "p-1", // Basic padding
    // Responsive columns for masonry layout
    "columns-2 xs:columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6", 
    "gap-2 sm:gap-3 md:gap-4" // Gap between columns
  );

  return (
    <>
      <div className={gridClasses}>
        {photos.map((photo) => (
          <WallpaperCard
            key={`${photo.id}-masonry`} // Ensure unique key
            photo={photo}
            onClick={() => onPhotoClick(photo)}
            // No orientation prop passed as card handles its own aspect ratio
          />
        ))}
      </div>
    </>
  );
}
