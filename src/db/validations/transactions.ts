import { z } from "zod";
import { transactionStatusEnum } from "../schema/enums";

export const createEntrySchema = z.object({
	vehicleId: z.string().refine((val) => !isNaN(Number(val)), "Invalid vehicle ID"),
	entryTime: z.date().refine((date) => date <= new Date(), "Entry time cannot be in the future"),
	rateId: z.string().refine((val) => !isNaN(Number(val)), "Invalid rate ID"),
	profileId: z.string().uuid(),
	areaId: z.string().refine((val) => !isNaN(Number(val)), "Invalid area ID"),
});

export const createExitSchema = z.object({
	exitTime: z.date().refine((date) => date <= new Date(), "Exit time cannot be in the future"),
});

export const transactionSchema = z.object({
	id: z.string().optional(),
	vehicleId: z.string(),
	entryTime: z.date(),
	exitTime: z.date().optional(),
	rateId: z.string(),
	durationHours: z.string().optional(),
	totalCost: z.string().optional(),
	status: z.enum(transactionStatusEnum.enumValues),
	profileId: z.string(),
	areaId: z.string(),
});

export type CreateEntry = z.infer<typeof createEntrySchema>;
export type CreateExit = z.infer<typeof createExitSchema>;
