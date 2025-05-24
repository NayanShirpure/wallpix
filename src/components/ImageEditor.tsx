'use client';

import React from 'react';
import FilerobotImageEditorComponent from 'filerobot-image-editor'; // Use default import
import type { FilerobotImageEditorConfig, SaveData } from 'filerobot-image-editor';

interface EditorClientProps {
  source: string;
  onSave: (data: SaveData, designState?: any) => void;
  onClose: (closingReason?: string, editorInstance?: any) => void;
  config?: Partial<FilerobotImageEditorConfig>;
}

// Renamed function to EditorClient as per user's example structure
// and exporting as default so dynamic import in page.tsx works as expected
export default function ImageEditorClient({ source, onSave, onClose, config }: EditorClientProps) {
  if (!source) {
    // Optional: render nothing or a placeholder if no source
    return (
        <div className="w-full h-full flex items-center justify-center bg-muted">
            <p className="text-muted-foreground">Error: No image source provided to editor.</p>
        </div>
    );
  }

  return (
    <div style={{ height: '100%', width: '100%' }} className="w-full h-full"> {/* Ensure wrapper takes up space */}
      <FilerobotImageEditorComponent
        source={source}
        onSave={onSave}
        onClose={onClose}
        config={config} 
      />
    </div>
  );
}
