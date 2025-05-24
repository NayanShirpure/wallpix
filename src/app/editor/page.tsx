'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/layout/PageHeader';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { UploadCloud, Edit3, Download, Image as ImageIconLucide } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { downloadFile } from '@/lib/utils';
// Types are needed even if component is dynamic
import type { SaveData, FilerobotImageEditorConfig, TabsIds, ToolsIds } from 'react-filerobot-image-editor';

// ✅ Declare the dynamic import BEFORE using it
const DynamicEditorClient = dynamic(() => import('@/components/ImageEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] w-full border rounded-lg bg-muted">
      <p className="text-muted-foreground">Loading Filerobot Editor...</p>
    </div>
  ),
});


export default function EditorPage() {
  // React state hooks
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
      // console.log('Image saved from Filerobot:', editedImageObject, designState);
      if (editedImageObject.imageBase64) {
        const originalNamePart = imageName?.replace(/\.[^/.]+$/, "") || 'edited_image';
        const extension = editedImageObject.extension || imageName?.split('.').pop() || 'png';
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
      closeEditor(); // Close editor after save attempt
    },
    [imageName, closeEditor, toast]
  );
  
  // Theme configuration for Filerobot - still memoized but not passed for now
  const filerobotThemeColors = useMemo(() => {
    const isDark = currentTheme === 'dark';
    const accentColor = 'hsl(190 88% 55%)'; 
    const primaryBg = 'hsl(220 13% 10%)';    
    const secondaryBg = 'hsl(220 13% 15%)';  
    const text = 'hsl(210 17% 95%)';      
    const textMuted = 'hsl(210 8% 65%)';  
    const borders = 'hsl(220 13% 25%)';    

    return {
      primaryBg: isDark ? primaryBg : '#ffffff', 
      secondaryBg: isDark ? secondaryBg : '#f8f9fa', 
      text: isDark ? text : '#212529',      
      textMuted: isDark ? textMuted : '#6c757d',
      accent: accentColor, 
      borders: isDark ? borders : '#dee2e6',
      activeTabBg: accentColor, 
    };
  }, [currentTheme]);

  const editorConfigObject: Partial<FilerobotImageEditorConfig> = useMemo(() => ({
    theme: {
      colors: filerobotThemeColors,
      typography: { fontFamily: 'Inter, Arial, sans-serif' },
    },
    tools: [
      'adjust', 'finetune', 'filter', 'crop', 'rotate', 'resize', 
      'text', 'image', 'shapes', 'draw', 'watermark'
    ] as ToolsIds[],
    // TABS and TOOLS enums would be imported if these lines were active
    // defaultTabId: TABS.ADJUST, 
    // defaultToolId: TOOLS.CROP,  
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
              // For this diagnostic step, ImageEditorClient defines its own onSave/onClose
              // and does not take a config prop directly from here
              // onSave={onSaveImage} // Temporarily handled by stub in ImageEditorClient
              // onClose={closeEditor} // Temporarily handled by stub in ImageEditorClient
              // config={editorConfigObject} // Temporarily handled by stub in ImageEditorClient
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
