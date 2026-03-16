import { pgTable, timestamp, bigint, numeric } from "drizzle-orm/pg-core";
import { vehicleTypeEnum } from "./enums";

export const tarif = pgTable("tarif", {
	id: bigint("id", { mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
	jenisKendaraan: vehicleTypeEnum("jenis_kendaraan").unique().notNull(),
	tarifPerJam: numeric("tarif_per_jam", { precision: 12, scale: 2 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
