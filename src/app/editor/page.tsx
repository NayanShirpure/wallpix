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
// Import types from the React wrapper
import type { FilerobotImageEditorConfig, SaveData, AnnotationsCommon, Text, Rotate, Crop } from 'react-filerobot-image-editor';

// Dynamically import the client-side wrapper
const DynamicEditorClient = dynamic(
  () => import('@/components/ImageEditor'), // This exports ImageEditorClient as default
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
          // setIsEditorOpen(false); // Keep editor closed until "Edit" is clicked
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
    // toast({ title: 'Editor Closed', description: 'Editing session ended.' });
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
      primaryBg: isDark ? '#1B232E' : '#FFFFFF',
      secondaryBg: isDark ? '#121821' : '#F8F9FA',
      text: isDark ? '#EFF2F5' : '#212529',
      textMuted: isDark ? '#707C88' : '#687076',
      accent: isDark ? '#27D2F5' : '#0DCAF0', // Primary accent
      borders: isDark ? '#313A48' : '#CBD5E0',
      activeTabBg: isDark ? '#27D2F5' : '#0DCAF0',
      // Add more Filerobot specific theme keys as needed
    };
  }, [currentTheme]);

  const editorConfigObject: FilerobotImageEditorConfig = useMemo(() => ({
    // @ts-ignore Filerobot's ThemeConfig type can be extensive.
    theme: {
      colors: filerobotThemeColors,
      typography: {
        fontFamily: 'Inter, Arial, sans-serif', // Match your site's font
      },
    },
    tools: [
      'adjust', 'finetune', 'filter', 'crop', 'rotate', 'resize',
      'text', 'image', 'shapes', 'draw', 'watermark' // 'effects' might need separate licensing or config
    ],
    // Example: if TABS and TOOLS enums were available from 'react-filerobot-image-editor'
    // tabsIds: [TABS.ADJUST, TABS.ANNOTATE, TABS.WATERMARK],
    // defaultTabId: TABS.ADJUST,
    // defaultToolId: TOOLS.CROP,
    // translations: { en: { 'toolbar.save': 'Download' } }, // Example to change save button text
    // Avoiding TABS/TOOLS enums for now as their export status can vary
    // Defaulting to Filerobot's own tool/tab setup which is generally good
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
            style={{ height: 'calc(100vh - 250px)', minHeight: 600 }} // Ensure sufficient height for the editor
            className="border rounded-lg overflow-hidden bg-background shadow-lg"
          >
            <DynamicEditorClient
              key={imageSource} // Re-mount if source changes, helps Filerobot re-initialize
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
