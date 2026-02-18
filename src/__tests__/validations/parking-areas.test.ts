import { describe, it, expect } from "vitest";
import { insertAreaSchema } from "@/src/db/validations/parking-areas";

describe("parking areas validation", () => {
	it("accepts valid area", () => {
		const data = {
			areaName: "Basement 1",
			capacity: 100,
			occupied: 0,
		};
		expect(insertAreaSchema.parse(data)).toEqual(data);
	});

	it("fails for zero capacity", () => {
		const data = {
			areaName: "Viper",
			capacity: 0,
		};
		expect(() => insertAreaSchema.parse(data)).toThrow();
	});

	it("fails for negative occupied", () => {
		const data = {
			areaName: "Viper",
			capacity: 50,
			occupied: -1,
		};
		expect(() => insertAreaSchema.parse(data)).toThrow();
	});
});
