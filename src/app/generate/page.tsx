
'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, AlertTriangle, Eye, Download as DownloadIcon } from 'lucide-react'; // Added Eye and DownloadIcon
import Image from 'next/image';
import { generateWallpaper, type GenerateWallpaperInput } from '@/ai/flows/generate-wallpaper-flow';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { PreviewDialog } from '@/components/wallpaper/PreviewDialog'; // Added PreviewDialog import
import type { PexelsPhoto } from '@/types/pexels'; // Added PexelsPhoto import
import { downloadFile } from '@/lib/utils'; // Added downloadFile import

export default function GeneratePage() {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImageUri, setGeneratedImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [aiWallpaperForPreview, setAiWallpaperForPreview] = useState<PexelsPhoto | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please enter a description for the wallpaper you want to generate.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setGeneratedImageUri(null);
    setAiWallpaperForPreview(null);
    setError(null);

    try {
      const input: GenerateWallpaperInput = { prompt };
      const result = await generateWallpaper(input);
      setGeneratedImageUri(result.imageDataUri);

      // Create a PexelsPhoto-like object for the PreviewDialog
      const aiPhotoForDialog: PexelsPhoto = {
        id: Date.now(), // Simple unique ID
        width: 1024,    // Placeholder dimension, AI might vary
        height: 1024,   // Placeholder dimension
        url: result.imageDataUri, // For 'View on Pexels' link, will just show image
        photographer: 'AI Generator (Wallify)',
        photographer_url: '/generate',
        photographer_id: 0,
        avg_color: '#7F7F7F', // Placeholder
        src: {
          original: result.imageDataUri,
          large2x: result.imageDataUri,
          large: result.imageDataUri,
          medium: result.imageDataUri,
          small: result.imageDataUri,
          portrait: result.imageDataUri,
          landscape: result.imageDataUri,
          tiny: result.imageDataUri, // Ideally a smaller data URI, but same for now
        },
        liked: false,
        alt: result.altText,
      };
      setAiWallpaperForPreview(aiPhotoForDialog);

      toast({
        title: 'Wallpaper Generated!',
        description: 'Your AI-powered wallpaper is ready.',
      });
    } catch (err) {
      console.error('Error generating wallpaper:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during generation.';
      setError(`Failed to generate wallpaper: ${errorMessage}`);
      toast({
        title: 'Generation Failed',
        description: `Could not generate wallpaper. ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    if (aiWallpaperForPreview) {
      setIsPreviewModalOpen(true);
    }
  };

  const handleDownload = async () => {
    if (!generatedImageUri) return;
    const filename = `wallify_ai_generated_${Date.now()}.png`;
    toast({
      title: "Download Starting",
      description: `Preparing ${filename} for download...`,
    });
    try {
      await downloadFile(generatedImageUri, filename);
      toast({
        title: "Download Complete",
        description: `${filename} has been downloaded.`,
      });
    } catch (error) {
      console.error('Error downloading AI wallpaper:', error);
      toast({
        title: "Download Failed",
        description: "Could not download the wallpaper. Please try again.",
        variant: "destructive",
      });
    }
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    // No need to clear aiWallpaperForPreview here as it's tied to generatedImageUri
  };


  return (
    <>
      <PageHeader
        title="AI Wallpaper Generator"
        backHref="/"
        backTextDesktop="Back to Wallify"
        backTextMobile="Home"
      >
        <ThemeToggle />
      </PageHeader>
      <main className="flex-grow container mx-auto max-w-3xl p-4 py-8 md:p-6 md:py-12">
        <Card className="shadow-xl border-border">
          <CardHeader className="text-center">
            <Wand2 className="mx-auto h-12 w-12 text-primary mb-2" />
            <CardTitle className="text-2xl font-bold text-primary">Create Your Own Wallpaper</CardTitle>
            <CardDescription className="text-muted-foreground">
              Describe the wallpaper you envision, and let our AI bring it to life.
              This feature is experimental; results may vary.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="prompt" className="block text-sm font-medium text-foreground">
                  Enter your prompt:
                </label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A mystical forest with glowing mushrooms under a starry night sky"
                  className="min-h-[100px] bg-input border-input"
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Wallpaper
                  </>
                )}
              </Button>
            </form>

            {isLoading && (
              <div className="mt-8 text-center">
                <Skeleton className="w-full aspect-video rounded-lg bg-muted/50" />
                <p className="text-sm text-muted-foreground mt-2">AI is conjuring your wallpaper... please wait.</p>
              </div>
            )}

            {error && !isLoading && (
              <div className="mt-8 text-center p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <AlertTriangle className="mx-auto h-8 w-8 text-destructive mb-2" />
                <p className="text-destructive font-semibold">Generation Error</p>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
            )}

            {generatedImageUri && !isLoading && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-primary mb-4 text-center">Your Generated Wallpaper:</h3>
                <div className="relative aspect-video w-full max-w-xl mx-auto rounded-lg overflow-hidden shadow-lg border border-border">
                  <Image
                    src={generatedImageUri}
                    alt={aiWallpaperForPreview?.alt || `AI generated wallpaper for prompt: ${prompt}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain"
                    data-ai-hint="generated ai art"
                  />
                </div>
                <div className="mt-4 flex justify-center space-x-3">
                  <Button variant="outline" onClick={handlePreview} disabled={!aiWallpaperForPreview}>
                    <Eye className="mr-2 h-4 w-4" /> Preview
                  </Button>
                  <Button onClick={handleDownload}>
                    <DownloadIcon className="mr-2 h-4 w-4" /> Download
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Image generation is experimental. Quality may vary.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground pt-4">
            <p>
              Note: Generated images are transient and not stored. The AI model used is Gemini.
              Please be mindful of <a href="https://ai.google.dev/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent" aria-label="Google's Generative AI Prohibited Use Policy (opens in new tab)">Google's Generative AI Prohibited Use Policy</a>.
            </p>
          </CardFooter>
        </Card>
      </main>
      {aiWallpaperForPreview && (
        <PreviewDialog
          photo={aiWallpaperForPreview}
          isOpen={isPreviewModalOpen}
          onClose={closePreviewModal}
        />
      )}
    </>
  );
}

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={
        `flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ` +
        (className || '')
      }
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';
