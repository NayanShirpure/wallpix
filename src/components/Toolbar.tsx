// File: components/Toolbar.tsx
'use client';

import React, { useCallback } from 'react';
import { fabric as FabricType } from 'fabric';
import { getHistoryStack, setHistoryStack } from '@/components/FabricCanvas';
import { 
  ZoomIn, ZoomOut, Type, Square, Circle as CircleIcon, Minus, Eraser, 
  Undo, Redo, Image as ImageIconLucide, UploadCloud, Trash2,
  FlipHorizontal, FlipVertical, Palette, Sparkles, Crop, EyeOff
} from 'lucide-react';

interface ToolbarProps {
  selectedColor: string;
  fabricCanvas: FabricType.Canvas | null;
  historyRevision: number; // To trigger re-render for disabled state of undo
  onApplyFilter: (filterType: 'grayscale' | 'sepia' | 'invert' | null) => void;
  onFlip: (direction: 'horizontal' | 'vertical') => void;
  onToggleCropGuide: () => void;
  onDeleteSelected: () => void;
}

export default function Toolbar({ 
  selectedColor, 
  fabricCanvas, 
  historyRevision,
  onApplyFilter,
  onFlip,
  onToggleCropGuide,
  onDeleteSelected
}: ToolbarProps) {

  const addText = useCallback(() => {
    if (fabricCanvas) {
      const newText = new FabricType.Textbox('New Text', {
        left: fabricCanvas.getWidth() / 2 - 50,
        top: fabricCanvas.getHeight() / 2 - 20,
        fontSize: 24,
        fill: selectedColor,
        fontFamily: 'Inter, sans-serif',
        originX: 'center',
        originY: 'center',
      });
      fabricCanvas.add(newText);
      fabricCanvas.setActiveObject(newText);
      fabricCanvas.renderAll();
    }
  }, [fabricCanvas, selectedColor]);

  const addRect = useCallback(() => {
    if (fabricCanvas) {
      const rect = new FabricType.Rect({
        left: fabricCanvas.getWidth() / 2 - 50,
        top: fabricCanvas.getHeight() / 2 - 25,
        fill: selectedColor,
        width: 100,
        height: 50,
        originX: 'center',
        originY: 'center',
      });
      fabricCanvas.add(rect);
      fabricCanvas.renderAll();
    }
  }, [fabricCanvas, selectedColor]);

  const addCircle = useCallback(() => {
    if (fabricCanvas) {
      const circle = new FabricType.Circle({
        left: fabricCanvas.getWidth() / 2,
        top: fabricCanvas.getHeight() / 2,
        fill: selectedColor,
        radius: 40,
        originX: 'center',
        originY: 'center',
      });
      fabricCanvas.add(circle);
      fabricCanvas.renderAll();
    }
  }, [fabricCanvas, selectedColor]);

  const addLine = useCallback(() => {
    if (fabricCanvas) {
      const line = new FabricType.Line([50, 100, 250, 100], {
        left: fabricCanvas.getWidth() / 2 - 100,
        top: fabricCanvas.getHeight() / 2,
        stroke: selectedColor,
        strokeWidth: 3,
        originX: 'center',
        originY: 'center',
      });
      fabricCanvas.add(line);
      fabricCanvas.renderAll();
    }
  }, [fabricCanvas, selectedColor]);

  const toggleFreeDrawing = useCallback(() => {
    if (fabricCanvas) {
      fabricCanvas.isDrawingMode = !fabricCanvas.isDrawingMode;
      if (fabricCanvas.isDrawingMode && fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush.color = selectedColor;
        const brushWidth = parseInt(prompt("Enter brush width (e.g., 5):", "5") || "5", 10);
        fabricCanvas.freeDrawingBrush.width = isNaN(brushWidth) ? 5 : brushWidth;
      }
    }
  }, [fabricCanvas, selectedColor]);

  const handleZoom = useCallback((factor: number) => {
    if (fabricCanvas) {
      let currentZoom = fabricCanvas.getZoom();
      currentZoom *= factor;
      currentZoom = Math.max(0.1, Math.min(currentZoom, 10)); // Limit zoom
      const center = fabricCanvas.getCenter();
      fabricCanvas.zoomToPoint(new FabricType.Point(center.left, center.top), currentZoom);
      fabricCanvas.renderAll();
    }
  }, [fabricCanvas]);

  const handleUndo = useCallback(() => {
    const currentHistory = getHistoryStack(); 
    if (fabricCanvas && currentHistory.length > 1) {
      currentHistory.pop(); 
      const prevStateJSON = currentHistory[currentHistory.length - 1];
      fabricCanvas.loadFromJSON(prevStateJSON, () => {
        fabricCanvas.renderAll();
        fabricCanvas.preserveObjectStacking = true; 
      });
    }
  }, [fabricCanvas]);

  const handleRedo = useCallback(() => {
    console.log("Redo functionality requires a separate redoStack, not implemented in this version.");
    alert("Redo not yet implemented.");
  }, []);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (fabricCanvas && event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (f) => {
        const data = f.target?.result as string;
        FabricType.Image.fromURL(data, (img) => {
          const maxDim = Math.min(fabricCanvas.getWidth(), fabricCanvas.getHeight()) * 0.8;
          if (img.width && img.height && (img.width > maxDim || img.height > maxDim)) {
            if (img.width > img.height) {
              img.scaleToWidth(maxDim);
            } else {
              img.scaleToHeight(maxDim);
            }
          }
          img.set({
            left: fabricCanvas.getWidth() / 2,
            top: fabricCanvas.getHeight() / 2,
            originX: 'center',
            originY: 'center',
          });
          fabricCanvas.add(img);
          fabricCanvas.renderAll();
        });
      };
      reader.readAsDataURL(file);
      if(event.target) event.target.value = ''; // Reset file input
    }
  }, [fabricCanvas]);

  return (
    <div className="p-3 bg-card border rounded-md shadow space-y-3">
      <div>
        <label htmlFor="image-upload-fabric" className="btn text-sm flex items-center justify-center cursor-pointer">
          <UploadCloud className="mr-2 h-4 w-4" /> Upload Image
        </label>
        <input id="image-upload-fabric" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => handleZoom(1.1)} title="Zoom In" className="btn btn-icon" disabled={!fabricCanvas}><ZoomIn size={18} /></button>
        <button onClick={() => handleZoom(0.9)} title="Zoom Out" className="btn btn-icon" disabled={!fabricCanvas}><ZoomOut size={18} /></button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={addText} title="Add Text" className="btn btn-icon" disabled={!fabricCanvas}><Type size={18}/></button>
        <button onClick={addRect} title="Add Rectangle" className="btn btn-icon" disabled={!fabricCanvas}><Square size={18}/></button>
        <button onClick={addCircle} title="Add Circle" className="btn btn-icon" disabled={!fabricCanvas}><CircleIcon size={18}/></button>
        <button onClick={addLine} title="Add Line" className="btn btn-icon" disabled={!fabricCanvas}><Minus size={18}/></button>
      </div>
      <button onClick={toggleFreeDrawing} title="Toggle Free Drawing" className="btn text-sm flex items-center justify-center" disabled={!fabricCanvas}>
        <Eraser className="mr-2 h-4 w-4"/> Draw
      </button>
      
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => onFlip('horizontal')} title="Flip Horizontal" className="btn btn-icon" disabled={!fabricCanvas}><FlipHorizontal size={18}/></button>
        <button onClick={() => onFlip('vertical')} title="Flip Vertical" className="btn btn-icon" disabled={!fabricCanvas}><FlipVertical size={18}/></button>
      </div>

      <p className="text-xs text-muted-foreground text-center">Filters (on selected image):</p>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => onApplyFilter('grayscale')} title="Grayscale" className="btn text-xs" disabled={!fabricCanvas}>Grayscale</button>
        <button onClick={() => onApplyFilter('sepia')} title="Sepia" className="btn text-xs" disabled={!fabricCanvas}>Sepia</button>
        <button onClick={() => onApplyFilter('invert')} title="Invert" className="btn text-xs" disabled={!fabricCanvas}>Invert</button>
        <button onClick={() => onApplyFilter(null)} title="Clear Filters" className="btn text-xs" disabled={!fabricCanvas}>Clear Filters</button>
      </div>
      
      <button onClick={onToggleCropGuide} title="Toggle 16:9 Crop Guide" className="btn text-sm flex items-center justify-center" disabled={!fabricCanvas}>
        <Crop className="mr-2 h-4 w-4"/> Crop Guide
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={handleUndo} title="Undo" className="btn btn-icon" disabled={!fabricCanvas || getHistoryStack().length <= 1}><Undo size={18}/></button>
        <button onClick={handleRedo} title="Redo (WIP)" className="btn btn-icon" disabled><Redo size={18}/></button>
      </div>
      <button onClick={onDeleteSelected} title="Delete Selected Object" className="btn text-sm flex items-center justify-center text-destructive-foreground bg-destructive hover:bg-destructive/90" disabled={!fabricCanvas}>
        <Trash2 className="mr-2 h-4 w-4"/> Delete Selected
      </button>
       <style jsx>{`
        .btn-icon {
          @apply p-2 flex items-center justify-center;
        }
      `}</style>
    </div>
  );
}
