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
// Types for FilerobotImageEditor's onSave callback and config
// These are not strictly needed for the diagnostic version of ImageEditorClient,
// but would be needed for the actual implementation.
// import type { SaveData, FilerobotImageEditorConfig } from 'filerobot-image-editor';

// Declare the dynamic import at the top level of the module
const DynamicEditorClient = dynamic(() => import('@/components/ImageEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] w-full border rounded-lg bg-muted">
      <p className="text-muted-foreground">Loading Diagnostic Editor...</p>
    </div>
  ),
});

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
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
          toast({
            title: 'Invalid File Type',
            description: 'Please upload a JPG, PNG, WEBP, or GIF image.',
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
          setIsEditorOpen(false); // Close any previous editor instance
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
    toast({ title: 'Editor Closed', description: 'Editing session ended.' });
  }, [toast]);

  const onSaveImage = useCallback(
    (editedImageObject: { imageCanvas: HTMLCanvasElement; name: string; extension: string; fullName: string; mimeType: string; saved?: boolean; dataUrl?: string }, designState?: any) => {
      console.log('Image saved (in EditorPage):', editedImageObject);
      if (editedImageObject.dataUrl) {
        const originalExtension = imageName?.split('.').pop() || 'png';
        const filename = `${imageName?.replace(/\.[^/.]+$/, "") || 'edited_image'}_filerobot.${originalExtension}`;
        downloadFile(editedImageObject.dataUrl, filename)
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
          description: 'Edited image data is not available for download.',
          variant: 'destructive',
        });
      }
      closeEditor(); 
    },
    [imageName, closeEditor, toast]
  );

  // For the actual Filerobot editor, you'd define this based on its documentation
  const filerobotThemeColors = useMemo(() => {
    // Define theme colors based on currentTheme (light/dark)
    // This is just an example structure; consult Filerobot docs for actual theme options
    if (currentTheme === 'dark') {
      return {
        primaryBg: '#1B232E', // card
        secondaryBg: '#121821', // background
        text: '#EFF2F5', // foreground
        textMuted: '#707C88', // muted-foreground
        accent: '#27D2F5', // primary (dark theme)
        borders: '#313A48', // border
      };
    }
    return {
      primaryBg: '#FFFFFF', // card
      secondaryBg: '#F8F9FA', // background
      text: '#212529', // foreground
      textMuted: '#687076', // muted-foreground (adjusted)
      accent: '#0DCAF0', // accent
      borders: '#CBD5E0', // border
    };
  }, [currentTheme]);

  const editorConfigObject = useMemo(() => {
    // This config would be passed to the actual Filerobot editor
    // For the diagnostic component, it's just illustrative
    return {
      theme: {
        colors: filerobotThemeColors,
        // other theme options
      },
      tools: [
        'adjust', 'finetune', 'filter', 'crop', 'rotate', 'resize', 
        'text', 'image', 'shapes', 'draw', 'watermark', 'effects'
      ],
      // defaultTabId: TABS.ADJUST, // Example, if TABS were imported
      // defaultToolId: TOOLS.CROP, // Example, if TOOLS were imported
      // other config options
    };
  }, [filerobotThemeColors]);


  return (
    <>
      <PageHeader
        title={isEditorOpen ? `Editing: ${imageName || 'Image'}` : "Image Editor"}
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
                accept="image/png, image/jpeg, image/webp, image/gif"
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
                Upload an image (PNG, JPG, WEBP, GIF) to start editing.
              </p>
            )}
          </div>
        )}

        {isEditorOpen && imageSource && (
          <div 
             style={{ height: 'calc(100vh - 250px)', minHeight: 600 }} // Ensure sufficient height for the editor UI
             className="border rounded-lg overflow-hidden bg-background shadow-lg"
          >
            <DynamicEditorClient
              key={imageSource} // Add key to help React re-initialize if source changes
              source={imageSource}
              onSave={onSaveImage}
              onClose={closeEditor}
              config={editorConfigObject} // Pass the config
            />
          </div>
        )}

        {/* Shows a preview of the uploaded image if editor is not open but image is selected */}
        {imageSource && !isEditorOpen && (
            <div className="mt-8 p-4 border border-dashed border-border rounded-lg text-center bg-muted/30">
                 <img
                    src={imageSource}
                    alt={imageName || 'Uploaded preview'}
                    className="max-w-xs max-h-60 mx-auto rounded-md shadow-md mb-4 object-contain"
                    data-ai-hint="uploaded image preview"
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
