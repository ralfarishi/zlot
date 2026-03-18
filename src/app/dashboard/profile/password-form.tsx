"use client";

import React, { useState, useTransition } from "react";
import { updatePassword } from "@/src/actions/profiles";
import { ShieldCheck, ArrowsClockwise, CheckCircle, LockKey } from "@phosphor-icons/react";
import { m, AnimatePresence } from "framer-motion";
import { useLocale } from "@/src/components/providers/locale-provider";

export const PasswordForm = ({ userId }: { userId: string }) => {
	const [isPending, startTransition] = useTransition();
	const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
	const [errorMessage, setErrorMessage] = useState("");
	const [passwords, setPasswords] = useState({ new: "", confirm: "" });
	const { t } = useLocale();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (passwords.new !== passwords.confirm) {
			setStatus("error");
			setErrorMessage("Passwords do not match");
			return;
		}

		if (passwords.new.length < 6) {
			setStatus("error");
			setErrorMessage("Password must be at least 6 characters");
			return;
		}

		setStatus("idle");
		setErrorMessage("");

		startTransition(async () => {
			try {
				await updatePassword(userId, passwords.new);
				setStatus("success");
				setPasswords({ new: "", confirm: "" });
				setTimeout(() => setStatus("idle"), 5000);
			} catch (err) {
				setStatus("error");
				setErrorMessage(err instanceof Error ? err.message : "Authentication update failed");
			}
		});
	};

	return (
		<div className="rounded-card border border-border bg-surface p-(--space-lg) shadow-card">
			<div className="mb-(--space-md) flex items-center justify-between">
				<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">
					<LockKey size={14} weight="bold" />
					{t("profile.securityProtocol")}
				</div>
				<AnimatePresence>
					{status === "success" && (
						<m.span
							initial={{ opacity: 0, x: 10 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0 }}
							className="flex items-center gap-1 text-[10px] font-black text-success uppercase"
						>
							<CheckCircle size={14} weight="bold" />
							{t("profile.credentialsSynced")}
						</m.span>
					)}
				</AnimatePresence>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<label
							htmlFor="new-password"
							className="text-[10px] font-black uppercase tracking-widest text-text-secondary select-none"
						>
							{t("profile.newAccessKey")}
						</label>
						<input
							id="new-password"
							type="password"
							required
							value={passwords.new}
							onChange={(e) => setPasswords((prev) => ({ ...prev, new: e.target.value }))}
							placeholder="••••••••"
							className="h-11 w-full rounded-xl border-2 border-border bg-surface-elevated/30 px-4 text-sm font-bold outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 shadow-sm"
						/>
					</div>
					<div className="space-y-2">
						<label
							htmlFor="confirm-password"
							className="text-[10px] font-black uppercase tracking-widest text-text-secondary select-none"
						>
							{t("profile.confirmSequence")}
						</label>
						<input
							id="confirm-password"
							type="password"
							required
							value={passwords.confirm}
							onChange={(e) => setPasswords((prev) => ({ ...prev, confirm: e.target.value }))}
							placeholder="••••••••"
							className="h-11 w-full rounded-xl border-2 border-border bg-surface-elevated/30 px-4 text-sm font-bold outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 shadow-sm"
						/>
					</div>
				</div>

				<AnimatePresence>
					{status === "error" && (
						<m.p
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							className="text-[10px] font-bold text-danger uppercase tracking-tight pl-1"
						>
							{errorMessage}
						</m.p>
					)}
				</AnimatePresence>

				<button
					type="submit"
					disabled={isPending}
					className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-black uppercase tracking-widest text-text-inverse shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
				>
					{isPending ? (
						<>
							<ArrowsClockwise size={16} weight="bold" className="animate-spin" />
							{t("profile.encrypting")}
						</>
					) : (
						<>
							<ShieldCheck size={16} weight="bold" />
							{t("profile.updateCredentials")}
						</>
					)}
				</button>
			</form>
		</div>
	);
};
