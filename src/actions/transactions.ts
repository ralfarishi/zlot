"use server";

import { db } from "@/src/db";
import { transactions, vehicles, parkingAreas, rates } from "@/src/db/schema";
import { requireAuth, requireRole } from "@/src/lib/auth-guard";
import { logActivity } from "./activity-logs";
import { eq, and, isNull, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const logEntrySchema = z.object({
	plateNumber: z.string().min(3).max(20),
	vehicleType: z.enum(["motorcycle", "car", "other"]),
	areaId: z.number(),
	color: z.string().optional().nullable(),
	ownerName: z.string().optional().nullable(),
});

const logExitSchema = z.object({
	transactionId: z.string().min(1),
	paymentMethod: z.enum(["QRIS", "CASH"]),
	cashReceived: z.string().optional().nullable(),
	cashChange: z.string().optional().nullable(),
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
	const plateUpper = data.plateNumber.toUpperCase();

	return await db.transaction(async (tx) => {
		// 1. Check if vehicle already in an active transaction
		const activeTx = await tx.query.transactions.findFirst({
			where: and(
				isNull(transactions.exitTime),
				eq(transactions.status, "entered"),
				sql`${transactions.vehicleId} IN (SELECT id FROM ${vehicles} WHERE plate_number = ${plateUpper})`,
			),
		});

		if (activeTx) {
			throw new Error("Vehicle is already registered inside the facility.");
		}

		// 2. Ensure vehicle exists or create it
		let vehicleRecord = await tx.query.vehicles.findFirst({
			where: eq(vehicles.plateNumber, plateUpper),
		});

		if (!vehicleRecord) {
			const [newVehicle] = await tx
				.insert(vehicles)
				.values({
					plateNumber: plateUpper,
					vehicleType: data.vehicleType,
					color: data.color || null,
					ownerName: data.ownerName || null,
					profileId: user.id,
				})
				.returning();
			vehicleRecord = newVehicle;
		}

		// 3. Get appropriate rate
		const rateRecord = await tx.query.rates.findFirst({
			where: eq(rates.vehicleType, data.vehicleType),
		});

		if (!rateRecord) {
			throw new Error(`No rate configuration found for vehicle type: ${data.vehicleType}`);
		}

		// 4. Create Transaction
		const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, "");
		const { nanoid } = await import("nanoid");
		const transactionNumber = `ZLT-${datePrefix}-${nanoid(6).toUpperCase()}`;

		const [newTx] = await tx
			.insert(transactions)
			.values({
				vehicleId: vehicleRecord.id,
				transactionNumber,
				areaId: BigInt(data.areaId),
				rateId: rateRecord.id,
				profileId: user.id,
				entryTime: new Date(),
				status: "entered",
			})
			.returning();

		// 5. Update Area Occupancy
		await tx
			.update(parkingAreas)
			.set({
				occupied: sql`${parkingAreas.occupied} + 1`,
				updatedAt: new Date(),
			})
			.where(eq(parkingAreas.id, BigInt(data.areaId)));

		await logActivity(`Log: Vehicle ENTRY [${plateUpper}] in Area ${data.areaId}`);

		revalidatePath("/dashboard/parking", "layout");

		return newTx;
	});
};

/**
 * LOG VEHICLE EXIT
 */
export const logExit = async (
	transactionId: string,
	paymentMethod: "QRIS" | "CASH",
	cashReceived?: string,
	cashChange?: string,
) => {
	await requireAuth();

	const validation = logExitSchema.safeParse({
		transactionId,
		paymentMethod,
		cashReceived,
		cashChange,
	});

	if (!validation.success) {
		throw new Error(
			`Invalid exit input: ${JSON.stringify(validation.error.flatten().fieldErrors)}`,
		);
	}

	return await db.transaction(async (tx) => {
		// 1. Fetch Transaction & Vehicle Details
		const currentTx = await tx.query.transactions.findFirst({
			where: eq(transactions.id, BigInt(transactionId)),
			with: {
				vehicle: true,
				rate: true,
				employee: true,
			},
		});

		if (!currentTx || currentTx.exitTime) {
			throw new Error("Transaction not found or vehicle already exited.");
		}

		// 2. Calculate Fee
		const exitTime = new Date();
		const diffMs = exitTime.getTime() - currentTx.entryTime.getTime();
		const diffHrs = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60))); // Min 1 hour
		const totalCost = (diffHrs * Number(currentTx.rate.hourlyRate)).toString();

		// 3. Update Transaction
		const [updatedTx] = await tx
			.update(transactions)
			.set({
				exitTime,
				durationHours: diffHrs.toString(),
				totalCost,
				paymentMethod,
				cashReceived: cashReceived || null,
				cashChange: cashChange || null,
				status: "exited",
				updatedAt: new Date(),
			})
			.where(eq(transactions.id, BigInt(transactionId)))
			.returning();

		// 4. Update Area Occupancy
		await tx
			.update(parkingAreas)
			.set({
				occupied: sql`${parkingAreas.occupied} - 1`,
				updatedAt: new Date(),
			})
			.where(eq(parkingAreas.id, currentTx.areaId));

		await logActivity(
			`Log: Vehicle EXIT [${currentTx.vehicle.plateNumber}] - Fee: $${totalCost} (${paymentMethod})`,
		);

		revalidatePath("/dashboard/parking", "layout");

		return {
			...updatedTx,
			vehicle: currentTx.vehicle,
			rate: currentTx.rate,
			employee: currentTx.employee,
		};
	});
};

/**
 * DELETE TRANSACTION
 */
