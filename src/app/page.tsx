import { getCuratedPhotos } from '@/lib/pexels';
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';
import type { PexelsPhoto } from '@/types/pexels';

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request

export default async function HomePage() {
  const data = await getCuratedPhotos(1, 20); // Fetch 20 curated photos
  const photos: PexelsPhoto[] = data?.photos || [];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Featured Wallpapers</h1>
      <WallpaperGrid photos={photos} />
    </div>
  );
}
