import { z } from "zod";

export const insertAreaSchema = z.object({
	areaName: z.string().min(1).max(50),
	capacity: z.number().int().positive(),
	occupied: z.number().int().nonnegative().default(0),
});

export const updateAreaSchema = insertAreaSchema.partial();

export type InsertArea = z.infer<typeof insertAreaSchema>;
export type UpdateArea = z.infer<typeof updateAreaSchema>;
