
import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wallpix.vercel.app/';

export const metadata: Metadata = {
  title: 'What Wallify Offers - Features & Benefits',
  description: 'Discover the features Wallify offers: curated collections, high-quality Pexels images, AI wallpaper generation, and an intuitive interface for all devices.',
  keywords: ['Wallify features', 'wallpaper collections', 'Pexels images', 'AI generator', 'desktop wallpapers', 'phone backgrounds', 'user-friendly app'],
  alternates: {
    canonical: `${BASE_URL}what-we-offer`,
  },
  openGraph: {
    title: 'What Wallify Offers - Features & Benefits',
    description: 'Explore the features of Wallify, your source for stunning wallpapers.',
    url: `${BASE_URL}what-we-offer`,
    type: 'website',
    images: [
      {
        url: `${BASE_URL}opengraph-image.png`, 
        width: 1200,
        height: 630,
        alt: 'Wallify - What We Offer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'What Wallify Offers - Features & Benefits',
    description: 'Discover the features that make Wallify the best place for wallpapers.',
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
