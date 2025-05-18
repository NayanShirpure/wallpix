
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Ensure GOOGLE_GENAI_API_KEY is set as an environment variable.
// For local development, add it to your .env.local file (e.g., GOOGLE_GENAI_API_KEY=your_key_here).
// For deployment (e.g., on Vercel), set it as a secret environment variable in your project settings.
// This key should NOT be prefixed with NEXT_PUBLIC_ as it's a server-side secret.
export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
