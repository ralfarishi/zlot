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
import { kendaraan } from "./vehicles";
import { tarif } from "./rates";
import { profil } from "./profiles";
import { areaParkir } from "./parking-areas";

export const transaksi = pgTable(
	"transaksi",
	{
		id: bigint("id", { mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
		idKendaraan: bigint("id_kendaraan", { mode: "bigint" })
			.references(() => kendaraan.id)
			.notNull(),
		noTransaksi: varchar("no_transaksi", { length: 50 }),
		waktuMasuk: timestamp("waktu_masuk", { withTimezone: true }).notNull(),
		waktuKeluar: timestamp("waktu_keluar", { withTimezone: true }),
		idTarif: bigint("id_tarif", { mode: "bigint" })
			.references(() => tarif.id)
			.notNull(),
		durasiJam: numeric("durasi_jam", { precision: 10, scale: 2 }),
		totalBiaya: numeric("total_biaya", { precision: 12, scale: 2 }),
		metodePembayaran: paymentMethodEnum("metode_pembayaran"),
		uangDiterima: numeric("uang_diterima", { precision: 12, scale: 2 }),
		kembalian: numeric("kembalian", { precision: 12, scale: 2 }),
		status: transactionStatusEnum("status").default("masuk").notNull(),
		idPetugas: uuid("id_petugas")
			.references(() => profil.id)
			.notNull(),
		idArea: bigint("id_area", { mode: "bigint" })
			.references(() => areaParkir.id)
			.notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("transaction_status_idx").on(table.status),
		index("transaction_entry_time_idx").on(table.waktuMasuk),
		index("transaction_vehicle_id_idx").on(table.idKendaraan),
		index("transaction_profile_id_idx").on(table.idPetugas),
		index("transaction_area_id_idx").on(table.idArea),
		uniqueIndex("transaction_number_idx").on(table.noTransaksi),
	],
);
