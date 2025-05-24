'use client';

import React from 'react';
// Assuming FilerobotImageEditor is a named export based on common usage and user examples
import { FilerobotImageEditor } from 'filerobot-image-editor'; 
import type { SaveData } from 'filerobot-image-editor';

// Props for the client-side wrapper
interface ImageEditorClientProps {
  source: string;
  onSave: (editedImageObject: SaveData, designState?: any) => void;
  onClose: () => void;
  // config prop is omitted for now to simplify and diagnose
}

// This is our client-only wrapper, ensuring Filerobot only loads client-side.
export default function ImageEditorClient({
  source,
  onSave,
  onClose,
}: ImageEditorClientProps) {
  if (!source) {
    // Should ideally not happen if parent component controls this
    return <p>Image source is missing.</p>;
  }

  return (
    <FilerobotImageEditor
      source={source}
      onSave={onSave}
      onClose={onClose}
      // Default tools and theme will be used initially
    />
  );
}
