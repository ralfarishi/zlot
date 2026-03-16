import { describe, it, expect } from "vitest";
import { createMasukSchema, createKeluarSchema } from "@/src/db/validations/transactions";

describe("transactions validation", () => {
	it("accepts valid entry", () => {
		const data = {
			idKendaraan: "1",
			waktuMasuk: new Date("2024-01-01T10:00:00Z"),
			idTarif: "1",
			idPetugas: "550e8400-e29b-41d4-a716-446655440000",
			idArea: "1",
		};
		expect(createMasukSchema.parse(data)).toEqual(data);
	});

	it("fails for future entry time", () => {
		const futureDate = new Date();
		futureDate.setHours(futureDate.getHours() + 1);
		const data = {
			idKendaraan: "1",
			waktuMasuk: futureDate,
			idTarif: "1",
			idPetugas: "550e8400-e29b-41d4-a716-446655440000",
			idArea: "1",
		};
		expect(() => createMasukSchema.parse(data)).toThrow("Entry time cannot be in the future");
	});

	it("accepts valid exit", () => {
		const data = {
			waktuKeluar: new Date(),
			metodePembayaran: "TUNAI",
		};
		expect(createKeluarSchema.parse(data)).toEqual(data);
	});
});
