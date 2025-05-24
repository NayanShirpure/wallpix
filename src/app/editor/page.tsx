// src/app/editor/page.tsx
'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/layout/PageHeader';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { UploadCloud, Edit3, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { downloadFile } from '@/lib/utils';
// Types from react-filerobot-image-editor
import type { FilerobotImageEditorConfig, SaveData } from 'react-filerobot-image-editor';

const DynamicEditorClient = dynamic(
  () => import('@/components/ImageEditor'), // Points to ImageEditor.tsx which exports ImageEditorClient
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px] w-full border rounded-lg bg-muted">
        <p className="text-muted-foreground">Loading Image Editor...</p>
      </div>
    ),
  }
);

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
            fileInputRef.current.value = '';
          }
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          setImageSource(e.target?.result as string);
          setImageName(file.name);
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
      if (editedImageObject.dataURL) {
        const originalExtension = imageName?.split('.').pop() || editedImageObject.extension || 'png';
        const filename = `${imageName?.replace(/\.[^/.]+$/, "") || 'edited_image'}_filerobot.${originalExtension}`;
        downloadFile(editedImageObject.dataURL, filename)
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
          description: 'Edited image data (dataURL) is not available for download.',
          variant: 'destructive',
        });
      }
      closeEditor();
    },
    [imageName, closeEditor, toast]
  );

  const filerobotThemeColors = useMemo(() => {
    const isDark = currentTheme === 'dark';
    return {
      primaryBg: isDark ? '#121821' : '#FFFFFF',
      secondaryBg: isDark ? '#1B232E' : '#F0F2F5',
      text: isDark ? '#EFF2F5' : '#212529',
      textMuted: isDark ? '#9AA5B1' : '#687076',
      accent: isDark ? '#27D2F5' : '#0DCAF0', 
      accentMuted: isDark ? '#27D2F5' : '#0DCAF0',
      borders: isDark ? '#313A48' : '#CBD5E0',
      activeTabBg: isDark ? '#27D2F5' : '#0DCAF0',
    };
  }, [currentTheme]);

  const editorConfigObject: FilerobotImageEditorConfig = useMemo(() => ({
    // @ts-ignore Filerobot's ThemeConfig type can be extensive and has caused issues.
    // For now, we'll rely on Filerobot's defaults or more specific themeing if simple color objects don't work.
    theme: {
      colors: filerobotThemeColors,
      typography: {
        fontFamily: 'Inter, Arial, sans-serif',
      },
    },
    tools: [
      'adjust', 'finetune', 'filter', 'crop', 'rotate', 'resize',
      'text', 'image', 'shapes', 'draw', 'watermark'
    ],
    // Removed TABS/TOOLS enum usage from here as they can be problematic if types are mismatched or not exported as expected.
    // Filerobot will use its default tab/tool setup if these are not provided or if provided as strings.
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
            <DynamicEditorClient
              key={imageSource} // Re-mount if source changes
              source={imageSource}
              onSave={onSaveImage}
              onClose={closeEditor}
              // config={editorConfigObject} // Temporarily remove config for this diagnostic step
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
