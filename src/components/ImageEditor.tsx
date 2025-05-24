'use client';

import React, { useEffect, useState } from 'react';
import FilerobotImageEditorComponent, {
  type SaveData,
  type FilerobotImageEditorConfig,
} from 'react-filerobot-image-editor';

interface ImageEditorClientProps {
  source: string;
  onSave: (editedImageObject: SaveData, designState?: any) => void;
  onClose: () => void;
  config: Partial<FilerobotImageEditorConfig>;
  // Key is implicitly handled by React if passed by parent
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
    // You can show a specific loader here if desired,
    // but the parent (EditorPage) already shows a loader for DynamicEditorClient.
    return <p>Preparing editor interface...</p>;
  }

  return (
    <FilerobotImageEditorComponent
      source={source}
      onSave={onSave}
      onClose={onClose}
      config={config}
    />
  );
}
