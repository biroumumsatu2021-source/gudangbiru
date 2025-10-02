'use server';

/**
 * @fileOverview A tool for converting GPS coordinates to a human-readable address.
 *
 * - reverseGeocode - A function that performs the reverse geocoding.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReverseGeocodeInputSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

const ReverseGeocodeOutputSchema = z.string().describe("The human-readable address.");

export const reverseGeocode = ai.defineTool(
  {
    name: 'reverseGeocode',
    description: 'Converts GPS coordinates to a human-readable address.',
    inputSchema: ReverseGeocodeInputSchema,
    outputSchema: ReverseGeocodeOutputSchema,
  },
  async ({latitude, longitude}) => {
    // In a real application, you would use a geocoding service API here.
    // For this example, we'll return a static address.
    console.log(`Reverse geocoding for: ${latitude}, ${longitude}`);
    // This is a placeholder. A real implementation would call a geocoding API.
    if (latitude.toFixed(2) === '34.05' && longitude.toFixed(2) === '-118.24') {
        return '123 Main St, Los Angeles, CA 90012, USA';
    }
    return 'Jalan Jenderal Sudirman No. 52-53, Jakarta Selatan, Indonesia';
  }
);
