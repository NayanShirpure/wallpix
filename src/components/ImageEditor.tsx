
'use client';

import React from 'react';
// Use default import for FilerobotImageEditor
import FilerobotImageEditorComponent from 'filerobot-image-editor';
import type { SaveData } from 'filerobot-image-editor';

// Props for the client-side wrapper
interface ImageEditorClientProps {
  source: string;
  onSave: (editedImageObject: SaveData, designState?: any) => void;
  onClose: () => void;
  config?: object; // Allow passing the config object
}

// This is our client-only wrapper, ensuring Filerobot only loads client-side.
export default function ImageEditorClient({
  source,
  onSave,
  onClose,
  config, // Accept the config prop
}: ImageEditorClientProps) {
  if (!source) {
    // Should ideally not happen if parent component controls this
    return <p>Image source is missing.</p>;
  }

  return (
    <FilerobotImageEditorComponent
      source={source}
      onSave={onSave}
      onClose={onClose}
      config={config} // Pass the config to the editor
    />
  );
}
