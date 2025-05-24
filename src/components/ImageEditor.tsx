'use client';

import React from 'react';
// Use default import for the React component from the wrapper library
import FilerobotImageEditorComponent from 'react-filerobot-image-editor';
// Import types if needed for props, though we are simplifying props for now
// import type { SaveData, FilerobotImageEditorConfig } from 'react-filerobot-image-editor';

// Simplified props for this diagnostic step
interface ImageEditorClientProps {
  source: string; // Source is essential
  // onSave, onClose, and config will be handled internally or omitted for this test
}

export default function ImageEditorClient({ source }: ImageEditorClientProps) {
  if (!source) {
    // This should ideally not happen if EditorPage manages source correctly
    return <p>Error: Image source is missing for the editor.</p>;
  }

  const handleSave = (editedImageObject: any, designState: any) => {
    console.log('Simplified Save:', editedImageObject, designState);
    // In a real scenario, this would trigger download or further processing
  };

  const handleClose = () => {
    console.log('Simplified Close');
    // In a real scenario, this would hide the editor
  };

  // For this diagnostic step, we pass minimal or no config
  // to see if the component loads at all.
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <FilerobotImageEditorComponent
        source={source}
        onSave={handleSave} // Using simplified internal handler
        onClose={handleClose} // Using simplified internal handler
        // config={{ tools: ['crop', 'rotate', 'filter', 'adjust'] }} // Temporarily removing config
      />
    </div>
  );
}
