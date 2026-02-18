import { z } from "zod";
import { vehicleTypeEnum } from "../schema/enums";

export const vehiclePlateRegex = /^[A-Z]{1,3}\s\d{1,4}\s[A-Z]{1,3}$/i; // Basic Indonesian plate format as example, can be adjusted

export const insertVehicleSchema = z.object({
	plateNumber: z
		.string()
		.min(3)
		.max(15)
		.regex(vehiclePlateRegex, "Invalid plate number format (e.g., B 1234 ABC)"),
	vehicleType: z.enum(vehicleTypeEnum.enumValues),
	color: z.string().max(50).optional(),
	ownerName: z.string().max(100).optional(),
	profileId: z.string().uuid(),
});

export const updateVehicleSchema = insertVehicleSchema.partial().omit({ profileId: true });

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type UpdateVehicle = z.infer<typeof updateVehicleSchema>;
