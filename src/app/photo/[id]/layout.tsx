
import type { Metadata, ResolvingMetadata } from 'next';
import { getPhotoById } from '@/lib/pexels';
import type { PexelsPhoto } from '@/types/pexels';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wallpix.vercel.app/';

type PhotoPageProps = {
  params: { id: string };
};

export async function generateMetadata(
  { params }: PhotoPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  let photo: PexelsPhoto | null = null;

  if (id && !isNaN(Number(id))) { // Ensure ID is a number for Pexels
    photo = await getPhotoById(id);
  }

  if (!photo) {
    return {
      title: 'Wallpaper Not Found | Wallify',
      description: 'The wallpaper you are looking for could not be found.',
       alternates: {
        canonical: `${BASE_URL}photo/${id}`,
      },
    };
  }

  const parentOpenGraph = await parent;
  const previousImages = parentOpenGraph?.openGraph?.images || [];
  const displayAlt = (photo.alt && photo.alt.trim() !== '') ? photo.alt : `Wallpaper by ${photo.photographer}`;

  return {
    title: `${displayAlt} | Wallify`,
    description: `View and download this stunning wallpaper: ${displayAlt}. Dimensions: ${photo.width}x${photo.height}.`,
    keywords: (photo.alt ? photo.alt.split(' ').concat(['wallpaper', 'background', photo.photographer]) : ['wallpaper', 'background', photo.photographer]),
    alternates: {
      canonical: `${BASE_URL}photo/${id}`,
    },
    openGraph: {
      title: `${displayAlt} | Wallify`,
      description: `High-quality wallpaper by ${photo.photographer}.`,
      url: `${BASE_URL}photo/${id}`,
      type: 'article', // More specific than 'website' for a single item view
      images: [
        {
          url: photo.src.large2x || photo.src.original,
          width: photo.width,
          height: photo.height,
          alt: displayAlt,
        },
        ...previousImages,
      ],
      tags: photo.alt ? photo.alt.split(' ').slice(0, 5) : [], // Use some alt words as tags
      section: 'Wallpapers',
      publishedTime: new Date().toISOString(), // Placeholder, Pexels API doesn't provide upload date for photo
      authors: [photo.photographer_url],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${displayAlt} | Wallify`,
      description: `Wallpaper by ${photo.photographer}.`,
      images: [photo.src.large || photo.src.original],
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
