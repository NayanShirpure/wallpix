
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
});
export type GenerateWallpaperOutput = z.infer<typeof GenerateWallpaperOutputSchema>;

export async function generateWallpaper(input: GenerateWallpaperInput): Promise<GenerateWallpaperOutput> {
  return generateWallpaperFlow(input);
}

// This flow directly calls the image generation model.
// For more complex scenarios, you might have a prompt here that guides the image generation.
const generateWallpaperFlow = ai.defineFlow(
  {
    name: 'generateWallpaperFlow',
    inputSchema: GenerateWallpaperInputSchema,
    outputSchema: GenerateWallpaperOutputSchema,
  },
  async (input: GenerateWallpaperInput) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // Specific model for image generation
      prompt: input.prompt, // Use the user's text prompt directly
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // Must request both for image generation
        // You can add safetySettings here if needed, e.g.:
        // safetySettings: [
        //   { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
        // ],
      },
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed or did not return an image.');
    }

    return { imageDataUri: media.url };
  }
);
