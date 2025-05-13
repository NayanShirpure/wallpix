
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react'; 
import { ContactForm } from '@/components/contact-form';
import { StructuredData } from '@/components/structured-data';
import type { ContactPage as SchemaContactPage, WithContext } from 'schema-dts';
// ThemeToggle removed, it's in global Header now.
// import { ThemeToggle } from '@/components/theme-toggle';


const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nayanshirpure.github.io/Wallify/';

export default function ContactPage() {
  const contactPageSchema: WithContext<SchemaContactPage> = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Wallify Support and Feedback',
    url: `${BASE_URL}contact`,
    description: 'Reach out to the Wallify team for any support, feedback, or questions regarding our wallpaper application.',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}contact`,
    },
  };
  return (
    <>
      <StructuredData data={contactPageSchema} />
       <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm print:hidden"> {/* z-index lower than global header */}
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6">
          <Link href="/" className="flex items-center gap-1 sm:gap-1.5 text-sm sm:text-base font-semibold text-primary hover:text-accent transition-colors" aria-label="Back to Wallify homepage">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="hidden sm:inline">
              Back
              <span className="hidden md:inline"> to Wallify</span>
            </span>
             <span className="sm:hidden">Home</span>
          </Link>
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-primary whitespace-nowrap px-2 truncate max-w-[calc(100%-120px)] sm:max-w-[calc(100%-160px)] md:max-w-[calc(100%-200px)]">
            Contact Wallify
          </h1>
          {/* ThemeToggle removed from here */}
          <div className="w-16 sm:w-20"> {/* Placeholder for alignment, or remove */} </div>
        </div>
      </header>
      <main className="flex flex-grow flex-col items-center justify-center p-4 py-8 md:p-6 md:py-12">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-primary">Get in Touch</h2>
          <p className="text-muted-foreground">Have questions, feedback, or just want to say hi? Let us know!</p>
        </div>
        <ContactForm />
      </main>
    </>
  );
}
