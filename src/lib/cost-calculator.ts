import { differenceInMinutes } from "date-fns";

/**
 * Calculates the total parking cost.
 * Partial hours are rounded up.
 * Minimum 1 hour charge if entry/exit are different.
 */
export function calculateParkingCost(
	entryTime: Date,
	exitTime: Date,
	hourlyRate: number,
): {
	durationHours: number;
	totalCost: number;
} {
	if (hourlyRate < 0) throw new Error("Hourly rate cannot be negative");
	if (exitTime < entryTime) throw new Error("Exit time cannot be before entry time");

	const diffInMinutes = differenceInMinutes(exitTime, entryTime);

	if (diffInMinutes === 0) {
		return { durationHours: 0, totalCost: 0 };
	}

	// Round up to nearest hour
	const durationHours = Math.ceil(diffInMinutes / 60);
	const totalCost = durationHours * hourlyRate;

	return {
		durationHours,
		totalCost,
	};
}
