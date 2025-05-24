
'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/layout/PageHeader';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Edit3, Download, Image as ImageIcon } from 'lucide-react';
import { downloadFile } from '@/lib/utils';
import { useTheme } from 'next-themes';

// Dynamically import FilerobotImageEditor
const DynamicFilerobotEditor = dynamic(
  () => import('filerobot-image-editor').then(mod => mod.default || mod),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] flex items-center justify-center border rounded-lg bg-muted/30">
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
  const { theme } = useTheme();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        toast({
          title: 'Unsupported File Type',
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
        setIsEditorOpen(true); // Open editor once image is selected
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const onSaveImage = (editedImageData: { imageCanvas: HTMLCanvasElement, name: string, extension: string, fullName?: string, mimeType: string, quality?: number, dataURL?: string }) => {
    if (editedImageData.dataURL && editedImageData.fullName) {
      const originalExtension = imageName?.split('.').pop() || 'png';
      const newName = editedImageData.fullName.replace(/\.\w+$/, `.${originalExtension}`);
      
      downloadFile(editedImageData.dataURL, newName)
        .then(() => {
          toast({
            title: 'Image Downloaded',
            description: `${newName} has been saved.`,
          });
        })
        .catch((error) => {
          console.error('Error downloading image:', error);
          toast({
            title: 'Download Failed',
            description: 'Could not download the edited image.',
            variant: 'destructive',
          });
        });
    } else {
       toast({
        title: 'Save Error',
        description: 'Could not retrieve edited image data.',
        variant: 'destructive',
      });
    }
    setIsEditorOpen(false); // Close editor after save
  };

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
    // Optionally reset imageSource and imageName if you want to clear the preview
    // setImageSource(null); 
    // setImageName(null);
  }, []);

  const filerobotThemeColors = useMemo(() => {
    // Using the "Vibrant Professional" theme's accent color: #0DCAF0
    // This color should be recognizable by Filerobot.
    // If HSL variables don't work directly, use the hex.
    const accentColor = '#0DCAF0'; // hsl(var(--accent)) -> Vibrant Cyan for light mode
    const darkAccentColor = '#27D2F5'; // hsl(var(--accent)) in dark mode -> Lighter Vibrant Cyan

    const currentAccent = theme === 'dark' ? darkAccentColor : accentColor;
    
    return {
      primaryBg: theme === 'dark' ? '#1B232E' : '#FFFFFF', // card background
      secondaryBg: theme === 'dark' ? '#121821' : '#F8F9FA', // main background
      text: theme === 'dark' ? '#EFF2F5' : '#212529', // foreground
      textMuted: theme === 'dark' ? '#707C88' : '#6c757d', // muted-foreground
      accent: currentAccent, // Your primary accent color
      // You can add more theme overrides here if needed
      // Filerobot theme structure: https://github.com/scaleflex/filerobot-image-editor#themeobject
    };
  }, [theme]);

  const editorConfigObject = useMemo(() => ({
    // source: imageSource, // Source is passed as a direct prop
    // onSave: onSaveImage, // onSave is passed as a direct prop
    // onClose: closeEditor, // onClose is passed as a direct prop
    annotationsCommon: {
      fill: filerobotThemeColors.accent,
    },
    Text: { text: 'Text Here' },
    Rotate: { angle: 90, componentType: 'slider' },
    tabsIds: ['Adjust', 'Annotate', 'Filters', 'Finetune', 'Resize'], // Common tabs
    defaultTabId: 'Adjust',
    defaultToolId: 'Crop',
    tools: [
      'Adjust', 'Annotate', 'Filters', 'Finetune', 'Resize', 'Crop', 'Rotate', 'Text', 'Draw', 'Watermark'
    ],
    theme: {
      colors: {
        primaryBg: filerobotThemeColors.primaryBg,
        primaryBgHover: filerobotThemeColors.accent, // Use accent for hover
        secondaryBg: filerobotThemeColors.secondaryBg,
        secondaryBgHover: filerobotThemeColors.accent,
        text: filerobotThemeColors.text,
        textHover: filerobotThemeColors.accent,
        textMuted: filerobotThemeColors.textMuted,
        textWarn: '#f7931e', // Orange for warnings
        accent: filerobotThemeColors.accent,
        accentHover: theme === 'dark' ? '#56DFFF' : '#00B2D6', // Slightly lighter/darker accent for hover
        borders: theme === 'dark' ? '#313A48' : '#dee2e6', // border
        border: theme === 'dark' ? '#313A48' : '#dee2e6',
        icons: filerobotThemeColors.text,
        iconsHover: filerobotThemeColors.accent,
        disabled: filerobotThemeColors.textMuted,
        // You might need to define more colors like activeIcon, etc.
      },
      typography: {
        fontFamily: 'Inter, Arial, sans-serif', // Match your site's font
        fontSize: '14px',
      },
    },
    // Example: Language and other options
    language: 'en', // Default is 'en', can be 'fr', 'de', etc.
    // avoidChangesNotSavedAlertOnLeave: true, // Prompt if there are unsaved changes
    // loadableDesignState: null, // For loading a previously saved state
  }), [filerobotThemeColors, theme]);


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
        {!isEditorOpen ? (
          <div className="flex flex-col items-center justify-center text-center space-y-8 p-6 border-2 border-dashed border-border rounded-xl bg-card shadow-lg min-h-[400px]">
            <ImageIcon className="h-20 w-20 text-primary opacity-70" />
            <h2 className="text-2xl font-semibold text-primary">
              Upload Your Image to Start Editing
            </h2>
            <p className="text-muted-foreground max-w-md">
              Click the button below to choose an image from your device. You can crop, rotate, add filters, text, and much more!
            </p>
            <Button onClick={triggerFileUpload} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <UploadCloud className="mr-2 h-5 w-5" /> Upload Image
            </Button>
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg, image/webp, image/gif"
            />
            {imageSource && imageName && (
              <div className="mt-6 text-sm text-muted-foreground">
                <p>Selected: {imageName}</p>
                <Button variant="link" onClick={() => setIsEditorOpen(true)} className="text-accent">
                  <Edit3 className="mr-2 h-4 w-4" /> Re-open Editor
                </Button>
              </div>
            )}
          </div>
        ) : null}

        {isEditorOpen && imageSource && (
          <div 
             style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }} // Ensure editor has space
             className="border rounded-lg overflow-hidden bg-background shadow-lg"
           >
            <DynamicFilerobotEditor
              source={imageSource}
              onSave={onSaveImage}
              onClose={closeEditor}
              config={editorConfigObject} // Pass the memoized config object here
            />
          </div>
        )}
      </main>
    </>
  );
}