export const deleteTransaction = async (id: string) => {
	await requireRole(["admin", "owner"]);

	// 1. Fetch transaction to get plate for logging
	const tx = await db.query.transactions.findFirst({
		where: eq(transactions.id, BigInt(id)),
		with: { vehicle: true },
	});

	if (!tx) throw new Error("Transaction not found.");

	// 2. Delete
	await db.delete(transactions).where(eq(transactions.id, BigInt(id)));

	// 3. Log
	await logActivity(
		`Deleted transaction ${tx.transactionNumber || tx.id.toString()} for vehicle [${tx.vehicle.plateNumber}]`,
	);

	revalidatePath("/dashboard/parking", "layout");
};

/**
 * GET ACTIVE TRANSACTIONS
 */
export const getActiveTransactions = async () => {
	await requireAuth();
	return await db.query.transactions.findMany({
		where: isNull(transactions.exitTime),
		with: {
			vehicle: true,
			area: true,
			rate: true,
			employee: true,
		},
		orderBy: [desc(transactions.entryTime)],
	});
};

/**
 * SEARCH ACTIVE VEHICLE BY PLATE
 */
export const findActiveTransactionByPlate = async (plate: string) => {
	await requireAuth();
	return await db.query.transactions.findFirst({
		where: and(
			isNull(transactions.exitTime),
			sql`${transactions.vehicleId} IN (SELECT id FROM ${vehicles} WHERE plate_number = ${plate.toUpperCase()})`,
		),
		with: {
			vehicle: true,
			area: true,
			rate: true,
			employee: true,
		},
	});
};
/**
 * GET ALL TRANSACTIONS (History)
 */
export const getAllTransactions = async () => {
	await requireAuth();
	return await db.query.transactions.findMany({
		with: {
			vehicle: true,
			area: true,
			rate: true,
			employee: true,
		},
		orderBy: [desc(transactions.entryTime)],
	});
};

/**
 * ANALYTICS: Get summary stats for today
 */
export const getAnalyticsStats = async () => {
	await requireRole(["admin", "owner"]);

	const todayStart = new Date();
	todayStart.setHours(0, 0, 0, 0);

	const yesterdayStart = new Date(todayStart);
	yesterdayStart.setDate(yesterdayStart.getDate() - 1);

	// Today's revenue (completed transactions)
	const todayRevenue = await db
		.select({ total: sql<string>`COALESCE(SUM(${transactions.totalCost}), 0)` })
		.from(transactions)
		.where(
			and(
				eq(transactions.status, "exited"),
				sql`${transactions.exitTime} >= ${todayStart.toISOString()}`,
			),
		);

	// Yesterday revenue for comparison
	const yesterdayRevenue = await db
		.select({ total: sql<string>`COALESCE(SUM(${transactions.totalCost}), 0)` })
		.from(transactions)
		.where(
			and(
				eq(transactions.status, "exited"),
				sql`${transactions.exitTime} >= ${yesterdayStart.toISOString()}`,
				sql`${transactions.exitTime} < ${todayStart.toISOString()}`,
			),
		);

	// Active vehicles
	const activeCount = await db
		.select({ count: sql<number>`COUNT(*)::int` })
		.from(transactions)
		.where(isNull(transactions.exitTime));

	// Occupancy rate (sum occupied / sum capacity)
	const occupancyResult = await db
		.select({
			totalOccupied: sql<number>`COALESCE(SUM(${parkingAreas.occupied}), 0)::int`,
			totalCapacity: sql<number>`COALESCE(SUM(${parkingAreas.capacity}), 0)::int`,
		})
		.from(parkingAreas)
		.where(isNull(parkingAreas.deletedAt));

	// Peak hour today (hour with most entries)
	const peakHourResult = await db
		.select({
			hour: sql<number>`EXTRACT(HOUR FROM ${transactions.entryTime})::int`,
			count: sql<number>`COUNT(*)::int`,
		})
		.from(transactions)
		.where(sql`${transactions.entryTime} >= ${todayStart.toISOString()}`)
		.groupBy(sql`EXTRACT(HOUR FROM ${transactions.entryTime})`)
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
	await requireRole(["admin", "owner"]);

	const since = new Date();
	since.setDate(since.getDate() - days);
	since.setHours(0, 0, 0, 0);

	const result = await db
		.select({
			day: sql<string>`TO_CHAR(${transactions.exitTime}, 'Dy')`,
			date: sql<string>`TO_CHAR(${transactions.exitTime}, 'YYYY-MM-DD')`,
			revenue: sql<string>`COALESCE(SUM(${transactions.totalCost}), 0)`,
		})
		.from(transactions)
		.where(
			and(
				eq(transactions.status, "exited"),
				sql`${transactions.exitTime} >= ${since.toISOString()}`,
			),
		)
		.groupBy(
			sql`TO_CHAR(${transactions.exitTime}, 'Dy')`,
			sql`TO_CHAR(${transactions.exitTime}, 'YYYY-MM-DD')`,
		)
		.orderBy(sql`TO_CHAR(${transactions.exitTime}, 'YYYY-MM-DD')`);

	return result.map((r) => ({
		name: r.day,
		revenue: parseFloat(r.revenue),
	}));
};

/**
 * ANALYTICS: Occupancy by area
 */
export const getOccupancyByArea = async () => {
	await requireRole(["admin", "owner"]);

	const areas = await db.query.parkingAreas.findMany({
		where: isNull(parkingAreas.deletedAt),
	});

	return areas.map((a) => ({
		name: a.areaName,
		value: a.occupied,
		capacity: a.capacity,
	}));
};

/**
 * REPORTS: Recent completed transactions
 */
export const getRecentCompletedTransactions = async (limit = 20) => {
	await requireAuth();

	return await db.query.transactions.findMany({
		where: eq(transactions.status, "exited"),
		with: {
			vehicle: true,
			area: true,
			rate: true,
			employee: true,
		},
		orderBy: [desc(transactions.exitTime)],
		limit,
	});
};
