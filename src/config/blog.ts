
import type { ComponentType } from 'react';

export interface BlogPostMeta {
  slug: string;
  title: string;
  summary: string;
  date: string; // YYYY-MM-DD
  author?: string;
  tags?: string[];
  keywords?: string[];
  contentComponent: () => Promise<{ default: ComponentType<any> }>;
  opengraphImage?: string; // Relative path to image in /public, e.g. /blog/og-image.png
}

export const blogPosts: BlogPostMeta[] = [
  {
    slug: 'guide-ai-wallpaper-generator',
    title: "Unleash Your Creativity: A Guide to Wallify's AI Wallpaper Generator",
    summary: "Learn how to use Wallify's new AI tool to generate unique, custom wallpapers from your text prompts. Tips, tricks, and inspiration included!",
    date: '2024-07-26', // New post, more recent date
    author: 'Wallify AI Team',
    tags: ['ai', 'generator', 'guide', 'how-to', 'custom wallpaper', 'creativity'],
    keywords: ['ai wallpaper generator', 'Wallify AI tool', 'custom background creation', 'text to image guide', 'generative art tips', 'personalized wallpapers'],
    contentComponent: () => import('@/components/blog/articles/guide-ai-wallpaper-generator'),
    opengraphImage: '/blog/og-guide-ai-generator.png',
  },
  {
    slug: 'discover-page-spotlight',
    title: "Find Your Spark: Exploring Wallify's Discover Page",
    summary: "Dive into Wallify's Discover page! Learn how Wallpaper of the Day, Trending sections, Editor's Picks, and curated collections can help you find the perfect background.",
    date: '2024-07-24', // New post
    author: 'Wallify Curators',
    tags: ['discover', 'features', 'inspiration', 'wallpaper collections', 'trending', 'ui'],
    keywords: ['Wallify discover page', 'wallpaper inspiration', 'trending backgrounds', 'editors pick wallpapers', 'wallpaper of the day', 'find new wallpapers'],
    contentComponent: () => import('@/components/blog/articles/discover-page-spotlight'),
    opengraphImage: '/blog/og-discover-page-spotlight.png',
  },
  {
    slug: 'wallpaper-trends-2025',
    title: 'Wallpaper Trends for 2025: What’s Hot in Digital Decor',
    summary: 'Explore the upcoming wallpaper trends for 2025. From biophilic designs to AI-generated art with Wallify\'s new tool, discover what will adorn our screens.', // Updated summary
    date: '2024-05-15',
    author: 'Wallify Editors',
    tags: ['trends', '2025', 'design', 'ai', 'minimalist', 'maximalist', 'nature', 'abstract'], // Added AI tag
    keywords: ['wallpaper trends 2025', 'digital decor', 'desktop backgrounds 2025', 'smartphone wallpapers 2025', 'ai generated art', 'design predictions', 'popular wallpaper styles'], // Added AI keyword
    contentComponent: () => import('@/components/blog/articles/wallpaper-trends-2025'),
    opengraphImage: '/blog/og-wallpaper-trends-2025.png',
  },
  {
    slug: 'best-wallpapers-smartphones',
    title: 'Best Wallpapers for Your Smartphone: Stunning Visuals on The Go',
    summary: 'Curated collection of wallpapers optimized for smartphone screens. Find the perfect fit for your iPhone or Android device using Wallify\'s easy filters.', // Slightly updated summary
    date: '2024-05-10',
    author: 'Wallify Curators',
    tags: ['smartphones', 'mobile', 'iphone', 'android', 'optimized', 'portrait'],
    keywords: ['best smartphone wallpapers', 'iPhone wallpapers', 'Android backgrounds', 'mobile wallpapers', 'optimized for phone', 'high-resolution mobile', 'vertical wallpapers'],
    contentComponent: () => import('@/components/blog/articles/best-wallpapers-smartphones'),
    opengraphImage: '/blog/og-best-smartphones-wallpapers.png',
  },
  {
    slug: 'wallpapers-for-gamers',
    title: 'Ultimate Wallpaper Collection for Gamers',
    summary: 'Level up your desktop with these epic gaming wallpapers. From fantasy landscapes to futuristic scenes, find your perfect gaming backdrop on Wallify.', // Slightly updated summary
    date: '2024-05-05',
    author: 'Gamer Central',
    tags: ['gaming', 'gamers', 'desktop', 'fantasy', 'sci-fi', 'esports'],
    keywords: ['gaming wallpapers', 'wallpapers for gamers', 'desktop gaming backgrounds', 'epic game art', 'video game wallpapers', 'esports wallpapers', 'ultrawide gaming'],
    contentComponent: () => import('@/components/blog/articles/wallpapers-for-gamers'),
    opengraphImage: '/blog/og-gaming-wallpapers-collection.png',
  },
  {
    slug: 'choosing-perfect-wallpaper',
    title: 'How to Choose the Perfect Wallpaper for Your Aesthetic',
    summary: 'A guide to selecting wallpapers that complement your personal style, color preferences, and desired mood, including tips for using Wallify\'s AI generator.', // Updated summary
    date: '2024-04-28',
    author: 'Design Gurus',
    tags: ['guide', 'how-to', 'aesthetic', 'personalization', 'style', 'ai generator'], // Added AI tag
    keywords: ['choose wallpaper', 'perfect wallpaper guide', 'wallpaper aesthetic', 'style matching wallpaper', 'color psychology wallpaper', 'desktop personalization', 'ai custom wallpaper'], // Added AI keyword
    contentComponent: () => import('@/components/blog/articles/choosing-perfect-wallpaper'),
    opengraphImage: '/blog/og-choosing-perfect-wallpaper-guide.png',
  },
  {
    slug: 'wallpaper-color-psychology',
    title: 'Wallpaper Color Palettes to Refresh Your Mood',
    summary: 'Discover how different color palettes in wallpapers can influence your mood and productivity. Choose colors that resonate with you using Wallify\'s search.', // Slightly updated summary
    date: '2024-04-20',
    author: 'Color Experts',
    tags: ['color psychology', 'mood', 'well-being', 'design', 'productivity', 'colors'],
    keywords: ['wallpaper color psychology', 'mood enhancing wallpapers', 'color palettes for desktop', 'calming wallpapers', 'energetic wallpapers', 'wallpaper and emotion', 'color search'],
    contentComponent: () => import('@/components/blog/articles/wallpaper-color-psychology'),
    opengraphImage: '/blog/og-wallpaper-color-mood.png',
  }
];
