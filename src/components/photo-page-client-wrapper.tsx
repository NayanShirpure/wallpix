
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { PexelsPhoto, DeviceOrientationCategory } from '@/types/pexels';
import { GlobalHeader } from '@/components/layout/GlobalHeader';
import { PhotoActions } from '@/components/photo-actions';
import { RelatedWallpapersGrid } from '@/components/wallpaper/RelatedWallpapersGrid';
import { User } from 'lucide-react';

interface PhotoPageClientWrapperProps {
  photo: PexelsPhoto;
  relatedQuery: string;
  initialSearchTerm: string;
}

export function PhotoPageClientWrapper({
  photo,
  relatedQuery,
  initialSearchTerm
}: PhotoPageClientWrapperProps) {
  const router = useRouter();
  const [currentDeviceOrientation, setCurrentDeviceOrientation] = useState<DeviceOrientationCategory>('desktop');

  const handleDeviceOrientationChange = (newCategory: DeviceOrientationCategory) => {
    setCurrentDeviceOrientation(newCategory);
    // Note: Device orientation change here won't reload the main photo,
    // but could affect how GlobalHeader or future child components behave.
  };

  const handleWallpaperCategorySelect = (categoryValue: string) => {
    router.push(`/search?query=${encodeURIComponent(categoryValue)}`);
  };

  const handleSearchSubmit = (searchTerm: string) => {
    if (searchTerm.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const displayAlt = (photo.alt && photo.alt.trim() !== '') ? photo.alt : `Wallpaper by ${photo.photographer}`;

  return (
    <>
      <GlobalHeader
        currentDeviceOrientation={currentDeviceOrientation}
        onDeviceOrientationChange={handleDeviceOrientationChange}
        onWallpaperCategorySelect={handleWallpaperCategorySelect}
        onSearchSubmit={handleSearchSubmit}
        initialSearchTerm={initialSearchTerm}
        navigateToSearchPage={true}
      />
      <main className="container mx-auto max-w-5xl p-4 md:p-6 py-8 md:py-10">
        <div className="bg-card p-4 sm:p-6 md:p-8 rounded-xl shadow-xl border border-border">
          <div className="relative w-full aspect-[4/3] md:aspect-video max-h-[75vh] rounded-lg overflow-hidden mb-6 shadow-lg bg-muted">
            <Image
              src={photo.src.large2x || photo.src.original}
              alt={displayAlt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
              className="object-contain"
              priority
              placeholder="blur"
              blurDataURL={photo.src.tiny}
              data-ai-hint={photo.alt ? photo.alt.split(' ').slice(0,2).join(' ') : "wallpaper image detail"}
            />
          </div>

          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex-grow">
              <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-1.5 break-words" title={displayAlt}>
                {displayAlt}
              </h1>
              <div className="flex items-center text-muted-foreground text-sm mb-4">
                <User className="mr-2 h-4 w-4" />
                <span>
                  Photographed by{' '}
                  {photo.photographer_url && photo.photographer_url.trim() !== '' ? (
                    <a
                      href={photo.photographer_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline focus:underline focus:outline-none"
                      aria-label={`View profile of photographer ${photo.photographer} (opens in new tab)`}
                    >
                      {photo.photographer}
                    </a>
                  ) : (
                    photo.photographer
                  )}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
               <PhotoActions photo={photo} />
            </div>
          </div>
          
          {photo.alt && photo.alt.trim() !== '' && (
            <div className="mt-6 pt-4 border-t border-border">
              <h2 className="text-lg font-semibold text-foreground mb-2">Description</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{photo.alt}</p>
            </div>
          )}
        </div>
        <RelatedWallpapersGrid initialQuery={relatedQuery} currentPhotoId={photo.id} />
      </main>
    </>
  );
}
