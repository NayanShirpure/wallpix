import { ReactNode } from 'react';
import type { Metadata, ResolvingMetadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nayanshirpure.github.io/Wallify/';

// This interface is only for the component
interface SearchLayoutProps {
  children: ReactNode;
}

// ✅ This is the correct type for generateMetadata parameters
export async function generateMetadata(
  { params }: { params: { query: string } },
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
      canonical: `${BASE_URL}search/${rawQueryParam || 'query'}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}search/${rawQueryParam || 'query'}`,
    },
  };
}

// ✅ layout does NOT need params unless you explicitly want to use them inside the component
export default function SearchLayout({ children }: SearchLayoutProps) {
  return <div>{children}</div>;
}
