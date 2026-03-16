"use server";

import { db } from "@/src/db";
import { kendaraan } from "@/src/db/schema";
import {
	insertKendaraanSchema,
	updateKendaraanSchema,
	type InsertKendaraan,
	type UpdateKendaraan,
} from "@/src/db/validations";
import { requireAuth, requireRole } from "@/src/lib/auth-guard";
import { logActivity } from "./activity-logs";
import { eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const getVehicles = async () => {
	await requireAuth();
	return await db.query.kendaraan.findMany({
		where: isNull(kendaraan.deletedAt),
		with: {
			owner: true,
		},
	});
};

export const getVehicleByPlate = async (plate: string) => {
	await requireAuth();
	return await db.query.kendaraan.findFirst({
		where: eq(kendaraan.platNomor, plate.toUpperCase()),
	});
};

export const createVehicle = async (data: InsertKendaraan) => {
	await requireAuth();
	const validated = insertKendaraanSchema.parse({
		...data,
		platNomor: data.platNomor.toUpperCase(),
	});

	const result = await db.insert(kendaraan).values(validated).returning();
	await logActivity(`Registered vehicle ${validated.platNomor}`);
	revalidatePath("/dashboard/vehicles");
	return result[0];
};

export const updateVehicle = async (id: string, data: UpdateKendaraan) => {
	await requireRole(["admin", "owner"]);
	const validated = updateKendaraanSchema.parse({
		...data,
		platNomor: data.platNomor?.toUpperCase(),
	});

	const result = await db
		.update(kendaraan)
		.set({ ...validated, updatedAt: new Date() })
		.where(eq(kendaraan.id, BigInt(id)))
		.returning();

	await logActivity(`Updated vehicle ${result[0].platNomor}`);
	revalidatePath("/dashboard/vehicles");
	return result[0];
};

export const deleteVehicle = async (id: string) => {
	await requireRole(["admin", "owner"]);

	const result = await db
		.update(kendaraan)
		.set({ deletedAt: new Date() })
		.where(eq(kendaraan.id, BigInt(id)))
		.returning();

	if (result.length > 0) {
		await logActivity(`De-registered vehicle ${result[0].platNomor}`);
	}

	revalidatePath("/dashboard/vehicles");
	return result[0];
};
