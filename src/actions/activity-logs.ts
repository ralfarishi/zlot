"use server";

import { db } from "@/src/db";
import { activityLogs } from "@/src/db/schema";
import { requireAuth, requireRole } from "@/src/lib/auth-guard";
import { desc, eq, or, ilike, count as drizzleCount } from "drizzle-orm";

export async function logActivity(activity: string, userIdOverride?: string) {
	const user = userIdOverride ? { id: userIdOverride } : await requireAuth();

	await db.insert(activityLogs).values({
		profileId: user.id,
		activity,
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
	const baseWhere = search ? or(ilike(activityLogs.activity, `%${escaped}%`)) : undefined;

	const [rows, totalResult] = await Promise.all([
		db.query.activityLogs.findMany({
			with: { profile: true },
			where: baseWhere,
			orderBy: [desc(activityLogs.createdAt)],
			limit,
			offset,
		}),
		db.select({ count: drizzleCount() }).from(activityLogs).where(baseWhere),
	]);

	return { data: rows, total: totalResult[0].count };
}

export async function deleteLog(id: number) {
	await requireRole(["admin"]);

	await db.delete(activityLogs).where(eq(activityLogs.id, BigInt(id)));
}
