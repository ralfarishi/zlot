import { pgTable, text, timestamp, bigint, uuid, index } from "drizzle-orm/pg-core";
import { profil } from "./profiles";

export const logAktifitas = pgTable(
	"log_aktifitas",
	{
		id: bigint("id", { mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
		idPetugas: uuid("id_petugas")
			.references(() => profil.id)
			.notNull(),
		aktifitas: text("aktifitas").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("activity_profile_id_idx").on(table.idPetugas),
		index("activity_created_at_idx").on(table.createdAt),
	],
);
