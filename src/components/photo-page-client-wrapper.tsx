
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { PexelsPhoto } from '@/types/pexels';
import { GlobalHeader } from '@/components/layout/GlobalHeader';
import { PhotoActions } from '@/components/photo-actions';
import { RelatedWallpapersGrid } from '@/components/wallpaper/RelatedWallpapersGrid';
import { User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getPhotoById } from '@/lib/pexels'; // For client-side fetching
import { StructuredData } from '@/components/structured-data';
import type { ImageObject as SchemaImageObject, Person as SchemaPerson, Organization as SchemaOrganization, MinimalWithContext } from '@/types/schema-dts';

interface PhotoPageClientWrapperProps {
  photoId: string;
}

export function PhotoPageClientWrapper({ photoId }: PhotoPageClientWrapperProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [photo, setPhoto] = useState<PexelsPhoto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Client-side initial search term for GlobalHeader (can be general)
  const [initialSearchTermForHeader, setInitialSearchTermForHeader] = useState<string>("Wallpaper");


  useEffect(() => {
    if (!photoId) {
      setError("Photo ID is missing.");
      setLoading(false);
      return;
    }
    if (isNaN(Number(photoId))) {
        setError("Invalid Photo ID format.");
        setLoading(false);
        // Optionally, redirect to a 404 or error page
        // router.push('/not-found'); // Or a custom error page
        return;
    }


    const fetchPhotoData = async () => {
      setLoading(true);
      setError(null);
      const fetchedPhoto = await getPhotoById(photoId);
      if (fetchedPhoto) {
        setPhoto(fetchedPhoto);
        setInitialSearchTermForHeader(fetchedPhoto.alt || "Wallpaper"); // Update search header term based on photo
      } else {
        setError(`Photo with ID ${photoId} not found or API call failed.`);
        // console.error(`[PhotoPageClient] Photo with ID ${photoId} not found or API call failed. Check PEXELS_API_KEY in deployment or network issues.`);
        toast({
          title: "Error Loading Photo",
          description: `Could not load details for photo ID ${photoId}. It might not exist or there was an API issue.`,
          variant: "destructive",
          duration: 7000,
        });
      }
      setLoading(false);
    };

    fetchPhotoData();
  }, [photoId, toast]);

  const handleWallpaperCategorySelect = useCallback((categoryValue: string) => {
    if (categoryValue.trim()) {
      router.push(`/search?query=${encodeURIComponent(categoryValue.trim())}`);
    }
  }, [router]);

  const handleSearchSubmit = useCallback((searchTerm: string) => {
    // Navigation is handled by SearchBar component itself
    console.log("Search submitted on Photo page:", searchTerm);
  }, []);

  if (loading) {
    return (
      <>
        <GlobalHeader
          onWallpaperCategorySelect={handleWallpaperCategorySelect}
          onSearchSubmit={handleSearchSubmit}
        />
        <main className="container mx-auto max-w-5xl p-4 md:p-6 py-8 md:py-10" aria-busy="true">
          <div className="bg-card p-4 sm:p-6 md:p-8 rounded-xl shadow-xl border border-border">
            <Skeleton className="relative w-full aspect-[4/3] md:aspect-video max-h-[75vh] rounded-lg mb-6" />
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div className="flex-grow">
                <Skeleton className="h-8 w-3/4 mb-1.5" />
                <Skeleton className="h-5 w-1/2 mb-4" />
              </div>
              <div className="flex-shrink-0">
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-4 md:mt-0">
                  <Skeleton className="h-9 w-24 rounded-md" />
                  <Skeleton className="h-9 w-24 rounded-md" />
                  <Skeleton className="h-9 w-28 rounded-md" />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-border">
             <Skeleton className="h-8 w-1/3 mx-auto mb-6" />
             {/* Skeletons for related grid could go here if desired */}
          </div>
        </main>
      </>
    );
  }

  if (error || !photo) {
    // If there was an error or photo is still null after loading is false
    return (
      <>
        <GlobalHeader
          onWallpaperCategorySelect={handleWallpaperCategorySelect}
          onSearchSubmit={handleSearchSubmit}
        />
        <main className="container mx-auto max-w-5xl p-4 md:p-6 py-8 md:py-10 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Photo Not Available</h1>
          <p className="text-muted-foreground">{error || `The photo with ID ${photoId} could not be loaded.`}</p>
          <button onClick={() => router.push('/')} className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            Back to Home
          </button>
        </main>
      </>
    );
  }

  // If photo is successfully loaded:
  const displayAlt = (photo.alt && photo.alt.trim() !== '') ? photo.alt : `Wallpaper by ${photo.photographer}`;
  const relatedQuery = photo.alt ? photo.alt.split(' ').slice(0, 3).join(' ') || 'abstract nature wallpaper' : 'abstract nature wallpaper';

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wallpix.vercel.app/';
  const imageSchema: MinimalWithContext<SchemaImageObject> = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: displayAlt,
    description: `High-resolution wallpaper by ${photo.photographer}. Dimensions: ${photo.width}x${photo.height}.`,
    contentUrl: photo.src.original,
    thumbnailUrl: photo.src.medium,
    width: { '@type': 'Distance', value: photo.width.toString(), unitCode: 'E37' },
    height: { '@type': 'Distance', value: photo.height.toString(), unitCode: 'E37' },
    author: {
      '@type': 'Person',
      name: photo.photographer,
      url: photo.photographer_url || undefined,
    } as SchemaPerson,
    copyrightHolder: {
      '@type': 'Person',
      name: photo.photographer,
      url: photo.photographer_url || undefined,
    } as SchemaPerson,
    license: 'https://www.pexels.com/license/',
    acquireLicensePage: photo.url || undefined,
    provider: {
      '@type': 'Organization',
      name: 'Pexels',
      url: 'https://www.pexels.com',
    } as SchemaOrganization,
  };


  return (
    <>
      {/* Client-side rendering of structured data if needed, or rely on server page's generic schema */}
      {photo && <StructuredData data={imageSchema} />}
      <GlobalHeader
        onWallpaperCategorySelect={handleWallpaperCategorySelect}
        onSearchSubmit={handleSearchSubmit}
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
        <RelatedWallpapersGrid 
            initialQuery={relatedQuery} 
            currentPhotoId={photo.id}
        />
      </main>
    </>
  );
}

