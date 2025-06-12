
// This is now a simple Server Component that passes the ID to the client wrapper.
// Data fetching for the photo will happen client-side.

import { notFound } from 'next/navigation';
import { PhotoPageClientWrapper } from '@/components/photo-page-client-wrapper';
import { StructuredData } from '@/components/structured-data';
// For a generic page schema, not image specific as data is client-fetched
import type { WebPage as SchemaWebPage, MinimalWithContext } from '@/types/schema-dts';

type PhotoPageProps = {
  params: { id: string };
};

export default async function PhotoPage({ params }: PhotoPageProps) {
  const id = params.id;

  if (isNaN(Number(id))) {
    // console.log(`[PhotoPage Server] Invalid photo ID (NaN): ${id}. Rendering 404.`);
    notFound(); // Still good to validate ID format server-side
  }
  
  // No server-side data fetching for the photo here.
  // The client wrapper will handle it.

  // Generic schema for the photo page container.
  // Specific ImageObject schema would need to be client-rendered or omitted
  // if critical SEO for the image itself is impacted by client-side fetching.
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wall-pix.netlify.app/';
  const pageSchema: MinimalWithContext<SchemaWebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage', // Could be 'ItemPage' or a more specific type
    name: `Photo ${id} on Wallify`,
    url: `${BASE_URL}photo/${id}`,
    description: `View photo with ID ${id} on Wallify. Discover stunning wallpapers.`,
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      {/* Pass only the photoId to the client wrapper */}
      <PhotoPageClientWrapper photoId={id} />
    </>
  );
}
