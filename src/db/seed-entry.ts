import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { transactions } from "./schema/transactions";
import { vehicles } from "./schema/vehicles";
import { parkingAreas } from "./schema/parking-areas";
import { rates } from "./schema/rates";
import { eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

const DATABASE_URL = process.env.DATABASE_URL!;

const PROFILE_IDS = [
	"c7f760a7-a037-4a28-9e09-e0e9bb4098a1",
	"d9171eff-72a1-48f3-b244-ad75526201ed",
];

const AREA_IDS = [1, 2, 3];
const RATE_IDS = [1, 2, 3];

const generatePlateNumber = () => {
	const prefixes = ["B", "D", "F", "H", "L", "N", "S", "W"];
	const suffixes = ["ABC", "XYZ", "KJS", "PLO", "QWE", "RTY", "UIO", "PAS", "DFG", "HJK"];
	const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
	const number = Math.floor(Math.random() * 8999) + 1000;
	const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
	return `${prefix}${number}${suffix}`;
};

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateRandomPastTime = () => {
	const now = new Date();
	const hoursBack = Math.floor(Math.random() * 24); // Within last 24 hours
	const minutesBack = Math.floor(Math.random() * 60);
	return new Date(now.getTime() - hoursBack * 60 * 60 * 1000 - minutesBack * 60 * 1000);
};

const seedEntries = async () => {
	if (!DATABASE_URL) {
		console.error("DATABASE_URL is not set");
		process.exit(1);
	}

	const client = postgres(DATABASE_URL, { prepare: false });
	const db = drizzle(client);

	console.log("Starting transactional seed for parking entries...\n");

	for (const areaId of AREA_IDS) {
		const count = Math.floor(Math.random() * 6) + 5; // 5 to 10
		console.log(`Generating ${count} entries for Area ID ${areaId}...`);

		for (let i = 0; i < count; i++) {
			const plateNumber = generatePlateNumber();
			const profileId = getRandomItem(PROFILE_IDS);
			const rateId = getRandomItem(RATE_IDS);

			// We need to pick a vehicle type consistent with the rate if we were being strict,
			// but here the user said rate id 1-3.
			// I'll just pick a random type for the vehicle.
			const vehicleTypes = ["car", "motorcycle", "other"] as const;
			const vehicleType = getRandomItem([...vehicleTypes]);

			await db.transaction(async (tx) => {
				// 1. Create/Ensure Vehicle
				let [vehicle] = await tx
					.insert(vehicles)
					.values({
						plateNumber,
						vehicleType,
						profileId,
					})
					.onConflictDoUpdate({
						target: vehicles.plateNumber,
						set: { updatedAt: new Date() },
					})
					.returning();

				// 2. Create Transaction
				const entryTime = generateRandomPastTime();
				const datePrefix = entryTime.toISOString().slice(0, 10).replace(/-/g, "");
				const transactionNumber = `ZLT-${datePrefix}-${nanoid(6).toUpperCase()}`;

				await tx.insert(transactions).values({
					vehicleId: vehicle.id,
					transactionNumber,
					areaId: BigInt(areaId),
					rateId: BigInt(rateId),
					profileId,
					entryTime,
					status: "entered",
				});

				// 3. Increment Occupancy
				await tx
					.update(parkingAreas)
					.set({
						occupied: sql`${parkingAreas.occupied} + 1`,
						updatedAt: new Date(),
					})
					.where(eq(parkingAreas.id, BigInt(areaId)));
			});
		}
	}

	console.log("\nSeed completed successfully!");
	await client.end();
	process.exit(0);
};

seedEntries().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
