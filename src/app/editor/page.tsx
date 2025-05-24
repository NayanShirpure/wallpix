
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
import type { SaveData } from 'filerobot-image-editor'; // TABS and TOOLS are not typically top-level exports for config objects in Filerobot v4+

// Declare the dynamic import BEFORE using it in the component
const DynamicFilerobotEditor = dynamic(
  () => import('filerobot-image-editor').then((mod) => mod.default || mod), // Handle potential default export wrapping
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
          fileInputRef.current.value = ''; 
        }
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSource(e.target?.result as string);
        setImageName(file.name);
        setIsEditorOpen(true); 
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
    setIsEditorOpen(false);
    setImageSource(null); 
    setImageName(null);
    if (fileInputRef.current) { 
        fileInputRef.current.value = '';
    }
  }, [imageName, toast]);

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
    setImageSource(null); 
    setImageName(null);
    if (fileInputRef.current) { 
        fileInputRef.current.value = '';
    }
  }, []);

  const filerobotThemeColors = useMemo(() => {
    const accentColor = currentTheme === 'dark' ? 'hsl(190 88% 55%)' : 'hsl(190 88% 50%)'; 
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
    // Filerobot's TABS and TOOLS are typically configured via string arrays or specific props
    // For Filerobot v4, the TABS and TOOLS enums are not typically exported for this level of config
    // We use string identifiers for tools and rely on Filerobot's default tab structure or specific props if available.
    return {
      // source: imageSource, // Source is passed as a direct prop
      // onSave: onSaveImage, // onSave is passed as a direct prop
      // onClose: closeEditor, // onClose is passed as a direct prop
      // Default tools, can be customized as per Filerobot docs
      tools: [
        'crop', 'rotate', 'flip', 'adjust', 'finetune',
        'filters', 'watermark', 'annotate', 'draw', 'text',
        'shapes', 'frame', 'merge', 'resize'
      ],
      // Example: Default to Adjust tab and Crop tool if needed (check Filerobot docs for exact props)
      // defaultTabId: 'Adjust', // Or use TABS.ADJUST if available and preferred by library
      // defaultToolId: 'Crop', // Or use TOOLS.CROP if available and preferred by library
      
      // Theme configuration
      theme: {
        colors: {
          primaryBg: filerobotThemeColors.primaryBg,
          primaryBgHover: filerobotThemeColors.accent, // Example hover
          secondaryBg: filerobotThemeColors.secondaryBg,
          secondaryBgHover: filerobotThemeColors.accent, // Example hover
          text: filerobotThemeColors.text,
          textHover: filerobotThemeColors.accent, // Example hover
          textMuted: filerobotThemeColors.textMuted,
          textWarn: '#f7931e', // Standard warning color
          accent: filerobotThemeColors.accent,
          accentHover: currentTheme === 'dark' ? 'hsl(190 88% 65%)' : 'hsl(190 88% 40%)',
          borders: filerobotThemeColors.borders,
          border: filerobotThemeColors.borders, 
          icons: filerobotThemeColors.text,
          iconsHover: filerobotThemeColors.accent,
          disabled: filerobotThemeColors.textMuted,
          activeTabBg: filerobotThemeColors.activeTabBg,
        },
        typography: {
          fontFamily: 'Inter, Arial, sans-serif', 
          fontSize: '14px',
        },
      },
      language: 'en',
      // defaultSavedImageName: 'edited_wallpaper', // Filerobot handles naming
      // defaultSavedImageType: 'png', // Filerobot usually defaults to original or offers choices
      showBackButton: true,
      // cropPresets can be added here if needed
      cropPresets: [
        { name: 'Original', value: 0 }, // 0 means free ratio
        { name: 'Square (1:1)', value: 1 / 1 },
        { name: 'Landscape (16:9)', value: 16 / 9 },
        { name: 'Portrait (9:16)', value: 9 / 16 },
        // Add more presets as needed
      ],
      // Example of enabling certain tabs if filerobot supports `tabsIds` in this way
      // Consult Filerobot documentation for precise control over tabs.
      // tabsIds: [TABS.ADJUST, TABS.ANNOTATE, TABS.WATERMARK, TABS.FINETUNE, TABS.FILTERS, TABS.RESIZE],
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
             style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }} // Ensure container has dimensions
             className="border rounded-lg overflow-hidden bg-background shadow-lg"
           >
            <DynamicFilerobotEditor
              key={imageSource} // Add key to help React re-initialize if source changes
              source={imageSource}
              onSave={onSaveImage}
              onClose={closeEditor}
              config={editorConfigObject} // Pass the main config object here
            />
          </div>
        )}
      </main>
    </>
  );
}
