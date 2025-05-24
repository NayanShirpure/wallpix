'use client';

import React, { useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/layout/PageHeader';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadCloud, Download, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { downloadFile } from '@/lib/utils';

// Dynamically import the client-side wrapper component for Filerobot
const DynamicEditorClient = dynamic(
  () => import('@/components/ImageEditor'), // This imports the default export from ImageEditor.tsx
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px] w-full border rounded-lg bg-muted">
        <p className="text-muted-foreground">Loading Editor...</p>
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
            fileInputRef.current.value = ''; // Reset file input
          }
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          setImageSource(e.target?.result as string);
          setImageName(file.name);
          setIsEditorOpen(false); // Close any previous editor instance
          // Delay opening to ensure state updates propagate if needed, though usually direct is fine
          // setTimeout(() => setIsEditorOpen(true), 0); 
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
    // Optionally clear imageSource and imageName if you want to force re-upload
    // setImageSource(null);
    // setImageName(null);
    toast({ title: 'Editor Closed', description: 'Editing session ended.' });
  }, [toast]);

  const onSaveImage = useCallback(
    (editedImageObject: { imageCanvas: HTMLCanvasElement; name: string; extension: string; fullName: string; mimeType: string; saved?: boolean; dataUrl?: string }, designState?: any) => {
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

  // For now, we will omit the complex config object to simplify debugging
  // const editorConfigObject = useMemo(() => { ... } , [currentTheme, filerobotThemeColors, onSaveImage, closeEditor, imageSource]);

  return (
    <>
      <PageHeader
        title="Image Editor"
        backHref="/"
        backTextDesktop="Back to Wallify"
        backTextMobile="Home"
      >
        <ThemeToggle />
      </PageHeader>
      <main className="flex-grow container mx-auto max-w-5xl p-4 py-8 md:p-6 md:py-12">
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
              Upload an image (PNG, JPG, WEBP, GIF) to start editing. Max file size may apply.
            </p>
          )}
        </div>

        {isEditorOpen && imageSource ? (
          <div 
             style={{ height: 'calc(100vh - 250px)', minHeight: 600 }} // Adjusted height
             className="border rounded-lg overflow-hidden bg-background shadow-lg"
          >
            <DynamicEditorClient
              key={imageSource} // Add key to help React re-initialize if source changes
              source={imageSource}
              onSave={onSaveImage}
              onClose={closeEditor}
              // config={editorConfigObject} // Config is omitted for now
            />
          </div>
        ) : imageSource ? (
            <div className="mt-8 p-4 border border-dashed border-border rounded-lg text-center bg-muted/30">
                 <img
                    src={imageSource}
                    alt={imageName || 'Uploaded preview'}
                    className="max-w-xs max-h-60 mx-auto rounded-md shadow-md mb-4 object-contain"
                 />
                <p className="text-muted-foreground">
                    Ready to edit "{imageName || 'your image'}"? Click the "Edit Selected Image" button above.
                </p>
            </div>
        ) : null}
      </main>
    </>
  );
}
