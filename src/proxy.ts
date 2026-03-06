import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/src/lib/supabase/proxy";

/**
 * In-memory sliding window rate limiter.
 * Tracks failed login attempts per IP within a 60-second window.
 * Effective for single-instance deployments.
 */
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 5;

const loginAttempts = new Map<string, number[]>();

const isRateLimited = (ip: string): boolean => {
	const now = Date.now();
	const attempts = loginAttempts.get(ip) ?? [];

	// Remove expired entries outside the window
	const recent = attempts.filter((t) => now - t < RATE_LIMIT_WINDOW);
	loginAttempts.set(ip, recent);

	return recent.length >= RATE_LIMIT_MAX;
};

const recordAttempt = (ip: string): void => {
	const now = Date.now();
	const attempts = loginAttempts.get(ip) ?? [];
	attempts.push(now);
	loginAttempts.set(ip, attempts);
};

// Periodic cleanup to prevent memory leaks (every 5 minutes)
setInterval(() => {
	const now = Date.now();
	for (const [ip, attempts] of loginAttempts.entries()) {
		const recent = attempts.filter((t) => now - t < RATE_LIMIT_WINDOW);
		if (recent.length === 0) {
			loginAttempts.delete(ip);
		} else {
			loginAttempts.set(ip, recent);
		}
	}
}, 5 * 60_000);

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Rate limiting on login page POST requests
	if (pathname === "/login" && request.method === "POST") {
		const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

		if (isRateLimited(ip)) {
			return NextResponse.json(
				{ error: "Too many login attempts. Please try again later." },
				{ status: 429 },
			);
		}

		recordAttempt(ip);
	}

	// Refresh Supabase auth session
	return await updateSession(request);
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * Feel free to modify this pattern to include more paths.
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
