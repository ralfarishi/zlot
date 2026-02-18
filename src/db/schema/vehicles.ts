import { pgTable, text, timestamp, bigint, uuid, index } from "drizzle-orm/pg-core";
import { vehicleTypeEnum } from "./enums";
import { profiles } from "./profiles";

export const vehicles = pgTable(
	"vehicles",
	{
		id: bigint("id", { mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
		plateNumber: text("plate_number").unique().notNull(),
		vehicleType: vehicleTypeEnum("vehicle_type").notNull(),
		color: text("color"),
		ownerName: text("owner_name"),
		profileId: uuid("profile_id")
			.references(() => profiles.id)
			.notNull(), // Registering user
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
		deletedAt: timestamp("deleted_at", { withTimezone: true }),
	},
	(table) => [index("plate_number_idx").on(table.plateNumber)],
);
