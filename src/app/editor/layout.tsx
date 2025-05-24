
import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wallpix.vercel.app/';

export const metadata: Metadata = {
  title: 'Image Editor - Edit Your Wallpapers | Wallify',
  description: 'Use the Wallify Image Editor to crop, rotate, add filters, text, and more to your images. Perfect for customizing wallpapers before use.',
  keywords: ['image editor', 'wallpaper editor', 'photo editor', 'crop image', 'rotate image', 'image filters', 'Wallify editor tool', 'customize images'],
  alternates: {
    canonical: `${BASE_URL}editor`,
  },
  openGraph: {
    title: 'Wallify Image Editor - Customize Your Backgrounds',
    description: 'Edit and enhance your images with Wallify\'s powerful online image editor. Create perfect wallpapers for any device.',
    url: `${BASE_URL}editor`,
    type: 'website',
    images: [
      {
        url: `${BASE_URL}opengraph-image.png`, 
        width: 1200,
        height: 630,
        alt: 'Wallify - Image Editor Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Edit Your Images with Wallify\'s Image Editor',
    description: 'Crop, filter, and enhance your images easily with the Wallify Image Editor.',
    images: [`${BASE_URL}twitter-image.png`], 
  },
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
