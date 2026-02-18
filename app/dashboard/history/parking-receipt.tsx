"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, X } from "@phosphor-icons/react/dist/ssr";
import { formatIDR, formatLongDuration } from "@/lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";

export interface ReceiptData {
	id: string;
	transactionNumber?: string | null;
	plateNumber: string;
	vehicleType: string;
	areaName: string;
	entryTime: Date;
	exitTime: Date | null;
	durationHours: string | null;
	totalCost: string | null;
	hourlyRate?: string | null;
	paymentMethod?: string | null;
	cashReceived?: string | null;
	cashChange?: string | null;
	staffName?: string | null;
}

interface ParkingReceiptProps {
	data: ReceiptData;
	onClose?: () => void;
}

export const ParkingReceipt = ({ data, onClose }: ParkingReceiptProps) => {
	const printRef = useRef<HTMLDivElement>(null);

	const handlePrint = useReactToPrint({
		contentRef: printRef,
		documentTitle: `Zlot-Receipt-TX${data.id}`,
	});

	const entryFormatted = format(new Date(data.entryTime), "dd MMM yyyy, HH:mm");
	const exitFormatted = data.exitTime
		? format(new Date(data.exitTime), "dd MMM yyyy, HH:mm")
		: null;
	const total = data.totalCost ? formatIDR(data.totalCost) : formatIDR(0);
	const rate = data.hourlyRate ? `${formatIDR(data.hourlyRate)}/hr` : null;
	const duration = formatLongDuration(data.entryTime, data.exitTime);

	return (
		<motion.div
			initial={{ opacity: 0, height: 0 }}
			animate={{ opacity: 1, height: "auto" }}
			exit={{ opacity: 0, height: 0 }}
			className="overflow-hidden"
		>
			<div className="mx-(--space-md) mb-(--space-md) mt-(--space-md) rounded-xl border border-border bg-surface-elevated p-(--space-lg) shadow-sm">
				{/* Header with actions */}
				<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
					<div className="flex items-center gap-3">
						<div className="flex flex-col">
							<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40 leading-none mb-1">
								Transaction Ref
							</p>
							<p className="font-mono text-base font-black text-primary leading-none">
								{data.transactionNumber || `TX-${data.id}`}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={() => handlePrint()}
							className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-[10px] font-black uppercase tracking-widest text-text-secondary transition-all hover:bg-surface-elevated hover:text-text-primary active:scale-95 shadow-sm"
						>
							<Printer size={14} weight="bold" />
							Print
						</button>
						{onClose && (
							<button
								onClick={onClose}
								className="flex size-10 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary transition-all hover:bg-danger/10 hover:text-danger active:scale-95 shadow-sm"
							>
								<X size={16} weight="bold" />
							</button>
						)}
					</div>
				</div>

				{/* Inline preview (visible on screen) */}
				<div className="grid grid-cols-2 gap-x-8 gap-y-5 text-sm">
					<div className="space-y-1">
						<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
							Vehicle
						</p>
						<p className="font-black text-text-primary uppercase tracking-tight text-base leading-none">
							{data.plateNumber}
						</p>
						<p className="text-[10px] font-bold text-text-secondary/40 uppercase">
							{data.vehicleType}
						</p>
					</div>
					<div className="space-y-1">
						<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
							Zone
						</p>
						<p className="font-black text-text-primary uppercase tracking-tight text-base leading-none">
							{data.areaName}
						</p>
					</div>
					<div className="space-y-1">
						<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
							Entry
						</p>
						<p className="font-bold text-text-primary">{entryFormatted}</p>
					</div>
					<div className="space-y-1">
						<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
							Exit
						</p>
						<p className="font-bold text-text-primary">
							{exitFormatted ?? <span className="text-success animate-pulse">Active</span>}
						</p>
					</div>
					{rate && (
						<div className="space-y-1">
							<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
								Rate
							</p>
							<p className="font-bold text-text-primary">{rate}</p>
						</div>
					)}
					{duration && (
						<div className="space-y-1">
							<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
								Duration
							</p>
							<p className="font-bold text-text-primary font-mono">{duration}</p>
						</div>
					)}
					{data.paymentMethod && (
						<div className="space-y-1">
							<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
								Paid Via
							</p>
							<p className="font-black text-text-primary uppercase tracking-tight">
								{data.paymentMethod}
							</p>
						</div>
					)}
					{data.staffName && (
						<div className="space-y-1">
							<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
								Duty Staff
							</p>
							<p className="font-bold text-text-primary uppercase tracking-tight">
								{data.staffName}
							</p>
						</div>
					)}
					{data.paymentMethod === "CASH" && data.cashReceived && (
						<>
							<div className="space-y-1">
								<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
									Received
								</p>
								<p className="font-bold text-text-primary">{formatIDR(data.cashReceived)}</p>
							</div>
							<div className="space-y-1">
								<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
									Change
								</p>
								<p className="font-bold text-success">{formatIDR(data.cashChange || 0)}</p>
							</div>
						</>
					)}
				</div>

				<div className="mt-8 flex items-center justify-between rounded-xl bg-surface p-4 ring-1 ring-border shadow-inner">
					<span className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60">
						Total Bill
					</span>
					<span className="text-2xl font-black tracking-tighter text-text-primary">{total}</span>
				</div>
			</div>

			{/* Printable receipt (Optimized for 80mm Thermal Paper) */}
			<div className="hidden">
				<div
					ref={printRef}
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

					<div style={{ textAlign: "center", marginBottom: "15px" }}>
						<h2
							style={{
								fontSize: "24px",
								fontWeight: "900",
								margin: "0 0 5px 0",
								letterSpacing: "2px",
							}}
						>
							ZLOT
						</h2>
						<p style={{ fontSize: "10px", margin: "0", letterSpacing: "1px", fontWeight: "bold" }}>
							OFFICIAL PARKING RECEIPT
						</p>
					</div>

					<p
						style={{ textAlign: "center", fontSize: "11px", margin: "10px 0", fontWeight: "bold" }}
					>
						{data.transactionNumber || `TX-${data.id}`}
					</p>

					<div style={{ borderTop: "1px dashed black", margin: "10px 0" }}></div>

					<div style={{ fontSize: "12px" }}>
						{data.staffName && (
							<div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
								<span>STAFF:</span>
								<span style={{ fontWeight: "bold" }}>{data.staffName}</span>
							</div>
						)}
						<div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
							<span>PLATE:</span>
							<span style={{ fontWeight: "bold" }}>{data.plateNumber}</span>
						</div>
						<div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
							<span>TYPE:</span>
							<span style={{ fontWeight: "bold" }}>{data.vehicleType}</span>
						</div>
						<div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
							<span>ZONE:</span>
							<span style={{ fontWeight: "bold" }}>{data.areaName}</span>
						</div>
					</div>

					<div style={{ borderTop: "1px dashed black", margin: "10px 0" }}></div>

					<div style={{ fontSize: "12px" }}>
						<div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
							<span>ENTRY:</span>
							<span>{entryFormatted}</span>
						</div>
						<div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
							<span>EXIT:</span>
							<span>{exitFormatted ?? "-"}</span>
						</div>
						{duration && (
							<div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
								<span>DURATION:</span>
								<span style={{ fontWeight: "bold" }}>{duration}</span>
							</div>
						)}
						{rate && (
							<div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
								<span>RATE:</span>
								<span>{rate}</span>
							</div>
						)}
						{data.paymentMethod && (
							<div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
								<span>METHOD:</span>
								<span style={{ fontWeight: "bold" }}>{data.paymentMethod}</span>
							</div>
						)}
					</div>

					<div style={{ borderTop: "1px dashed black", margin: "10px 0" }}></div>

					{data.paymentMethod === "CASH" && data.cashReceived && (
						<div style={{ fontSize: "12px", marginBottom: "10px" }}>
							<div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
								<span>RECEIVED:</span>
								<span>{formatIDR(data.cashReceived)}</span>
							</div>
							<div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
								<span>CHANGE:</span>
								<span style={{ fontWeight: "bold" }}>{formatIDR(data.cashChange || 0)}</span>
							</div>
							<div style={{ borderTop: "1px dashed black", margin: "10px 0" }}></div>
						</div>
					)}

					<div style={{ textAlign: "center", margin: "10px 0" }}>
						<p style={{ margin: "0", fontSize: "12px", fontWeight: "bold" }}>TOTAL AMOUNT</p>
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
							PLEASE KEEP THIS RECEIPT
						</p>
					</div>

					<div style={{ textAlign: "center", marginTop: "15px" }}>
						<p style={{ fontSize: "10px", margin: "0" }}>Thank you for using Zlot</p>
						<p style={{ fontSize: "9px", margin: "5px 0 0 0", fontStyle: "italic" }}>
							{new Date().toLocaleString("id-ID")}
						</p>
					</div>
				</div>
			</div>
		</motion.div>
	);
};
