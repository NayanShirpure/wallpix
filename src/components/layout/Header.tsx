import Link from 'next/link';
import { SearchBar } from '@/components/wallpaper/SearchBar';
import { Camera } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Camera className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Wallpix</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
