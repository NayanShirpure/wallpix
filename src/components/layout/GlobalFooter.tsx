
// 'use client'; // Removed to make it a Server Component

import Link from 'next/link';
import { Twitter, Instagram, Github } from 'lucide-react';

export function GlobalFooter() {
  const currentYear = new Date().getFullYear(); // Safe to use in Server Component

  return (
    <footer className="text-center text-muted-foreground text-sm py-4 sm:py-6 border-t border-border bg-card/80 backdrop-blur-sm print:hidden">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 px-4">
        <div className="text-center md:text-left mb-2 md:mb-0">
          <p>
            © {currentYear} Wallify. All rights reserved.
          </p>
          <p className="mt-0.5">
             Wallpapers generously provided by <a 
               href="https://www.pexels.com" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="underline hover:text-accent"
               aria-label="Pexels (opens in new tab)"
             >Pexels</a>.
          </p>
        </div>
        
        <div className="flex flex-col items-center md:flex-row md:items-center gap-3 md:gap-6">
          <div className="flex items-center justify-center gap-x-4 sm:gap-x-5">
            <a 
              href="https://x.com/NayanShirpure" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Wallify on Twitter (opens in new tab)" 
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              <Twitter className="h-[1.125rem] w-[1.125rem] sm:h-5 sm:w-5" />
            </a>
            <a 
              href="https://instagram.com/NayanShirpure" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Wallify on Instagram (opens in new tab)" 
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              <Instagram className="h-[1.125rem] w-[1.125rem] sm:h-5 sm:w-5" />
            </a>
            <a 
              href="https://github.com/NayanShirpure/Wallify" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Wallify on GitHub (opens in new tab)" 
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              <Github className="h-[1.125rem] w-[1.125rem] sm:h-5 sm:w-5" />
            </a>
          </div>

          <nav className="flex gap-x-3 sm:gap-x-4 gap-y-1.5 flex-wrap justify-center md:justify-end" aria-label="Footer navigation">
            <Link href="/" className="hover:text-accent hover:underline">Home</Link>
            <Link href="/discover" className="hover:text-accent hover:underline">Discover</Link>
            <Link href="/blog" className="hover:text-accent hover:underline">Blog</Link>
            <Link href="/about" className="hover:text-accent hover:underline">About</Link>
            <Link href="/privacy-policy" className="hover:text-accent hover:underline">Privacy</Link>
            <Link href="/terms-conditions" className="hover:text-accent hover:underline">Terms</Link>
            <Link href="/contact" className="hover:text-accent hover:underline">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
