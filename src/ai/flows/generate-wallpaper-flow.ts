
'use server';
/**
 * @fileOverview An AI wallpaper generation flow.
 *
 * - generateWallpaper - A function that handles the wallpaper generation process.
 * - GenerateWallpaperInput - The input type for the generateWallpaper function.
 * - GenerateWallpaperOutput - The return type for the generateWallpaper function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWallpaperInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GenerateWallpaperInput = z.infer<typeof GenerateWallpaperInputSchema>;

const GenerateWallpaperOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe('The generated image as a data URI.'),
  altText: z.string().describe('Generated alt text for the image, based on the prompt.'),
});
export type GenerateWallpaperOutput = z.infer<typeof GenerateWallpaperOutputSchema>;

export async function generateWallpaper(input: GenerateWallpaperInput): Promise<GenerateWallpaperOutput> {
  return generateWallpaperFlow(input);
}

const generateWallpaperFlow = ai.defineFlow(
  {
    name: 'generateWallpaperFlow',
    inputSchema: GenerateWallpaperInputSchema,
    outputSchema: GenerateWallpaperOutputSchema,
  },
  async (input: GenerateWallpaperInput) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', 
      prompt: input.prompt, 
      config: {
        responseModalities: ['TEXT', 'IMAGE'], 
      },
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed or did not return an image.');
    }

    // Construct alt text based on the prompt
    const altText = `AI generated wallpaper: ${input.prompt.substring(0, 100)}${input.prompt.length > 100 ? '...' : ''}`;

    return { 
      imageDataUri: media.url,
      altText: altText,
    };
  }
);
