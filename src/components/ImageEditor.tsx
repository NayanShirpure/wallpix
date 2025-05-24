'use client';

import React from 'react';
import FilerobotImageEditor from 'filerobot-image-editor';
import type { FilerobotImageEditorConfig } from 'filerobot-image-editor';

interface ImageEditorClientProps {
  source: string;
  onSave: (editedImageObject: any, designState: any) => void;
  onClose: () => void;
  config: FilerobotImageEditorConfig;
}

export default function ImageEditorClient({ source, onSave, onClose, config }: ImageEditorClientProps) {
  return (
    <div style={{ height: 'calc(100vh - 220px)', minHeight: '550px' }} className="w-full">
      <FilerobotImageEditor
        source={source}
        onSave={onSave}
        onClose={onClose}
        config={config}
      />
    </div>
  );
}
