'use client';

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image'; // For the image preview before editing
import { PageHeader } from '@/components/layout/PageHeader';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { UploadCloud, Edit3, Download as DownloadIcon } from 'lucide-react'; // Renamed Download to DownloadIcon
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { downloadFile } from '@/lib/utils';
// Removed Filerobot specific type imports for this diagnostic step
// import type { SaveData, FilerobotImageEditorConfig, TABS, TOOLS } from 'react-filerobot-image-editor';


// Temporarily replace DynamicEditorClient with DebugClient for Phase 2
const DynamicEditorClient = dynamic(
  () => import('@/components/DebugClient'), // <--- POINT TO DEBUG CLIENT
  {
    ssr: false, // Crucial for client-side only components
    loading: () => (
      <div className="flex items-center justify-center h-[600px] w-full border rounded-lg bg-muted">
        <p className="text-muted-foreground">Loading debug client...</p>
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
            fileInputRef.current.value = '';
          }
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          setImageSource(e.target?.result as string);
          setImageName(file.name);
          setIsEditorOpen(false); // Reset editor state until "Edit" is clicked
          setEditorReadyToRender(false);
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
      // Defer rendering the editor slightly to ensure DOM is stable
      const timer = setTimeout(() => setEditorReadyToRender(true), 0);
      return () => clearTimeout(timer);
    } else {
      setEditorReadyToRender(false);
    }
  }, [isEditorOpen, imageSource]);

  const onSaveImage = useCallback(
    (editedImageObject: any, designState?: any) => { // Using 'any' for SaveData due to Filerobot types removed
      console.log('Original onSaveImage called (from Page)', editedImageObject);
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
    // Optionally reset image source if user closes without saving
    // setImageSource(null);
    // setImageName(null);
    // if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: 'Editor Closed', description: 'Editing session was closed.'});
  }, [toast]);

  // Theme configuration for Filerobot editor - kept for when we switch back
  const filerobotThemeColors = useMemo(() => {
    const isDark = currentTheme === 'dark';
    const accentColor = '#27D2F5'; // Vibrant Cyan for dark mode primary
    const primaryBg = isDark ? '#1B232E' : '#FFFFFF';
    const secondaryBg = isDark ? '#121821' : '#F8F9FA';
    const text = isDark ? '#EFF2F5' : '#212529';
    const textMuted = isDark ? '#9AA5B1' : '#6C757D'; // Adjusted dark muted text
    const borders = isDark ? '#313A48' : '#DEE2E6';

    return {
      primaryBg: primaryBg,
      secondaryBg: secondaryBg,
      text: text,
      textMuted: textMuted,
      accent: accentColor, 
      borders: borders,
      activeTabBg: accentColor,
    };
  }, [currentTheme]);

  const editorConfigObject = useMemo(() => ({
    // source, onSave, onClose will be passed directly
    theme: {
      colors: filerobotThemeColors,
      typography: { fontFamily: 'Inter, Arial, sans-serif' },
    },
    // Example: use string identifiers for tools as it's a common pattern
    tools: [
      'adjust', 'finetune', 'filter', 'crop', 'rotate', 'resize', 
      'text', 'image', 'shapes', 'draw', 'watermark'
    ],
    // Example for tabs and default tool if TABS/TOOLS enums were available
    // tabsIds: [TABS.ADJUST, TABS.ANNOTATE, TABS.WATERMARK],
    // defaultTabId: TABS.ADJUST, 
    // defaultToolId: TOOLS.CROP,
    tabsIds: ['Adjust', 'Annotate', 'Watermark', 'Resize'], // Using string IDs
    defaultTabId: 'Adjust', 
    defaultToolId: 'crop', 
    language: 'en',
    // closeOnSave: true, // Filerobot default is false, can set to true
    // avoidChangesNotSavedAlertOnLeave: true, // Filerobot default is false
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
        
        {/* Filerobot editor rendering area - using DebugClient for this phase */}
        {isEditorOpen && imageSource && editorReadyToRender && (
          <div 
             style={{ height: 'calc(100vh - 250px)', minHeight: 600 }} // Ensure container has defined height
             className="border rounded-lg overflow-hidden bg-background shadow-lg"
          >
            <DynamicEditorClient
              key={imageSource} // Re-mount if source changes - good for Filerobot re-initialization
              // For DebugClient, we don't pass these complex props
              // source={imageSource}
              // onSave={onSaveImage}
              // onClose={closeEditor}
              // config={editorConfigObject}
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
