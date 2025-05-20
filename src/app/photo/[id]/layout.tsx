
import type { Metadata, ResolvingMetadata } from 'next';
// Removed getPhotoById import as we can't fetch specific photo details here anymore
// import type { PexelsPhoto } from '@/types/pexels'; // Keep if needed for other layout elements, but not for dynamic metadata

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wallpix.vercel.app/';

type PhotoPageLayoutProps = {
  params: { id: string };
};

export async function generateMetadata(
  { params }: PhotoPageLayoutProps,
  parent: ResolvingMetadata // Keep parent for potentially inheriting other metadata
): Promise<Metadata> {
  const id = params.id;
  // Since data is fetched client-side, we generate more generic metadata here.
  // Specific photo details won't be available for server-rendered meta tags.

  const title = id ? `View Photo ${id} | Wallify` : 'View Photo | Wallify';
  const description = `View and explore wallpapers on Wallify. Photo ID: ${id}.`;
  const imageUrl = `${BASE_URL}opengraph-image.png`; // Generic fallback image

  const parentOpenGraph = await parent;
  const previousImages = parentOpenGraph?.openGraph?.images || [];

  return {
    title,
    description,
    keywords: ['wallpaper', 'background', 'photo', 'image', `photo ${id}`, 'Wallify'],
    alternates: {
      canonical: `${BASE_URL}photo/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}photo/${id}`,
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
        ...previousImages
      ],
      // section and publishedTime might be too generic without photo data
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function PhotoPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
