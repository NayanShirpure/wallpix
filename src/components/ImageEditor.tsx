// src/components/ImageEditor.tsx (Our EditorClient wrapper)
'use client';

import React, { useEffect, useState } from 'react';
import FilerobotImageEditorComponent from 'react-filerobot-image-editor'; // Default import
import type { SaveData, FilerobotImageEditorConfig } from 'react-filerobot-image-editor';

interface ImageEditorClientProps {
  source: string;
  onSave: (editedImageObject: SaveData, designState?: any) => void;
  onClose: () => void;
  config: Partial<FilerobotImageEditorConfig>; // Config object passed as a prop
  // Key prop is handled by React if passed from parent
}

export default function ImageEditorClient({
  source,
  onSave,
  onClose,
  config,
}: ImageEditorClientProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // This effect runs once on the client after the component mounts
    setIsMounted(true);
  }, []);

  if (!isMounted || !source) {
    // Don't render Filerobot until this wrapper component is mounted
    // and a source is provided.
    // Parent (EditorPage) dynamic import already has a loader for this component.
    return <p className="p-4 text-muted-foreground text-center">Initializing editor...</p>;
  }

  return (
    <FilerobotImageEditorComponent
      source={source}
      onSave={onSave}
      onClose={onClose}
      config={config} // Pass the structured config object
    />
  );
}
