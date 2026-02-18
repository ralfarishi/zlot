import { z } from "zod";
import { vehicleTypeEnum } from "../schema/enums";

export const insertRateSchema = z.object({
	vehicleType: z.enum(vehicleTypeEnum.enumValues),
	hourlyRate: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
		message: "Hourly rate must be a positive number",
	}),
});

export const updateRateSchema = insertRateSchema.partial();

export type InsertRate = z.infer<typeof insertRateSchema>;
export type UpdateRate = z.infer<typeof updateRateSchema>;
