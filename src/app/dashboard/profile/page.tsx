import { requireAuth } from "@/src/lib/auth-guard";
import { createClient } from "@/src/lib/supabase/server";
import type { Metadata } from "next";
import {
	User,
	Envelope,
	IdentificationBadge,
	Pulse,
	Calendar,
	ShieldCheck,
	Fingerprint,
	SignOut,
} from "@phosphor-icons/react/dist/ssr";
import { logout } from "@/src/actions/profiles";
import { PasswordForm } from "./password-form";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
	title: "Profile | Zlot",
};

const ProfilePage = async () => {
	const user = await requireAuth();
	const supabase = await createClient();

	const { data: profile } = await supabase
		.from("profiles")
		.select("full_name, role, is_active, created_at")
		.eq("id", user.id)
		.single();

	const initials = (profile?.full_name ?? user.email ?? "?")
		.split(" ")
		.map((n: string) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<div className="mx-auto max-w-3xl space-y-(--space-lg)">
			{/* Profile Header Card */}
			<div className="relative overflow-hidden rounded-card border border-border bg-surface p-(--space-xl) shadow-card">
				<div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
					<Fingerprint size={120} weight="fill" />
				</div>

				<div className="flex flex-col items-center gap-(--space-lg) sm:flex-row sm:items-start">
					<div className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-3xl font-black text-primary ring-4 ring-primary/5">
						{initials}
					</div>

					<div className="flex-1 text-center sm:text-left">
						<div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
							<h1 className="text-3xl font-black tracking-tighter text-text-primary">
								{profile?.full_name ?? "Zlot Member"}
							</h1>
							<span
								className={cn(
									"rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ring-1",
									profile?.is_active
										? "bg-success/10 text-success ring-success/20"
										: "bg-danger/10 text-danger ring-danger/20",
								)}
							>
								{profile?.is_active ? "Verified Ops" : "Suspended"}
							</span>
						</div>
						<p className="mt-1 flex items-center justify-center gap-2 text-sm font-medium text-text-secondary sm:justify-start">
							<Envelope size={16} weight="bold" />
							{user.email}
						</p>

						<div className="mt-(--space-md) flex flex-wrap justify-center gap-2 sm:justify-start">
							<div className="flex items-center gap-1.5 rounded-lg bg-surface-elevated px-3 py-1.5 text-xs font-bold text-text-primary ring-1 ring-border shadow-sm">
								<ShieldCheck size={14} weight="fill" className="text-secondary" />
								{profile?.role?.toUpperCase()} ACCESS
							</div>
							<form action={logout}>
								<button className="flex items-center gap-1.5 rounded-lg bg-danger/10 px-3 py-1.5 text-xs font-bold text-danger transition-all hover:bg-danger/20 active:scale-95 ring-1 ring-danger/20">
									<SignOut size={14} weight="bold" />
									Terminated Session
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>

			<div className="grid gap-(--space-lg) md:grid-cols-2">
				{/* Account Details */}
				<div className="rounded-card border border-border bg-surface p-(--space-lg) shadow-card">
					<div className="mb-(--space-md) flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">
						<IdentificationBadge size={14} weight="bold" />
						Registry Artifacts
					</div>

					<dl className="space-y-(--space-md)">
						<div className="flex flex-col gap-1 border-b border-border pb-(--space-sm) last:border-0 last:pb-0">
							<dt className="text-[10px] font-black uppercase tracking-tight text-text-secondary/40">
								Legal Designation
							</dt>
							<dd className="text-sm font-bold text-text-primary">{profile?.full_name ?? "—"}</dd>
						</div>

						<div className="flex flex-col gap-1 border-b border-border pb-(--space-sm) last:border-0 last:pb-0">
							<dt className="text-[10px] font-black uppercase tracking-tight text-text-secondary/40">
								Credential Proxy
							</dt>
							<dd className="font-mono text-xs font-bold text-text-secondary">{user.email}</dd>
						</div>

						<div className="flex flex-col gap-1 border-b border-border pb-(--space-sm) last:border-0 last:pb-0">
							<dt className="text-[10px] font-black uppercase tracking-tight text-text-secondary/40">
								Temporal Entry
							</dt>
							<dd className="flex items-center gap-2 text-sm font-bold text-text-primary">
								<Calendar size={16} weight="duotone" className="text-primary" />
								{profile?.created_at
									? new Date(profile.created_at).toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
										})
									: "—"}
							</dd>
						</div>
					</dl>
				</div>

				{/* Security & Access */}
				<div className="rounded-card border border-border bg-surface p-(--space-lg) shadow-card">
					<div className="mb-(--space-md) flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">
						<Pulse size={14} weight="bold" />
						System Status
					</div>

					<div className="space-y-(--space-md)">
						<div className="flex items-center justify-between rounded-xl bg-surface-elevated/50 p-4 ring-1 ring-border">
							<div className="flex items-center gap-3">
								<div
									className={cn(
										"flex size-10 items-center justify-center rounded-lg",
										profile?.is_active ? "bg-success/10 text-success" : "bg-danger/10 text-danger",
									)}
								>
									<User size={20} weight="bold" />
								</div>
								<div>
									<p className="text-xs font-bold text-text-primary">Account Vitality</p>
									<p className="text-[10px] text-text-secondary uppercase">Operational Status</p>
								</div>
							</div>
							<span
								className={cn(
									"text-xs font-black uppercase",
									profile?.is_active ? "text-success" : "text-danger",
								)}
							>
								{profile?.is_active ? "LIVE" : "OFFLINE"}
							</span>
						</div>

						<div className="flex items-center justify-between rounded-xl bg-surface-elevated/50 p-4 ring-1 ring-border opacity-50 grayscale cursor-not-allowed">
							<div className="flex items-center gap-3">
								<div className="flex size-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
									<ShieldCheck size={20} weight="bold" />
								</div>
								<div>
									<p className="text-xs font-bold text-text-primary">MFA Shield</p>
									<p className="text-[10px] text-text-secondary uppercase">Security Layer</p>
								</div>
							</div>
							<span className="text-[10px] font-black uppercase text-text-secondary">Disabled</span>
						</div>
					</div>
				</div>

				{/* Password Change Policy */}
				<div className="md:col-span-2">
					<PasswordForm userId={user.id} />
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
