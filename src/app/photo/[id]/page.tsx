
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPhotoById } from '@/lib/pexels';
import type { PexelsPhoto } from '@/types/pexels';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, User, Share2, Bookmark, ArrowLeft, Home } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ThemeToggle } from '@/components/theme-toggle';
import { downloadFile } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { StructuredData } from '@/components/structured-data';
import type { ImageObject as SchemaImageObject, Person as SchemaPerson, Organization as SchemaOrganization, MinimalWithContext } from '@/types/schema-dts';

type PhotoPageProps = {
  params: { id: string };
};

async function copyToClipboard(url: string, title: string) {
  try {
    await navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied!",
      description: `${title} link copied to clipboard.`,
    });
  } catch (err) {
    console.error("Failed to copy link:", err);
    toast({
      title: "Manual Copy Needed",
      description: `Could not copy link automatically. Please copy this link: ${url}`,
      duration: 9000,
      variant: "default",
    });
  }
}

// Client component for interactive buttons
function PhotoActions({ photo }: { photo: PexelsPhoto }) {
  'use client';

  const handleDownload = async () => {
    const photographerName = photo.photographer.replace(/[^a-zA-Z0-9_-\\s]/g, '').replace(/\\s+/g, '_');
    const filename = `wallify_${photographerName}_${photo.id}_original.jpg`;
    toast({
      title: "Download Starting",
      description: `Preparing ${filename} for download...`,
    });
    try {
      await downloadFile(photo.src.original, filename);
      toast({
        title: "Download Complete",
        description: `${filename} has been downloaded.`,
      });
    } catch (error) {
      console.error('Error downloading wallpaper:', error);
      toast({
        title: "Download Failed",
        description: "Could not download the wallpaper. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const displayAlt = (photo.alt && photo.alt.trim() !== '') ? photo.alt : `Wallpaper by ${photo.photographer}`;
    const shareTitle = displayAlt;
    const shareText = `Check out this amazing wallpaper on Wallify: "${displayAlt}" by ${photo.photographer}.`;
    const query = encodeURIComponent(displayAlt);
    const shareUrl = `${window.location.origin}/search?query=${query}`;

    const shareData = { title: shareTitle, text: shareText, url: shareUrl };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({ title: "Shared successfully!" });
      } catch (error) {
         const err = error as Error;
        if (err.name !== 'AbortError') {
            if (err.message && err.message.toLowerCase().includes('permission denied')) {
                 toast({
                    title: "Share Permission Denied",
                    description: "Browser prevented sharing. Trying to copy link instead. Check site permissions if this persists.",
                    variant: "default",
                    duration: 7000,
                });
            } else {
                console.error("Error sharing:", err);
                toast({ title: "Sharing via App Failed", description: "Trying to copy link instead.", variant: "default"});
            }
            await copyToClipboard(shareData.url, shareTitle);
        }
      }
    } else {
      toast({ title: "Web Share Not Supported", description: "Trying to copy link instead.", variant: "default" });
      await copyToClipboard(shareData.url, shareTitle);
    }
  };
  
  const handleSave = () => {
    toast({
      title: "Save Feature",
      description: "Saving wallpapers will be available soon!",
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-4 md:mt-0">
      <Button onClick={handleShare} variant="outline" size="sm" className="h-9 text-sm">
        <Share2 className="mr-2 h-4 w-4" /> Share
      </Button>
      <Button onClick={handleSave} variant="outline" size="sm" className="h-9 text-sm">
        <Bookmark className="mr-2 h-4 w-4" /> Save
      </Button>
      <Button onClick={handleDownload} size="sm" className="h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90">
        <Download className="mr-2 h-4 w-4" /> Download Original
      </Button>
      <Button variant="outline" size="sm" asChild className="h-9 text-sm">
        <a href={photo.url} target="_blank" rel="noopener noreferrer" aria-label="View original image on Pexels (opens in new tab)">
          Pexels <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}


export default async function PhotoPage({ params }: PhotoPageProps) {
  const id = params.id;
  if (isNaN(Number(id))) { // Pexels IDs are numbers
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
      url: photo.photographer_url,
    } as SchemaPerson,
    copyrightHolder: {
      '@type': 'Person',
      name: photo.photographer,
      url: photo.photographer_url,
    } as SchemaPerson,
    license: 'https://www.pexels.com/license/',
    acquireLicensePage: photo.url,
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
                  <a
                    href={photo.photographer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline focus:underline focus:outline-none"
                    aria-label={`View profile of photographer ${photo.photographer} (opens in new tab)`}
                  >
                    {photo.photographer}
                  </a>
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

