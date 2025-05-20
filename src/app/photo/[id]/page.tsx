
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPhotoById } from '@/lib/pexels';
import { StructuredData } from '@/components/structured-data';
import type { ImageObject as SchemaImageObject, Person as SchemaPerson, Organization as SchemaOrganization, MinimalWithContext } from '@/types/schema-dts';
import type { PexelsPhoto } from '@/types/pexels';
import { PhotoPageClientWrapper } from '@/components/photo-page-client-wrapper';

type PhotoPageProps = {
  params: { id: string };
};

export default async function PhotoPage({ params }: PhotoPageProps) {
  const id = params.id;
  if (isNaN(Number(id))) {
    console.log(`[PhotoPage Server] Invalid photo ID (NaN): ${id}. Rendering 404.`);
    notFound();
  }
  const photo = await getPhotoById(id);

  if (!photo) {
    console.log(`[PhotoPage Server] Photo with ID ${id} not found or API call failed. Rendering 404. Check PEXELS_API_KEY in deployment environment.`); // Added log
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
    width: { '@type': 'Distance', value: photo.width.toString(), unitCode: 'E37' }, // E37 is not standard, but often used as placeholder for px
    height: { '@type': 'Distance', value: photo.height.toString(), unitCode: 'E37' },
    author: {
      '@type': 'Person',
      name: photo.photographer,
      url: photo.photographer_url || undefined, // Ensure URL is not null
    } as SchemaPerson,
    copyrightHolder: {
      '@type': 'Person',
      name: photo.photographer,
      url: photo.photographer_url || undefined, // Ensure URL is not null
    } as SchemaPerson,
    license: 'https://www.pexels.com/license/',
    acquireLicensePage: photo.url || undefined, // Ensure URL is not null
    provider: {
      '@type': 'Organization',
      name: 'Pexels',
      url: 'https://www.pexels.com',
    } as SchemaOrganization,
  };

  let relatedQuery = 'abstract nature wallpaper'; // Default fallback
  if (photo.alt && photo.alt.trim() !== '') {
    const altWords = photo.alt.split(' ');
    if (altWords.length >= 3) {
      relatedQuery = altWords.slice(0, 3).join(' ');
    } else {
      relatedQuery = photo.alt + ' wallpaper background'; // For shorter alt texts
    }
  } else if (photo.photographer) {
      relatedQuery = photo.photographer + ' photography style';
  }
  
  const initialSearchTermForHeader = photo.alt || "Wallpaper";


  return (
    <>
      <StructuredData data={imageSchema} />
      <PhotoPageClientWrapper photo={photo} relatedQuery={relatedQuery} initialSearchTerm={initialSearchTermForHeader} />
    </>
  );
}
