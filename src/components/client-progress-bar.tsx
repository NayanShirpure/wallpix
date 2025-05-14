
'use client';

import NextNProgress from 'nextjs-progressbar';
import type React from 'react';

// Define props explicitly based on nextjs-progressbar's typical API
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
  transformCSS?: (css: string) => string;
  // Ensure any other top-level props from nextjs-progressbar are also allowed
  [key: string]: any;
}

export default function ClientProgressBar(props: ClientProgressBarProps) {
  return <NextNProgress {...props} />;
}
