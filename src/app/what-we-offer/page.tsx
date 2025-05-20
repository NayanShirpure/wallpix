
import { PageHeader } from '@/components/layout/PageHeader';
import { ThemeToggle } from '@/components/theme-toggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, ImageIcon, Smartphone, Monitor, Wand2, ExternalLink, Palette, Search } from 'lucide-react';
import Image from 'next/image';

export default function WhatWeOfferPage() {
  return (
    <>
      <PageHeader
        title="What Wallify Offers"
        backHref="/"
        backTextDesktop="Back to Wallify"
        backTextMobile="Home"
      >
        <ThemeToggle />
      </PageHeader>
      <main className="flex-grow container mx-auto max-w-4xl p-4 py-8 md:p-6 md:py-12">
        <div className="space-y-10">
          <section className="text-center">
            <Image
              src="https://placehold.co/600x300.png"
              alt="Collage representing Wallify's features: diverse wallpapers, AI generation, and device optimization"
              width={600}
              height={300}
              className="mx-auto mb-6 rounded-lg shadow-xl"
              data-ai-hint="features collage abstract"
              priority
            />
            <h1 className="text-3xl font-bold text-primary mb-4">Everything You Need for a Stunning Digital Space</h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Wallify is packed with features designed to make finding and personalizing your device's background a delightful and effortless experience.
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-card-foreground">
                  <Layers className="mr-3 h-7 w-7 text-accent" />
                  Curated Collections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Explore a vast and diverse range of handpicked wallpapers. From serene landscapes and abstract art to vibrant patterns and clean minimalist designs, everything is thoughtfully organized into categories to make discovery effortless and inspiring.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-card-foreground">
                  <ImageIcon className="mr-3 h-7 w-7 text-accent" />
                  High-Quality Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  All wallpapers are sourced from the renowned Pexels API, ensuring professional-grade, high-resolution content that looks stunning and crisp on any screen, from the smallest smartphone to the largest desktop monitor.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-card-foreground">
                  <Wand2 className="mr-3 h-7 w-7 text-accent" />
                  AI Wallpaper Generator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Unleash your creativity with our experimental AI Wallpaper Generator. Describe your vision, and let our AI bring unique, custom wallpapers to life for you. A truly personal touch for your device!
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-card-foreground">
                  <Search className="mr-3 h-7 w-7 text-accent" />
                  Intuitive Interface & Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Designed with simplicity and user experience in mind, Wallify’s clean and modern UI, powerful search, and category filters make browsing and downloading wallpapers fast and frustration-free.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-lg md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-card-foreground">
                  <Monitor className="mr-2 h-7 w-7 text-accent inline-block" />
                  <Smartphone className="mr-3 h-7 w-7 text-accent inline-block" />
                  Optimized for All Devices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Whether you're on a smartphone, tablet, or desktop, Wallify offers formats and resolutions optimized for your specific screen size. Easily switch between "Phone" (portrait) and "Desktop" (landscape) views to find the perfect wallpaper.
                </p>
              </CardContent>
            </Card>
          </div>

          <section>
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-card-foreground">
                  <ExternalLink className="mr-3 h-7 w-7 text-accent" />
                  Powered by Pexels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Our extensive library of stunning, high-quality images is powered by the Pexels API. This gives you access to thousands of photos from a talented community of photographers worldwide, all free to use.
                   Wallpapers are provided by <a 
                     href="https://www.pexels.com" 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className="underline hover:text-accent"
                     aria-label="Pexels (opens in new tab)"
                   >Pexels</a>.
                </p>
              </CardContent>
            </Card>
          </section>

           <section className="text-center pt-4">
            <p className="text-lg text-muted-foreground">
              Wallify is committed to making your digital world more beautiful, one wallpaper at a time.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}

