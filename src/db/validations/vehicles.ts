import { z } from "zod";
import { vehicleTypeEnum } from "../schema/enums";

export const vehiclePlateRegex = /^[A-Z]{1,3}\s\d{1,4}\s[A-Z]{1,3}$/i; // Basic Indonesian plate format as example, can be adjusted

export const insertKendaraanSchema = z.object({
	platNomor: z
		.string()
		.min(3)
		.max(15)
		.regex(vehiclePlateRegex, "Invalid plate number format (e.g., B 1234 ABC)"),
	jenisKendaraan: z.enum(vehicleTypeEnum.enumValues),
	warna: z.string().max(50).optional(),
	namaPemilik: z.string().max(100).optional(),
	idPetugas: z.string().uuid(),
});

export const updateKendaraanSchema = insertKendaraanSchema.partial().omit({ idPetugas: true });

export type InsertKendaraan = z.infer<typeof insertKendaraanSchema>;
export type UpdateKendaraan = z.infer<typeof updateKendaraanSchema>;
