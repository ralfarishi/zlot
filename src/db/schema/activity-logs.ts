import { pgTable, text, timestamp, bigint, uuid, index } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";

export const activityLogs = pgTable(
	"activity_logs",
	{
		id: bigint("id", { mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
		profileId: uuid("profile_id")
			.references(() => profiles.id)
			.notNull(),
		activity: text("activity").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("activity_profile_id_idx").on(table.profileId),
		index("activity_created_at_idx").on(table.createdAt),
	],
);
