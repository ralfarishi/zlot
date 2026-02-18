import { describe, it, expect } from "vitest";
import { insertRateSchema } from "@/src/db/validations/rates";

describe("rates validation", () => {
	it("accepts valid rate", () => {
		const data = {
			vehicleType: "motorcycle",
			hourlyRate: "2000",
		};
		expect(insertRateSchema.parse(data)).toEqual(data);
	});

	it("fails for zero rate", () => {
		const data = {
			vehicleType: "car",
			hourlyRate: "0",
		};
		expect(() => insertRateSchema.parse(data)).toThrow("Hourly rate must be a positive number");
	});

	it("fails for negative rate", () => {
		const data = {
			vehicleType: "car",
			hourlyRate: "-5000",
		};
		expect(() => insertRateSchema.parse(data)).toThrow();
	});

	it("fails for non-numeric rate", () => {
		const data = {
			vehicleType: "car",
			hourlyRate: "abc",
		};
		expect(() => insertRateSchema.parse(data)).toThrow();
	});
});
