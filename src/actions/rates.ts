"use server";

import { db } from "@/src/db";
import { tarif } from "@/src/db/schema";
import {
	insertTarifSchema,
	updateTarifSchema,
	type InsertTarif,
	type UpdateTarif,
} from "@/src/db/validations";
import { requireAuth, requireRole } from "@/src/lib/auth-guard";
import { logActivity } from "./activity-logs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const getRates = async () => {
	await requireAuth();
	return await db.query.tarif.findMany();
};

export const createRate = async (data: InsertTarif) => {
	await requireRole(["admin"]);
	const validated = insertTarifSchema.parse(data);

	const result = await db.insert(tarif).values(validated).returning();
	await logActivity(`Created rate for ${validated.jenisKendaraan}: ${validated.tarifPerJam}`);
	revalidatePath("/dashboard/rates");
	return result[0];
};

export const updateRate = async (id: string, data: UpdateTarif) => {
	await requireRole(["admin"]);
	const validated = updateTarifSchema.parse(data);

	const result = await db
		.update(tarif)
		.set({ ...validated, updatedAt: new Date() })
		.where(eq(tarif.id, BigInt(id)))
		.returning();

	await logActivity(`Updated rate for ${result[0].jenisKendaraan}: ${result[0].tarifPerJam}`);
	revalidatePath("/dashboard/rates");
	return result[0];
};

export const deleteRate = async (id: number) => {
	await requireRole(["admin"]);

	try {
		const result = await db
			.delete(tarif)
			.where(eq(tarif.id, BigInt(id)))
			.returning();

		if (!result[0]) return { success: false, error: "NOT_FOUND" };

		await logActivity(`Deleted rate for ${result[0].jenisKendaraan}`);
		revalidatePath("/dashboard/rates");
		return { success: true, data: result[0] };
	} catch (error) {
		const isReferenceError =
			(error && typeof error === "object" && "code" in error && error.code === "23503") ||
			(error instanceof Error && error.message.includes("still referenced from table"));

		if (isReferenceError) {
			return { success: false, error: "REFERENCE_EXISTS" };
		}
		throw error;
	}
};
