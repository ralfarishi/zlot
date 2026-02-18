import { createClient } from "@supabase/supabase-js";

/**
 * SECURE ADMIN CLIENT
 * This client uses the SUPABASE_SERVICE_ROLE_KEY and should ONLY be used
 * in Server Actions or Server Components. It bypasses Row Level Security (RLS).
 * NEVER import this into a client-side component.
 */
export const createAdminClient = () => {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl || !serviceRoleKey) {
		throw new Error("Missing Supabase Admin environment variables");
	}

	return createClient(supabaseUrl, serviceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});
};
