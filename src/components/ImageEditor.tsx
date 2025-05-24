'use client';

import React from 'react';
// Correctly import the main component from the library
import FilerobotImageEditorComponent from 'filerobot-image-editor';
import type { FilerobotImageEditorConfig, SaveData } from 'filerobot-image-editor';


interface EditorClientProps {
  source: string;
  onSave: (data: SaveData) => void;
  onClose: () => void;
  config?: Partial<FilerobotImageEditorConfig>; // Make config optional for now
}

// Renamed function to EditorClient as per user's example structure
export default function EditorClient({ source, onSave, onClose, config }: EditorClientProps) {
  if (!source) {
    // Optional: render nothing or a placeholder if no source
    return <p>No image source provided to editor.</p>;
  }

  // FilerobotImageEditor is often a class component, so we use it directly.
  // If it were a function component from a library, direct usage is also fine.
  return (
    <div style={{ height: 'calc(100vh - 150px)', minHeight: '500px' }} className="w-full">
      <FilerobotImageEditorComponent
        source={source}
        onSave={onSave}
        onClose={onClose}
        config={config} // Pass the config object
      />
    </div>
  );
}
