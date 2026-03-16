import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { transaksi } from "./schema/transactions";
import { kendaraan } from "./schema/vehicles";
import { areaParkir } from "./schema/parking-areas";

import { eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

const DATABASE_URL = process.env.DATABASE_URL!;

const PROFILE_IDS = [
	"78a0a7b9-4914-4baf-a66b-7c54386031f5",
	"f95918c8-378a-4339-9d90-e036967d20c1",
];

const AREA_IDS = [1, 2, 3];
const RATE_IDS = [1, 2, 3];

const generatePlateNumber = () => {
	const prefixes = ["B", "D", "F", "H", "L", "N", "S", "DD"];
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
			const platNomor = generatePlateNumber();
			const profileId = getRandomItem(PROFILE_IDS);
			const rateId = getRandomItem(RATE_IDS);

			// We need to pick a vehicle type consistent with the rate if we were being strict,
			// but here the user said rate id 1-3.
			// I'll just pick a random type for the vehicle.
			const vehicleTypes = ["mobil", "motor", "lainnya"] as const;
			const jenisKendaraan = getRandomItem([...vehicleTypes]);

			await db.transaction(async (tx) => {
				// 1. Create/Ensure Vehicle
				const [vehicle] = await tx
					.insert(kendaraan)
					.values({
						platNomor,
						jenisKendaraan,
						idPetugas: profileId,
					})
					.onConflictDoUpdate({
						target: kendaraan.platNomor,
						set: { updatedAt: new Date() },
					})
					.returning();

				// 2. Create Transaction
				const waktuMasuk = generateRandomPastTime();
				const datePrefix = waktuMasuk.toISOString().slice(0, 10).replace(/-/g, "");
				const noTransaksi = `ZLT-${datePrefix}-${nanoid(6).toUpperCase()}`;

				await tx.insert(transaksi).values({
					idKendaraan: vehicle.id,
					noTransaksi,
					idArea: BigInt(areaId),
					idTarif: BigInt(rateId),
					idPetugas: profileId,
					waktuMasuk,
					status: "masuk",
				});

				// 3. Increment Occupancy
				await tx
					.update(areaParkir)
					.set({
						terisi: sql`${areaParkir.terisi} + 1`,
						updatedAt: new Date(),
					})
					.where(eq(areaParkir.id, BigInt(areaId)));
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
