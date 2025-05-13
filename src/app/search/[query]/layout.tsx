import { ReactNode } from 'react';
import type { Metadata, ResolvingMetadata } from 'next';

// const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nayanshirpure.github.io/Wallify/';

// interface SearchLayoutProps {
//   children: ReactNode;
// }

// ✅ Only used inside generateMetadata
type GenerateMetadataProps = {
  params: { query: string };
};

// interface GenerateMetadataProps {
//   params: { query: string };
// }

export async function generateMetadata(
  { params }: { params: GenerateMetadataProps['params'] }, // 👈 This is the crucial type correction
  parent: ResolvingMetadata
): Promise<Metadata> {
  const rawQueryParam = params.query || '';
  let queryDisplay = "Search";

  try {
    const decodedQuery = decodeURIComponent(rawQueryParam);
    if (decodedQuery.trim()) {
      queryDisplay = decodedQuery;
    }
  } catch (e) {
    console.warn("Failed to decode query for metadata in layout:", rawQueryParam, e);
    queryDisplay = "Invalid Search";
  }

  const title =
    queryDisplay === "Search" || queryDisplay === "Invalid Search"
      ? `Search Results | Wallify`
      : `Search: "${queryDisplay}" | Wallify`;

  const description = `Find high-quality wallpapers matching "${queryDisplay}" on Wallify, your source for stunning backgrounds.`;

  return {
    title,
    description,
    keywords:
      queryDisplay === "Search" || queryDisplay === "Invalid Search"
        ? ['Wallify search', 'wallpapers', 'backgrounds']
        : [queryDisplay, 'wallpapers', 'backgrounds', `${queryDisplay} backgrounds`, 'Wallify search'],
    alternates: {
      canonical: `https://nayanshirpure.github.io/Wallify/search/${rawQueryParam || 'query'}`,
    },
    openGraph: {
      title,
      description,
      url: `https://nayanshirpure.github.io/Wallify/search/${rawQueryParam || 'query'}`,
    },
  };
}

export default function SearchLayout({ children }: { children: ReactNode }) { // 👈 But the component's props are directly typed here
  return <div>{children}</div>;
}