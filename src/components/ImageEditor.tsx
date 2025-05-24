
'use client';

import React, { useEffect, useState } from 'react';
// Use default import for react-filerobot-image-editor
import FilerobotImageEditorComponent from 'react-filerobot-image-editor';
import type { SaveData, FilerobotImageEditorConfig } from 'react-filerobot-image-editor';
// Note: TABS and TOOLS enums might not be exported or might have different names.
// If needed, refer to react-filerobot-image-editor documentation for specific config.

interface ImageEditorClientProps {
  source: string;
  onSave: (data: SaveData, designState?: any) => void;
  onClose: () => void;
  config?: Partial<FilerobotImageEditorConfig>;
}

export default function ImageEditorClient({
  source,
  onSave,
  onClose,
  config,
}: ImageEditorClientProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set mounted to true after the component has mounted on the client.
    // This ensures FilerobotImageEditorComponent is only rendered client-side
    // and after this wrapper has established its DOM presence.
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // This can be a more specific loader for just this component
    // if the dynamic import loader in page.tsx is too generic.
    // Or return null if parent's loader is sufficient.
    return <div className="flex items-center justify-center h-full w-full"><p className="text-muted-foreground">Initializing Editor Interface...</p></div>;
  }
  
  if (!source) {
    // This case should ideally be handled by the parent component
    // by not rendering ImageEditorClient if source is not available.
    return <div className="flex items-center justify-center h-full w-full"><p className="text-muted-foreground">Image source is required to load the editor.</p></div>;
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
