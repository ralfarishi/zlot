import { z } from "zod";
import { userRoleEnum } from "../schema/enums";

export const insertProfilSchema = z.object({
	id: z.string().uuid(),
	namaLengkap: z.string().min(2).max(100),
	role: z.enum(userRoleEnum.enumValues),
	isActive: z.boolean().default(true),
});

export const updateProfilSchema = insertProfilSchema.partial().omit({ id: true });

export type InsertProfil = z.infer<typeof insertProfilSchema>;
export type UpdateProfil = z.infer<typeof updateProfilSchema>;
