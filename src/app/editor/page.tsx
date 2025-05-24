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


// Dynamically import the client-side editor wrapper
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
            fileInputRef.current.value = ''; // Reset file input
          }
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          setImageSource(e.target?.result as string);
          setImageName(file.name);
          // Automatically open editor once image is selected for this simplified test
          // setIsEditorOpen(true); 
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

  // This onSaveImage will be passed to the ImageEditorClient,
  // which now has its own internal simpler handler for diagnostic.
  // So, this specific function won't be called by Filerobot directly in this test.
  const onSaveImage = useCallback(
    (editedImageObject: SaveData, designState?: any) => {
      // console.log('Page onSaveImage triggered with:', editedImageObject, designState);
      if (editedImageObject.imageBase64) { // Filerobot often returns base64
        const originalExtension = imageName?.split('.').pop() || editedImageObject.extension || 'png';
        const filename = `${imageName?.replace(/\.[^/.]+$/, "") || 'edited_image'}_filerobot.${originalExtension}`;
        
        // Use the base64 directly
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
  
  // Filerobot theme and config - will be passed to ImageEditorClient
  // if the basic rendering test (without config) succeeds
  const filerobotThemeColors = useMemo(() => {
    const isDark = currentTheme === 'dark';
    // Using more generic color names that Filerobot's theme structure might expect
    return {
      primaryBg: isDark ? '#111827' : '#FFFFFF', // Darker background for dark, white for light
      secondaryBg: isDark ? '#1F2937' : '#F3F4F6', // Slightly lighter for dark, light gray for light
      text: isDark ? '#E5E7EB' : '#111827', // Light gray for dark, dark gray for light
      textMuted: isDark ? '#9CA3AF' : '#6B7280', // Muted gray
      accent: '#2DD4CF', // Your teal accent
      accentMuted: '#5EEAD4', // Lighter teal
      borders: isDark ? '#374151' : '#D1D5DB', // Borders
      activeTabBg: '#2DD4CF', 
    };
  }, [currentTheme]);

  const editorConfigObject: Partial<FilerobotImageEditorConfig> = useMemo(() => ({
    // @ts-ignore Filerobot's ThemeConfig type can be complex.
    // theme: {
    //   colors: filerobotThemeColors,
    //   typography: {
    //     fontFamily: 'Inter, Arial, sans-serif',
    //   },
    // },
    tools: [ // Common tools
      'adjust', 'finetune', 'filter', 'crop', 'rotate', 'resize',
      'text', 'image', 'shapes', 'draw', 'watermark'
    ],
    // Example using TABS and TOOLS if they were available and needed for defaults
    // We'd need to import them from 'react-filerobot-image-editor'
    // tabsIds: [TABS.ADJUST, TABS.ANNOTATE, TABS.WATERMARK],
    // defaultTabId: TABS.ADJUST,
    // defaultToolId: TOOLS.CROP,
  }), [/* filerobotThemeColors */]); // Temporarily remove theme from dependencies if not used in config yet


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
            style={{ height: 'calc(100vh - 250px)', minHeight: 600 }} // Adjust height as needed
            className="border rounded-lg overflow-hidden bg-background shadow-lg"
          >
            <DynamicEditorClient
              key={imageSource} // Re-mount if source changes
              source={imageSource}
              // For this diagnostic step, ImageEditorClient defines its own onSave/onClose
              // onSave={onSaveImage} 
              // onClose={closeEditor}
              // config={editorConfigObject} // Temporarily not passing config
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
