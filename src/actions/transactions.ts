"use server";

import { db } from "@/src/db";
import { transaksi, kendaraan, areaParkir, tarif } from "@/src/db/schema";
import { revalidatePath } from "next/cache";
import { requireAuth, requireRole } from "@/src/lib/auth-guard";
import { logActivity } from "./activity-logs";
import { eq, and, isNull, sql, desc } from "drizzle-orm";
import { z } from "zod";

const logEntrySchema = z.object({
	platNomor: z.string().min(3).max(20),
	jenisKendaraan: z.enum(["motor", "mobil", "lainnya"]),
	idArea: z.number(),
	warna: z.string().optional().nullable(),
	namaPemilik: z.string().optional().nullable(),
});

const logExitSchema = z.object({
	idTransaksi: z.string().min(1),
	metodePembayaran: z.enum(["QRIS", "TUNAI"]),
	uangDiterima: z.string().optional().nullable(),
	kembalian: z.string().optional().nullable(),
});

/**
 * LOG VEHICLE ENTRY
 */
export const logEntry = async (rawInput: unknown) => {
	const user = await requireAuth();

	const validation = logEntrySchema.safeParse(rawInput);
	if (!validation.success) {
		throw new Error(`Invalid input: ${JSON.stringify(validation.error.flatten().fieldErrors)}`);
	}

	const data = validation.data;
	const plateUpper = data.platNomor.toUpperCase();

	return await db.transaction(async (tx) => {
		// 1. Check if vehicle already in an active transaction
		const activeTx = await tx.query.transaksi.findFirst({
			where: and(
				isNull(transaksi.waktuKeluar),
				eq(transaksi.status, "masuk"),
				sql`${transaksi.idKendaraan} IN (SELECT id FROM ${kendaraan} WHERE plat_nomor = ${plateUpper})`,
			),
		});

		if (activeTx) {
			throw new Error("Vehicle is already registered inside the facility.");
		}

		// 2. Ensure vehicle exists or create it
		let vehicleRecord = await tx.query.kendaraan.findFirst({
			where: eq(kendaraan.platNomor, plateUpper),
		});

		if (!vehicleRecord) {
			const [newVehicle] = await tx
				.insert(kendaraan)
				.values({
					platNomor: plateUpper,
					jenisKendaraan: data.jenisKendaraan,
					warna: data.warna || null,
					namaPemilik: data.namaPemilik || null,
					idPetugas: user.id,
				})
				.returning();
			vehicleRecord = newVehicle;
		}

		// 3. Get appropriate rate
		const rateRecord = await tx.query.tarif.findFirst({
			where: eq(tarif.jenisKendaraan, data.jenisKendaraan),
		});

		if (!rateRecord) {
			throw new Error(`No rate configuration found for vehicle type: ${data.jenisKendaraan}`);
		}

		// 4. Create Transaction
		const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, "");
		const { nanoid } = await import("nanoid");
		const transactionNumber = `ZLT-${datePrefix}-${nanoid(6).toUpperCase()}`;

		const [newTx] = await tx
			.insert(transaksi)
			.values({
				idKendaraan: vehicleRecord.id,
				noTransaksi: transactionNumber,
				idArea: BigInt(data.idArea),
				idTarif: rateRecord.id,
				idPetugas: user.id,
				waktuMasuk: new Date(),
				status: "masuk",
			})
			.returning();

		// 5. Update Area Occupancy
		const [targetArea] = await tx
			.update(areaParkir)
			.set({
				terisi: sql`${areaParkir.terisi} + 1`,
				updatedAt: new Date(),
			})
			.where(eq(areaParkir.id, BigInt(data.idArea)))
			.returning();

		await logActivity(
			`Log: Vehicle ENTRY [${plateUpper}] in Area ${targetArea?.namaArea || data.idArea}`,
		);

		revalidatePath("/dashboard/parking", "layout");
		revalidatePath("/dashboard");
		revalidatePath("/dashboard/analytics");

		return newTx;
	});
};

/**
 * LOG VEHICLE EXIT
 */
