
import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wall-pix.netlify.app/';

export const metadata: Metadata = {
  title: 'Discover Wallpapers - Curated Collections & Trends | Wallify',
  description: 'Explore featured collections, trending Pexels wallpapers, seasonal themes, and new additions on Wallify. Discover stunning backgrounds for your desktop and smartphone.',
  keywords: ['discover wallpapers', 'featured wallpapers', 'trending backgrounds', 'wallpaper collections', 'new Pexels images', 'Wallify discover', 'phone wallpapers', 'desktop backgrounds'],
  alternates: {
    canonical: `${BASE_URL}discover`,
  },
  openGraph: {
    title: 'Discover Fresh Wallpapers on Wallify - Collections & Trends',
    description: 'Explore Wallify\'s Discover page for curated collections, trending wallpapers, and daily inspiration for all your devices.',
    url: `${BASE_URL}discover`,
    type: 'website',
    images: [
      {
        url: `${BASE_URL}opengraph-image.png`, 
        width: 1200,
        height: 630,
        alt: 'Wallify - Discover Fresh Wallpapers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discover Wallpapers on Wallify - Curated Collections',
    description: 'Find your next favorite wallpaper by exploring curated collections and trending images on Wallify.',
    images: [`${BASE_URL}twitter-image.png`], 
  },
};

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
