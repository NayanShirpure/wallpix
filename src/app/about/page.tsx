
import type { Metadata } from 'next';
import Link from 'next/link';
import { Info, Users, Target, Award, Palette, Smartphone, Monitor } from 'lucide-react'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { StructuredData } from '@/components/structured-data';
// Updated import for local minimal types
import type { Organization, MinimalWithContext, ContactPoint } from '@/types/schema-dts';
import { ThemeToggle } from '@/components/theme-toggle';
import { PageHeader } from '@/components/layout/PageHeader';


const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nayanshirpure.github.io/Wallify/';

export default function AboutUsPage() {
  // Correctly typed with MinimalWithContext<Organization>
  const orgData: MinimalWithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Wallify',
    url: BASE_URL,
    logo: `${BASE_URL}opengraph-image.png`, 
    description: 'Wallify is your ultimate destination for stunning, high-quality wallpapers for all your devices, sourced from Pexels.',
    contactPoint: { 
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      url: `${BASE_URL}contact`,
    } as ContactPoint, 
    sameAs: [ 
        "https://x.com/NayanShirpure",
        "https://instagram.com/NayanShirpure",
        "https://github.com/NayanShirpure/Wallify"
    ]
  };

  return (
    <>
      <StructuredData data={orgData} />
      <PageHeader
        title="About Wallify"
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
              src="https://picsum.photos/seed/wallify-brand-visual/300/150"
              alt="Wallify Brand Visual"
              width={300}
              height={150}
              className="mx-auto mb-6 rounded-lg shadow-xl"
              data-ai-hint="app brand concept"
              priority
            />
            <h2 className="text-3xl font-bold text-primary mb-4">Welcome to Wallify</h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Wallify is your ultimate destination for stunning, high-quality wallpapers for all your devices.
              We believe that a beautiful background can inspire creativity, bring tranquility, and personalize
              your digital space.
            </p>
          </section>

          <section>
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-card-foreground">
                  <Target className="mr-3 h-7 w-7 text-accent" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Our mission is simple: to provide a seamless and enjoyable experience for discovering and
                  downloading beautiful wallpapers. We curate a vast collection of images from Pexels, ensuring there's
                  something for every taste and style, for both your smartphone and desktop.
                </p>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-card-foreground">
                  <Info className="mr-3 h-7 w-7 text-accent" />
                  What We Offer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start">
                  <Palette className="mr-4 h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-primary text-lg">Curated Collections</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Access a diverse range of wallpapers, from breathtaking landscapes and abstract art to
                      minimalist designs and vibrant patterns, all easily searchable and categorized.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Award className="mr-4 h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-primary text-lg">High Quality Images</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      All wallpapers are sourced from Pexels, ensuring high resolution and stunning clarity for
                      your devices.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="mr-4 h-6 w-6 text-accent flex-shrink-0 mt-1" /> 
                  <div>
                    <h3 className="font-semibold text-primary text-lg">User-Friendly Interface</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Our app is designed to be intuitive and easy to navigate, making it effortless to find and
                      download your next favorite wallpaper.
                    </p>
                  </div>
                </div>
                 <div className="flex items-start">
                   <div className="mr-4 flex-shrink-0 mt-1">
                    <Smartphone className="inline h-6 w-6 text-accent" />
                    <Monitor className="inline h-6 w-6 text-accent ml-1" />
                   </div>
                  <div>
                    <h3 className="font-semibold text-primary text-lg">Optimized for All Devices</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Easily switch between smartphone (portrait) and desktop (landscape) optimized wallpapers to find the perfect fit.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-card-foreground">
                  <Users className="mr-3 h-7 w-7 text-accent" />
                  The Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Wallify was created by a passionate developer dedicated to bringing beauty and personalization
                  to your digital experience. We are constantly working to improve the app and add new features.
                  Your feedback is always welcome!
                </p>
              </CardContent>
            </Card>
          </section>

           <section className="text-center pt-4">
            <p className="text-lg text-muted-foreground">
              Thank you for choosing Wallify. We hope you enjoy our collection!
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Wallpapers are provided by <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">Pexels</a>.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
