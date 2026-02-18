import { describe, it, expect } from "vitest";
import { calculateParkingCost } from "@/src/lib/cost-calculator";

describe("calculateParkingCost", () => {
	const hourlyRate = 5000;

	it("calculates 0 cost for 0 minutes", () => {
		const entry = new Date("2024-01-01T10:00:00Z");
		const exit = new Date("2024-01-01T10:00:00Z");
		const result = calculateParkingCost(entry, exit, hourlyRate);
		expect(result.durationHours).toBe(0);
		expect(result.totalCost).toBe(0);
	});

	it("rounds up 1 minute to 1 hour", () => {
		const entry = new Date("2024-01-01T10:00:00Z");
		const exit = new Date("2024-01-01T10:01:00Z");
		const result = calculateParkingCost(entry, exit, hourlyRate);
		expect(result.durationHours).toBe(1);
		expect(result.totalCost).toBe(hourlyRate);
	});

	it("calculates exact 1 hour correctly", () => {
		const entry = new Date("2024-01-01T10:00:00Z");
		const exit = new Date("2024-01-01T11:00:00Z");
		const result = calculateParkingCost(entry, exit, hourlyRate);
		expect(result.durationHours).toBe(1);
		expect(result.totalCost).toBe(hourlyRate);
	});

	it("rounds 61 minutes to 2 hours", () => {
		const entry = new Date("2024-01-01T10:00:00Z");
		const exit = new Date("2024-01-01T11:01:00Z");
		const result = calculateParkingCost(entry, exit, hourlyRate);
		expect(result.durationHours).toBe(2);
		expect(result.totalCost).toBe(hourlyRate * 2);
	});

	it("handles midnight crossing", () => {
		const entry = new Date("2024-01-01T23:00:00Z");
		const exit = new Date("2024-01-02T01:00:00Z");
		const result = calculateParkingCost(entry, exit, hourlyRate);
		expect(result.durationHours).toBe(2);
		expect(result.totalCost).toBe(hourlyRate * 2);
	});

	it("handles multi-day parking", () => {
		const entry = new Date("2024-01-01T10:00:00Z");
		const exit = new Date("2024-01-03T10:00:00Z"); // 48 hours
		const result = calculateParkingCost(entry, exit, hourlyRate);
		expect(result.durationHours).toBe(48);
		expect(result.totalCost).toBe(hourlyRate * 48);
	});

	it("throws error for negative rate", () => {
		const entry = new Date();
		const exit = new Date();
		expect(() => calculateParkingCost(entry, exit, -100)).toThrow("Hourly rate cannot be negative");
	});

	it("throws error for exit before entry", () => {
		const entry = new Date("2024-01-01T11:00:00Z");
		const exit = new Date("2024-01-01T10:00:00Z");
		expect(() => calculateParkingCost(entry, exit, hourlyRate)).toThrow(
			"Exit time cannot be before entry time",
		);
	});
});
