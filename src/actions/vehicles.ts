"use server";

import { db } from "@/src/db";
import { vehicles } from "@/src/db/schema";
import {
	insertVehicleSchema,
	updateVehicleSchema,
	type InsertVehicle,
	type UpdateVehicle,
} from "@/src/db/validations";
import { requireAuth, requireRole } from "@/src/lib/auth-guard";
import { logActivity } from "./activity-logs";
import { eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const getVehicles = async () => {
	await requireAuth();
	return await db.query.vehicles.findMany({
		where: isNull(vehicles.deletedAt),
		with: {
			owner: true,
		},
	});
};

export const getVehicleByPlate = async (plate: string) => {
	await requireAuth();
	return await db.query.vehicles.findFirst({
		where: eq(vehicles.plateNumber, plate.toUpperCase()),
	});
};

export const createVehicle = async (data: InsertVehicle) => {
	await requireAuth();
	const validated = insertVehicleSchema.parse({
		...data,
		plateNumber: data.plateNumber.toUpperCase(),
	});

	const result = await db.insert(vehicles).values(validated).returning();
	await logActivity(`Registered vehicle ${validated.plateNumber}`);
	revalidatePath("/dashboard/vehicles");
	return result[0];
};

export const updateVehicle = async (id: string, data: UpdateVehicle) => {
	await requireAuth();
	const validated = updateVehicleSchema.parse({
		...data,
		plateNumber: data.plateNumber?.toUpperCase(),
	});

	const result = await db
		.update(vehicles)
		.set({ ...validated, updatedAt: new Date() })
		.where(eq(vehicles.id, BigInt(id)))
		.returning();

	await logActivity(`Updated vehicle ${result[0].plateNumber}`);
	revalidatePath("/dashboard/vehicles");
	return result[0];
};

export const deleteVehicle = async (id: string) => {
	await requireRole(["admin", "owner"]);

	const result = await db
		.update(vehicles)
		.set({ deletedAt: new Date() })
		.where(eq(vehicles.id, BigInt(id)))
		.returning();

	if (result.length > 0) {
		await logActivity(`De-registered vehicle ${result[0].plateNumber}`);
	}

	revalidatePath("/dashboard/vehicles");
	return result[0];
};
