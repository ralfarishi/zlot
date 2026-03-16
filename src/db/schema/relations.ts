import { relations } from "drizzle-orm";
import { profil } from "./profiles";
import { kendaraan } from "./vehicles";
import { tarif } from "./rates";
import { areaParkir } from "./parking-areas";
import { transaksi } from "./transactions";
import { logAktifitas } from "./activity-logs";

export const profilRelations = relations(profil, ({ many }) => ({
	kendaraan: many(kendaraan),
	transaksi: many(transaksi),
	logs: many(logAktifitas),
}));

export const kendaraanRelations = relations(kendaraan, ({ one, many }) => ({
	owner: one(profil, { fields: [kendaraan.idPetugas], references: [profil.id] }),
	transaksi: many(transaksi),
}));

export const tarifRelations = relations(tarif, ({ many }) => ({
	transaksi: many(transaksi),
}));

export const areaParkirRelations = relations(areaParkir, ({ many }) => ({
	transaksi: many(transaksi),
}));

export const transaksiRelations = relations(transaksi, ({ one }) => ({
	kendaraan: one(kendaraan, { fields: [transaksi.idKendaraan], references: [kendaraan.id] }),
	tarif: one(tarif, { fields: [transaksi.idTarif], references: [tarif.id] }),
	petugas: one(profil, { fields: [transaksi.idPetugas], references: [profil.id] }),
	area: one(areaParkir, { fields: [transaksi.idArea], references: [areaParkir.id] }),
}));

export const logAktifitasRelations = relations(logAktifitas, ({ one }) => ({
	petugas: one(profil, { fields: [logAktifitas.idPetugas], references: [profil.id] }),
}));
