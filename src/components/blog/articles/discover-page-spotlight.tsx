
import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Compass, Zap, Star, Palette, Layers } from 'lucide-react';

const ArticleContent = (): ReactNode => (
  <>
    <p className="lead text-lg text-muted-foreground">
      Feeling uninspired by your current digital backdrop? Wallify's <Link href="/discover" className="text-accent hover:underline">Discover Page</Link> is your personal muse, designed to spark joy and help you find the perfect wallpaper with ease. Let's explore the treasure trove of features waiting for you!
    </p>

    <div className="my-6 flex justify-center">
      <Image
        src="https://placehold.co/800x450.png"
        alt="Screenshot of Wallify's Discover Page showcasing various sections"
        width={800}
        height={450}
        className="rounded-lg shadow-md"
        data-ai-hint="discover page interface"
      />
    </div>

    <h2><Zap className="inline-block mr-2 h-6 w-6 text-accent" />Wallpaper of the Day: Your Daily Dose of Beauty</h2>
    <p>
      Start your day with a fresh perspective! Our "Wallpaper of the Day" feature highlights a stunning, handpicked image right at the top of the Discover page. It's a fantastic way to encounter beautiful visuals you might not have searched for otherwise, offering a daily surprise to refresh your screen.
    </p>
    <div className="my-4 flex justify-center">
      <Image
        src="https://placehold.co/700x400.png"
        alt="Close-up of the Wallpaper of the Day section on Wallify"
        width={700}
        height={400}
        className="rounded-lg shadow-md"
        data-ai-hint="daily wallpaper feature"
      />
    </div>

    <h2><Star className="inline-block mr-2 h-6 w-6 text-accent" />Trending Wallpapers & Editor's Picks: What's Hot and What We Love</h2>
    <p>
      Curious about what's popular or what our team thinks is exceptional?
    </p>
    <ul className="list-disc pl-5 space-y-2 my-4">
      <li>
        <strong>Trending Wallpapers:</strong> This section showcases images that are currently capturing the community's attention. It's a great place to find contemporary styles and popular themes.
      </li>
      <li>
        <strong>Editor's Picks:</strong> Our curation team hand-selects exceptional wallpapers that stand out for their quality, composition, or uniqueness. Discover hidden gems and artistic masterpieces here.
      </li>
    </ul>

    <h2><Palette className="inline-block mr-2 h-6 w-6 text-accent" />Theme-Based & Seasonal Collections: Moods and Moments</h2>
    <p>
      Sometimes, you're looking for a specific vibe. Our theme-based collections cater to diverse tastes:
    </p>
    <ul className="list-disc pl-5 space-y-2 my-4">
      <li>
        <strong>Immerse Yourself:</strong> Explore collections like "Cyberpunk Worlds" for a futuristic feel, "Vintage Rides" for a touch of nostalgia, or "Dark & Moody" for atmospheric depth.
      </li>
      <li>
        <strong>Celebrate the Seasons:</strong> Find wallpapers that perfectly capture the essence of the current season, whether it's the vibrant colors of "Autumn Vibes" or the fresh bloom of spring. These collections are updated to keep your screen in tune with the time of year.
      </li>
    </ul>
    <div className="my-6 flex justify-center">
      <Image
        src="https://placehold.co/800x400.png"
        alt="Examples of theme-based collections like 'Cyberpunk' and 'Autumn Vibes'"
        width={800}
        height={400}
        className="rounded-lg shadow-md"
        data-ai-hint="theme collections examples"
      />
    </div>

    <h2><Layers className="inline-block mr-2 h-6 w-6 text-accent" />Explore Popular Categories: Dive Deeper</h2>
    <p>
      For a more targeted search, our "Explore Popular Categories" section offers a grid of enticing visual entry points. Each category card features a representative image and a brief description, inviting you to explore collections like:
    </p>
    <ul className="list-disc pl-5 space-y-1 my-2">
      <li>Abstract Art</li>
      <li>Nature Escapes</li>
      <li>Cosmic Wonders</li>
      <li>Minimalist Vibes</li>
      <li>And many more!</li>
    </ul>
    <p>
      Clicking on a category takes you directly to a dedicated search results page, pre-filled with stunning wallpapers matching that theme.
    </p>

    <h2><Compass className="inline-block mr-2 h-6 w-6 text-accent" />Optimized for Your Device</h2>
    <p>
      Remember, the Discover page, like the rest of Wallify, allows you to toggle between "Phone" (portrait) and "Desktop" (landscape) orientations using the <Link href="/" className="text-accent hover:underline">Global Header</Link>. This ensures that the wallpapers presented in each section are optimally suited for your chosen device, providing the best visual experience.
    </p>

    <p>
      The <Link href="/discover" className="text-accent hover:underline">Discover Page</Link> is more than just a gallery; it's an experience designed to inspire. Whether you're looking for something specific or just browsing for a pleasant surprise, Wallify's Discover page is your gateway to a world of beautiful backgrounds. Happy exploring!
    </p>
  </>
);

export default ArticleContent;
