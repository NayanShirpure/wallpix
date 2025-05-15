
import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nayanshirpure.github.io/Wallify/';

export const metadata: Metadata = {
  title: 'AI Wallpaper Generator | Wallify',
  description: 'Create unique wallpapers using AI. Enter a prompt and let our AI generate a custom background for your device.',
  keywords: ['ai wallpaper generator', 'generate wallpapers', 'custom backgrounds', 'ai image generation', 'Wallify ai tool'],
  alternates: {
    canonical: `${BASE_URL}generate`,
  },
  openGraph: {
    title: 'AI Wallpaper Generator - Wallify',
    description: 'Generate custom wallpapers with AI based on your text prompts.',
    url: `${BASE_URL}generate`,
    type: 'website',
    images: [
      {
        url: `${BASE_URL}opengraph-image.png`, // Using generic OG image
        width: 1200,
        height: 630,
        alt: 'Wallify - AI Wallpaper Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Wallpaper Generator - Wallify',
    description: 'Create unique wallpapers using AI text prompts on Wallify.',
    images: [`${BASE_URL}twitter-image.png`], // Using generic Twitter image
  },
};

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
