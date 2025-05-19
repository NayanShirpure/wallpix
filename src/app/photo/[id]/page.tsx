
import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation'; // Added useRouter
import { getPhotoById } from '@/lib/pexels';
import { GlobalHeader } from '@/components/layout/GlobalHeader'; // Changed import
import { ThemeToggle } from '@/components/theme-toggle';
import { StructuredData } from '@/components/structured-data';
import type { ImageObject as SchemaImageObject, Person as SchemaPerson, Organization as SchemaOrganization, MinimalWithContext } from '@/types/schema-dts';
import { PhotoActions } from '@/components/photo-actions';
import { RelatedWallpapersGrid } from '@/components/wallpaper/RelatedWallpapersGrid';
import { User } from 'lucide-react';
import type { DeviceOrientationCategory } from '@/types/pexels'; // Added for GlobalHeader prop

type PhotoPageProps = {
  params: { id: string };
};

// This function now needs to be a client component or pass client-compatible handlers if GlobalHeader is interactive.
// For this iteration, we'll make the page a client component to handle router interactions from GlobalHeader.
// However, to keep data fetching server-side as much as possible, a better pattern would be a server component
// fetching data, and a client component rendering GlobalHeader and the photo details.
// For now, let's adjust it to work with GlobalHeader as a client component within this page.

export default async function PhotoPage({ params }: PhotoPageProps) {
  const id = params.id;
  if (isNaN(Number(id))) {
    notFound();
  }
  const photo = await getPhotoById(id);

  if (!photo) {
    notFound();
  }

  const displayAlt = (photo.alt && photo.alt.trim() !== '') ? photo.alt : `Wallpaper by ${photo.photographer}`;
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

  let relatedQuery = 'abstract nature wallpaper';
  if (photo.alt && photo.alt.trim() !== '') {
    relatedQuery = photo.alt.split(' ').slice(0, 3).join(' ');
    if (relatedQuery.length < 5 && photo.alt.split(' ').length <= 2) {
        relatedQuery = photo.alt + ' wallpaper background';
    }
  } else if (photo.photographer) {
      relatedQuery = photo.photographer + ' photography style';
  }
  
  // Client-side handlers for GlobalHeader
  // These will be passed to the client component PhotoPageContent
  const initialSearchTermForHeader = photo.alt || "Wallpaper";


  return (
    <>
      <StructuredData data={imageSchema} />
      {/* 
        GlobalHeader is a Client Component. We pass handlers that will work on the client.
        Since PhotoPage is a Server Component, we need a way to bridge this.
        A common pattern is to have a child client component that handles the GlobalHeader.
        For now, we'll pass navigation-based handlers.
      */}
      <PhotoPageClientWrapper photo={photo} relatedQuery={relatedQuery} initialSearchTerm={initialSearchTermForHeader} />
    </>
  );
}

// New Client Component to wrap the content and handle GlobalHeader's client-side needs
function PhotoPageClientWrapper({ 
  photo, 
  relatedQuery,
  initialSearchTerm
}: { 
  photo: NonNullable<Awaited<ReturnType<typeof getPhotoById>>>, 
  relatedQuery: string,
  initialSearchTerm: string 
}) {
  'use client'; // This component will be a client component

  const router = useRouter();
  const [currentDeviceOrientation, setCurrentDeviceOrientation] = useState<DeviceOrientationCategory>('desktop');

  const handleDeviceOrientationChange = (newCategory: DeviceOrientationCategory) => {
    // This page primarily shows one image, so changing orientation here might not be
    // very useful for the main content, but the header needs the prop.
    setCurrentDeviceOrientation(newCategory);
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
        currentDeviceOrientation={currentDeviceOrientation} // Default or managed by state
        onDeviceOrientationChange={handleDeviceOrientationChange} // Can be no-op or simple state update
        onWallpaperCategorySelect={handleWallpaperCategorySelect}
        onSearchSubmit={handleSearchSubmit}
        initialSearchTerm={initialSearchTerm}
        navigateToSearchPage={true} // Navigates away from this page on search/category
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
                  {photo.photographer_url ? (
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

// Need to ensure useState is imported
import { useState } from 'react';
