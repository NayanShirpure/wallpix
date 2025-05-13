
'use client'; 

import React, { useState, useEffect } from 'react'; 
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react'; 
import { StructuredData } from '@/components/structured-data';
import type { WebPage, WithContext } from 'schema-dts';
import { ThemeToggle } from '@/components/theme-toggle'; 

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nayanshirpure.github.io/Wallify/';

export default function PrivacyPolicyPage() {
  const [lastUpdatedDate, setLastUpdatedDate] = useState<string | null>(null);

  useEffect(() => {
    setLastUpdatedDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);
  
  const actualPolicyModificationDate = "2024-05-20"; 

  const webPageSchema: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage', 
    name: 'Privacy Policy for Wallify Wallpaper Application',
    url: `${BASE_URL}privacy-policy`,
    description: 'Official Privacy Policy for the Wallify application, detailing data handling practices.',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}privacy-policy`,
    },
    datePublished: "2024-01-01", 
    dateModified: actualPolicyModificationDate, 
  };

  return (
    <>
      <StructuredData data={webPageSchema} />
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm print:hidden">
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
            Privacy Policy
          </h1>
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto max-w-4xl p-4 py-8 md:p-6 md:py-12">
        <article className="prose prose-invert max-w-none dark:prose-invert prose-headings:text-primary prose-a:text-accent prose-a:no-underline hover:prose-a:underline">
          <h2 className="text-2xl font-semibold text-primary">Privacy Policy for Wallify</h2>
          <p>Last updated: {lastUpdatedDate || 'Loading date...'}</p>

          <p>
            Welcome to Wallify! We are committed to protecting your privacy. This Privacy Policy explains how we
            handle information when you use our application ("Service"). By using Wallify, you agree to the
            collection and use of information in accordance with this policy.
          </p>

          <h3 className="text-xl font-semibold text-primary mt-6">Information Collection and Use</h3>
          <p>
            Wallify does not require user registration and does not collect any personally identifiable information (PII)
            from its users directly. Our primary function is to display wallpapers fetched from the Pexels API.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Search Queries:</strong> When you use the search feature, your search terms are sent to the Pexels API
              to retrieve relevant wallpapers. These search terms are not stored by Wallify or linked to any individual user by us.
            </li>
            <li>
              <strong>Category Selections:</strong> Your selection of device categories (e.g., smartphone, desktop) is used to
              filter results from the Pexels API. This preference is not stored by Wallify.
            </li>
            <li>
              <strong>Usage Data (Analytics):</strong> We may use standard web analytics tools (e.g., Vercel Analytics, if deployed on Vercel, or a similar privacy-focused tool) to collect anonymous, aggregated usage data. This data helps us understand how users interact with Wallify (e.g., popular features, general user flow) to improve the application. This data does not identify individual users and is not PII.
            </li>
          </ul>


          <h3 className="text-xl font-semibold text-primary mt-6">Third-Party Services</h3>
          <p>
            Wallify relies on the following third-party services:
          </p>
          <ul className="list-disc pl-5 space-y-1">
              <li>
                  <strong>Pexels API:</strong> Wallify uses the Pexels API (<a href="https://www.pexels.com/api/" target="_blank" rel="noopener noreferrer">https://www.pexels.com/api/</a>) to source wallpaper images. Your interactions with the Pexels service through Wallify are subject to Pexels' own Privacy Policy (<a href="https://www.pexels.com/privacy-policy/" target="_blank" rel="noopener noreferrer">https://www.pexels.com/privacy-policy/</a>) and Terms of Service (<a href="https://www.pexels.com/terms-of-service/" target="_blank" rel="noopener noreferrer">https://www.pexels.com/terms-of-service/</a>). We recommend you review their policies.
              </li>
              <li>
                  <strong>Formspree:</strong> For our contact form, Wallify uses Formspree (<a href="https://formspree.io/" target="_blank" rel="noopener noreferrer">https://formspree.io/</a>). If you choose to contact us via the form, the information you submit (e.g., name, email, message) is processed by Formspree according to their Privacy Policy (<a href="https://formspree.io/legal/privacy-policy/" target="_blank" rel="noopener noreferrer">https://formspree.io/legal/privacy-policy/</a>). Wallify receives this information to respond to your inquiry but does not store it beyond the scope of addressing your communication.
              </li>
          </ul>


          <h3 className="text-xl font-semibold text-primary mt-6">Data Security</h3>
          <p>
            Since Wallify does not store personal data of its users, the risk associated with data breaches from our end is minimal. We rely on the security measures implemented by our third-party service providers (Pexels, Formspree, and hosting platform like Vercel/GitHub Pages). While we strive to use commercially acceptable means to protect any information processed, no method of transmission over the Internet or method of electronic storage is 100% secure.
          </p>

          <h3 className="text-xl font-semibold text-primary mt-6">Children's Privacy</h3>
          <p>
              Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13.
          </p>

          <h3 className="text-xl font-semibold text-primary mt-6">Changes to This Privacy Policy</h3>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            Changes to this Privacy Policy are effective when they are posted on this page.
          </p>

          <h3 className="text-xl font-semibold text-primary mt-6">Contact Us</h3>
          <p>
            If you have any questions about this Privacy Policy, please <Link href="/contact">contact us</Link>.
          </p>
        </article>
      </main>
    </>
  );
}
