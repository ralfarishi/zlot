import { describe, it, expect } from "vitest";
import { insertTarifSchema } from "@/src/db/validations/rates";

describe("rates validation", () => {
	it("accepts valid rate", () => {
		const data = {
			jenisKendaraan: "motor",
			tarifPerJam: "2000",
		};
		expect(insertTarifSchema.parse(data)).toEqual(data);
	});

	it("fails for zero rate", () => {
		const data = {
			jenisKendaraan: "mobil",
			tarifPerJam: "0",
		};
		expect(() => insertTarifSchema.parse(data)).toThrow("Hourly rate must be a positive number");
	});

	it("fails for negative rate", () => {
		const data = {
			jenisKendaraan: "mobil",
			tarifPerJam: "-5000",
		};
		expect(() => insertTarifSchema.parse(data)).toThrow();
	});

	it("fails for non-numeric rate", () => {
		const data = {
			jenisKendaraan: "mobil",
			tarifPerJam: "abc",
		};
		expect(() => insertTarifSchema.parse(data)).toThrow();
	});
});
