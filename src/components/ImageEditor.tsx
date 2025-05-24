'use client';

import React from 'react';
import FilerobotImageEditor from 'filerobot-image-editor';
import type { FilerobotImageEditorConfig } from 'filerobot-image-editor';

interface ImageEditorProps {
  source: string;
  onSave: (editedImageObject: any, designState: any) => void;
  onClose: () => void;
  config: FilerobotImageEditorConfig; // Use the specific config type if available, or a more general one
}

export default function ImageEditor({ source, onSave, onClose, config }: ImageEditorProps) {
  return (
    <div style={{ height: 'calc(100vh - 220px)', minHeight: '550px' }} className="w-full"> {/* Adjusted height */}
      <FilerobotImageEditor
        source={source}
        onSave={onSave}
        onClose={onClose}
        config={config}
      />
    </div>
  );
}
