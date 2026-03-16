import { describe, it, expect } from "vitest";
import { insertAreaParkirSchema } from "@/src/db/validations/parking-areas";

describe("parking areas validation", () => {
	it("accepts valid area", () => {
		const data = {
			namaArea: "Basement 1",
			kapasitas: 100,
			terisi: 0,
		};
		expect(insertAreaParkirSchema.parse(data)).toEqual(data);
	});

	it("fails for zero capacity", () => {
		const data = {
			namaArea: "Viper",
			kapasitas: 0,
		};
		expect(() => insertAreaParkirSchema.parse(data)).toThrow();
	});

	it("fails for negative occupied", () => {
		const data = {
			namaArea: "Viper",
			kapasitas: 50,
			terisi: -1,
		};
		expect(() => insertAreaParkirSchema.parse(data)).toThrow();
	});
});
