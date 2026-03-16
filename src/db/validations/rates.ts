import { z } from "zod";
import { vehicleTypeEnum } from "../schema/enums";

export const insertTarifSchema = z.object({
	jenisKendaraan: z.enum(vehicleTypeEnum.enumValues),
	tarifPerJam: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
		message: "Hourly rate must be a positive number",
	}),
});

export const updateTarifSchema = insertTarifSchema.partial();

export type InsertTarif = z.infer<typeof insertTarifSchema>;
export type UpdateTarif = z.infer<typeof updateTarifSchema>;
