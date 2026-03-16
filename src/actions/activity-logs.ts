"use server";

import { db } from "@/src/db";
import { logAktifitas } from "@/src/db/schema";
import { requireAuth, requireRole } from "@/src/lib/auth-guard";
import { desc, eq, or, ilike, count as drizzleCount } from "drizzle-orm";

export async function logActivity(aktifitas: string, userIdOverride?: string) {
	const user = userIdOverride ? { id: userIdOverride } : await requireAuth();

	await db.insert(logAktifitas).values({
		idPetugas: user.id,
		aktifitas,
	});
}

export async function getActivityLogs({
	limit = 20,
	offset = 0,
	search = "",
}: {
	limit?: number;
	offset?: number;
	search?: string;
} = {}) {
	await requireRole(["admin", "owner"]);

	const escaped = search ? search.replace(/[%_]/g, "\\$&") : "";
	const baseWhere = search ? or(ilike(logAktifitas.aktifitas, `%${escaped}%`)) : undefined;

	const [rows, totalResult] = await Promise.all([
		db.query.logAktifitas.findMany({
			with: { petugas: true },
			where: baseWhere,
			orderBy: [desc(logAktifitas.createdAt)],
			limit,
			offset,
		}),
		db.select({ count: drizzleCount() }).from(logAktifitas).where(baseWhere),
	]);

	return { data: rows, total: totalResult[0].count };
}

export async function deleteLog(id: number) {
	await requireRole(["admin"]);

	await db.delete(logAktifitas).where(eq(logAktifitas.id, BigInt(id)));
}