export const logExit = async (
	idTransaksi: string,
	metodePembayaran: "QRIS" | "TUNAI",
	uangDiterima?: string,
	kembalian?: string,
) => {
	await requireAuth();

	const validation = logExitSchema.safeParse({
		idTransaksi,
		metodePembayaran,
		uangDiterima,
		kembalian,
	});

	if (!validation.success) {
		throw new Error(
			`Invalid exit input: ${JSON.stringify(validation.error.flatten().fieldErrors)}`,
		);
	}

	return await db.transaction(async (tx) => {
		// 1. Fetch Transaction & Vehicle Details
		const currentTx = await tx.query.transaksi.findFirst({
			where: eq(transaksi.id, BigInt(idTransaksi)),
			with: {
				kendaraan: true,
				tarif: true,
				petugas: true,
			},
		});

		if (!currentTx || currentTx.waktuKeluar) {
			throw new Error("Transaction not found or vehicle already exited.");
		}

		// 2. Calculate Fee
		const waktuKeluar = new Date();
		const diffMs = waktuKeluar.getTime() - currentTx.waktuMasuk.getTime();
		const diffHrs = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60))); // Min 1 hour
		const totalBiaya = (diffHrs * Number(currentTx.tarif.tarifPerJam)).toString();

		// 3. Update Transaction
		const [updatedTx] = await tx
			.update(transaksi)
			.set({
				waktuKeluar,
				durasiJam: diffHrs.toString(),
				totalBiaya,
				metodePembayaran,
				uangDiterima: uangDiterima || null,
				kembalian: kembalian || null,
				status: "keluar",
				updatedAt: new Date(),
			})
			.where(eq(transaksi.id, BigInt(idTransaksi)))
			.returning();

		// 4. Update Area Occupancy
		await tx
			.update(areaParkir)
			.set({
				terisi: sql`${areaParkir.terisi} - 1`,
				updatedAt: new Date(),
			})
			.where(eq(areaParkir.id, currentTx.idArea));

		await logActivity(
			`Log: Vehicle EXIT [${currentTx.kendaraan.platNomor}] - Fee: $${totalBiaya} (${metodePembayaran})`,
		);

		revalidatePath("/dashboard/parking", "layout");
		revalidatePath("/dashboard");
		revalidatePath("/dashboard/analytics");

		return {
			...updatedTx,
			kendaraan: currentTx.kendaraan,
			tarif: currentTx.tarif,
			petugas: currentTx.petugas,
		};
	});
};

/**
 * DELETE TRANSACTION
 */
export const deleteTransaction = async (id: string) => {
	await requireRole(["admin", "owner"]);

	// 1. Fetch transaction to get plate for logging
	const tx = await db.query.transaksi.findFirst({
		where: eq(transaksi.id, BigInt(id)),
		with: { kendaraan: true },
	});

	if (!tx) throw new Error("Transaction not found.");

	// 2. Delete
	await db.delete(transaksi).where(eq(transaksi.id, BigInt(id)));

	// 3. Log
	await logActivity(
		`Deleted transaction ${tx.noTransaksi || tx.id.toString()} for vehicle [${tx.kendaraan.platNomor}]`,
	);

	revalidatePath("/dashboard/parking", "layout");
	revalidatePath("/dashboard");
	revalidatePath("/dashboard/analytics");
};

/**
 * GET ACTIVE TRANSACTIONS
 */
export const getActiveTransactions = async () => {
	await requireAuth();
	return await db.query.transaksi.findMany({
		where: isNull(transaksi.waktuKeluar),
		with: {
			kendaraan: true,
			area: true,
			tarif: true,
			petugas: true,
		},
		orderBy: [desc(transaksi.waktuMasuk)],
	});
};

/**
 * SEARCH ACTIVE VEHICLE BY PLATE
 */
export const findActiveTransactionByPlate = async (plate: string) => {
	await requireAuth();
	return await db.query.transaksi.findFirst({
		where: and(
			isNull(transaksi.waktuKeluar),
			sql`${transaksi.idKendaraan} IN (SELECT id FROM ${kendaraan} WHERE plat_nomor = ${plate.toUpperCase()})`,
		),
		with: {
			kendaraan: true,
			area: true,
			tarif: true,
			petugas: true,
		},
	});
};
/**
 * GET ALL TRANSACTIONS (History)
 */
