'use client';

import React from 'react';
import FilerobotImageEditorComponent from 'react-filerobot-image-editor';
import type { SaveData } from 'react-filerobot-image-editor';

// Props for the client-side wrapper, simplified for diagnostics
interface ImageEditorClientProps {
  source: string;
  // onSave and onClose will be stubbed internally for this test
  // config will be omitted for this test
}

export default function ImageEditorClient({ source }: ImageEditorClientProps) {
  // console.log('Diagnostic ImageEditorClient rendering with source:', source);

  const handleSave = (editedImageObject: SaveData, designState?: any) => {
    console.log('DIAGNOSTIC: Filerobot save triggered', editedImageObject, designState);
    // In a real scenario, this would call a prop like props.onSave
  };

  const handleClose = () => {
    console.log('DIAGNOSTIC: Filerobot close triggered');
    // In a real scenario, this would call a prop like props.onClose
  };

  if (!source) {
    return <p className="text-center text-muted-foreground p-4">Image source is missing for editor.</p>;
  }

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <FilerobotImageEditorComponent
        source={source}
        onSave={handleSave} // Using internal stub
        onClose={handleClose} // Using internal stub
        // config prop is explicitly omitted for this diagnostic step
      />
    </div>
  );
}
