import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { userRoleEnum } from "./enums";

export const profil = pgTable("profil", {
	id: uuid("id").primaryKey().notNull(),
	namaLengkap: text("nama_lengkap").notNull(),
	role: userRoleEnum("role").default("petugas").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
