
'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/layout/PageHeader';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadCloud, Edit3, Image as ImageIconLucide, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadFile } from '@/lib/utils';
import { useTheme } from 'next-themes';
import type { SaveData, TABS, TOOLS } from 'filerobot-image-editor';

// Dynamically import FilerobotImageEditor as it's client-side only
const DynamicFilerobotEditor = dynamic(
  () => import('filerobot-image-editor').then((mod) => mod.default || mod),
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
  const { theme: currentTheme } = useTheme();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast({
          title: 'Unsupported File Type',
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
        setIsEditorOpen(true); // Open editor once image is loaded
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const onSaveImage = useCallback((editedImageData: SaveData) => {
    if (editedImageData.image.imageBase64 && editedImageData.image.fullName) {
      const originalExtension = imageName?.split('.').pop() || 'png';
      const newName = editedImageData.image.fullName.replace(/\.\w+$/, `.${originalExtension}`);
      
      downloadFile(editedImageData.image.imageBase64, newName)
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
    setImageSource(null); // Clear image source
    setImageName(null);
    if (fileInputRef.current) { // Reset file input
        fileInputRef.current.value = '';
    }
  }, [imageName, toast]);

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
    setImageSource(null); // Clear image source when closing editor
    setImageName(null);
    if (fileInputRef.current) { // Reset file input
        fileInputRef.current.value = '';
    }
  }, []);

  const filerobotThemeColors = useMemo(() => {
    // Using Tailwind HSL variables directly by parsing them.
    // This requires Tailwind's CSS variables to be loaded, which they are in globals.css.
    // A more robust way might be to define these colors also in JS if possible,
    // or use a utility to parse them. For now, this is an approximation.

    const accentColor = currentTheme === 'dark' ? 'hsl(190 88% 55%)' : 'hsl(190 88% 50%)'; // Vibrant Cyan
    const primaryBg = currentTheme === 'dark' ? 'hsl(220 13% 10%)' : 'hsl(0 0% 100%)'; 
    const secondaryBg = currentTheme === 'dark' ? 'hsl(220 13% 15%)' : 'hsl(210 17% 98%)';
    const text = currentTheme === 'dark' ? 'hsl(210 17% 95%)' : 'hsl(210 10% 15%)';
    const textMuted = currentTheme === 'dark' ? 'hsl(210 8% 65%)' : 'hsl(210 10% 35%)';
    const borders = currentTheme === 'dark' ? 'hsl(220 13% 25%)' : 'hsl(210 14% 80%)';

    return {
      primaryBg,
      secondaryBg,
      text,
      textMuted,
      accent: accentColor, 
      borders,
      activeTabBg: accentColor,
    };
  }, [currentTheme]);

  const editorConfigObject = useMemo(() => {
    const TABS_ENUM = (DynamicFilerobotEditor as any)?.TABS || {};
    const TOOLS_ENUM = (DynamicFilerobotEditor as any)?.TOOLS || {};

    return {
      theme: {
        colors: {
          primaryBg: filerobotThemeColors.primaryBg,
          primaryBgHover: filerobotThemeColors.accent,
          secondaryBg: filerobotThemeColors.secondaryBg,
          secondaryBgHover: filerobotThemeColors.accent,
          text: filerobotThemeColors.text,
          textHover: filerobotThemeColors.accent,
          textMuted: filerobotThemeColors.textMuted,
          textWarn: '#f7931e', // Example warning color
          accent: filerobotThemeColors.accent,
          accentHover: currentTheme === 'dark' ? 'hsl(190 88% 65%)' : 'hsl(190 88% 40%)', // Lighter/darker accent for hover
          borders: filerobotThemeColors.borders,
          border: filerobotThemeColors.borders, 
          icons: filerobotThemeColors.text,
          iconsHover: filerobotThemeColors.accent,
          disabled: filerobotThemeColors.textMuted,
          activeTabBg: filerobotThemeColors.activeTabBg,
        },
        typography: {
          fontFamily: 'Inter, Arial, sans-serif', // Match your site font
          fontSize: '14px',
        },
      },
      language: 'en',
      // Example using TABS and TOOLS enums (if they are correctly exported and loaded)
      // Otherwise, use string identifiers.
      tabsIds: [
        TABS_ENUM.ADJUST || 'Adjust', 
        TABS_ENUM.ANNOTATE || 'Annotate', 
        TABS_ENUM.WATERMARK || 'Watermark',
        TABS_ENUM.FINETUNE || 'Finetune',
        TABS_ENUM.FILTERS || 'Filters',
        TABS_ENUM.RESIZE || 'Resize',
      ],
      defaultTabId: TABS_ENUM.ADJUST || 'Adjust',
      defaultToolId: TOOLS_ENUM.CROP || 'Crop',
      tools: [ // Standard string identifiers for tools array
        'crop', 'rotate', 'flip', 'adjust', 'finetune',
        'filters', 'watermark', 'annotate', 'draw', 'text',
        'shapes', 'frame', 'merge', 'resize'
      ],
      cropPresets: [
        { name: 'Original', value: 0 },
        { name: 'Square (1:1)', value: 1 / 1 },
        { name: 'Landscape (16:9)', value: 16 / 9 },
        { name: 'Portrait (9:16)', value: 9 / 16 },
      ],
      showBackButton: true,
      // defaultSavedImageName: 'edited_wallpaper',
      // defaultSavedImageType: 'png', // Filerobot defaults to original type
    };
  }, [filerobotThemeColors, currentTheme]);


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
        {!isEditorOpen || !imageSource ? (
          <div className="flex flex-col items-center justify-center text-center space-y-8 p-6 border-2 border-dashed border-border rounded-xl bg-card shadow-lg min-h-[400px]">
            <ImageIconLucide className="h-20 w-20 text-primary opacity-70" />
            <h2 className="text-2xl font-semibold text-primary">
              Upload Your Image to Start Editing
            </h2>
            <p className="text-muted-foreground max-w-md">
              Click the button below to choose an image (JPG, PNG, WEBP). You can crop, rotate, add filters, text, and much more!
            </p>
            <Button onClick={triggerFileUpload} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <UploadCloud className="mr-2 h-5 w-5" /> Upload Image
            </Button>
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
            />
          </div>
        ) : null}

        {isEditorOpen && imageSource && (
          <div 
             style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}
             className="border rounded-lg overflow-hidden bg-background shadow-lg"
           >
            <DynamicFilerobotEditor
              key={imageSource} // Add key to help React re-initialize if source changes
              source={imageSource}
              onSave={onSaveImage}
              onClose={closeEditor}
              config={editorConfigObject}
            />
          </div>
        )}
      </main>
    </>
  );
}
