import {
	pgTable,
	timestamp,
	bigint,
	uuid,
	numeric,
	index,
	varchar,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { transactionStatusEnum, paymentMethodEnum } from "./enums";
import { vehicles } from "./vehicles";
import { rates } from "./rates";
import { profiles } from "./profiles";
import { parkingAreas } from "./parking-areas";

export const transactions = pgTable(
	"transactions",
	{
		id: bigint("id", { mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
		vehicleId: bigint("vehicle_id", { mode: "bigint" })
			.references(() => vehicles.id)
			.notNull(),
		transactionNumber: varchar("transaction_number", { length: 50 }),
		entryTime: timestamp("entry_time", { withTimezone: true }).notNull(),
		exitTime: timestamp("exit_time", { withTimezone: true }),
		rateId: bigint("rate_id", { mode: "bigint" })
			.references(() => rates.id)
			.notNull(),
		durationHours: numeric("duration_hours", { precision: 10, scale: 2 }),
		totalCost: numeric("total_cost", { precision: 12, scale: 2 }),
		paymentMethod: paymentMethodEnum("payment_method"),
		cashReceived: numeric("cash_received", { precision: 12, scale: 2 }),
		cashChange: numeric("cash_change", { precision: 12, scale: 2 }),
		status: transactionStatusEnum("status").default("entered").notNull(),
		profileId: uuid("profile_id")
			.references(() => profiles.id)
			.notNull(), // Employee on duty
		areaId: bigint("area_id", { mode: "bigint" })
			.references(() => parkingAreas.id)
			.notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("transaction_status_idx").on(table.status),
		index("transaction_entry_time_idx").on(table.entryTime),
		index("transaction_vehicle_id_idx").on(table.vehicleId),
		index("transaction_profile_id_idx").on(table.profileId),
		index("transaction_area_id_idx").on(table.areaId),
		uniqueIndex("transaction_number_idx").on(table.transactionNumber),
	],
);
