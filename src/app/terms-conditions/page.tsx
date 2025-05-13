
'use client'; 

import React, { useState, useEffect } from 'react'; 
import Link from 'next/link';
import { StructuredData } from '@/components/structured-data';
// Updated import for local minimal types
import type { WebPage as SchemaWebPage, MinimalWithContext } from '@/types/schema-dts';
import { ThemeToggle } from '@/components/theme-toggle'; 
import { PageHeader } from '@/components/layout/PageHeader';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nayanshirpure.github.io/Wallify/';

export default function TermsConditionsPage() {
  const [lastUpdatedDate, setLastUpdatedDate] = useState<string | null>(null);

  useEffect(() => {
    setLastUpdatedDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  const actualTermsModificationDate = "2024-05-20"; 

  // Correctly typed with MinimalWithContext<SchemaWebPage>
  const webPageSchema: MinimalWithContext<SchemaWebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage', 
    name: 'Terms and Conditions for Wallify Application',
    url: `${BASE_URL}terms-conditions`,
    description: 'Official Terms and Conditions governing the use of the Wallify wallpaper application.',
    mainEntityOfPage: { // This needs to conform to WebPage from @/types/schema-dts if used strictly
      '@type': 'WebPage',
      '@id': `${BASE_URL}terms-conditions`,
    } as SchemaWebPage, // Cast to ensure it matches the defined WebPage type
    datePublished: "2024-01-01", 
    dateModified: actualTermsModificationDate, 
  };

  return (
    <>
      <StructuredData data={webPageSchema} />
      <PageHeader
        title="Terms & Conditions"
        backHref="/"
        backTextDesktop="Back to Wallify"
        backTextMobile="Home"
      >
        <ThemeToggle />
      </PageHeader>
      <main className="flex-grow container mx-auto max-w-4xl p-4 py-8 md:p-6 md:py-12">
        <article className="prose prose-invert max-w-none dark:prose-invert prose-headings:text-primary prose-a:text-accent prose-a:no-underline hover:prose-a:underline">
          <h2 className="text-2xl font-semibold text-primary">Terms and Conditions for Wallify</h2>
          <p>Last updated: {lastUpdatedDate || 'Loading date...'}</p>

          <p>
            Please read these Terms and Conditions ("Terms", "Terms and Conditions") carefully before using the Wallify
            application (the "Service") operated by Wallify ("us", "we", or "our").
          </p>

          <p>
            Your access to and use of the Service is conditioned upon your acceptance of and compliance with these Terms.
            These Terms apply to all visitors, users, and others who wish to access or use the Service. By accessing or
            using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you
            do not have permission to access the Service.
          </p>

          <h3 className="text-xl font-semibold text-primary mt-6">Use License</h3>
          <p>
            The Service provides access to wallpaper images. The images themselves are sourced from Pexels and are subject to the Pexels License.
            Wallify grants you a limited, non-exclusive, non-transferable, revocable license to use our Service for your personal, non-commercial use to discover and download these wallpapers.
          </p>
          <p>
            You agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Use the Service for any illegal purpose or in violation of any local, state, national, or international law.</li>
            <li>Violate or encourage others to violate the rights of third parties, including intellectual property rights.</li>
            <li>Attempt to decompile, reverse engineer, or otherwise attempt to discover the source code of the Service or any part thereof.</li>
            <li>Interfere with the security-related features of the Service.</li>
            <li>Overload, flood, or spam the Service, or use any device, software or routine that interferes with the proper working of the Service.</li>
          </ul>
          <p>
            This license shall automatically terminate if you violate any of these restrictions and may be terminated by Wallify at any time.
          </p>

          <h3 className="text-xl font-semibold text-primary mt-6">Content and Intellectual Property</h3>
          <p>
            The Wallify application, including its "look and feel" (e.g., text, graphics, images, logos), proprietary content, information and other materials, are protected under copyright, trademark and other intellectual property laws. You agree not to copy, modify, distribute, sell, or lease any part of our Service or included software.
          </p>
           <p>
             Wallpapers displayed in Wallify are sourced from Pexels (<a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer">https://www.pexels.com</a>) via their API.
             All images are subject to the Pexels License (<a href="https://www.pexels.com/license/" target="_blank" rel="noopener noreferrer">https://www.pexels.com/license/</a>). Wallify does not claim
             ownership of these images. Please ensure your use of downloaded wallpapers complies with the Pexels License. We encourage you to review the Pexels License for detailed terms regarding image usage.
           </p>


          <h3 className="text-xl font-semibold text-primary mt-6">Third-Party Services</h3>
           <p>
             Our Service relies on third-party services:
           </p>
           <ul className="list-disc pl-5 space-y-1">
              <li><strong>Pexels API:</strong> For providing wallpaper images. Your use is subject to Pexels' Terms of Service (<a href="https://www.pexels.com/terms-of-service/" target="_blank" rel="noopener noreferrer">https://www.pexels.com/terms-of-service/</a>).</li>
              <li><strong>Formspree:</strong> For contact form submissions. Your use of the contact form is subject to Formspree's Terms of Service (<a href="https://formspree.io/legal/terms-of-service/" target="_blank" rel="noopener noreferrer">https://formspree.io/legal/terms-of-service/</a>).</li>
           </ul>
           <p>
              Wallify is not responsible for the content, privacy policies, or practices of any third-party web sites or services.
           </p>

          <h3 className="text-xl font-semibold text-primary mt-6">Disclaimer of Warranties</h3>
          <p>
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Wallify makes no warranties, expressed
            or implied, and hereby disclaims and negates all other warranties including, without limitation, implied
            warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of
            intellectual property or other violation of rights.
          </p>
          <p>
            Further, Wallify does not warrant or make any representations concerning the accuracy, likely results, or
            reliability of the use of the materials on its Service or otherwise relating to such materials or on any
            sites linked to this Service.
          </p>

          <h3 className="text-xl font-semibold text-primary mt-6">Limitation of Liability</h3>
          <p>
            In no event shall Wallify or its suppliers be liable for any damages (including, without limitation, damages
            for loss of data or profit, or due to business interruption) arising out of the use or inability to use the
            Service or the materials on Wallify's Service, even if Wallify or a Wallify authorized representative has been notified
            orally or in writing of the possibility of such damage.
          </p>

          <h3 className="text-xl font-semibold text-primary mt-6">Governing Law</h3>
          <p>
            These Terms shall be governed and construed in accordance with the laws of India, without regard
            to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be
            considered a waiver of those rights.
          </p>

          <h3 className="text-xl font-semibold text-primary mt-6">Changes to Terms</h3>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is
            material we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a
            material change will be determined at our sole discretion. By continuing to access or use our Service after
            any revisions become effective, you agree to be bound by the revised terms.
          </p>

          <h3 className="text-xl font-semibold text-primary mt-6">Contact Us</h3>
           <p>
            If you have any questions about these Terms, please <Link href="/contact">contact us</Link>.
          </p>

        </article>
      </main>
    </>
  );
}
