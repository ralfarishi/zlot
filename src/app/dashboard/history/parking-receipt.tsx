"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, X } from "@phosphor-icons/react";
import { formatIDR, formatLongDuration } from "@/src/lib/utils";
import { m } from "framer-motion";
import { format } from "date-fns";
import { useLocale } from "@/src/components/providers/locale-provider";

export interface ReceiptData {
	id: string;
	nomorTransaksi: string;
	platNomor: string;
	jenisKendaraan: string;
	namaArea: string;
	waktuMasuk: Date | string;
	waktuKeluar: Date | string | null;
	durasiJam: string | number | null;
	totalBiaya: number | null;
	tarifPerJam: number;
	namaPetugas: string | null;
	metodePembayaran: string | null;
	tunaiDiterima: number | null;
	kembalian: number | null;
}

interface ParkingReceiptProps {
	data: ReceiptData;
	onClose?: () => void;
}

export const ParkingReceipt = ({ data, onClose }: ParkingReceiptProps) => {
	const componentRef = useRef<HTMLDivElement>(null);
	const { t } = useLocale();

	const handlePrint = useReactToPrint({
		contentRef: componentRef,
		documentTitle: `Zlot-Receipt-TX${data.id}`,
	});

	const entryFormatted = format(new Date(data.waktuMasuk), "MMM dd, HH:mm:ss");
	const exitFormatted = data.waktuKeluar
		? format(new Date(data.waktuKeluar), "MMM dd, HH:mm:ss")
		: null;

	const duration = formatLongDuration(data.waktuMasuk, data.waktuKeluar);
	const total = formatIDR(data.totalBiaya ?? 0);
	const rate = formatIDR(data.tarifPerJam);

	return (
		<m.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-surface p-6 shadow-2xl"
		>
			<div className="flex flex-col gap-6">
				<div className="flex items-center justify-between border-b border-border border-dashed pb-4">
					<div className="flex items-center gap-3">
						<div className="flex flex-col">
							<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40 leading-none mb-1">
								{t("history.receipt.ref")}
							</p>
							<p className="font-mono text-base font-black text-primary leading-none">
								{data.nomorTransaksi || `TX-${data.id}`}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={() => handlePrint()}
							className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-[10px] font-black uppercase tracking-widest text-text-secondary transition-all hover:bg-surface-elevated hover:text-text-primary active:scale-95 shadow-sm"
						>
							<Printer size={14} weight="bold" />
							{t("history.receipt.print")}
						</button>
						{onClose && (
							<button
								onClick={onClose}
								className="flex size-9 items-center justify-center rounded-xl bg-surface-elevated text-text-secondary hover:text-text-primary transition-all active:scale-95"
							>
								<X size={18} weight="bold" />
							</button>
						)}
					</div>
				</div>

				<div className="grid grid-cols-2 gap-x-8 gap-y-5 text-sm">
					<div className="space-y-1">
						<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
							{t("history.receipt.vehicle")}
						</p>
						<p className="font-black text-text-primary uppercase tracking-tight text-base leading-none">
							{data.platNomor}
						</p>
						<p className="text-[9px] font-bold text-text-secondary uppercase opacity-40">
							{data.jenisKendaraan}
						</p>
					</div>
					<div className="space-y-1">
						<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
							{t("history.receipt.zone")}
						</p>
						<p className="font-black text-text-primary uppercase tracking-tight text-base leading-none">
							{data.namaArea}
						</p>
					</div>
					<div className="space-y-1">
						<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
							{t("history.receipt.entry")}
						</p>
						<p className="font-bold text-text-primary">{entryFormatted}</p>
					</div>
					<div className="space-y-1">
						<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
							{t("history.receipt.exit")}
						</p>
						<p className="font-bold text-text-primary">
							{exitFormatted ?? (
								<span className="text-success animate-pulse">{t("history.receipt.active")}</span>
							)}
						</p>
					</div>
					{rate && (
						<div className="space-y-1">
							<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
								{t("history.receipt.rate")}
							</p>
							<p className="font-bold text-text-primary">{rate}</p>
						</div>
					)}
					{duration && (
						<div className="space-y-1">
							<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
								{t("history.receipt.duration")}
							</p>
							<p className="font-bold text-text-primary font-mono">{duration}</p>
						</div>
					)}
					{data.metodePembayaran && (
						<div className="space-y-1">
							<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
								{t("history.receipt.paidVia")}
							</p>
							<p className="font-black text-text-primary uppercase tracking-tight">
								{data.metodePembayaran}
							</p>
						</div>
					)}
					{data.namaPetugas && (
						<div className="space-y-1">
							<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
								{t("history.receipt.dutyStaff")}
							</p>
							<p className="font-bold text-text-primary uppercase tracking-tight">
								{data.namaPetugas}
							</p>
						</div>
					)}
					{data.metodePembayaran === "TUNAI" && data.tunaiDiterima && (
						<>
							<div className="space-y-1">
								<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
									{t("history.receipt.received")}
								</p>
								<p className="font-bold text-text-primary">{formatIDR(data.tunaiDiterima)}</p>
							</div>
							<div className="space-y-1">
								<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
									{t("history.receipt.change")}
								</p>
								<p className="font-bold text-success">{formatIDR(data.kembalian || 0)}</p>
							</div>
						</>
					)}
				</div>

				<div className="mt-8 flex items-center justify-between rounded-xl bg-surface p-4 ring-1 ring-border shadow-inner">
					<span className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60">
						{t("history.receipt.totalBill")}
					</span>
					<span className="text-2xl font-black tracking-tighter text-text-primary">{total}</span>
				</div>
			</div>

			{/* Printable receipt (Optimized for 80mm Thermal Paper) */}
			<div className="hidden">
				<div
					ref={componentRef}
					style={{
						width: "80mm",
						padding: "8mm 4mm",
						backgroundColor: "white",
						color: "black",
						fontFamily: "'Courier New', Courier, monospace",
						lineHeight: "1.2",
					}}
				>
					{/* Add a specific style tag for printer settings when this is cloned */}
					<style>{`
						@page { margin: 0; size: auto; }
						@media print {
							body { margin: 0; padding: 0; }
							* { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
						}
					`}</style>

					{/* Receipt Header */}
					<div style={{ textAlign: "center", marginBottom: "15px" }}>
						<p
							style={{
								fontSize: "24px",
								fontWeight: "900",
								margin: "0 0 5px 0",
								letterSpacing: "2px",
							}}
						>
							ZLOT
						</p>
						<p style={{ fontSize: "10px", margin: "0", letterSpacing: "1px", fontWeight: "bold" }}>
							{t("history.receipt.thermalHeader")}
						</p>
					</div>

					<p
						style={{ textAlign: "center", fontSize: "11px", margin: "10px 0", fontWeight: "bold" }}
					>
						{data.nomorTransaksi || `TX-${data.id}`}
					</p>

					<div style={{ borderTop: "1px dashed black", margin: "10px 0" }}></div>

					<div style={{ fontSize: "12px" }}>
						{data.namaPetugas && (
							<div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
								<span>{t("history.receipt.dutyStaff").toUpperCase()}:</span>
								<span style={{ fontWeight: "bold" }}>{data.namaPetugas}</span>
							</div>
						)}
						<div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
							<span>{t("history.receipt.vehicle").toUpperCase()}:</span>
							<span style={{ fontWeight: "bold" }}>{data.platNomor}</span>
						</div>
						<div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
							<span>{t("history.receipt.zone").toUpperCase()}:</span>
							<span style={{ fontWeight: "bold" }}>{data.namaArea}</span>
						</div>
					</div>

					<div style={{ borderTop: "1px dashed black", margin: "10px 0" }}></div>

					<div style={{ fontSize: "12px" }}>
						<div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
							<span>{t("history.receipt.entry").toUpperCase()}:</span>
							<span>{entryFormatted}</span>
						</div>
						<div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
							<span>{t("history.receipt.exit").toUpperCase()}:</span>
							<span>{exitFormatted ?? "-"}</span>
						</div>
						{duration && (
							<div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
								<span>{t("history.receipt.duration").toUpperCase()}:</span>
								<span style={{ fontWeight: "bold" }}>{duration}</span>
							</div>
						)}
						{rate && (
							<div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
								<span>{t("history.receipt.rate").toUpperCase()}:</span>
								<span>{rate}</span>
							</div>
						)}
						{data.metodePembayaran && (
							<div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
								<span>METHOD:</span>
								<span style={{ fontWeight: "bold" }}>{data.metodePembayaran}</span>
							</div>
						)}
					</div>

					<div style={{ borderTop: "1px dashed black", margin: "10px 0" }}></div>

					{data.metodePembayaran === "TUNAI" && data.tunaiDiterima && (
						<div style={{ fontSize: "12px", marginBottom: "10px" }}>
							<div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
								<span>{t("history.receipt.received").toUpperCase()}:</span>
								<span>{formatIDR(data.tunaiDiterima)}</span>
							</div>
							<div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
								<span>{t("history.receipt.change").toUpperCase()}:</span>
								<span style={{ fontWeight: "bold" }}>{formatIDR(data.kembalian || 0)}</span>
							</div>
							<div style={{ borderTop: "1px dashed black", margin: "10px 0" }}></div>
						</div>
					)}

					<div style={{ textAlign: "center", margin: "10px 0" }}>
						<p style={{ margin: "0", fontSize: "12px", fontWeight: "bold" }}>
							{t("history.receipt.totalBill").toUpperCase()}
						</p>
						<p style={{ margin: "5px 0", fontSize: "28px", fontWeight: "900" }}>{total}</p>
					</div>

					<div
						style={{
							borderTop: "2px solid black",
							borderBottom: "2px solid black",
							padding: "5px 0",
							textAlign: "center",
							margin: "15px 0",
						}}
					>
						<p style={{ margin: "0", fontSize: "10px", fontWeight: "bold" }}>
							{t("history.receipt.keepReceipt").toUpperCase()}
						</p>
					</div>

					<div style={{ textAlign: "center", marginTop: "15px" }}>
						<p style={{ fontSize: "10px", margin: "0" }}>{t("history.receipt.thankYou")}</p>
						<p style={{ fontSize: "9px", margin: "5px 0 0 0", fontStyle: "italic" }}>
							{new Date().toLocaleString(t("locale.language") === "en" ? "en-US" : "id-ID")}
						</p>
					</div>
				</div>
			</div>
		</m.div>
	);
};
