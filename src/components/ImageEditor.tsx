'use client';

import React from 'react';

// Simple diagnostic component
export default function ImageEditorClient(props: any) {
  console.log("DIAGNOSTIC ImageEditorClient rendered. Props received:", props);
  return (
    <div style={{ padding: '20px', border: '2px dashed red', margin: '20px', backgroundColor: 'lightyellow' }}>
      <h2>Diagnostic ImageEditorClient Loaded Successfully!</h2>
      <p>This confirms `next/dynamic` can load a component from this path.</p>
      {props.source && <p>Image source prop received: {props.source.substring(0,50)}...</p>}
      {props.config && <p>Config prop received.</p>}
      <p>If you see this, the issue is likely within the FilerobotImageEditorComponent usage in the original ImageEditorClient.</p>
    </div>
  );
}
