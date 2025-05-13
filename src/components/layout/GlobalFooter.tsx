
'use client';

import Link from 'next/link';
import { Twitter, Instagram, Github } from 'lucide-react';

export function GlobalFooter() {
  return (
    <footer className="text-center text-muted-foreground text-xs py-4 sm:py-6 border-t border-border bg-card/80 backdrop-blur-sm print:hidden">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 px-4">
        <div className="text-center md:text-left mb-2 md:mb-0">
          <p>
            © {new Date().getFullYear()} Wallify. All rights reserved.
          </p>
          <p className="text-xs mt-0.5">
             Wallpapers generously provided by <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">Pexels</a>.
          </p>
        </div>
        
        <div className="flex items-center gap-x-4 sm:gap-x-5 order-first md:order-none mb-3 md:mb-0">
          <a href="https://x.com/NayanShirpure" target="_blank" rel="noopener noreferrer" aria-label="Wallify on Twitter" className="text-muted-foreground hover:text-accent transition-colors">
            <Twitter className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </a>
          <a href="https://instagram.com/NayanShirpure" target="_blank" rel="noopener noreferrer" aria-label="Wallify on Instagram" className="text-muted-foreground hover:text-accent transition-colors">
            <Instagram className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </a>
          <a href="https://github.com/NayanShirpure/Wallify" target="_blank" rel="noopener noreferrer" aria-label="Wallify on GitHub" className="text-muted-foreground hover:text-accent transition-colors">
            <Github className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </a>
        </div>

        <nav className="flex gap-x-3 sm:gap-x-4 gap-y-1.5 flex-wrap justify-center md:justify-end" aria-label="Footer navigation">
          <Link href="/" className="underline hover:text-accent">Home</Link>
          <Link href="/explorer" className="underline hover:text-accent">Explore</Link>
          <Link href="/blog" className="underline hover:text-accent">Blog</Link>
          <Link href="/about" className="underline hover:text-accent">About</Link>
          <Link href="/privacy-policy" className="underline hover:text-accent">Privacy</Link>
          <Link href="/terms-conditions" className="underline hover:text-accent">Terms</Link>
          <Link href="/contact" className="underline hover:text-accent">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}
