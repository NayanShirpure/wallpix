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
  onHistoryUpdate?: () => void; // Callback to notify parent of history change
}

export default function FabricCanvas({ selectedColor, setFabricCanvasInstance, onHistoryUpdate }: FabricCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  const saveState = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (historyStack.length > 20) { 
      historyStack.shift();
    }
    // Use toDatalessJSON to avoid bloating history with image data if images are part of canvas state
    // Pass an array of properties to exclude if specific ones are causing issues or are not needed for history
    historyStack.push(JSON.stringify(canvas.toDatalessJSON(['clipPath']))); 
    onHistoryUpdate?.(); 
  }, [onHistoryUpdate]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800, // Initial width, will be adjusted by resizeCanvas
      height: 600, // Initial height
      backgroundColor: '#2D3748', 
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
    
    // Initialize history after canvas and initial object are ready
    historyStack = [JSON.stringify(canvas.toDatalessJSON(['clipPath']))]; 
    onHistoryUpdate?.(); 

    canvas.on('object:modified', saveState);
    canvas.on('object:added', saveState);
    canvas.on('object:removed', saveState);

    const resizeCanvas = () => {
      if (canvasRef.current && canvasRef.current.parentElement && fabricCanvasRef.current) {
        const parentElement = canvasRef.current.parentElement;
        if (parentElement.clientWidth > 0) { // Ensure parent has valid width
            fabricCanvasRef.current.setWidth(parentElement.clientWidth);
            // Optional: Adjust height - current setup keeps height fixed unless explicitly handled elsewhere
            // fabricCanvasRef.current.setHeight(parentElement.clientHeight); 
            fabricCanvasRef.current.renderAll();
        }
      }
    };

    // Defer initial resize to ensure parent dimensions are stable
    const resizeTimeoutId = setTimeout(resizeCanvas, 0);
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearTimeout(resizeTimeoutId);
      if (fabricCanvasRef.current) {
        // Make sure to turn off listeners before disposing
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
        }
        // Note: Changing color of an active object does not save to history stack here.
        // If desired, call saveState() after renderAll(), but this might make many history entries.
      } else {
        if (fabricCanvasRef.current.freeDrawingBrush) {
          fabricCanvasRef.current.freeDrawingBrush.color = selectedColor;
        }
      }
    }
  }, [selectedColor, saveState]); // Added saveState to dependencies of second useEffect if it were to call saveState

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
