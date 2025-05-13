import { ReactNode } from 'react';

import type { Metadata, ResolvingMetadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nayanshirpure.github.io/Wallify/';

interface SearchLayoutProps {
  children: ReactNode;
  params: { query: string };
}

// interface SearchLayoutProps {
//   params: { query: string };
// } 

// This metadata function will run on the server.
// For client components, dynamic title/description updates based on fetched data
// would need to happen client-side (e.g. useEffect with document.title)
// or by having this layout wrap a Server Component that can fetch and pass down metadata.
export async function generateMetadata(
  { params }: SearchLayoutProps,
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
  
  const title = queryDisplay === "Search" || queryDisplay === "Invalid Search"
    ? `Search Results | Wallify`
    : `Search: "${queryDisplay}" | Wallify`;
  const description = `Find high-quality wallpapers matching "${queryDisplay}" on Wallify, your source for stunning backgrounds.`;

  return {
    title: title,
    description: description,
    keywords: queryDisplay === "Search" || queryDisplay === "Invalid Search"
      ? ['Wallify search', 'wallpapers', 'backgrounds']
      : [queryDisplay, 'wallpapers', 'backgrounds', `${queryDisplay} backgrounds`, 'Wallify search'],
    alternates: {
      canonical: `${BASE_URL}search/${rawQueryParam || 'query'}`,
    },
    openGraph: {
        title: title,
        description: description,
        url: `${BASE_URL}search/${rawQueryParam || 'query'}`,
    }
  };
}


export default function SearchLayout({ children }: SearchLayoutProps) {
  return (
    <div>
      {/* Layout can access params.query if needed */}
      {children}
    </div>
  );
}

// export default function SearchPageLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return <>{children}</>;
// }
