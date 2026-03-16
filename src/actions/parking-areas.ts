"use server";

import { db } from "@/src/db";
import { areaParkir } from "@/src/db/schema";
import {
	insertAreaParkirSchema,
	updateAreaParkirSchema,
	type InsertAreaParkir,
	type UpdateAreaParkir,
} from "@/src/db/validations";
import { requireAuth, requireRole } from "@/src/lib/auth-guard";
import { logActivity } from "./activity-logs";
import { eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const getAreas = async () => {
	await requireAuth();
	return await db.query.areaParkir.findMany({
		where: isNull(areaParkir.deletedAt),
	});
};

export const createArea = async (data: InsertAreaParkir) => {
	await requireRole(["admin"]);
	const validated = insertAreaParkirSchema.parse(data);

	const result = await db.insert(areaParkir).values(validated).returning();
	await logActivity(
		`Created parking area ${validated.namaArea} with capacity ${validated.kapasitas}`,
	);
	revalidatePath("/dashboard/areas");
	return result[0];
};

export const updateArea = async (id: string, data: UpdateAreaParkir) => {
	await requireRole(["admin"]);
	const validated = updateAreaParkirSchema.parse(data);

	const result = await db
		.update(areaParkir)
		.set({ ...validated, updatedAt: new Date() })
		.where(eq(areaParkir.id, BigInt(id)))
		.returning();

	await logActivity(`Updated parking area ${result[0].namaArea}`);
	revalidatePath("/dashboard/areas");
	return result[0];
};
export const deleteArea = async (id: number) => {
	await requireRole(["admin"]);

	const result = await db
		.update(areaParkir)
		.set({ deletedAt: new Date() })
		.where(eq(areaParkir.id, BigInt(id)))
		.returning();

	await logActivity(`Deleted parking area ${result[0].namaArea}`);
	revalidatePath("/dashboard/areas");
	return result[0];
};
