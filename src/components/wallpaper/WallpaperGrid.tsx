
'use client';

import type { PexelsPhoto } from '@/types/pexels';
import { WallpaperCard } from './WallpaperCard';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { cn } from '@/lib/utils';

interface WallpaperGridProps {
  photos: PexelsPhoto[];
  // onPhotoClick prop is removed as WallpaperCard now handles navigation
}

export function WallpaperGrid({ photos }: WallpaperGridProps) {

  const isLikelyUsingMockData =
    photos &&
    photos.length > 0 &&
    photos.every(p => p.photographer === 'Mock Photographer');

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

  const gridClasses = cn(
    "p-1", 
    "columns-2 xs:columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6", 
    "gap-2 sm:gap-3 md:gap-4" 
  );

  return (
    <>
      <div className={gridClasses}>
        {photos.map((photo) => (
          <WallpaperCard
            key={`${photo.id}-masonry`} 
            photo={photo}
            // onClick is removed
          />
        ))}
      </div>
    </>
  );
}
