import { z } from "zod";
import { userRoleEnum } from "../schema/enums";

export const insertProfileSchema = z.object({
	id: z.string().uuid(),
	fullName: z.string().min(2).max(100),
	role: z.enum(userRoleEnum.enumValues),
	isActive: z.boolean().default(true),
});

export const updateProfileSchema = insertProfileSchema.partial().omit({ id: true });

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
