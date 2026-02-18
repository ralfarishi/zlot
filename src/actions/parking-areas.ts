"use server";

import { db } from "@/src/db";
import { parkingAreas } from "@/src/db/schema";
import {
	insertAreaSchema,
	updateAreaSchema,
	type InsertArea,
	type UpdateArea,
} from "@/src/db/validations";
import { requireAuth, requireRole } from "@/src/lib/auth-guard";
import { logActivity } from "./activity-logs";
import { eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const getAreas = async () => {
	await requireAuth();
	return await db.query.parkingAreas.findMany({
		where: isNull(parkingAreas.deletedAt),
	});
};

export const createArea = async (data: InsertArea) => {
	await requireRole(["admin"]);
	const validated = insertAreaSchema.parse(data);

	const result = await db.insert(parkingAreas).values(validated).returning();
	await logActivity(
		`Created parking area ${validated.areaName} with capacity ${validated.capacity}`,
	);
	revalidatePath("/dashboard/areas");
	return result[0];
};

export const updateArea = async (id: string, data: UpdateArea) => {
	await requireRole(["admin"]);
	const validated = updateAreaSchema.parse(data);

	const result = await db
		.update(parkingAreas)
		.set({ ...validated, updatedAt: new Date() })
		.where(eq(parkingAreas.id, BigInt(id)))
		.returning();

	await logActivity(`Updated parking area ${result[0].areaName}`);
	revalidatePath("/dashboard/areas");
	return result[0];
};
export const deleteArea = async (id: number) => {
	await requireRole(["admin"]);

	const result = await db
		.update(parkingAreas)
		.set({ deletedAt: new Date() })
		.where(eq(parkingAreas.id, BigInt(id)))
		.returning();

	await logActivity(`Deleted parking area ${result[0].areaName}`);
	revalidatePath("/dashboard/areas");
	return result[0];
};
