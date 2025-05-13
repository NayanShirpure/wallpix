
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, Camera, Compass, Check } from 'lucide-react'; // Added Compass for Discover
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { wallpaperFilterCategoryGroups, deviceOrientationTabs, type DeviceOrientationCategory } from '@/config/categories';
import { ThemeToggle } from '@/components/theme-toggle';
import { SearchBar } from '@/components/wallpaper/SearchBar'; 

interface GlobalHeaderProps {
  currentDeviceOrientation: DeviceOrientationCategory;
  onDeviceOrientationChange: (newCategory: DeviceOrientationCategory) => void;
  onWallpaperCategorySelect: (categoryValue: string) => void;
  onSearchSubmit: (searchTerm: string) => void;
  initialSearchTerm?: string; 
}

export function GlobalHeader({
  currentDeviceOrientation,
  onDeviceOrientationChange,
  onWallpaperCategorySelect,
  onSearchSubmit,
  initialSearchTerm,
}: GlobalHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card/90 backdrop-blur-md supports-[backdrop-filter]:bg-card/75 print:hidden">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-4">
        <Link href="/" className="mr-1 flex items-center space-x-2 sm:mr-2" aria-label="Wallify Home">
          <Camera className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          <span className="font-bold text-lg sm:text-xl text-primary hidden xxs:inline">Wallify</span>
        </Link>

        <div className="flex-1 items-center justify-end hidden sm:flex gap-1.5 sm:gap-2">
            <Tabs value={currentDeviceOrientation} onValueChange={(value) => onDeviceOrientationChange(value as DeviceOrientationCategory)} className="w-auto">
              <TabsList className="h-9 text-xs sm:text-sm">
                {deviceOrientationTabs.map(opt => (
                  <TabsTrigger key={opt.value} value={opt.value} className="px-2.5 py-1.5 sm:px-3">{opt.label}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          
            <Link href="/discover" passHref legacyBehavior>
              <Button variant="outline" className="h-9 text-xs sm:text-sm px-2.5 sm:px-3">
                  <Compass className="mr-1 h-3.5 w-3.5" />
                  <span className="hidden md:inline">Discover</span>
                  <span className="md:hidden">Discover</span>
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 text-xs sm:text-sm px-2.5 sm:px-3">
                  <Menu className="mr-1 h-3.5 w-3.5" />
                  <span className="hidden md:inline">Categories</span>
                  <span className="md:hidden">Cat.</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto">
                <DropdownMenuLabel>Filter Wallpapers By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {wallpaperFilterCategoryGroups.map((group, groupIndex) => (
                  <React.Fragment key={`desktop-group-${group.groupLabel}-${groupIndex}`}>
                    <DropdownMenuLabel className="text-xs text-muted-foreground px-2 pt-2">{group.groupLabel}</DropdownMenuLabel>
                    {group.categories.map((cat) => (
                      <DropdownMenuItem key={`desktop-cat-${cat.value}`} onSelect={() => onWallpaperCategorySelect(cat.value)}>
                        {cat.label}
                      </DropdownMenuItem>
                    ))}
                    {groupIndex < wallpaperFilterCategoryGroups.length - 1 && <DropdownMenuSeparator />}
                  </React.Fragment>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
        
        {/* Search Bar - Centralized or right-aligned for all screens */}
        <div className="w-full max-w-[150px] xs:max-w-[180px] sm:max-w-xs mx-auto sm:mx-0 sm:ml-auto">
          <SearchBar onSubmitSearch={onSearchSubmit} initialValue={initialSearchTerm} />
        </div>

        {/* Mobile Combined Menu */}
        <div className="sm:hidden ml-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                <Menu className="h-4 w-4" />
                  <span className="sr-only">Open navigation menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[80vh] overflow-y-auto w-60">
              <DropdownMenuItem onSelect={() => { if (typeof window !== 'undefined') window.location.href = '/discover'; }}>
                <Compass className="mr-2 h-4 w-4" />
                <span>Discover</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Device</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {deviceOrientationTabs.map(opt => (
                <DropdownMenuItem key={`mobile-device-${opt.value}`} onSelect={() => onDeviceOrientationChange(opt.value as DeviceOrientationCategory)}>
                  {opt.label}
                  {currentDeviceOrientation === opt.value && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Categories</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {wallpaperFilterCategoryGroups.map((group, groupIndex) => (
                <React.Fragment key={`mobile-group-${group.groupLabel}-${groupIndex}`}>
                  <DropdownMenuLabel className="text-xs text-muted-foreground px-2 pt-1">{group.groupLabel}</DropdownMenuLabel>
                  {group.categories.map((cat) => (
                    <DropdownMenuItem key={`mobile-cat-${cat.value}-${groupIndex}`} onSelect={() => onWallpaperCategorySelect(cat.value)}>
                      {cat.label}
                    </DropdownMenuItem>
                  ))}
                  {groupIndex < wallpaperFilterCategoryGroups.length - 1 && <DropdownMenuSeparator className="my-1" />}
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
                  
        <div className="ml-1 sm:ml-0"> {/* Ensure ThemeToggle doesn't get pushed out on small screens */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
