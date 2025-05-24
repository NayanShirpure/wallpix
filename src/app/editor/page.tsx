// File: app/editor/page.tsx
'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react'; // Ensure React is imported
import { HexColorPicker } from 'react-colorful';
import { PageHeader } from '@/components/layout/PageHeader';
import { ThemeToggle } from '@/components/theme-toggle';

const FabricCanvas = dynamic(() => import('@/components/FabricCanvas'), { 
  ssr: false,
  loading: () => <div className="w-full h-[600px] flex items-center justify-center border shadow rounded bg-muted"><p>Loading Canvas...</p></div>
});
const Toolbar = dynamic(() => import('@/components/Toolbar'), { 
  ssr: false,
  loading: () => <div className="w-full md:w-64"><p>Loading Toolbar...</p></div>
});

export default function EditorPage() {
  const [selectedColor, setSelectedColor] = useState('#ff0000');
  const [fabricCanvasInstance, setFabricCanvasInstance] = useState<any>(null); // To hold the Fabric.js canvas instance

  return (
    <>
      <PageHeader
        title="Advanced Image Editor"
        backHref="/"
        backTextDesktop="Back to Wallify"
        backTextMobile="Home"
      >
        <ThemeToggle />
      </PageHeader>
      <main className="flex-grow container mx-auto max-w-7xl p-4 py-8 md:p-6 md:py-12">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="w-full md:w-64 flex-shrink-0 space-y-4 order-2 md:order-1">
            <Toolbar selectedColor={selectedColor} fabricCanvas={fabricCanvasInstance} />
            <div className="p-2 border rounded-md shadow bg-card">
              <h2 className="text-sm font-medium text-card-foreground mb-2">Color</h2>
              <HexColorPicker className="!w-full" color={selectedColor} onChange={setSelectedColor} />
            </div>
          </div>
          <div className="flex-1 border shadow-lg rounded-lg overflow-hidden order-1 md:order-2 bg-background">
            <FabricCanvas selectedColor={selectedColor} setFabricCanvasInstance={setFabricCanvasInstance} />
          </div>
        </div>
      </main>
    </>
  );
}
