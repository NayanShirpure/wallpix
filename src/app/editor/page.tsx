'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
// import dynamic from 'next/dynamic'; // Temporarily remove dynamic import
import ImageEditorClient from '@/components/ImageEditor'; // Use static import for diagnostics
import { PageHeader } from '@/components/layout/PageHeader';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { UploadCloud, Edit3, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { downloadFile } from '@/lib/utils';
import type { SaveData, FilerobotImageEditorConfig } from 'react-filerobot-image-editor';

// Dynamic import (kept for reference, but not used in this diagnostic version)
// const DynamicEditorClient = dynamic(() => import('@/components/ImageEditor'), {
//   ssr: false,
//   loading: () => (
//     <div className="flex items-center justify-center h-[600px] w-full border rounded-lg bg-muted">
//       <p className="text-muted-foreground">Loading Filerobot Editor...</p>
//     </div>
//   ),
// });


export default function EditorPage() {
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { theme: currentTheme } = useTheme();

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          toast({
            title: 'Invalid File Type',
            description: 'Please upload a JPG, PNG, or WEBP image.',
            variant: 'destructive',
          });
          if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset file input
          }
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          setImageSource(e.target?.result as string);
          setImageName(file.name);
          //setIsEditorOpen(true); // Don't auto-open, let user click "Edit"
        };
        reader.readAsDataURL(file);
      }
    },
    [toast]
  );

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const openEditor = () => {
    if (imageSource) {
      setIsEditorOpen(true);
    } else {
      toast({
        title: 'No Image Selected',
        description: 'Please upload an image first to start editing.',
        variant: 'default',
      });
    }
  };

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
  }, []);

  const onSaveImage = useCallback(
    (editedImageObject: SaveData, designState?: any) => {
      console.log('Image saved:', editedImageObject, designState);
      if (editedImageObject.imageBase64) {
        const originalExtension = imageName?.split('.').pop() || editedImageObject.extension || 'png';
        const filename = `${imageName?.replace(/\.[^/.]+$/, "") || 'edited_image'}_filerobot.${originalExtension}`;
        
        downloadFile(editedImageObject.imageBase64, filename)
          .then(() => {
            toast({
              title: 'Image Downloaded',
              description: `${filename} has been saved.`,
            });
          })
          .catch((err) => {
            console.error('Error downloading image:', err);
            toast({
              title: 'Download Failed',
              description: 'Could not download the edited image.',
              variant: 'destructive',
            });
          });
      } else {
        toast({
          title: 'Save Error',
          description: 'Edited image data (base64) is not available for download.',
          variant: 'destructive',
        });
      }
      closeEditor();
    },
    [imageName, closeEditor, toast]
  );

  const filerobotThemeColors = useMemo(() => {
    const isDark = currentTheme === 'dark';
    const accentColor = isDark ? 'hsl(190 88% 55%)' : 'hsl(190 88% 50%)'; // From globals.css
    const primaryBg = isDark ? 'hsl(220 13% 10%)' : 'hsl(0 0% 100%)';     // --background or --popover-background
    const secondaryBg = isDark ? 'hsl(220 13% 15%)' : 'hsl(0 0% 98%)';   // --card or --background
    const text = isDark ? 'hsl(210 17% 95%)' : 'hsl(210 10% 15%)';       // --foreground
    const textMuted = isDark ? 'hsl(210 8% 65%)' : 'hsl(210 10% 35%)';   // --muted-foreground
    const borders = isDark ? 'hsl(220 13% 25%)' : 'hsl(210 14% 80%)';     // --border

    return {
      primaryBg,
      secondaryBg,
      text,
      textMuted,
      accent: accentColor, // Use the defined accent color
      borders,
      activeTabBg: accentColor,
      // Further theme properties as per Filerobot docs, using HSL values
      // Example:
      // 'icons.primary': text,
      // 'icons.secondary': textMuted,
      // 'icons.active': accentColor,
      // 'buttons.primary.text': primaryBg, // Text color on primary button
      // 'buttons.primary.background': accentColor,
      // 'buttons.secondary.text': text,
      // 'buttons.secondary.background': secondaryBg,
      // 'buttons.secondary.border': borders,
    };
  }, [currentTheme]);

  const editorConfigObject: Partial<FilerobotImageEditorConfig> = useMemo(() => ({
    // We removed source, onSave, onClose from here as they are direct props
    theme: {
      colors: filerobotThemeColors,
      typography: {
        fontFamily: 'Inter, Arial, sans-serif', // Match your site's font
      },
    },
    tools: [
      'adjust', 'finetune', 'filter', 'crop', 'rotate', 'resize', 'text', 'image', 'shapes', 'draw', 'watermark'
    ],
    // Example: default to Annotate tab and Text tool
    // defaultTabId: TABS.ANNOTATE, // Requires TABS import
    // defaultToolId: TOOLS.TEXT,    // Requires TOOLS import
    // To use TABS and TOOLS, ensure they are imported:
    // import { TABS, TOOLS } from 'react-filerobot-image-editor';
  }), [filerobotThemeColors]);


  return (
    <>
      <PageHeader
        title={isEditorOpen && imageName ? `Editing: ${imageName}` : "Image Editor"}
        backHref="/"
        backTextDesktop="Back to Wallify"
        backTextMobile="Home"
      >
        <ThemeToggle />
      </PageHeader>
      <main className="flex-grow container mx-auto max-w-5xl p-4 py-8 md:p-6 md:py-12">
        {!isEditorOpen && (
          <div className="mb-6 p-6 border border-border rounded-lg shadow-sm bg-card">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                aria-label="Upload image for editing"
              />
              <Button onClick={triggerFileInput} variant="outline" className="w-full sm:w-auto">
                <UploadCloud className="mr-2 h-4 w-4" /> Upload Image
              </Button>
              {imageSource && (
                <Button onClick={openEditor} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Selected Image
                </Button>
              )}
            </div>
            {imageName && (
              <p className="text-sm text-muted-foreground mt-3">
                Selected: <span className="font-medium text-foreground">{imageName}</span>
              </p>
            )}
            {!imageSource && (
              <p className="text-sm text-muted-foreground mt-3">
                Upload an image (PNG, JPG, WEBP) to start editing.
              </p>
            )}
          </div>
        )}

        {isEditorOpen && imageSource && (
          <div
            style={{ height: 'calc(100vh - 250px)', minHeight: 600 }}
            className="border rounded-lg overflow-hidden bg-background shadow-lg"
          >
            {/* Use static import for diagnostics */}
            <ImageEditorClient
              key={imageSource} // Re-mount if source changes
              source={imageSource}
              onSave={onSaveImage}
              onClose={closeEditor}
              config={editorConfigObject}
            />
          </div>
        )}

        {imageSource && !isEditorOpen && (
          <div className="mt-8 p-4 border border-dashed border-border rounded-lg text-center bg-muted/30">
            <img
              src={imageSource}
              alt={imageName || 'Uploaded preview'}
              className="max-w-xs max-h-60 mx-auto rounded-md shadow-md mb-4 object-contain"
              data-ai-hint="uploaded preview"
            />
            <p className="text-muted-foreground">
              Ready to edit "{imageName || 'your image'}"? Click the "Edit Selected Image" button above.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
