"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash, SignIn, House } from "@phosphor-icons/react";
import { m, AnimatePresence } from "framer-motion";
import { createClient } from "@/src/lib/supabase/client";

interface FormErrors {
	email?: string;
	password?: string;
	form?: string;
}

const LoginPage = () => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<FormErrors>({});

	const validate = (email: string, password: string): FormErrors => {
		const errs: FormErrors = {};
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
			errs.email = "Please enter a valid email address";
		if (password.length < 6) errs.password = "Password must be at least 6 characters";
		return errs;
	};

	const handleSubmit = useCallback(
		async (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			if (isLoading) return;

			const formData = new FormData(e.currentTarget);
			const email = formData.get("email")?.toString().trim() ?? "";
			const password = formData.get("password")?.toString() ?? "";

			const validationErrors = validate(email, password);
			if (Object.keys(validationErrors).length > 0) {
				setErrors(validationErrors);
				return;
			}

			setErrors({});
			setIsLoading(true);

			const supabase = createClient();
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				setErrors({ form: "Invalid email or password. Please try again." });
				setIsLoading(false);
				return;
			}

			router.push("/dashboard");
			router.refresh();
		},
		[isLoading, router],
	);

	return (
		<div className="relative flex h-dvh w-full flex-col items-center justify-center overflow-hidden px-(--space-lg)">
			{/* Bg decorations */}
			<div className="absolute top-0 left-0 -z-10 h-full w-full overflow-hidden opacity-10">
				<div className="absolute -top-24 -left-24 size-96 rounded-full bg-primary blur-3xl" />
				<div className="absolute -bottom-24 -right-24 size-96 rounded-full bg-accent-2 blur-3xl" />
			</div>

			<m.div
				initial={{ scale: 0.9, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				className="w-full max-w-md"
			>
				{/* Logo/Header */}
				<div className="mb-8 text-center">
					<m.div
						initial={{ y: -20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.1 }}
						className="mx-auto mb-6 flex size-16 items-center justify-center rounded-3xl bg-primary text-text-inverse shadow-2xl"
					>
						<House weight="fill" size={32} />
					</m.div>
					<h1 className="font-display text-4xl font-extrabold tracking-tight">Launch Console.</h1>
					<p className="mt-2 text-lg font-medium text-text-secondary">
						Welcome back, elite operator.
					</p>
				</div>

				{/* Card */}
				<div className="rounded-[40px] border border-border bg-surface/80 p-10 shadow-2xl backdrop-blur-xl">
					<AnimatePresence mode="wait">
						{errors.form && (
							<m.div
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: "auto", opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								className="mb-6 rounded-2xl bg-danger/10 p-4 text-center text-sm font-bold text-danger border border-danger/20"
							>
								{errors.form}
							</m.div>
						)}
					</AnimatePresence>

					<form onSubmit={handleSubmit} noValidate className="space-y-6">
						<div>
							<label
								htmlFor="email"
								className="mb-2 block text-xs font-bold uppercase tracking-widest text-text-secondary"
							>
								Your Email
							</label>
							<input
								id="email"
								name="email"
								type="email"
								placeholder="you@company.com"
								className="w-full rounded-2xl border-2 border-border bg-surface px-6 py-4 text-lg font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
							/>
							{errors.email && <p className="mt-2 text-xs font-bold text-danger">{errors.email}</p>}
						</div>

						<div>
							<label
								htmlFor="password"
								className="mb-2 block text-xs font-bold uppercase tracking-widest text-text-secondary"
							>
								Secret Access Code
							</label>
							<div className="relative">
								<input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									placeholder="••••••••"
									className="w-full rounded-2xl border-2 border-border bg-surface px-6 py-4 pr-14 text-lg font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute top-1/2 right-4 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
								>
									{showPassword ? (
										<EyeSlash size={24} weight="duotone" />
									) : (
										<Eye size={24} weight="duotone" />
									)}
								</button>
							</div>
							{errors.password && (
								<p className="mt-2 text-xs font-bold text-danger">{errors.password}</p>
							)}
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-5 text-xl font-bold text-text-inverse shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
						>
							{isLoading ? (
								"Syncing..."
							) : (
								<>
									Launch
									<SignIn
										size={24}
										weight="bold"
										className="transition-transform group-hover:translate-x-1"
									/>
								</>
							)}
						</button>
					</form>

					<div className="mt-8 text-center text-sm font-medium text-text-secondary">
						New operator?{" "}
						<Link href="/contact" className="text-primary font-bold hover:underline">
							Get Access
						</Link>
					</div>
				</div>

				<m.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					className="mt-12 text-center"
				>
					<Link
						href="/"
						className="inline-flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-primary transition-colors"
					>
						<House weight="duotone" size={20} />
						Back to Surface
					</Link>
				</m.div>
			</m.div>
		</div>
	);
};

export default LoginPage;
