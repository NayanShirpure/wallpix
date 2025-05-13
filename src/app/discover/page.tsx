
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface DiscoverCategory {
  id: string;
  title: string;
  description: string;
  query: string; // for navigation to search page
  imageUrl: string; // placeholder image URL
  dataAiHint: string; // For AI image suggestion
}

// Curated list of categories for the Discover page
const discoverPageCategories: DiscoverCategory[] = [
  { id: 'abstract', title: 'Abstract Art', description: 'Explore mind-bending patterns and colors.', query: 'Abstract Art', imageUrl: 'https://picsum.photos/seed/discover-abstract/600/400', dataAiHint: 'abstract colorful' },
  { id: 'nature', title: 'Nature Escapes', description: 'Breathtaking landscapes and serene wilderness.', query: 'Nature Landscape', imageUrl: 'https://picsum.photos/seed/discover-nature/600/400', dataAiHint: 'nature forest' },
  { id: 'space', title: 'Cosmic Wonders', description: 'Journey through galaxies and nebulae.', query: 'Outer Space Galaxy', imageUrl: 'https://picsum.photos/seed/discover-space/600/400', dataAiHint: 'space galaxy' },
  { id: 'minimalist', title: 'Minimalist Vibes', description: 'Clean lines and simple elegance.', query: 'Minimalist Design', imageUrl: 'https://picsum.photos/seed/discover-minimalist/600/400', dataAiHint: 'minimalist white' },
  { id: 'animals', title: 'Wild Encounters', description: 'Majestic creatures from around the globe.', query: 'Wildlife Animals', imageUrl: 'https://picsum.photos/seed/discover-animals/600/400', dataAiHint: 'wildlife animal' },
  { id: 'cityscapes', title: 'Urban Dreams', description: 'Iconic city skylines and vibrant streets.', query: 'Cityscape Night', imageUrl: 'https://picsum.photos/seed/discover-cityscapes/600/400', dataAiHint: 'city night' },
  { id: 'dark_moody', title: 'Dark & Moody', description: 'Atmospheric and intriguing dark themes.', query: 'Dark Moody Forest', imageUrl: 'https://picsum.photos/seed/discover-darkmoody/600/400', dataAiHint: 'dark abstract' },
  { id: 'vibrant', title: 'Vibrant Hues', description: 'Explosions of color to energize your screen.', query: 'Vibrant Colorful Pattern', imageUrl: 'https://picsum.photos/seed/discover-vibrant/600/400', dataAiHint: 'colorful vibrant' },
  { id: 'vintage', title: 'Retro Rewind', description: 'Nostalgic designs and classic aesthetics.', query: 'Vintage Retro Pattern', imageUrl: 'https://picsum.photos/seed/discover-vintage/600/400', dataAiHint: 'vintage pattern' },
  { id: 'technology', title: 'Tech & Innovation', description: 'Futuristic concepts and digital art.', query: 'Technology Circuits', imageUrl: 'https://picsum.photos/seed/discover-tech/600/400', dataAiHint: 'tech abstract' },
  { id: 'food', title: 'Delicious Delights', description: 'Mouth-watering food photography.', query: 'Food Photography Flatlay', imageUrl: 'https://picsum.photos/seed/discover-food/600/400', dataAiHint: 'food delicious' },
  { id: 'patterns', title: 'Intricate Patterns', description: 'Geometric shapes and repeating designs.', query: 'Seamless Pattern Geometric', imageUrl: 'https://picsum.photos/seed/discover-patterns/600/400', dataAiHint: 'pattern geometric' },
];

export default function DiscoverPage() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary">Explore Wallpaper Categories</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Dive into diverse themes and find the perfect backdrop for your device.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {discoverPageCategories.map((category) => (
          <Link key={category.id} href={`/search/${encodeURIComponent(category.query)}`} passHref legacyBehavior>
            <a className="block group">
              <Card className="overflow-hidden h-full flex flex-col bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus-within:-translate-y-1 focus-within:shadow-xl rounded-xl">
                <div className="relative w-full aspect-[16/10] overflow-hidden">
                  <Image
                    src={category.imageUrl}
                    alt={`Preview for ${category.title} category`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                    data-ai-hint={category.dataAiHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                </div>
                <CardHeader className="p-4 flex-grow">
                  <CardTitle className="text-lg sm:text-xl font-semibold text-card-foreground group-hover:text-accent transition-colors">
                    {category.title}
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                    {category.description}
                  </p>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-sm font-medium text-accent group-hover:underline flex items-center">
                    Explore <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
