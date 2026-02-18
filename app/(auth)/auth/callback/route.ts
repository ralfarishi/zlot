import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export const GET = async (request: Request) => {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get("code");
	const next = searchParams.get("next") ?? "/dashboard";

	if (code) {
		const supabase = await createClient();
		const { error } = await supabase.auth.exchangeCodeForSession(code);

		if (!error) {
			return NextResponse.redirect(`${origin}${next}`);
		}
	}

	// Return the user to login if code exchange fails
	return NextResponse.redirect(`${origin}/login`);
};
