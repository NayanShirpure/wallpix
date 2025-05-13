
'use client';

import Link from 'next/link';
import { Twitter, Instagram, Github } from 'lucide-react';

export function GlobalFooter() {
  // useState and useEffect are not needed if the year is the only dynamic part based on Date.
  // new Date().getFullYear() can be called directly.
  // const [currentYear, setCurrentYear] = useState<number | null>(null);
  // useEffect(() => {
  //   setCurrentYear(new Date().getFullYear());
  // }, []);

  return (
    <footer className="text-center text-muted-foreground text-xs py-3 sm:py-4 border-t border-border bg-background/50 print:hidden">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-3 px-4">
        <div className="text-center md:text-left">
          <p>
            © {new Date().getFullYear()} Wallify. All rights reserved.
          </p>
          <p className="text-xs">
             Wallpapers generously provided by <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">Pexels</a>.
          </p>
        </div>
        <div className="flex items-center gap-x-3 sm:gap-x-4">
          <a href="https://x.com/NayanShirpure" target="_blank" rel="noopener noreferrer" aria-label="Wallify on Twitter" className="text-muted-foreground hover:text-accent transition-colors">
            <Twitter className="h-4 w-4" />
          </a>
          <a href="https://instagram.com/NayanShirpure" target="_blank" rel="noopener noreferrer" aria-label="Wallify on Instagram" className="text-muted-foreground hover:text-accent transition-colors">
            <Instagram className="h-4 w-4" />
          </a>
          <a href="https://github.com/NayanShirpure/Wallify" target="_blank" rel="noopener noreferrer" aria-label="Wallify on GitHub" className="text-muted-foreground hover:text-accent transition-colors">
            <Github className="h-4 w-4" />
          </a>
        </div>
        <nav className="flex gap-x-3 sm:gap-x-4 gap-y-1 flex-wrap justify-center md:justify-end" aria-label="Footer navigation">
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
