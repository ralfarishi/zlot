"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createUserWithProfile } from "@/src/actions/profiles";
import {
	UserPlus,
	X,
	Envelope,
	Lock,
	IdentificationCard,
	ShieldCheck,
	CheckCircle,
	WarningCircle,
	ArrowsClockwise,
} from "@phosphor-icons/react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";

const NewUserPage = () => {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleSubmit = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			const formData = new FormData(e.currentTarget);
			const namaLengkap = formData.get("namaLengkap")?.toString().trim() ?? "";
			const email = formData.get("email")?.toString().trim() ?? "";
			const password = formData.get("password")?.toString() ?? "";
			const role = formData.get("role")?.toString() ?? "";

			const newErrors: Record<string, string> = {};
			if (namaLengkap.length < 2) newErrors.namaLengkap = "Name must be at least 2 characters";
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
				newErrors.email = "Enter a valid email address";
			if (password.length < 8) newErrors.password = "Password must be at least 8 characters";
			if (!["admin", "petugas", "owner"].includes(role)) newErrors.role = "Select a valid role";

			if (Object.keys(newErrors).length > 0) {
				setErrors(newErrors);
				return;
			}

			setErrors({});
			startTransition(async () => {
				try {
					await createUserWithProfile({
						namaLengkap,
						email,
						password,
						role: role as "admin" | "petugas" | "owner",
					});
					router.push("/dashboard/users");
				} catch (err) {
					const message = err instanceof Error ? err.message : "Failed to create user";
					setErrors({ form: message });
				}
			});
		},
		[router],
	);

	return (
		<div className="mx-auto max-w-2xl px-4">
			<m.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				className="overflow-hidden rounded-card border border-border bg-surface shadow-card backdrop-blur-md"
			>
				{/* Header Section */}
				<div className="relative border-b border-border bg-surface-elevated/50 p-(--space-lg)">
					<div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
						<UserPlus size={80} weight="fill" />
					</div>

					<div className="flex items-center gap-3">
						<div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
							<UserPlus size={24} weight="bold" />
						</div>
						<div>
							<h1 className="text-2xl font-black tracking-tighter text-text-primary uppercase">
								Provision Personnel
							</h1>
							<p className="text-xs font-bold text-text-secondary uppercase tracking-widest opacity-60">
								Authorize new system access record
							</p>
						</div>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="p-(--space-lg) space-y-6">
					{errors.form && (
						<div className="rounded-lg bg-danger/10 p-3 flex items-center gap-2 text-danger text-xs font-bold uppercase tracking-tight">
							<WarningCircle size={18} weight="fill" />
							{errors.form}
						</div>
					)}

					<div className="grid gap-6 md:grid-cols-2">
						{/* Full Name Field */}
						<div className="space-y-2 md:col-span-2">
							<label
								htmlFor="nama-lengkap"
								className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary"
							>
								<IdentificationCard size={14} weight="bold" />
								Legal Full Name
							</label>
							<div className="relative">
								<input
									id="nama-lengkap"
									name="namaLengkap"
									type="text"
									placeholder="Unit Designation (e.g. John Doe)"
									className={cn(
										"w-full rounded-button border bg-surface px-4 py-3 text-sm font-bold outline-none transition-all shadow-sm",
										errors.namaLengkap
											? "border-danger ring-4 ring-danger/5"
											: "border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5",
									)}
								/>
							</div>
							{errors.namaLengkap && (
								<p className="text-[10px] font-bold uppercase tracking-tight text-danger pl-1">
									{errors.namaLengkap}
								</p>
							)}
						</div>

						{/* Email Field */}
						<div className="space-y-2">
							<label
								htmlFor="email"
								className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary"
							>
								<Envelope size={14} weight="bold" />
								Credential Proxy (Email)
							</label>
							<div className="relative">
								<input
									id="email"
									name="email"
									type="email"
									placeholder="operator@zlot.system"
									className={cn(
										"w-full rounded-button border bg-surface px-4 py-3 text-sm font-bold outline-none transition-all shadow-sm",
										errors.email
											? "border-danger ring-4 ring-danger/5"
											: "border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5",
									)}
								/>
							</div>
							{errors.email && (
								<p className="text-[10px] font-bold uppercase tracking-tight text-danger pl-1">
									{errors.email}
								</p>
							)}
						</div>

						{/* Role Field */}
						<div className="space-y-2">
							<label
								htmlFor="role"
								className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary"
							>
								<ShieldCheck size={14} weight="bold" />
								Access clearance
							</label>
							<div className="relative">
								<select
									id="role"
									name="role"
									defaultValue=""
									className={cn(
										"w-full appearance-none rounded-button border bg-surface px-4 py-3 text-sm font-bold outline-none transition-all shadow-sm",
										errors.role
											? "border-danger ring-4 ring-danger/5"
											: "border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5",
									)}
								>
									<option value="" disabled>
										Select privilege level
									</option>
									<option value="admin">System Admin</option>
									<option value="petugas">Gate Employee</option>
									<option value="owner">System Owner</option>
								</select>
							</div>
							{errors.role && (
								<p className="text-[10px] font-bold uppercase tracking-tight text-danger pl-1">
									{errors.role}
								</p>
							)}
						</div>

						{/* Password Field */}
						<div className="space-y-2 md:col-span-2">
							<label
								htmlFor="password"
								className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary"
							>
								<Lock size={14} weight="bold" />
								Initial Secret Cipher (Password)
							</label>
							<div className="relative">
								<input
									id="password"
									name="password"
									type="password"
									placeholder="Minimum 8 characters"
									className={cn(
										"w-full rounded-button border bg-surface px-4 py-3 text-sm font-bold outline-none transition-all shadow-sm font-mono",
										errors.password
											? "border-danger ring-4 ring-danger/5"
											: "border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5",
									)}
								/>
							</div>
							{errors.password && (
								<p className="text-[10px] font-bold uppercase tracking-tight text-danger pl-1">
									{errors.password}
								</p>
							)}
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-end">
						<button
							type="button"
							onClick={() => router.back()}
							className="flex items-center justify-center gap-2 rounded-button border border-border bg-surface px-6 py-2.5 text-xs font-black uppercase tracking-widest text-text-secondary transition-all hover:bg-surface-elevated active:scale-95"
						>
							<X size={16} weight="bold" />
							Abort
						</button>
						<button
							type="submit"
							disabled={isPending}
							className="flex items-center justify-center gap-2 rounded-button bg-primary px-8 py-2.5 text-xs font-black uppercase tracking-[0.15em] text-text-inverse shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
						>
							{isPending ? (
								<>
									<ArrowsClockwise size={16} weight="bold" className="animate-spin" />
									Initializing...
								</>
							) : (
								<>
									<CheckCircle size={16} weight="bold" />
									Authorize Access
								</>
							)}
						</button>
					</div>
				</form>

				{/* Footer Tip */}
				<div className="bg-surface-elevated p-4 text-center">
					<p className="text-[10px] font-bold uppercase tracking-tight text-text-secondary/50">
						Ensuring zlot security protocol compliance • V2.4.0
					</p>
				</div>
			</m.div>
		</div>
	);
};

export default NewUserPage;
