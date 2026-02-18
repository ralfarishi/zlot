import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { userRoleEnum } from "./enums";

export const profiles = pgTable("profiles", {
	id: uuid("id").primaryKey().notNull(), // Links to auth.users
	fullName: text("full_name").notNull(),
	role: userRoleEnum("role").default("employee").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
