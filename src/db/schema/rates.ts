import { pgTable, timestamp, bigint, numeric } from "drizzle-orm/pg-core";
import { vehicleTypeEnum } from "./enums";

export const rates = pgTable("rates", {
	id: bigint("id", { mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
	vehicleType: vehicleTypeEnum("vehicle_type").unique().notNull(),
	hourlyRate: numeric("hourly_rate", { precision: 12, scale: 2 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
