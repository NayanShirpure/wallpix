// File: components/Toolbar.tsx
'use client';

import React, { useEffect } from 'react'; // Ensure React is imported
import { fabric } from 'fabric';
import { getHistoryStack, setHistoryStack } from '@/components/FabricCanvas'; // Import history
import { ZoomIn, ZoomOut, Type, Square, Circle as CircleIcon, Minus, Eraser, Undo, Redo, Image as ImageIcon, UploadCloud } from 'lucide-react'; // Import necessary icons

interface ToolbarProps {
  selectedColor: string;
  fabricCanvas: fabric.Canvas | null; // Receive fabric instance as prop
}

export default function Toolbar({ selectedColor, fabricCanvas }: ToolbarProps) {
  
  const getCanvas = (): fabric.Canvas | null => {
    // Prioritize passed prop, fallback to window object for legacy compatibility if any
    return fabricCanvas || (window as any).__fabricCanvas as fabric.Canvas || null;
  };

  const addText = () => {
    const canvas = getCanvas();
    if (canvas) {
      const newText = new fabric.Textbox('New Text', {
        left: canvas.getWidth() / 2 - 50,
        top: canvas.getHeight() / 2 - 20,
        fontSize: 24,
        fill: selectedColor,
        fontFamily: 'Inter, sans-serif',
        originX: 'center',
        originY: 'center',
      });
      canvas.add(newText);
      canvas.setActiveObject(newText);
      canvas.renderAll();
    }
  };

  const addRect = () => {
    const canvas = getCanvas();
    if (canvas) {
      const rect = new fabric.Rect({
        left: canvas.getWidth() / 2 - 50,
        top: canvas.getHeight() / 2 - 25,
        fill: selectedColor,
        width: 100,
        height: 50,
        originX: 'center',
        originY: 'center',
      });
      canvas.add(rect);
      canvas.renderAll();
    }
  };
  
  const addCircle = () => {
    const canvas = getCanvas();
    if (canvas) {
      const circle = new fabric.Circle({
        left: canvas.getWidth() / 2,
        top: canvas.getHeight() / 2,
        fill: selectedColor,
        radius: 40,
        originX: 'center',
        originY: 'center',
      });
      canvas.add(circle);
      canvas.renderAll();
    }
  };

  const addLine = () => {
    const canvas = getCanvas();
    if (canvas) {
      const line = new fabric.Line([50, 100, 250, 100], {
        left: canvas.getWidth() / 2 - 100,
        top: canvas.getHeight() / 2,
        stroke: selectedColor,
        strokeWidth: 3,
        originX: 'center',
        originY: 'center',
      });
      canvas.add(line);
      canvas.renderAll();
    }
  };

  const toggleFreeDrawing = () => {
    const canvas = getCanvas();
    if (canvas) {
      canvas.isDrawingMode = !canvas.isDrawingMode;
      if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = selectedColor;
        canvas.freeDrawingBrush.width = 5;
      }
    }
  };
  
  const handleZoom = (factor: number) => {
    const canvas = getCanvas();
    if (canvas) {
      let currentZoom = canvas.getZoom();
      currentZoom *= factor;
      // Prevent zooming too far in or out
      currentZoom = Math.max(0.1, Math.min(currentZoom, 10)); 
      
      const center = canvas.getCenter();
      canvas.zoomToPoint(new fabric.Point(center.left, center.top), currentZoom);
      canvas.renderAll();
    }
  };

  const handleUndo = () => {
    const canvas = getCanvas();
    const currentHistory = getHistoryStack();
    if (canvas && currentHistory.length > 1) { // Keep at least one state (initial)
      currentHistory.pop(); // Remove current state
      const prevState = currentHistory[currentHistory.length - 1];
      canvas.loadFromJSON(prevState, () => {
        canvas.renderAll();
        // Restore object stacking after loadFromJSON
        canvas.preserveObjectStacking = true; 
      });
      setHistoryStack([...currentHistory]); // Update the shared history
    }
  };

  // Placeholder for Redo - more complex as it requires a forward stack
  const handleRedo = () => {
    console.log("Redo functionality to be implemented");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const canvas = getCanvas();
    if (canvas && event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (f) => {
        const data = f.target?.result as string;
        fabric.Image.fromURL(data, (img) => {
          img.scaleToWidth(canvas.getWidth() / 2); // Scale to fit nicely
          img.set({
            left: canvas.getWidth() / 4,
            top: canvas.getHeight() / 4,
          });
          canvas.add(img);
          canvas.renderAll();
        });
      };
      reader.readAsDataURL(file);
      event.target.value = ''; // Reset file input
    }
  };


  return (
    <div className="p-3 bg-card border rounded-md shadow space-y-3">
      <div>
        <label htmlFor="image-upload-fabric" className="btn text-sm flex items-center justify-center cursor-pointer">
          <UploadCloud className="mr-2 h-4 w-4" /> Upload Image
        </label>
        <input id="image-upload-fabric" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => handleZoom(1.1)} title="Zoom In" className="btn btn-icon"><ZoomIn size={18} /></button>
        <button onClick={() => handleZoom(0.9)} title="Zoom Out" className="btn btn-icon"><ZoomOut size={18} /></button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={addText} title="Add Text" className="btn btn-icon"><Type size={18}/></button>
        <button onClick={addRect} title="Add Rectangle" className="btn btn-icon"><Square size={18}/></button>
        <button onClick={addCircle} title="Add Circle" className="btn btn-icon"><CircleIcon size={18}/></button>
        <button onClick={addLine} title="Add Line" className="btn btn-icon"><Minus size={18}/></button>
      </div>
      <button onClick={toggleFreeDrawing} title="Toggle Free Drawing" className="btn text-sm flex items-center justify-center">
        <Eraser className="mr-2 h-4 w-4"/> Draw
      </button>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={handleUndo} title="Undo" className="btn btn-icon" disabled={getHistoryStack().length <= 1}><Undo size={18}/></button>
        <button onClick={handleRedo} title="Redo (WIP)" className="btn btn-icon" disabled><Redo size={18}/></button>
      </div>
       <style jsx>{`
        .btn-icon {
          @apply p-2 flex items-center justify-center;
        }
      `}</style>
    </div>
  );
}
