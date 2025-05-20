
import type { DeviceOrientationCategory } from '@/types/pexels';

export const popularSearchQueries: string[] = [
  'Wallpaper',
  'Nature',
  'Technology',
  'Abstract',
  'Minimalist',
  'Space',
  'Animals',
  'City',
  'Food',
  'Travel',
  'Dark',
  'Pattern',
  'Office',
  'Sky',
  'Vintage',
  'Gradient',
  'Texture',
  'Mountains',
  'Forest',
  'Ocean',
  'Flowers',
  'Art',
  'Illustration',
  'Cute',
  'Gaming',
  'Car',
  'Sports',
  'Music',
  'Holiday',
  'Seasonal',
];

export interface WallpaperFilterCategory {
  label: string;
  value: string; // This will be used as the search query
}

export interface CategoryGroup {
  groupLabel: string;
  categories: WallpaperFilterCategory[];
}

export const wallpaperFilterCategoryGroups: CategoryGroup[] = [
  {
    groupLabel: "By Type",
    categories: [
      { label: "Abstract", value: "Abstract" },
      { label: "Nature", value: "Nature" },
      { label: "Animals", value: "Animals" },
      { label: "Space", value: "Space" },
      { label: "Minimal", value: "Minimalist" },
      { label: "3D Renders", value: "3D Renders" },
      { label: "Aesthetic", value: "Aesthetic" },
      { label: "Anime", value: "Anime" },
      { label: "Cars", value: "Cars" },
      { label: "Architecture", value: "Architecture" },
    ],
  },
  {
    groupLabel: "By Device/Resolution Focus",
    categories: [
      { label: "Tablet", value: "Tablet Wallpaper" },
      { label: "4K", value: "4K Ultra HD" },
      { label: "Ultrawide", value: "Ultrawide Monitor" },
    ],
  },
  {
    groupLabel: "By Color Palette",
    categories: [
      { label: "Dark", value: "Dark" },
      { label: "Light", value: "Light" },
      { label: "Pastel", value: "Pastel Colors" },
      { label: "Neon", value: "Neon Lights" },
    ],
  },
  {
    groupLabel: "By Mood",
    categories: [
      { label: "Calm", value: "Calm Peaceful Serene" },
      { label: "Energetic", value: "Energetic Vibrant Dynamic" },
      { label: "Moody", value: "Moody Atmospheric" },
      { label: "Vintage", value: "Vintage Retro Old" },
      { label: "Futuristic", value: "Futuristic Sci-Fi Cyberpunk" },
    ],
  },
];

export const deviceOrientationTabs: { label: string; value: DeviceOrientationCategory }[] = [
  { label: 'Desktop', value: 'desktop' },
  { label: 'Smartphone', value: 'smartphone' },
];

// Re-exporting for convenience if needed elsewhere
export type { DeviceOrientationCategory };
