// src/app/editor/page.tsx
'use client';

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image'; // Ensure next/image is imported
import { PageHeader } from '@/components/layout/PageHeader';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { UploadCloud, Edit3, Download as DownloadIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { downloadFile } from '@/lib/utils';
import type {
  SaveData,
  FilerobotImageEditorConfig,
} from 'react-filerobot-image-editor';
// Import TABS and TOOLS directly for config
import { TABS, TOOLS } from 'react-filerobot-image-editor';

// ✅ Declare the dynamic import BEFORE using the EditorPage component
const DynamicEditorClient = dynamic(
  () => import('@/components/ImageEditor'), // Points to ImageEditor.tsx which exports ImageEditorClient
  {
    ssr: false, // Crucial for client-side only components
    loading: () => (
      <div className="flex items-center justify-center h-[600px] w-full border rounded-lg bg-muted">
        <p className="text-muted-foreground">Loading Editor Interface...</p>
      </div>
    ),
  }
);

export default function EditorPage() {
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editorReadyToRender, setEditorReadyToRender] = useState<boolean>(false); // To defer rendering
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
          setIsEditorOpen(false); // Close editor if it was open
          setEditorReadyToRender(false); // Reset ready state
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

  useEffect(() => {
    if (isEditorOpen && imageSource) {
      const timer = setTimeout(() => setEditorReadyToRender(true), 0); // Ensure DOM is ready
      return () => clearTimeout(timer);
    } else {
      setEditorReadyToRender(false);
    }
  }, [isEditorOpen, imageSource]);

  const onSaveImage = useCallback(
    (editedImageObject: SaveData, designState?: any) => {
      console.log('Image saved:', editedImageObject, designState);
      if (editedImageObject.imageBase64) {
        const originalNamePart = imageName?.replace(/\.[^/.]+$/, "") || 'edited_image';
        const extension = editedImageObject.extension || imageName?.split('.').pop()?.toLowerCase() || 'png';
        const filename = `${originalNamePart}_filerobot.${extension}`;
        
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
      setIsEditorOpen(false);
      setEditorReadyToRender(false);
    },
    [imageName, toast]
  );

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
    setEditorReadyToRender(false);
    toast({ title: 'Editor Closed', description: 'Editing session was closed.'});
  }, [toast]);

  const filerobotThemeColors = useMemo(() => {
    const isDark = currentTheme === 'dark';
    const primaryBg = isDark ? '#121821' : '#FFFFFF';
    const secondaryBg = isDark ? '#1B232E' : '#F0F2F5'; 
    const text = isDark ? '#EFF2F5' : '#212529';
    const textMuted = isDark ? '#9AA5B1' : '#6C757D';
    const accentColor = isDark ? '#27D2F5' : '#0DCAF0'; // Theme accent
    const borders = isDark ? '#313A48' : '#DEE2E6';

    return {
      primaryBg: primaryBg,
      secondaryBg: secondaryBg,
      text: text,
      textMuted: textMuted,
      accent: accentColor, // Main accent color
      borders: borders,
      activeTabBg: accentColor,
    };
  }, [currentTheme]);

  const editorConfigObject: Partial<FilerobotImageEditorConfig> = useMemo(() => ({
    theme: {
      colors: filerobotThemeColors,
      typography: {
        fontFamily: 'Inter, Arial, sans-serif',
      },
    },
    tools: [ // String identifiers for tools
      TOOLS.ADJUST, TOOLS.FINETUNE, TOOLS.FILTER, TOOLS.CROP, 
      TOOLS.ROTATE, TOOLS.TEXT, TOOLS.IMAGE, TOOLS.SHAPES, 
      TOOLS.DRAW, TOOLS.WATERMARK, TOOLS.BACKGROUND,
    ],
    tabsIds: [ // Use imported TABS enum
      TABS.ADJUST, TABS.ANNOTATE, TABS.WATERMARK, TABS.FINETUNE, TABS.FILTER
    ],
    defaultTabId: TABS.ADJUST, 
    defaultToolId: TOOLS.CROP,
    language: 'en',
    // Other Filerobot options
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
                Upload an image (PNG, JPG, WEBP) to start. Click "Edit Selected Image" to open the editor.
              </p>
            )}
          </div>
        )}

        {imageSource && !isEditorOpen && (
          <div className="mt-8 p-4 border border-dashed border-border rounded-lg text-center bg-muted/30">
            <Image
              src={imageSource}
              alt={imageName || 'Uploaded preview'}
              width={320} 
              height={240} // Add height for next/image
              className="max-w-xs max-h-60 mx-auto rounded-md shadow-md mb-4 object-contain"
              data-ai-hint="uploaded preview"
            />
            <p className="text-muted-foreground">
              Ready to edit "{imageName || 'your image'}"? Click "Edit Selected Image" above.
            </p>
          </div>
        )}
        
        {isEditorOpen && imageSource && editorReadyToRender && (
          <div 
             style={{ height: 'calc(100vh - 250px)', minHeight: 600 }} // Ensure container has dimensions
             className="border rounded-lg overflow-hidden bg-background shadow-lg"
          >
            <DynamicEditorClient
              key={imageSource} // Re-mount if source changes
              source={imageSource}
              onSave={onSaveImage}
              onClose={closeEditor}
              config={editorConfigObject}
            />
          </div>
        )}
         {isEditorOpen && imageSource && !editorReadyToRender && (
            <div className="flex items-center justify-center h-[600px] w-full border rounded-lg bg-muted">
                <p className="text-muted-foreground">Preparing editor interface...</p>
            </div>
        )}
      </main>
    </>
  );
}
