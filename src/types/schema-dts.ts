// src/types/schema-dts.ts

// Basic Thing type
export interface MinimalThing {
  "@type": string;
  name?: string;
  description?: string;
  url?: string;
  image?: string | { "@type": "ImageObject"; url: string; width?: number; height?: number };
  [key: string]: any; // Allow other properties
}

// Wrapper to add @context
export interface MinimalWithContext<T extends MinimalThing> {
  "@context": "https://schema.org";
  "@type": T["@type"]; // Ensure @type matches the generic
  [key: string]: any; // Allow other properties from T, including '@type' itself.
}

// Specific schema types can extend MinimalThing
export interface BlogPosting extends MinimalThing {
  "@type": "BlogPosting";
  headline?: string;
  datePublished?: string;
  dateModified?: string;
  author?: MinimalThing | MinimalThing[]; // Could be Person or Organization
  publisher?: MinimalThing; // Typically Organization
  mainEntityOfPage?: MinimalThing; // Typically WebPage
  keywords?: string;
}

export interface WebPage extends MinimalThing {
    "@type": "WebPage";
}

export interface Organization extends MinimalThing {
    "@type": "Organization";
    logo?: string | { "@type": "ImageObject"; url: string; };
    contactPoint?: ContactPoint | ContactPoint[];
    sameAs?: string[];
}

export interface ContactPoint extends MinimalThing {
    "@type": "ContactPoint";
    contactType?: string;
    telephone?: string;
    email?: string;
    url?: string;
}

export interface ImageObject extends MinimalThing {
  "@type": "ImageObject";
  contentUrl?: string;
  thumbnailUrl?: string;
  width?: { "@type": "Distance"; value: string; unitCode: string } | string | number;
  height?: { "@type": "Distance"; value: string; unitCode: string } | string | number;
  caption?: string;
  encodingFormat?: string;
  uploadDate?: string;
}

export interface SearchResultsPage extends WebPage {
  "@type": "SearchResultsPage";
}

export interface Blog extends MinimalThing {
  "@type": "Blog";
  blogPost?: BlogPosting[];
}

export interface ContactPage extends WebPage {
  "@type": "ContactPage";
}

export interface Person extends MinimalThing {
  "@type": "Person";
}

export interface SearchAction extends MinimalThing {
  "@type": "SearchAction";
  target?: { "@type": "EntryPoint"; urlTemplate: string; } | string;
  "query-input"?: string;
}

export interface WebSite extends MinimalThing {
  "@type": "WebSite";
  potentialAction?: SearchAction | SearchAction[];
}

// Distance is used in ImageObject for width/height sometimes
export interface Distance extends MinimalThing {
  "@type": "Distance";
  value: string;
  unitCode: string; // e.g., "E37" for pixel, though often string numbers suffice for schema.org
}

// Removed: export type * from 'schema-dts';
// No longer re-exporting from 'schema-dts' to ensure local minimal types are used.
