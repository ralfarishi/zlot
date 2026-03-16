import { pgTable, text, timestamp, bigint, integer } from "drizzle-orm/pg-core";

export const areaParkir = pgTable("area_parkir", {
	id: bigint("id", { mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
	namaArea: text("nama_area").notNull(),
	kapasitas: integer("kapasitas").notNull(),
	terisi: integer("terisi").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
