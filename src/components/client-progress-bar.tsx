
'use client';

import NextNProgress from 'nextjs-progressbar';
import type React from 'react';

// Define props based on the component if NextNProgressProps is not exported directly
type ProgressBarProps = React.ComponentProps<typeof NextNProgress>;

export default function ClientProgressBar(props: ProgressBarProps) {
  return <NextNProgress {...props} />;
}
