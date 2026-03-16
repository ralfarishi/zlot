import { describe, it, expect } from "vitest";
import { insertKendaraanSchema } from "@/src/db/validations/vehicles";

describe("vehicles validation", () => {
	it("accepts valid Indonesian-style plate", () => {
		const data = {
			platNomor: "B 1234 ABC",
			jenisKendaraan: "mobil",
			warna: "Black",
			namaPemilik: "Alice",
			idPetugas: "550e8400-e29b-41d4-a716-446655440000",
		};
		expect(insertKendaraanSchema.parse(data)).toEqual(data);
	});

	it("fails for invalid plate format", () => {
		const data = {
			platNomor: "12345",
			jenisKendaraan: "mobil",
			idPetugas: "550e8400-e29b-41d4-a716-446655440000",
		};
		expect(() => insertKendaraanSchema.parse(data)).toThrow("Invalid plate number format");
	});

	it("fails for missing idPetugas", () => {
		const data = {
			platNomor: "B 1234 ABC",
			jenisKendaraan: "motor",
		};
		expect(() => insertKendaraanSchema.parse(data)).toThrow();
	});
});
