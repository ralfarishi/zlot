import { z } from "zod";

export const insertAreaParkirSchema = z.object({
	namaArea: z.string().min(1).max(50),
	kapasitas: z.number().int().positive(),
	terisi: z.number().int().nonnegative().default(0),
});

export const updateAreaParkirSchema = insertAreaParkirSchema.partial();

export type InsertAreaParkir = z.infer<typeof insertAreaParkirSchema>;
export type UpdateAreaParkir = z.infer<typeof updateAreaParkirSchema>;
