// src/app/editor/page.tsx
'use client';

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { PageHeader } from '@/components/layout/PageHeader';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { UploadCloud, Edit3, Download as DownloadIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { downloadFile } from '@/lib/utils';

// Assuming TABS and TOOLS are correctly exported by react-filerobot-image-editor
// If not, this import needs adjustment based on the library's actual exports
import type {
  SaveData,
  FilerobotImageEditorConfig,
  // TABS as FilerobotTabsType, // For type annotation if needed
  // TOOLS as FilerobotToolsType, // For type annotation if needed
} from 'react-filerobot-image-editor';
// For actual enum values for configuration:
import { TABS, TOOLS } from 'react-filerobot-image-editor';


// Dynamically import the client-side editor wrapper
const DynamicEditorClient = dynamic(
  () => import('@/components/ImageEditor'), // Points to ImageEditor.tsx which exports ImageEditorClient
  {
    ssr: false,
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
          setIsEditorOpen(false); // Close editor if it was open with a previous image
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

  // Defer rendering the editor slightly after it's been "opened"
  // to ensure DOM container is ready for Filerobot
  useEffect(() => {
    if (isEditorOpen && imageSource) {
      const timer = setTimeout(() => setEditorReadyToRender(true), 0); // Small delay
      return () => clearTimeout(timer);
    } else {
      setEditorReadyToRender(false); // Ensure it's reset if editor is closed or image removed
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
      setEditorReadyToRender(false); // Reset ready state
    },
    [imageName, toast]
  );

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
    setEditorReadyToRender(false); // Reset ready state
    toast({ title: 'Editor Closed', description: 'Editing session was closed.'});
  }, [toast]);

  const filerobotThemeColors = useMemo(() => {
    const isDark = currentTheme === 'dark';
    // Using Vibran Professional Dark theme colors
    const primaryBg = isDark ? '#121821' : '#FFFFFF'; // --background
    const secondaryBg = isDark ? '#1B232E' : '#1B232E'; // --card (using dark card for editor for consistency)
    const text = isDark ? '#EFF2F5' : '#212529';      // --foreground
    const textMuted = isDark ? '#9AA5B1' : '#6C757D'; // --muted-foreground (darker for light theme)
    const accentColor = isDark ? '#27D2F5' : '#0DCAF0';// --primary (dark) or --accent (light)
    const borders = isDark ? '#313A48' : '#DEE2E6';   // --border

    return {
      primaryBg: primaryBg,
      secondaryBg: secondaryBg, // Background for panels/toolbars within editor
      text: text,
      textMuted: textMuted,
      accent: accentColor, // Main accent color for buttons, sliders
      borders: borders,
      activeTabBg: accentColor,
      // You can add more theme options here based on Filerobot's documentation
      // e.g., for specific tool icons, hover states, etc.
    };
  }, [currentTheme]);

  const editorConfigObject: Partial<FilerobotImageEditorConfig> = useMemo(() => ({
    theme: {
      colors: filerobotThemeColors,
      typography: {
        fontFamily: 'Inter, Arial, sans-serif', // Match your site's font
      },
    },
    tools: [ // These are string identifiers for tools
      TOOLS.ADJUST, TOOLS.FINETUNE, TOOLS.FILTER, TOOLS.CROP, 
      TOOLS.ROTATE, TOOLS.TEXT, TOOLS.IMAGE, TOOLS.SHAPES, 
      TOOLS.DRAW, TOOLS.WATERMARK, TOOLS.BACKGROUND,
      // Add or remove tools as needed
    ],
    tabsIds: [ // These use the imported TABS enum
      TABS.ADJUST, TABS.ANNOTATE, TABS.WATERMARK, TABS.FINETUNE, TABS.FILTER
    ],
    defaultTabId: TABS.ADJUST, 
    defaultToolId: TOOLS.CROP,
    language: 'en',
    // Consider other Filerobot options:
    // showBackButton: true, // To close editor
    // noCapitalStrs: false,
    // savingPixelRatio: window.devicePixelRatio, // For high-res exports
    // previewPixelRatio: window.devicePixelRatio,
    // annotationsCommon: { fill: filerobotThemeColors.accent }, // Example
    // Text: { text: 'Type here...' },
    // Crop: { ... }
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
                Upload an image (PNG, JPG, WEBP) to start editing. Click "Edit Selected Image" to open the editor.
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
              height={240}
              className="max-w-xs max-h-60 mx-auto rounded-md shadow-md mb-4 object-contain"
              data-ai-hint="uploaded preview"
            />
            <p className="text-muted-foreground">
              Ready to edit "{imageName || 'your image'}"? Click the "Edit Selected Image" button above.
            </p>
          </div>
        )}
        
        {/* Filerobot editor is rendered here when isEditorOpen and editorReadyToRender are true */}
        {isEditorOpen && imageSource && editorReadyToRender && (
          <div 
             style={{ height: 'calc(100vh - 250px)', minHeight: 600 }}
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
         {/* Placeholder while dynamic editor component is loading (after image selected, before editorReadyToRender from parent) */}
         {isEditorOpen && imageSource && !editorReadyToRender && (
            <div className="flex items-center justify-center h-[600px] w-full border rounded-lg bg-muted">
                <p className="text-muted-foreground">Preparing editor interface...</p>
            </div>
        )}
      </main>
    </>
  );
}
