'use client';

import type { PexelsPhoto, DeviceOrientationCategory } from '@/types/pexels';
import { WallpaperCard } from './WallpaperCard';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface WallpaperGridProps {
  photos: PexelsPhoto[];
  orientation: DeviceOrientationCategory;
  onPhotoClick: (photo: PexelsPhoto) => void;
}

export function WallpaperGrid({ photos, orientation, onPhotoClick }: WallpaperGridProps) {

  // Determine if mock data is being used due to API key issues.
  // This check is primarily for development to guide the user.
  const isLikelyUsingMockData =
    photos &&
    photos.length > 0 &&
    photos.every(p => p.photographer === 'Mock Photographer');

  const isApiKeyMissingOrPlaceholder = !process.env.NEXT_PUBLIC_PEXELS_API_KEY ||
                                    /your_actual_pexels_api_key/i.test(process.env.NEXT_PUBLIC_PEXELS_API_KEY || "");


  if (isLikelyUsingMockData && isApiKeyMissingOrPlaceholder && process.env.NODE_ENV === 'development') {
     return (
        <Alert variant="default" className="bg-primary/10 border-primary/30 text-primary-foreground my-4">
          <Info className="h-5 w-5 text-primary" />
          <AlertTitle className="text-primary font-semibold">PEXELS API Key Notice</AlertTitle>
          <AlertDescription className="text-primary/90">
            The Pexels API key (NEXT_PUBLIC_PEXELS_API_KEY) is not configured correctly or is using a placeholder.
            Displaying mock data. To fetch real wallpapers, please set the <code className="bg-primary/20 px-1 rounded mx-0.5">PEXELS_API_KEY</code> environment variable in your
            <code className="bg-primary/20 px-1 rounded mx-0.5">.env.local</code> file and restart your development server.
            <br />
            Example: <code className="bg-primary/20 px-1 py-0.5 rounded text-xs">PEXELS_API_KEY=YOUR_ACTUAL_PEXELS_API_KEY</code>
          </AlertDescription>
        </Alert>
     );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground">No wallpapers found.</p>
        {process.env.NODE_ENV === 'development' && isApiKeyMissingOrPlaceholder && (
            <p className="text-sm text-muted-foreground mt-2">Is your PEXELS_API_KEY set correctly in .env.local?</p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {photos.map((photo) => (
          <WallpaperCard
            key={`${photo.id}-${orientation}`}
            photo={photo}
            onClick={() => onPhotoClick(photo)}
            orientation={orientation}
          />
        ))}
      </div>
    </>
  );
}