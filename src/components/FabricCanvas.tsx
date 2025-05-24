// File: components/FabricCanvas.tsx
'use client';

import React, { useEffect, useRef, useCallback } from 'react'; 
import { fabric } from 'fabric';

// Module-level history stack
export let historyStack: string[] = [];
export const setHistoryStack = (newStack: string[]) => {
  historyStack = newStack;
};
export const getHistoryStack = () => historyStack;

interface FabricCanvasProps {
  selectedColor: string;
  setFabricCanvasInstance: (canvas: fabric.Canvas | null) => void;
  onHistoryUpdate?: () => void;
}

export default function FabricCanvas({ 
  selectedColor, 
  setFabricCanvasInstance, 
  onHistoryUpdate 
}: FabricCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const cropGuideRef = useRef<fabric.Rect | null>(null);

  const saveState = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (historyStack.length > 20) { 
      historyStack.shift();
    }
    historyStack.push(JSON.stringify(canvas.toDatalessJSON(['clipPath']))); 
    onHistoryUpdate?.(); 
  }, [onHistoryUpdate]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#2D3748', // Darker background for contrast
      preserveObjectStacking: true,
    });
    fabricCanvasRef.current = canvas;
    setFabricCanvasInstance(canvas);

    const text = new fabric.Textbox('Edit me!', { 
      left: 50, 
      top: 50, 
      fontSize: 30, 
      fill: '#F7FAFC', 
      fontFamily: 'Inter, sans-serif'
    });
    canvas.add(text);
    
    historyStack = [JSON.stringify(canvas.toDatalessJSON(['clipPath']))]; 
    onHistoryUpdate?.(); 

    canvas.on('object:modified', saveState);
    canvas.on('object:added', saveState);
    canvas.on('object:removed', saveState);

    const resizeCanvas = () => {
      if (canvasRef.current && canvasRef.current.parentElement && fabricCanvasRef.current) {
        const parentElement = canvasRef.current.parentElement;
        if (parentElement.clientWidth > 0) {
            const newWidth = parentElement.clientWidth;
            // For simplicity, keep height fixed unless specific aspect ratio logic is needed
            // const newHeight = parentElement.clientHeight; // Or fixed like 600
            fabricCanvasRef.current.setWidth(newWidth);
            // fabricCanvasRef.current.setHeight(newHeight);
            fabricCanvasRef.current.renderAll();
        }
      }
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (canvasRef.current?.parentElement) {
        resizeObserver.observe(canvasRef.current.parentElement);
    }
    // Initial resize
    setTimeout(resizeCanvas, 0); 

    return () => {
      resizeObserver.disconnect();
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.off('object:modified', saveState);
        fabricCanvasRef.current.off('object:added', saveState);
        fabricCanvasRef.current.off('object:removed', saveState);
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
      setFabricCanvasInstance(null);
      historyStack = []; 
      onHistoryUpdate?.(); 
    };
  }, [setFabricCanvasInstance, onHistoryUpdate, saveState]); 

  useEffect(() => {
    if (fabricCanvasRef.current) {
      const activeObject = fabricCanvasRef.current.getActiveObject();
      if (activeObject) {
        let needsRender = false;
        if (activeObject.type === 'textbox' || activeObject.type === 'i-text' || activeObject.type === 'text') {
          if (activeObject.get('fill') !== selectedColor) {
            activeObject.set('fill', selectedColor);
            needsRender = true;
          }
        } else if ((activeObject as any).fill && activeObject.get('fill') !== selectedColor) {
            activeObject.set('fill', selectedColor);
            needsRender = true;
        } else if ((activeObject as any).stroke && activeObject.get('stroke') !== selectedColor) {
           activeObject.set('stroke', selectedColor);
           needsRender = true;
        }
        if (needsRender) {
            fabricCanvasRef.current.renderAll();
            saveState(); // Save state after color change
        }
      } else {
        if (fabricCanvasRef.current.freeDrawingBrush) {
          fabricCanvasRef.current.freeDrawingBrush.color = selectedColor;
        }
      }
    }
  }, [selectedColor, saveState]);

  const applyFilter = (filterType: 'grayscale' | 'sepia' | 'invert' | null) => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas?.getActiveObject();
    if (canvas && activeObject && activeObject.type === 'image') {
      const image = activeObject as fabric.Image;
      image.filters = []; // Clear existing filters
      if (filterType === 'grayscale') {
        image.filters.push(new fabric.Image.filters.Grayscale());
      } else if (filterType === 'sepia') {
        image.filters.push(new fabric.Image.filters.Sepia());
      } else if (filterType === 'invert') {
        image.filters.push(new fabric.Image.filters.Invert());
      }
      image.applyFilters();
      canvas.renderAll();
      saveState();
    } else if (filterType !== null) {
      alert("Please select an image object to apply filters.");
    } else if (filterType === null && activeObject && activeObject.type === 'image') {
        // This part is for clearing, already handled by resetting image.filters
        (activeObject as fabric.Image).applyFilters();
        canvas.renderAll();
        saveState();
    }
  };

  const flipObject = (direction: 'horizontal' | 'vertical') => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas?.getActiveObject();
    if (canvas && activeObject) {
      if (direction === 'horizontal') {
        activeObject.set('flipX', !activeObject.flipX);
      } else {
        activeObject.set('flipY', !activeObject.flipY);
      }
      canvas.renderAll();
      saveState();
    } else {
      alert("Please select an object to flip.");
    }
  };
  
  const toggleCropGuide = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (cropGuideRef.current) {
      canvas.remove(cropGuideRef.current);
      cropGuideRef.current = null;
    } else {
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      // Example: 16:9 guide
      let guideWidth = canvasWidth * 0.9;
      let guideHeight = guideWidth * (9 / 16);

      if (guideHeight > canvasHeight * 0.9) {
        guideHeight = canvasHeight * 0.9;
        guideWidth = guideHeight * (16 / 9);
      }
      
      const guide = new fabric.Rect({
        left: (canvasWidth - guideWidth) / 2,
        top: (canvasHeight - guideHeight) / 2,
        width: guideWidth,
        height: guideHeight,
        fill: 'rgba(0,0,0,0)', // Transparent fill
        stroke: 'rgba(255,255,255,0.7)', // White dashed line
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false, // Not interactive
      });
      cropGuideRef.current = guide;
      canvas.add(guide).bringToFront(guide);
    }
    canvas.renderAll();
  };

  const deleteSelectedObject = () => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas?.getActiveObject();
    if (canvas && activeObject) {
      canvas.remove(activeObject);
      // If it was a group, remove all objects in the group
      if (activeObject.type === 'activeSelection') {
        (activeObject as fabric.ActiveSelection).forEachObject(obj => canvas.remove(obj));
        canvas.discardActiveObject();
      }
      canvas.renderAll();
      saveState(); // Save state after deletion
    } else {
      alert("No object selected to delete.");
    }
  };

  // Make functions available to Toolbar via props passed from EditorPage
  useEffect(() => {
    if (fabricCanvasRef.current) {
      (fabricCanvasRef.current as any).customApplyFilter = applyFilter;
      (fabricCanvasRef.current as any).customFlipObject = flipObject;
      (fabricCanvasRef.current as any).customToggleCropGuide = toggleCropGuide;
      (fabricCanvasRef.current as any).customDeleteSelectedObject = deleteSelectedObject;
    }
  }, [applyFilter, flipObject, toggleCropGuide, deleteSelectedObject]);


  return <canvas ref={canvasRef} className="w-full h-full" />;
}
