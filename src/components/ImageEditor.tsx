'use client';

import React from 'react';
// Use default import for the React component from the wrapper library
import FilerobotImageEditorComponent from 'react-filerobot-image-editor';
// Import types for props if needed, e.g., SaveData for onSave
// Ensure FilerobotImageEditorConfig is imported if used for config prop later
import type { SaveData, FilerobotImageEditorConfig } from 'react-filerobot-image-editor'; 

interface ImageEditorClientProps {
  source: string;
  // Temporarily making these optional or removing if we hardcode inside for testing
  onSave?: (editedImageObject: SaveData, designState?: any) => void;
  onClose?: () => void;
  config?: FilerobotImageEditorConfig; // Still accept it, but won't pass it for now
}

export default function ImageEditorClient({ source, onSave, onClose, config }: ImageEditorClientProps) {
  if (!source) {
    return <p>Error: Image source is missing for the editor.</p>;
  }

  const internalOnSave = (editedImageObject: SaveData, designState?: any) => {
    console.log('Internal Save:', editedImageObject);
    if (onSave) {
      onSave(editedImageObject, designState);
    }
  };

  const internalOnClose = () => {
    console.log('Internal Close');
    if (onClose) {
      onClose();
    }
  };

  // For this diagnostic step, we pass a minimal or no config
  // to see if the component loads at all.
  // The actual config prop is still accepted by ImageEditorClient
  // but we are testing without passing it to FilerobotImageEditorComponent.

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <FilerobotImageEditorComponent
        source={source}
        onSave={internalOnSave} // Use internal or passed-through handlers
        onClose={internalOnClose}
        // config={config} // Temporarily remove config for diagnostics
      />
    </div>
  );
}
