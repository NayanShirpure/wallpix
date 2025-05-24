// File: app/editor/page.tsx
'use client';

import dynamic from 'next/dynamic';
import React, { useState, useCallback, useEffect } from 'react'; 
import { HexColorPicker } from 'react-colorful';
import { PageHeader } from '@/components/layout/PageHeader';
import { ThemeToggle } from '@/components/theme-toggle';
import type { fabric as FabricType } from 'fabric'; 

// Dynamically import components that are client-side only
const FabricCanvas = dynamic(() => import('@/components/FabricCanvas'), { 
  ssr: false,
  loading: () => <div className="w-full h-[600px] flex items-center justify-center border shadow rounded bg-muted"><p>Loading Canvas...</p></div>
});
const Toolbar = dynamic(() => import('@/components/Toolbar'), { 
  ssr: false,
  loading: () => <div className="w-full md:w-64"><p>Loading Toolbar...</p></div> // Simple text loader for toolbar
});

export default function EditorPage() {
  const [selectedColor, setSelectedColor] = useState('#ff0000');
  const [fabricCanvasInstance, setFabricCanvasInstance] = useState<FabricType.Canvas | null>(null);
  const [historyRevision, setHistoryRevision] = useState(0); 

  const handleHistoryUpdate = useCallback(() => {
    setHistoryRevision(prev => prev + 1); // Increment to trigger re-render
  }, []);
  
  const canvasContainerMinHeight = '600px'; // Or adjust as needed

  const handleApplyFilter = useCallback((filterType: 'grayscale' | 'sepia' | 'invert' | null) => {
    if (fabricCanvasInstance && (fabricCanvasInstance as any).customApplyFilter) {
      (fabricCanvasInstance as any).customApplyFilter(filterType);
    }
  }, [fabricCanvasInstance]);

  const handleFlip = useCallback((direction: 'horizontal' | 'vertical') => {
    if (fabricCanvasInstance && (fabricCanvasInstance as any).customFlipObject) {
      (fabricCanvasInstance as any).customFlipObject(direction);
    }
  }, [fabricCanvasInstance]);
  
  const handleToggleCropGuide = useCallback(() => {
    if (fabricCanvasInstance && (fabricCanvasInstance as any).customToggleCropGuide) {
      (fabricCanvasInstance as any).customToggleCropGuide();
    }
  }, [fabricCanvasInstance]);

  const handleDeleteSelected = useCallback(() => {
    if (fabricCanvasInstance && (fabricCanvasInstance as any).customDeleteSelectedObject) {
      (fabricCanvasInstance as any).customDeleteSelectedObject();
    }
  }, [fabricCanvasInstance]);


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
            {fabricCanvasInstance && ( // Only render Toolbar if canvas instance exists
              <Toolbar 
                selectedColor={selectedColor} 
                fabricCanvas={fabricCanvasInstance}
                historyRevision={historyRevision} 
                onApplyFilter={handleApplyFilter}
                onFlip={handleFlip}
                onToggleCropGuide={handleToggleCropGuide}
                onDeleteSelected={handleDeleteSelected}
              />
            )}
            {!fabricCanvasInstance && ( // Placeholder for Toolbar while canvas loads
                 <div className="w-full md:w-64"><p>Loading Toolbar...</p></div>
            )}
            <div className="p-2 border rounded-md shadow bg-card">
              <h2 className="text-sm font-medium text-card-foreground mb-2">Object Color</h2>
              <HexColorPicker className="!w-full" color={selectedColor} onChange={setSelectedColor} />
            </div>
          </div>
          <div 
            className="flex-1 border shadow-lg rounded-lg overflow-hidden order-1 md:order-2 bg-background"
            style={{ minHeight: canvasContainerMinHeight }} // Ensure container has min height
          >
            <FabricCanvas 
              selectedColor={selectedColor} 
              setFabricCanvasInstance={setFabricCanvasInstance}
              onHistoryUpdate={handleHistoryUpdate} 
            />
          </div>
        </div>
      </main>
    </>
  );
}
