
import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wall-pix.netlify.app/';

export const metadata: Metadata = {
  title: 'Wallify Features - AI Generator, Pexels Wallpapers & More',
  description: 'Explore Wallify\'s features: curated collections, high-quality Pexels images, an intuitive interface, device optimization, and our innovative AI Wallpaper Generator.',
  keywords: ['Wallify features', 'AI wallpaper generator', 'Pexels image collections', 'desktop wallpapers', 'phone backgrounds', 'user-friendly wallpaper app', 'custom wallpaper creation'],
  alternates: {
    canonical: `${BASE_URL}what-we-offer`,
  },
  openGraph: {
    title: 'Discover Wallify\'s Features - Stunning Wallpapers & AI Generation',
    description: 'Learn about Wallify\'s offerings: curated Pexels collections, an AI wallpaper generator, and a seamless experience for all your devices.',
    url: `${BASE_URL}what-we-offer`,
    type: 'website',
    images: [
      {
        url: `${BASE_URL}opengraph-image.png`, 
        width: 1200,
        height: 630,
        alt: 'Wallify - Features Overview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wallify Features: AI Generation, Pexels & More',
    description: 'Discover the features that make Wallify the best place for high-quality wallpapers and AI-generated backgrounds.',
    images: [`${BASE_URL}twitter-image.png`], 
  },
};

export default function WhatWeOfferLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
