
import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wall-pix.netlify.app/';

export const metadata: Metadata = {
  title: 'Privacy Policy - Wallify',
  description: 'Read the Wallify Privacy Policy to understand how we collect, use, and protect your information while you use our wallpaper application powered by Pexels API.',
  keywords: ['Wallify privacy policy', 'data privacy', 'user information', 'Pexels API privacy', 'Formspree privacy', 'wallpaper app security', 'information collection', 'data usage Wallify'],
  alternates: {
    canonical: `${BASE_URL}privacy-policy`,
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
