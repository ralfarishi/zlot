import { describe, it, expect } from "vitest";
import { createEntrySchema, createExitSchema } from "@/src/db/validations/transactions";

describe("transactions validation", () => {
	it("accepts valid entry", () => {
		const data = {
			vehicleId: "1",
			entryTime: new Date("2024-01-01T10:00:00Z"),
			rateId: "1",
			profileId: "550e8400-e29b-41d4-a716-446655440000",
			areaId: "1",
		};
		expect(createEntrySchema.parse(data)).toEqual(data);
	});

	it("fails for future entry time", () => {
		const futureDate = new Date();
		futureDate.setHours(futureDate.getHours() + 1);
		const data = {
			vehicleId: "1",
			entryTime: futureDate,
			rateId: "1",
			profileId: "550e8400-e29b-41d4-a716-446655440000",
			areaId: "1",
		};
		expect(() => createEntrySchema.parse(data)).toThrow("Entry time cannot be in the future");
	});

	it("accepts valid exit", () => {
		const data = {
			exitTime: new Date(),
		};
		expect(createExitSchema.parse(data)).toEqual(data);
	});
});