export const getAllTransactions = async () => {
	await requireAuth();
	return await db.query.transaksi.findMany({
		with: {
			kendaraan: true,
			area: true,
			tarif: true,
			petugas: true,
		},
		orderBy: [desc(transaksi.waktuMasuk)],
	});
};

/**
 * ANALYTICS: Get summary stats for today
 */
export const getAnalyticsStats = async () => {
	await requireAuth();

	const todayStart = new Date();
	todayStart.setHours(0, 0, 0, 0);

	const yesterdayStart = new Date(todayStart);
	yesterdayStart.setDate(yesterdayStart.getDate() - 1);

	// Today's revenue (completed transactions)
	const todayRevenue = await db
		.select({ total: sql<string>`COALESCE(SUM(${transaksi.totalBiaya}), 0)` })
		.from(transaksi)
		.where(
			and(
				eq(transaksi.status, "keluar"),
				sql`${transaksi.waktuKeluar} >= ${todayStart.toISOString()}`,
			),
		);

	// Yesterday revenue for comparison
	const yesterdayRevenue = await db
		.select({ total: sql<string>`COALESCE(SUM(${transaksi.totalBiaya}), 0)` })
		.from(transaksi)
		.where(
			and(
				eq(transaksi.status, "keluar"),
				sql`${transaksi.waktuKeluar} >= ${yesterdayStart.toISOString()}`,
				sql`${transaksi.waktuKeluar} < ${todayStart.toISOString()}`,
			),
		);

	// Active vehicles
	const activeCount = await db
		.select({ count: sql<number>`COUNT(*)::int` })
		.from(transaksi)
		.where(isNull(transaksi.waktuKeluar));

	// Occupancy rate (sum occupied / sum capacity)
	const occupancyResult = await db
		.select({
			totalOccupied: sql<number>`COALESCE(SUM(${areaParkir.terisi}), 0)::int`,
			totalCapacity: sql<number>`COALESCE(SUM(${areaParkir.kapasitas}), 0)::int`,
		})
		.from(areaParkir)
		.where(isNull(areaParkir.deletedAt));

	// Peak hour today (hour with most entries)
	const peakHourResult = await db
		.select({
			hour: sql<number>`EXTRACT(HOUR FROM ${transaksi.waktuMasuk})::int`,
		})
		.from(transaksi)
		.where(
			and(
				sql`${transaksi.waktuMasuk} >= ${todayStart.toISOString()}`,
				sql`${transaksi.waktuMasuk} < ${new Date(todayStart.getTime() + 86400000).toISOString()}`,
			),
		)
		.groupBy(sql`EXTRACT(HOUR FROM ${transaksi.waktuMasuk})`)
		.orderBy(sql`COUNT(*) DESC`)
		.limit(1);

	const todayTotal = parseFloat(todayRevenue[0].total);
	const yesterdayTotal = parseFloat(yesterdayRevenue[0].total);
	const revenueChange =
		yesterdayTotal > 0
			? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100
			: todayTotal > 0
				? 100
				: 0;

	const totalOccupied = occupancyResult[0].totalOccupied;
	const totalCapacity = occupancyResult[0].totalCapacity;
	const occupancyRate = totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0;

	const peakHour = peakHourResult.length > 0 ? peakHourResult[0].hour : null;

	return {
		dailyRevenue: todayTotal,
		revenueChange: Math.round(revenueChange * 10) / 10,
		activeVehicles: activeCount[0].count,
		occupancyRate: Math.round(occupancyRate * 10) / 10,
		peakHour,
	};
};

/**
 * ANALYTICS: Revenue by day (last N days)
 */
