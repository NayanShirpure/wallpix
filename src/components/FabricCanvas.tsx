// File: components/FabricCanvas.tsx
'use client';

import React, { useEffect, useRef } from 'react'; // Ensure React is imported
import { fabric } from 'fabric';

// Module-level history stack, exported for Toolbar
export let historyStack: string[] = [];
export const setHistoryStack = (newStack: string[]) => {
  historyStack = newStack;
};
export const getHistoryStack = () => historyStack;


interface FabricCanvasProps {
  selectedColor: string;
  setFabricCanvasInstance: (canvas: fabric.Canvas | null) => void;
}

export default function FabricCanvas({ selectedColor, setFabricCanvasInstance }: FabricCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null); // Use a ref for the Fabric instance

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800, // Default width, will be responsive
      height: 600, // Default height
      backgroundColor: '#2D3748', // Darker background for contrast
      preserveObjectStacking: true,
    });
    fabricCanvasRef.current = canvas;
    setFabricCanvasInstance(canvas); // Pass instance to parent

    // Expose globally for Toolbar (as per user's original structure)
    (window as any).__fabricCanvas = canvas; 

    const text = new fabric.Textbox('Edit me!', { 
      left: 50, 
      top: 50, 
      fontSize: 30, 
      fill: '#F7FAFC', // Light text for dark bg
      fontFamily: 'Inter, sans-serif'
    });
    canvas.add(text);
    historyStack = [JSON.stringify(canvas.toDatalessJSON())]; // Initialize history

    const saveState = () => {
      if (historyStack.length > 20) { // Limit history size
        historyStack.shift();
      }
      historyStack.push(JSON.stringify(canvas.toDatalessJSON()));
    };

    canvas.on('object:modified', saveState);
    canvas.on('object:added', saveState);
    // Consider adding more events like 'object:removed' if relevant

    // Handle responsive canvas size
    const resizeCanvas = () => {
      if (canvasRef.current && canvasRef.current.parentElement && fabricCanvasRef.current) {
        const parentWidth = canvasRef.current.parentElement.clientWidth;
        // Maintain aspect ratio or set fixed, for now using parentWidth
        fabricCanvasRef.current.setWidth(parentWidth);
        // Adjust height proportionally or keep fixed. For now, keeping fixed.
        // To make height responsive (e.g., 3/4 of width):
        // fabricCanvasRef.current.setHeight(parentWidth * (3/4));
        fabricCanvasRef.current.renderAll();
      }
    };

    resizeCanvas(); // Initial resize
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
      setFabricCanvasInstance(null);
      delete (window as any).__fabricCanvas; // Clean up global
    };
  }, [setFabricCanvasInstance]);

  useEffect(() => {
    if (fabricCanvasRef.current) {
      const activeObject = fabricCanvasRef.current.getActiveObject();
      if (activeObject) {
        // Check if it's a text object or shape that has 'fill'
        if (activeObject.type === 'textbox' || activeObject.type === 'i-text' || activeObject.type === 'text' || (activeObject as any).fill) {
          activeObject.set('fill', selectedColor);
        } else if ((activeObject as any).stroke) { // For objects like lines or hollow shapes, change stroke
           activeObject.set('stroke', selectedColor);
        }
        fabricCanvasRef.current.renderAll();
      } else {
        // If no object selected, maybe change brush color for drawing?
        if (fabricCanvasRef.current.freeDrawingBrush) {
          fabricCanvasRef.current.freeDrawingBrush.color = selectedColor;
        }
      }
    }
  }, [selectedColor]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
