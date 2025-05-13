
import Link from 'next/link';
import { SearchBar } from '@/components/wallpaper/SearchBar';
import { Camera } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-4">
        <Link href="/" className="mr-3 flex items-center space-x-2 sm:mr-6">
          <Camera className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl text-primary">Wallify</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          <div className="w-full flex-1 sm:w-auto sm:flex-none">
             <SearchBar />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
