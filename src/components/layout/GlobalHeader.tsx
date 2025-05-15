
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, Palette, Compass, Check, ListFilter, Wand2, Info } from 'lucide-react'; // Added Info icon
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { wallpaperFilterCategoryGroups, deviceOrientationTabs, type DeviceOrientationCategory } from '@/config/categories';
import { ThemeToggle } from '@/components/theme-toggle';
import { SearchBar } from '@/components/wallpaper/SearchBar'; 

interface GlobalHeaderProps {
  currentDeviceOrientation: DeviceOrientationCategory;
  onDeviceOrientationChange: (newCategory: DeviceOrientationCategory) => void;
  onWallpaperCategorySelect: (categoryValue: string) => void;
  onSearchSubmit: (searchTerm: string) => void;
  initialSearchTerm?: string; 
  navigateToSearchPage?: boolean;
}

export function GlobalHeader({
  currentDeviceOrientation,
  onDeviceOrientationChange,
  onWallpaperCategorySelect,
  onSearchSubmit,
  initialSearchTerm,
  navigateToSearchPage,
}: GlobalHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75 print:hidden">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between gap-x-2 px-3 sm:px-4">
        
        <Link href="/" className="flex items-center space-x-2 shrink-0" aria-label="Wallify Home">
          <Palette className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          <span className="font-bold text-lg sm:text-xl text-primary hidden xxs:inline">Wallify</span>
        </Link>

        <div className="flex-1 flex justify-center px-2 sm:px-4">
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
            <SearchBar 
              onSubmitSearch={onSearchSubmit} 
              initialValue={initialSearchTerm}
              navigateToSearchPage={navigateToSearchPage}
            />
          </div>
        </div>

        <div className="flex items-center shrink-0 gap-x-1.5 sm:gap-x-2">
          <nav className="hidden sm:flex items-center gap-1.5 sm:gap-x-2">
              <Tabs value={currentDeviceOrientation} onValueChange={(value) => onDeviceOrientationChange(value as DeviceOrientationCategory)} className="w-auto">
                <TabsList className="h-9 text-xs sm:text-sm">
                  {deviceOrientationTabs.map(opt => (
                    <TabsTrigger key={opt.value} value={opt.value} className="px-2.5 py-1.5 sm:px-3">{opt.label}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            
              <Sheet> 
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9 text-xs sm:text-sm px-2.5 sm:px-3">
                      <Menu className="mr-1 h-3.5 w-3.5" />
                      Browse
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/discover" className="flex items-center">
                        <Compass className="mr-2 h-4 w-4" />
                        Discover
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/what-we-offer" className="flex items-center">
                        <Info className="mr-2 h-4 w-4" />
                        What We Offer
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/generate" className="flex items-center">
                        <Wand2 className="mr-2 h-4 w-4" />
                        AI Generate
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <SheetTrigger asChild>
                      <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                        <ListFilter className="mr-2 h-4 w-4" />
                        <span>Filter Categories</span>
                      </DropdownMenuItem>
                    </SheetTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>
                <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle>Filter by Category</SheetTitle>
                    <SheetDescription>Select a category to refine your wallpaper search.</SheetDescription>
                  </SheetHeader>
                  <div className="py-4 px-2 h-[calc(100%-73px)] overflow-y-auto">
                    {wallpaperFilterCategoryGroups.map((group, groupIndex) => (
                      <React.Fragment key={`desktop-sheet-group-${group.groupLabel}-${groupIndex}`}>
                        <h4 className="text-sm font-semibold text-muted-foreground px-2 pt-2 pb-1">{group.groupLabel}</h4>
                        {group.categories.map((cat) => (
                          <SheetClose asChild key={`desktop-sheet-cat-${cat.value}`}>
                            <Button
                              variant="ghost"
                              className="w-full justify-start px-2 py-1.5 text-sm h-auto"
                              onClick={() => onWallpaperCategorySelect(cat.value)}
                            >
                              {cat.label}
                            </Button>
                          </SheetClose>
                        ))}
                        {groupIndex < wallpaperFilterCategoryGroups.length - 1 && <Separator className="my-2" />}
                      </React.Fragment>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
          </nav>

          <div className="sm:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <div className="py-2 px-2 h-[calc(100%-57px)] overflow-y-auto">
                  <SheetClose asChild>
                    <Link href="/discover" passHref legacyBehavior>
                      <a className="block">
                        <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2 mb-1">
                          <Compass className="mr-2 h-4 w-4" /> Discover
                        </Button>
                      </a>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/what-we-offer" passHref legacyBehavior>
                      <a className="block">
                        <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2 mb-1">
                          <Info className="mr-2 h-4 w-4" /> What We Offer
                        </Button>
                      </a>
                    </Link>
                  </SheetClose>
                   <SheetClose asChild>
                    <Link href="/generate" passHref legacyBehavior>
                      <a className="block">
                        <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2 mb-1">
                          <Wand2 className="mr-2 h-4 w-4" /> AI Generate
                        </Button>
                      </a>
                    </Link>
                  </SheetClose>
                  <Separator />
                  <div className="py-1">
                    <h4 className="text-sm font-semibold text-muted-foreground px-2 pt-2 pb-1">Device</h4>
                    {deviceOrientationTabs.map(opt => (
                      <SheetClose asChild key={`mobile-sheet-device-${opt.value}`}>
                        <Button
                          variant={currentDeviceOrientation === opt.value ? "secondary" : "ghost"}
                          className="w-full justify-between px-2 py-1.5 text-sm h-auto"
                          onClick={() => onDeviceOrientationChange(opt.value as DeviceOrientationCategory)}
                        >
                          {opt.label}
                          {currentDeviceOrientation === opt.value && <Check className="h-4 w-4" />}
                        </Button>
                      </SheetClose>
                    ))}
                  </div>
                  <Separator />
                  <div className="py-1">
                    <h4 className="text-sm font-semibold text-muted-foreground px-2 pt-2 pb-1">Categories</h4>
                    {wallpaperFilterCategoryGroups.map((group, groupIndex) => (
                      <React.Fragment key={`mobile-sheet-group-${group.groupLabel}-${groupIndex}`}>
                        <h5 className="text-xs font-medium text-muted-foreground px-2 pt-2 pb-1">{group.groupLabel}</h5>
                        {group.categories.map((cat) => (
                          <SheetClose asChild key={`mobile-sheet-cat-${cat.value}-${groupIndex}`}>
                            <Button
                              variant="ghost"
                              className="w-full justify-start px-2 py-1.5 text-sm h-auto"
                              onClick={() => onWallpaperCategorySelect(cat.value)}
                            >
                              {cat.label}
                            </Button>
                          </SheetClose>
                        ))}
                        {groupIndex < wallpaperFilterCategoryGroups.length - 1 && <Separator className="my-1" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
                    
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
