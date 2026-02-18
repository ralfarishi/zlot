import { describe, it, expect } from "vitest";
import { insertVehicleSchema } from "@/src/db/validations/vehicles";

describe("vehicles validation", () => {
	it("accepts valid Indonesian-style plate", () => {
		const data = {
			plateNumber: "B 1234 ABC",
			vehicleType: "car",
			color: "Black",
			ownerName: "Alice",
			profileId: "550e8400-e29b-41d4-a716-446655440000",
		};
		expect(insertVehicleSchema.parse(data)).toEqual(data);
	});

	it("fails for invalid plate format", () => {
		const data = {
			plateNumber: "12345",
			vehicleType: "car",
			profileId: "550e8400-e29b-41d4-a716-446655440000",
		};
		expect(() => insertVehicleSchema.parse(data)).toThrow("Invalid plate number format");
	});

	it("fails for missing profileId", () => {
		const data = {
			plateNumber: "B 1234 ABC",
			vehicleType: "motorcycle",
		};
		expect(() => insertVehicleSchema.parse(data)).toThrow();
	});
});
