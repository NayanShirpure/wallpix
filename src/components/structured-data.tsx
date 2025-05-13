
// src/components/structured-data.tsx

// Define minimal local types if schema-dts is fully removed
interface MinimalThing {
  "@type": string;
  [key: string]: any;
}

interface MinimalWithContext<T extends MinimalThing> {
  "@context": "https://schema.org";
  "@type": T["@type"];
  [key: string]: any;
}


interface StructuredDataProps<T extends MinimalThing> {
  data: MinimalWithContext<T>;
}

export function StructuredData<T extends MinimalThing>({ data }: StructuredDataProps<T>) {
  // Temporarily return null to isolate issues.
  // This will prevent the <script> tag from being rendered.
  return null;

  // Original logic that was in place after removing schema-dts:
  //  if (!data || typeof data['@type'] !== 'string') {
  //    // console.warn('StructuredData: data or data["@type"] is undefined, skipping render.');
  //    return null;
  //  }
  //  try {
  //    return (
  //      <script
  //        type="application/ld+json"
  //        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
  //        key={`structured-data-${data['@type']}-${(data as any).url || (data as any).name || JSON.stringify(data).substring(0,50)}`}
  //      />
  //    );
  //  } catch (error) {
  //    // console.error('StructuredData: Error stringifying data', error, data);
  //    return null;
  //  }
}
