
'use client';

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image'; // Added this import
import { PageHeader } from '@/components/layout/PageHeader';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { UploadCloud, Edit3, Download, Image as ImageIconLucide } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { downloadFile } from '@/lib/utils';
import type { SaveData, FilerobotImageEditorConfig } from 'react-filerobot-image-editor';

// Dynamically import the client-side wrapper for FilerobotImageEditor
const DynamicEditorClient = dynamic(
  () => import('@/components/ImageEditor').then((mod) => mod.default || mod),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px] w-full border rounded-lg bg-muted">
        <p className="text-muted-foreground">Loading Filerobot Editor...</p>
      </div>
    ),
  }
);

export default function EditorPage() {
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editorReadyToRender, setEditorReadyToRender] = useState<boolean>(false);
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
          // Don't open editor immediately, let user click "Edit Selected Image"
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
    // This effect handles deferring the rendering of the editor
    // until after the imageSource is set and the editor is intended to be open.
    // This gives React time to update the DOM.
    if (isEditorOpen && imageSource) {
      const timer = setTimeout(() => setEditorReadyToRender(true), 0);
      return () => clearTimeout(timer);
    } else {
      setEditorReadyToRender(false);
    }
  }, [isEditorOpen, imageSource]);

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
    setEditorReadyToRender(false); // Ensure this is reset
    // Optionally reset imageSource and imageName if desired upon close
    // setImageSource(null);
    // setImageName(null);
    // if (fileInputRef.current) {
    //   fileInputRef.current.value = '';
    // }
  }, []);

  const onSaveImage = useCallback(
    (editedImageObject: SaveData, designState?: any) => {
      if (editedImageObject.imageBase64) {
        const originalNamePart = imageName?.replace(/\.[^/.]+$/, "") || 'edited_image';
        // Ensure the extension from Filerobot is used, or fallback to original extension or png
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
      closeEditor(); // Close the editor after saving
    },
    [imageName, closeEditor, toast]
  );
  
  // Theme configuration for Filerobot editor
  const filerobotThemeColors = useMemo(() => {
    const isDark = currentTheme === 'dark';
    // Using direct hex codes for simplicity, as HSL conversion logic isn't here.
    // These should ideally map to your theme variables from globals.css.
    const accentColor = '#0DCAF0'; // Your vibrant cyan (from Vibrant Professional theme)
    const primaryBg = isDark ? '#1B232E' : '#FFFFFF'; // Card background
    const secondaryBg = isDark ? '#121821' : '#F8F9FA'; // Main background
    const text = isDark ? '#EFF2F5' : '#212529'; // Foreground
    const textMuted = isDark ? '#707C88' : '#6C757D'; // Muted foreground
    const borders = isDark ? '#313A48' : '#DEE2E6'; // Border color

    return {
      primaryBg: primaryBg,
      secondaryBg: secondaryBg,
      text: text,
      textMuted: textMuted,
      accent: accentColor, 
      borders: borders,
      activeTabBg: accentColor,
      // Add other Filerobot theme properties as needed based on their documentation
    };
  }, [currentTheme]);

  const editorConfigObject: Partial<FilerobotImageEditorConfig> = useMemo(() => ({
    // Essential props are passed directly to DynamicEditorClient
    // This object holds the 'config' prop for Filerobot
    theme: {
      colors: filerobotThemeColors,
      typography: { fontFamily: 'Inter, Arial, sans-serif' }, // Match your site's font
    },
    tools: [ // Common tools
      'adjust', 'finetune', 'filter', 'crop', 'rotate', 'resize', 
      'text', 'image', 'shapes', 'draw', 'watermark'
    ],
    // Example for tabs and default tool (using string IDs which are generally safe)
    // Refer to Filerobot docs for exact string IDs if TABS/TOOLS enums aren't used/available
    tabsIds: ['Adjust', 'Finetune', 'Filter', 'Annotate', 'Watermark'],
    defaultTabId: 'Adjust', 
    defaultToolId: 'crop', 
    language: 'en', // Or use a language detection logic
    // avoidChangesNotSavedAlertOnLeave: true, // Good for UX
    // closeAfterSave: true, // Good for UX
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
                Upload an image (PNG, JPG, WEBP) to start editing. Your chosen image will replace the default editor image.
              </p>
            )}
          </div>
        )}

        {/* Filerobot editor rendering area */}
        {isEditorOpen && imageSource && editorReadyToRender ? (
          <div 
             style={{ height: 'calc(100vh - 250px)', minHeight: 600 }} // Ensure container has defined height for Filerobot
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
        ) : isEditorOpen && imageSource && !editorReadyToRender ? (
           // Shows while editorReadyToRender is false (briefly after clicking "Edit Image")
          <div className="flex items-center justify-center h-[600px] w-full border rounded-lg bg-muted">
            <p className="text-muted-foreground">Preparing editor interface...</p>
          </div>
        ) : null}
        
        {/* Image preview before opening editor */}
        {imageSource && !isEditorOpen && (
          <div className="mt-8 p-4 border border-dashed border-border rounded-lg text-center bg-muted/30">
            <Image
              src={imageSource}
              alt={imageName || 'Uploaded preview'}
              width={320} 
              height={240} 
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
