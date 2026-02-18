import { pgTable, text, timestamp, bigint, integer } from "drizzle-orm/pg-core";

export const parkingAreas = pgTable("parking_areas", {
	id: bigint("id", { mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
	areaName: text("area_name").notNull(),
	capacity: integer("capacity").notNull(),
	occupied: integer("occupied").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
