import { z } from "zod";
import { transactionStatusEnum, paymentMethodEnum } from "../schema/enums";

export const createMasukSchema = z.object({
	idKendaraan: z.string().refine((val) => !isNaN(Number(val)), "Invalid vehicle ID"),
	waktuMasuk: z.date().refine((date) => date <= new Date(), "Entry time cannot be in the future"),
	idTarif: z.string().refine((val) => !isNaN(Number(val)), "Invalid rate ID"),
	idPetugas: z.string().uuid(),
	idArea: z.string().refine((val) => !isNaN(Number(val)), "Invalid area ID"),
});

export const createKeluarSchema = z.object({
	waktuKeluar: z.date().refine((date) => date <= new Date(), "Exit time cannot be in the future"),
	metodePembayaran: z.enum(paymentMethodEnum.enumValues),
	uangDiterima: z.string().optional().nullable(),
	kembalian: z.string().optional().nullable(),
});

export const transaksiSchema = z.object({
	id: z.string().optional(),
	idKendaraan: z.string(),
	noTransaksi: z.string().optional(),
	waktuMasuk: z.date(),
	waktuKeluar: z.date().optional().nullable(),
	idTarif: z.string(),
	durasiJam: z.string().optional().nullable(),
	totalBiaya: z.string().optional().nullable(),
	metodePembayaran: z.enum(paymentMethodEnum.enumValues).optional().nullable(),
	uangDiterima: z.string().optional().nullable(),
	kembalian: z.string().optional().nullable(),
	status: z.enum(transactionStatusEnum.enumValues),
	idPetugas: z.string(),
	idArea: z.string(),
});

export type CreateMasuk = z.infer<typeof createMasukSchema>;
export type CreateKeluar = z.infer<typeof createKeluarSchema>;
export type Transaksi = z.infer<typeof transaksiSchema>;
