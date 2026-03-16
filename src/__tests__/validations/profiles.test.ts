import { describe, it, expect } from "vitest";
import { insertProfilSchema } from "@/src/db/validations/profiles";

describe("profiles validation", () => {
	it("accepts valid profile", () => {
		const data = {
			id: "550e8400-e29b-41d4-a716-446655440000",
			namaLengkap: "John Doe",
			role: "admin",
			isActive: true,
		};
		expect(insertProfilSchema.parse(data)).toEqual(data);
	});

	it("fails for invalid ID", () => {
		const data = { id: "invalid-id", namaLengkap: "John", role: "admin" };
		expect(() => insertProfilSchema.parse(data)).toThrow();
	});

	it("fails for short name", () => {
		const data = {
			id: "550e8400-e29b-41d4-a716-446655440000",
			namaLengkap: "J",
			role: "admin",
		};
		expect(() => insertProfilSchema.parse(data)).toThrow();
	});

	it("fails for invalid role", () => {
		const data = {
			id: "550e8400-e29b-41d4-a716-446655440000",
			namaLengkap: "John Doe",
			role: "super-admin",
		};
		expect(() => insertProfilSchema.parse(data)).toThrow();
	});
});