export const getRevenueByDay = async (days = 7) => {
	await requireAuth();

	const safeDays = Math.max(1, Math.min(days, 365));
	const since = new Date();
	since.setDate(since.getDate() - safeDays);
	since.setHours(0, 0, 0, 0);

	const result = await db
		.select({
			day: sql<string>`TO_CHAR(${transaksi.waktuKeluar}, 'Dy')`,
			date: sql<string>`TO_CHAR(${transaksi.waktuKeluar}, 'YYYY-MM-DD')`,
			revenue: sql<string>`COALESCE(SUM(${transaksi.totalBiaya}), 0)`,
		})
		.from(transaksi)
		.where(
			and(
				eq(transaksi.status, "keluar"),
				sql`${transaksi.waktuKeluar} >= ${since.toISOString()}`,
			),
		)
		.groupBy(
			sql`TO_CHAR(${transaksi.waktuKeluar}, 'Dy')`,
			sql`TO_CHAR(${transaksi.waktuKeluar}, 'YYYY-MM-DD')`,
		)
		.orderBy(sql`TO_CHAR(${transaksi.waktuKeluar}, 'YYYY-MM-DD')`);

	return result.map((r) => ({
		name: r.day,
		revenue: parseFloat(r.revenue),
	}));
};

/**
 * ANALYTICS: Occupancy by area
 */
export const getOccupancyByArea = async () => {
	await requireAuth();

	const areas = await db.query.areaParkir.findMany({
		where: isNull(areaParkir.deletedAt),
	});

	return areas.map((a) => ({
		name: a.namaArea,
		value: a.terisi,
		capacity: a.kapasitas,
	}));
};

/**
 * REPORTS: Recent completed transactions
 */
export const getRecentCompletedTransactions = async (limit = 20) => {
	await requireAuth();

	return await db.query.transaksi.findMany({
		where: eq(transaksi.status, "keluar"),
		with: {
			kendaraan: true,
			area: true,
			tarif: true,
			petugas: true,
		},
		orderBy: [desc(transaksi.waktuKeluar)],
		limit,
	});
};

/**
 * ANALYTICS: Hourly Load Data (Heatmap)
 */
export const getHourlyLoadData = async () => {
	await requireAuth();

	const result = await db
		.select({
			hour: sql<number>`EXTRACT(HOUR FROM ${transaksi.waktuMasuk})::int`,
			count: sql<number>`COUNT(*)::int`,
		})
		.from(transaksi)
		.where(sql`${transaksi.waktuMasuk} >= CURRENT_DATE - INTERVAL '7 days'`)
		.groupBy(sql`EXTRACT(HOUR FROM ${transaksi.waktuMasuk})`)
		.orderBy(sql`EXTRACT(HOUR FROM ${transaksi.waktuMasuk})`);

	return result;
};

/**
 * ANALYTICS: Zone Performance
 */
export const getZonePerformance = async () => {
	await requireAuth();

	const result = await db
		.select({
			name: areaParkir.namaArea,
			revenue: sql<string>`COALESCE(SUM(${transaksi.totalBiaya}), 0)`,
			transactionCount: sql<number>`COUNT(*)::int`,
		})
		.from(areaParkir)
		.leftJoin(transaksi, eq(transaksi.idArea, areaParkir.id))
		.where(
			and(
				isNull(areaParkir.deletedAt),
				sql`${transaksi.waktuKeluar} >= CURRENT_DATE - INTERVAL '30 days'`,
			),
		)
		.groupBy(areaParkir.namaArea)
		.orderBy(desc(sql`SUM(${transaksi.totalBiaya})`));

	return result.map((r) => ({
		...r,
		revenue: parseFloat(r.revenue),
	}));
};

/**
 * ANALYTICS: Revenue Velocity (Last 6 Hours)
 */
export const getRevenueVelocity = async () => {
	await requireAuth();

	const result = await db
		.select({
			hour: sql<string>`TO_CHAR(${transaksi.waktuKeluar}, 'HH24:00')`,
			revenue: sql<string>`COALESCE(SUM(${transaksi.totalBiaya}), 0)`,
		})
		.from(transaksi)
		.where(
			and(
				eq(transaksi.status, "keluar"),
				sql`${transaksi.waktuKeluar} >= now() - INTERVAL '6 hours'`,
			),
		)
		.groupBy(sql`TO_CHAR(${transaksi.waktuKeluar}, 'HH24:00')`)
		.orderBy(sql`MIN(${transaksi.waktuKeluar})`);

	return result.map((r) => ({
		name: r.hour,
		revenue: parseFloat(r.revenue),
	}));
};
