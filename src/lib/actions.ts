
"use server";

import { reverseGeocode } from "@/ai/tools/reverse-geocode";
import { z } from "zod";

const getAddressSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export async function getAddressFromCoordinates(data: z.infer<typeof getAddressSchema>) {
    try {
        const address = await reverseGeocode(data);
        return { success: true, address };
    } catch (error) {
        console.error("Error getting address:", error);
        return { success: false, error: "Gagal mendapatkan alamat." };
    }
}
