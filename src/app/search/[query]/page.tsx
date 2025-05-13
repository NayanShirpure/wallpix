import { searchPhotos } from '@/lib/pexels';
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';
import type { PexelsPhoto } from '@/types/pexels';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  params: {
    query: string;
  };
}

export async function generateMetadata({ params }: SearchPageProps) {
  const query = decodeURIComponent(params.query);
  return {
    title: `Search results for "${query}" - Wallpix`,
    description: `Find high-quality wallpapers matching "${query}" on Wallpix.`,
  };
}

export default async function SearchPage({ params }: SearchPageProps) {
  const query = decodeURIComponent(params.query);
  const data = await searchPhotos(query, 1, 20); // Fetch 20 photos for the query
  const photos: PexelsPhoto[] = data?.photos || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Results for: <span className="text-primary">{query}</span>
        </h1>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>
      {photos.length > 0 ? (
        <WallpaperGrid photos={photos} />
      ) : (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">
            No wallpapers found for &quot;{query}&quot;. Try a different search.
          </p>
        </div>
      )}
    </div>
  );
}
