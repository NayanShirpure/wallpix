
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, Palette, ListFilter, MoreVertical, Compass, Info, Wand2, Users, FileText, Shield, Home, MessageSquare, Monitor, Smartphone } from 'lucide-react';
import {
  Sheet,
  SheetClose,
  SheetContent,
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
import { wallpaperFilterCategoryGroups, type DeviceOrientationCategory } from '@/config/categories';
import { ThemeToggle } from '@/components/theme-toggle';
import { SearchBar } from '@/components/wallpaper/SearchBar';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GlobalHeaderProps {
  currentDeviceOrientation: DeviceOrientationCategory;
  onDeviceOrientationChange: (orientation: DeviceOrientationCategory) => void;
  onWallpaperCategorySelect: (categoryValue: string) => void;
  // onSearchSubmit is no longer passed as SearchBar handles navigation
}

export function GlobalHeader({
  currentDeviceOrientation,
  onDeviceOrientationChange,
  onWallpaperCategorySelect,
}: GlobalHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  let displaySearchTerm = '';
  if (pathname === '/search') {
    const queryParam = searchParams.get('query');
    if (queryParam) {
      displaySearchTerm = queryParam;
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75 print:hidden">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between gap-x-2 px-3 sm:px-4">

        <Link href="/" className="flex items-center space-x-2 shrink-0" aria-label="Wallify Home">
          <Palette className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          <span className="font-bold text-lg sm:text-xl text-primary hidden xxs:inline">Wallify</span>
        </Link>

        <div className="flex-1 flex justify-center items-center px-2 sm:px-4">
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
            <SearchBar
              initialValue={displaySearchTerm}
              navigateToSearchPage={true}
            />
          </div>
        </div>

        <nav className="flex items-center shrink-0 gap-x-1.5 sm:gap-x-2">
          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-x-2">
            <Tabs value={currentDeviceOrientation} onValueChange={(value) => onDeviceOrientationChange(value as DeviceOrientationCategory)} className="hidden md:block">
              <TabsList className="h-9">
                {/* Updated TabsTrigger for desktop */}
                <TabsTrigger
                  value="desktop"
                  className="p-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                  aria-label="Desktop View"
                >
                  <Monitor className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger
                  value="smartphone"
                  className="p-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                  aria-label="Smartphone View"
                >
                  <Smartphone className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-9 text-xs sm:text-sm px-2.5 sm:px-3">
                  <ListFilter className="mr-1 h-3.5 w-3.5" />
                  Categories
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Filter by Category</SheetTitle>
                </SheetHeader>
                <div className="py-4 px-2 h-[calc(100%-57px)] overflow-y-auto">
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More options</span>
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
                <DropdownMenuItem asChild>
                  <Link href="/about" className="flex items-center">
                    <Users className="mr-2 h-4 w-4" /> About
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/blog" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" /> Blog
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/contact" className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4" /> Contact
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/privacy-policy" className="flex items-center">
                     <Shield className="mr-2 h-4 w-4" /> Privacy Policy
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/terms-conditions" className="flex items-center">
                    Terms & Conditions
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Trigger */}
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
                  <div className="px-2 py-1 mb-1">
                    <span className="text-sm font-medium text-muted-foreground">Orientation</span>
                    <Tabs value={currentDeviceOrientation} onValueChange={(value) => onDeviceOrientationChange(value as DeviceOrientationCategory)} className="mt-1.5">
                      <TabsList className="grid w-full grid-cols-2 h-9">
                        {/* Mobile TabsTrigger remains unchanged with icon and label */}
                        <TabsTrigger
                          value="desktop"
                          className="text-xs px-2 py-1.5 h-auto"
                        >
                           <Monitor className="mr-1.5 h-3.5 w-3.5" />
                           Desktop
                        </TabsTrigger>
                        <TabsTrigger
                          value="smartphone"
                          className="text-xs px-2 py-1.5 h-auto"
                        >
                           <Smartphone className="mr-1.5 h-3.5 w-3.5" />
                           Smartphone
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <Separator className="my-1.5" />
                  <SheetClose asChild><Link href="/" className="block"><Button variant="ghost" className="w-full justify-start text-sm h-auto py-2 mb-1"><Home className="mr-2 h-4 w-4" /> Home</Button></Link></SheetClose>
                  <SheetClose asChild><Link href="/discover" className="block"><Button variant="ghost" className="w-full justify-start text-sm h-auto py-2 mb-1"><Compass className="mr-2 h-4 w-4" /> Discover</Button></Link></SheetClose>
                  <SheetClose asChild><Link href="/what-we-offer" className="block"><Button variant="ghost" className="w-full justify-start text-sm h-auto py-2 mb-1"><Info className="mr-2 h-4 w-4" /> What We Offer</Button></Link></SheetClose>
                  <SheetClose asChild><Link href="/generate" className="block"><Button variant="ghost" className="w-full justify-start text-sm h-auto py-2 mb-1"><Wand2 className="mr-2 h-4 w-4" /> AI Generate</Button></Link></SheetClose>
                  <Separator className="my-1.5" />
                  <SheetClose asChild><Link href="/about" className="block"><Button variant="ghost" className="w-full justify-start text-sm h-auto py-2 mb-1"><Users className="mr-2 h-4 w-4" /> About</Button></Link></SheetClose>
                  <SheetClose asChild><Link href="/blog" className="block"><Button variant="ghost" className="w-full justify-start text-sm h-auto py-2 mb-1"><FileText className="mr-2 h-4 w-4" /> Blog</Button></Link></SheetClose>
                  <SheetClose asChild><Link href="/contact" className="block"><Button variant="ghost" className="w-full justify-start text-sm h-auto py-2 mb-1"><MessageSquare className="mr-2 h-4 w-4" /> Contact</Button></Link></SheetClose>
                  <Separator className="my-1.5" />
                  <SheetClose asChild><Link href="/privacy-policy" className="block"><Button variant="ghost" className="w-full justify-start text-sm h-auto py-2"><Shield className="mr-2 h-4 w-4" /> Privacy Policy</Button></Link></SheetClose>
                  <SheetClose asChild><Link href="/terms-conditions" className="block"><Button variant="ghost" className="w-full justify-start text-sm h-auto py-2">Terms & Conditions</Button></Link></SheetClose>
                  <Separator className="my-1.5" />
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
        </nav>
      </div>
    </header>
  );
}
