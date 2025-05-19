
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPhotoById } from '@/lib/pexels';
import type { PexelsPhoto } from '@/types/pexels';
import { Button } from '@/components/ui/button';
import { User, Home } from 'lucide-react'; // Removed Download, ExternalLink, Share2, Bookmark as they are in PhotoActions
import { PageHeader } from '@/components/layout/PageHeader';
import { ThemeToggle } from '@/components/theme-toggle';
import { StructuredData } from '@/components/structured-data';
import type { ImageObject as SchemaImageObject, Person as SchemaPerson, Organization as SchemaOrganization, MinimalWithContext } from '@/types/schema-dts';
import { PhotoActions } from '@/components/photo-actions'; // Import PhotoActions

type PhotoPageProps = {
  params: { id: string };
};

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
    width: { '@type': 'Distance', value: photo.width.toString(), unitCode: 'E37' }, // E37 is for pixel, common unit for schema
    height: { '@type': 'Distance', value: photo.height.toString(), unitCode: 'E37' },
    author: {
      '@type': 'Person',
      name: photo.photographer,
      url: photo.photographer_url || undefined, // Fallback for schema
    } as SchemaPerson,
    copyrightHolder: {
      '@type': 'Person',
      name: photo.photographer,
      url: photo.photographer_url || undefined, // Fallback for schema
    } as SchemaPerson,
    license: 'https://www.pexels.com/license/',
    acquireLicensePage: photo.url || undefined, // Fallback for schema
    provider: {
      '@type': 'Organization',
      name: 'Pexels',
      url: 'https://www.pexels.com',
    } as SchemaOrganization,
  };

  return (
    <>
      <StructuredData data={imageSchema} />
      <PageHeader
        title="Wallpaper Details"
        backHref="/"
        backTextDesktop="Back to Wallify"
        backTextMobile="Home"
      >
        <ThemeToggle />
      </PageHeader>
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

        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> Explore More Wallpapers
            </Link>
          </Button>
        </div>
      </main>
    </>
  );
}
