import { pgTable, text, timestamp, bigint, uuid, index } from "drizzle-orm/pg-core";
import { vehicleTypeEnum } from "./enums";
import { profil } from "./profiles";

export const kendaraan = pgTable(
	"kendaraan",
	{
		id: bigint("id", { mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
		platNomor: text("plat_nomor").unique().notNull(),
		jenisKendaraan: vehicleTypeEnum("jenis_kendaraan").notNull(),
		warna: text("warna"),
		namaPemilik: text("nama_pemilik"),
		idPetugas: uuid("id_petugas")
			.references(() => profil.id)
			.notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
		deletedAt: timestamp("deleted_at", { withTimezone: true }),
	},
	(table) => [index("plat_nomor_idx").on(table.platNomor)],
);
