
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
import type { FilerobotImageEditorConfig, TabsIds, ToolsIds } from 'filerobot-image-editor';

// Dynamically import the client-only editor component
const EditorClient = dynamic(() => import('@/components/ImageEditor'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] flex items-center justify-center border rounded-lg bg-muted/30">
      <p className="text-muted-foreground">Loading Editor...</p>
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

  const onSaveImage = useCallback((editedImageData: { imageCanvas: HTMLCanvasElement, name: string, extension: string, fullName?: string, mimeType: string, quality?: number, dataURL?: string }) => {
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

  const editorConfigObject: FilerobotImageEditorConfig = useMemo(() => {
    // Filerobot specific TABS and TOOLS if needed and exported, otherwise use string arrays
    // Example: const TABS = { ADJUST: 'Adjust', ANNOTATE: 'Annotate', WATERMARK: 'Watermark' };
    // Example: const TOOLS = { CROP: 'Crop', TEXT: 'Text' };
    // For safety, assuming string arrays if TABS/TOOLS enums are not directly available or cause issues.

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
          textWarn: '#f7931e', 
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
      tabsIds: ['Adjust', 'Annotate', 'Watermark', 'Finetune', 'Filters', 'Resize'] as TabsIds,
      defaultTabId: 'Adjust' as TabsIds[number], 
      defaultToolId: 'Crop' as ToolsIds, 
      tools: [
        'adjust', 'rotate', 'brightness', 'contrast', 'saturation', 'exposure', 
        'filters', 
        'annotate', 'text', 'rect', 'ellipse', 'arrow', 'draw', 
        'resize', 
        'watermark',
        'crop'
      ] as ToolsIds[],
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
            <ImageIcon className="h-20 w-20 text-primary opacity-70" />
            <h2 className="text-2xl font-semibold text-primary">
              Upload Your Image to Start Editing
            </h2>
            <p className="text-muted-foreground max-w-md">
              Click the button below to choose an image. You can crop, rotate, add filters, text, and much more!
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
            {imageSource && imageName && !isEditorOpen && (
              <div className="mt-6 text-sm text-muted-foreground">
                <p>Previously edited: {imageName}. Upload a new image or re-open.</p>
              </div>
            )}
          </div>
        ) : null}

        {isEditorOpen && imageSource && (
           <div 
             className="border rounded-lg overflow-hidden bg-background shadow-lg"
           >
            <EditorClient
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
