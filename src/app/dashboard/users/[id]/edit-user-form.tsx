"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, deleteProfile, updatePassword } from "@/src/actions/profiles";
import {
	IdentificationCard,
	WarningCircle,
	ArrowsClockwise,
	Trash,
	FloppyDisk,
	ArrowLeft,
} from "@phosphor-icons/react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLocale } from "@/src/components/providers/locale-provider";

interface Profile {
	id: string;
	namaLengkap: string;
	role: "admin" | "petugas" | "owner";
	isActive: boolean;
}

export const EditUserForm = ({ profile }: { profile: Profile }) => {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [errors, setErrors] = useState<Record<string, string>>({});
	const { t } = useLocale();

	const handleSubmit = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			const formData = new FormData(e.currentTarget);
			const namaLengkap = formData.get("namaLengkap")?.toString().trim() ?? "";
			const role = formData.get("role")?.toString() ?? "";

			const newErrors: Record<string, string> = {};
			if (namaLengkap.length < 2) newErrors.namaLengkap = "Name must be at least 2 characters";
			if (!["admin", "petugas", "owner"].includes(role)) newErrors.role = "Select a valid role";

			if (Object.keys(newErrors).length > 0) {
				setErrors(newErrors);
				return;
			}

			setErrors({});
			startTransition(async () => {
				try {
					await updateProfile(profile.id, {
						namaLengkap,
						role: role as "admin" | "petugas" | "owner",
					});

					const password = formData.get("password")?.toString();
					if (password) {
						await updatePassword(profile.id, password);
					}

					router.push("/dashboard/users");
				} catch (err) {
					setErrors({ form: err instanceof Error ? err.message : "An unexpected error occurred" });
				}
			});
		},
		[profile.id, router],
	);

	const handleDelete = useCallback(() => {
		if (
			!confirm("Are you sure you want to delete this user profile? This action cannot be undone.")
		)
			return;

		startTransition(async () => {
			await deleteProfile(profile.id);
			router.push("/dashboard/users");
		});
	}, [profile.id, router]);

	return (
		<m.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="space-y-(--space-lg)"
		>
			<form
				onSubmit={handleSubmit}
				className="overflow-hidden rounded-card border border-border bg-surface shadow-card"
			>
				<div className="border-b border-border bg-surface-elevated/50 p-(--space-lg)">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary ring-1 ring-secondary/20">
							<IdentificationCard size={20} weight="bold" />
						</div>
						<div>
							<h3 className="text-sm font-black uppercase tracking-widest text-text-primary">
								{t("users.profileConfig")}
							</h3>
							<p className="text-[10px] font-bold text-text-secondary uppercase opacity-60 mt-0.5">
								{t("users.modifyAttributes")}
							</p>
						</div>
					</div>
				</div>

				<div className="p-(--space-lg) space-y-6">
					<div className="grid gap-6 sm:grid-cols-2">
						{/* Full Name Field */}
						<div className="space-y-2">
							<label
								htmlFor="nama-lengkap"
								className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary"
							>
								{t("users.fullName")}
							</label>
							<div className="relative">
								<input
									id="nama-lengkap"
									name="namaLengkap"
									type="text"
									defaultValue={profile.namaLengkap}
									placeholder="e.g. John Doe"
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

						{/* Role Field */}
						<div className="space-y-2">
							<label
								htmlFor="role"
								className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary"
							>
								{t("users.accessRole")}
							</label>
							<div className="relative">
								<select
									id="role"
									name="role"
									defaultValue={profile.role}
									className={cn(
										"w-full appearance-none rounded-button border bg-surface px-4 py-3 text-sm font-bold outline-none transition-all shadow-sm",
										errors.role
											? "border-danger ring-4 ring-danger/5"
											: "border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5",
									)}
								>
									<option value="admin">{t("users.systemAdmin")}</option>
									<option value="petugas">{t("users.gateEmployee")}</option>
									<option value="owner">{t("users.systemOwner")}</option>
								</select>
							</div>
						</div>

						{/* Password Field */}
						<div className="space-y-2 sm:col-span-2">
							<label
								htmlFor="password"
								className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary"
							>
								{t("users.securityOverride")}
							</label>
							<div className="relative">
								<input
									id="password"
									name="password"
									type="password"
									placeholder="•••••••• (Leave blank to keep current)"
									className={cn(
										"w-full rounded-button border bg-surface px-4 py-3 text-sm font-bold outline-none transition-all shadow-sm border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5",
									)}
								/>
							</div>
							<p className="text-[10px] font-bold text-text-secondary/40 uppercase tracking-tighter pl-1">
								{t("users.credentialResetHint")}
							</p>
						</div>
					</div>

					{errors.form && (
						<div className="rounded-lg bg-danger/10 p-3 flex items-center gap-2 border border-danger/20">
							<WarningCircle size={16} className="text-danger" weight="bold" />
							<p className="text-xs font-bold text-danger uppercase tracking-tight">
								{errors.form}
							</p>
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-end border-t border-border mt-6">
						<button
							type="button"
							onClick={() => router.back()}
							className="flex items-center justify-center gap-2 rounded-button border border-border bg-surface px-6 py-2.5 text-xs font-black uppercase tracking-widest text-text-secondary transition-all hover:bg-surface-elevated active:scale-95"
						>
							<ArrowLeft size={16} weight="bold" />
							{t("users.goBack")}
						</button>
						<button
							type="submit"
							disabled={isPending}
							className="flex items-center justify-center gap-2 rounded-button bg-primary px-8 py-2.5 text-xs font-black uppercase tracking-[0.15em] text-text-inverse shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
						>
							{isPending ? (
								<>
									<ArrowsClockwise size={16} weight="bold" className="animate-spin" />
									{t("users.processing")}
								</>
							) : (
								<>
									<FloppyDisk size={16} weight="bold" />
									{t("users.commitChanges")}
								</>
							)}
						</button>
					</div>
				</div>
			</form>

			{/* Danger Zone */}
			<div className="overflow-hidden rounded-card border border-danger/30 bg-danger/5 shadow-sm">
				<div className="border-b border-danger/20 bg-danger/10 px-(--space-lg) py-3">
					<div className="flex items-center gap-2">
						<WarningCircle size={14} weight="bold" className="text-danger" />
						<h3 className="text-[10px] font-black uppercase tracking-widest text-danger">
							{t("users.dangerZone")}
						</h3>
					</div>
				</div>
				<div className="p-(--space-lg) flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-xs font-bold text-text-primary tracking-tight">
							{t("users.decommission")}
						</p>
						<p className="text-[10px] text-text-secondary uppercase mt-0.5">
							{t("users.decommissionDesc")}
						</p>
					</div>
					<button
						type="button"
						onClick={handleDelete}
						disabled={isPending}
						className="flex items-center justify-center gap-2 rounded-button bg-danger px-6 py-2.5 text-xs font-black uppercase tracking-widest text-text-inverse shadow-lg shadow-danger/20 transition-all hover:bg-danger/90 active:scale-95 disabled:opacity-50"
					>
						<Trash size={16} weight="bold" />
						{t("users.purgeRecord")}
					</button>
				</div>
			</div>
		</m.div>
	);
};
