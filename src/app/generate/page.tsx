
'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ThemeToggle } from '@/components/theme-toggle';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { generateWallpaper, type GenerateWallpaperInput } from '@/ai/flows/generate-wallpaper-flow';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function GeneratePage() {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
    setGeneratedImage(null);
    setError(null);

    try {
      const input: GenerateWallpaperInput = { prompt };
      const result = await generateWallpaper(input);
      setGeneratedImage(result.imageDataUri);
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

            {generatedImage && !isLoading && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-primary mb-4 text-center">Your Generated Wallpaper:</h3>
                <div className="relative aspect-video w-full max-w-xl mx-auto rounded-lg overflow-hidden shadow-lg border border-border">
                  <Image
                    src={generatedImage}
                    alt={`AI generated wallpaper for prompt: ${prompt}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain"
                    data-ai-hint="generated ai art"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Right-click or long-press on the image to save. Image generation is experimental.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground pt-4">
            <p>
              Note: Generated images are transient and not stored. The AI model used is Gemini.
              Please be mindful of <a href="https://ai.google.dev/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">Google's Generative AI Prohibited Use Policy</a>.
            </p>
          </CardFooter>
        </Card>
      </main>
    </>
  );
}

// Minimal Textarea to avoid adding a full UI component for one-off use
// If Textarea is used more broadly, it should be a proper Shadcn component.
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
