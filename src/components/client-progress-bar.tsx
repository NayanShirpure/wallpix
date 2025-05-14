
'use client';

import NextNProgress from 'nextjs-progressbar';
import type React from 'react'; // Ensure React is imported for React.ReactElement

// Define props explicitly based on nextjs-progressbar's typical API
// and correcting the transformCSS prop type
interface ClientProgressBarProps {
  color?: string;
  startPosition?: number;
  stopDelayMs?: number;
  height?: number;
  showOnShallow?: boolean;
  options?: {
    showSpinner?: boolean;
    trickle?: boolean;
    trickleSpeed?: number;
    minimum?: number;
    easing?: string;
    speed?: number;
    template?: string;
    [key: string]: any; // Allow any other nprogress options passed via the options prop
  };
  nonce?: string;
  transformCSS?: (css: string) => React.ReactElement; // Corrected return type
  // Ensure any other top-level props from nextjs-progressbar are also allowed
  [key: string]: any;
}

export default function ClientProgressBar(props: ClientProgressBarProps) {
  return <NextNProgress {...props} />;
}

