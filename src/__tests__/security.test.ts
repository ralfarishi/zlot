import { describe, it, expect } from "vitest";

/**
 * Open redirect sanitization tests.
 * Mirrors the logic in src/app/(auth)/auth/callback/route.ts
 */
const sanitizeRedirect = (next: string): string => {
	return /^\/(?!\/)/.test(next) ? next : "/dashboard";
};

describe("open redirect sanitization", () => {
	it("allows valid relative paths", () => {
		expect(sanitizeRedirect("/dashboard")).toBe("/dashboard");
		expect(sanitizeRedirect("/dashboard/users")).toBe("/dashboard/users");
		expect(sanitizeRedirect("/")).toBe("/");
	});

	it("blocks protocol-relative URLs", () => {
		expect(sanitizeRedirect("//evil.com")).toBe("/dashboard");
		expect(sanitizeRedirect("//evil.com/phish")).toBe("/dashboard");
	});

	it("blocks absolute URLs", () => {
		expect(sanitizeRedirect("https://evil.com")).toBe("/dashboard");
		expect(sanitizeRedirect("http://evil.com")).toBe("/dashboard");
	});

	it("blocks empty and malformed values", () => {
		expect(sanitizeRedirect("")).toBe("/dashboard");
		expect(sanitizeRedirect("evil.com")).toBe("/dashboard");
		expect(sanitizeRedirect("javascript:void(0)")).toBe("/dashboard");
	});
});

/**
 * Password policy validation tests.
 * Mirrors the logic in src/actions/profiles.ts
 */
const validatePassword = (password: string): string | null => {
	if (password.length < 8) return "Password must be at least 8 characters.";
	if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
	if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
	return null;
};

describe("password policy", () => {
	it("rejects passwords shorter than 8 characters", () => {
		expect(validatePassword("Ab1")).toBeTruthy();
		expect(validatePassword("Short1A")).toBeTruthy();
	});

	it("rejects passwords without uppercase", () => {
		expect(validatePassword("lowercase1")).toBeTruthy();
	});

	it("rejects passwords without digits", () => {
		expect(validatePassword("NoDigitsHere")).toBeTruthy();
	});

	it("accepts valid passwords", () => {
		expect(validatePassword("ValidPass1")).toBeNull();
		expect(validatePassword("MyP@ssw0rd")).toBeNull();
	});
});

/**
 * LIKE wildcard escaping tests.
 * Mirrors the logic in src/actions/activity-logs.ts
 */
const escapeLikeWildcards = (input: string): string => {
	return input.replace(/[%_]/g, "\\$&");
};

describe("LIKE wildcard escaping", () => {
	it("escapes percent signs", () => {
		expect(escapeLikeWildcards("100%")).toBe("100\\%");
	});

	it("escapes underscores", () => {
		expect(escapeLikeWildcards("user_name")).toBe("user\\_name");
	});

	it("escapes mixed wildcards", () => {
		expect(escapeLikeWildcards("%admin_test%")).toBe("\\%admin\\_test\\%");
	});

	it("passes through normal text unchanged", () => {
		expect(escapeLikeWildcards("normal search")).toBe("normal search");
	});
});

/**
 * Analytics days bounds validation tests.
 * Mirrors the logic in src/actions/transactions.ts
 */
const clampDays = (days: number): number => {
	return Math.max(1, Math.min(days, 365));
};

describe("analytics days bounds", () => {
	it("clamps zero to 1", () => {
		expect(clampDays(0)).toBe(1);
	});

	it("clamps negative values to 1", () => {
		expect(clampDays(-5)).toBe(1);
	});

	it("clamps extreme values to 365", () => {
		expect(clampDays(99999)).toBe(365);
	});

	it("passes valid values through", () => {
		expect(clampDays(7)).toBe(7);
		expect(clampDays(30)).toBe(30);
		expect(clampDays(365)).toBe(365);
	});
});
