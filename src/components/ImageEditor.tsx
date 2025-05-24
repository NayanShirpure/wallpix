// src/components/ImageEditor.tsx
'use client';

import React from 'react';
// Import FilerobotImageEditor from the React wrapper
import FilerobotImageEditor from 'react-filerobot-image-editor';
// Import types as named exports from the React wrapper
import type { SaveData, FilerobotImageEditorConfig } from 'react-filerobot-image-editor';

interface ImageEditorClientProps {
  source: string;
  onSave: (editedImageObject: SaveData, designState?: any) => void;
  onClose: () => void;
  config?: FilerobotImageEditorConfig;
}

export default function ImageEditorClient(props: ImageEditorClientProps) {
  if (!props.source) {
    return <p>Image source is not available for the editor.</p>;
  }

  return (
    // Filerobot editor typically needs its container to have dimensions.
    // The parent div in EditorPage provides this via style={{ height: '...', width: '...' }}
    // or Tailwind classes ensuring fixed height.
    <div style={{ height: '100%', width: '100%' }}>
      <FilerobotImageEditor
        source={props.source}
        onSave={props.onSave}
        onClose={props.onClose}
        config={props.config}
      />
    </div>
  );
}
