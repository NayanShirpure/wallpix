// src/components/DebugClient.tsx
'use client';

import React from 'react';

export default function DebugClient() {
  // Intentionally simple. No complex imports, no heavy logic.
  React.useEffect(() => {
    console.log('DebugClient Mounted!');
    return () => {
      console.log('DebugClient Unmounted!');
    };
  }, []);

  return (
    <div style={{ padding: '20px', border: '2px dashed red', background: '#ffebeb', margin: '20px' }}>
      <h3>DebugClient Loaded Successfully!</h3>
      <p>This confirms the dynamic import mechanism is working if you see this.</p>
    </div>
  );
}
