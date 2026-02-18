import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const idrFormatter = new Intl.NumberFormat("id-ID", {
	style: "currency",
	currency: "IDR",
	minimumFractionDigits: 0,
	maximumFractionDigits: 0,
});

export const formatIDR = (value: number | string): string => {
	const num = typeof value === "string" ? parseFloat(value) : value;
	if (isNaN(num)) return "Rp 0";
	return idrFormatter.format(num);
};

export function formatLongDuration(start: Date | string, end: Date | string | null): string {
	const entry = new Date(start);
	const exit = end ? new Date(end) : new Date();
	const diffMs = exit.getTime() - entry.getTime();

	const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	const hrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

	const parts = [];
	if (days > 0) parts.push(`${days} ${days === 1 ? "day" : "days"}`);
	if (hrs > 0) parts.push(`${hrs} ${hrs === 1 ? "hour" : "hours"}`);
	if (mins > 0 || (days === 0 && hrs === 0)) parts.push(`${mins} ${mins === 1 ? "min" : "mins"}`);

	return parts.join(" ");
}

