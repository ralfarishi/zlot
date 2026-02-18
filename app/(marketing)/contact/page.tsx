"use client";

import { useState, useCallback } from "react";
import { PaperPlaneTilt, CheckCircle, Envelope, Phone, MapPin } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

type FormState = "idle" | "sending" | "sent";

const ContactPage = () => {
	const [formState, setFormState] = useState<FormState>("idle");
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validate = (formData: FormData) => {
		const newErrors: Record<string, string> = {};
		const name = formData.get("name")?.toString().trim() ?? "";
		const email = formData.get("email")?.toString().trim() ?? "";
		const message = formData.get("message")?.toString().trim() ?? "";

		if (name.length < 2) newErrors.name = "Name must be at least 2 characters";
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Please enter a valid email";
		if (message.length < 10) newErrors.message = "Message must be at least 10 characters";

		return { errors: newErrors, isValid: Object.keys(newErrors).length === 0 };
	};

	const handleSubmit = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			if (formState === "sending") return;

			const formData = new FormData(e.currentTarget);
			const { errors: validationErrors, isValid } = validate(formData);

			if (!isValid) {
				setErrors(validationErrors);
				return;
			}

			setErrors({});
			setFormState("sending");

			// Simulate sending
			setTimeout(() => {
				setFormState("sent");
			}, 1500);
		},
		[formState],
	);

	return (
		<div className="relative px-(--space-lg) pt-40 pb-(--space-2xl) md:pt-48 md:pb-32 overflow-hidden">
			{/* Background Decorations */}
			<div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] bg-primary/5 rounded-full blur-[140px]" />
			</div>

			<div className="mx-auto max-w-6xl">
				<div className="grid gap-16 md:grid-cols-2">
					{/* Text Side */}
					<motion.div
						initial={{ x: -20, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						className="flex flex-col justify-center"
					>
						<h1 className="font-display text-6xl font-black tracking-tighter md:text-9xl">
							Let&apos;s <br />
							<span className="text-secondary italic">connect.</span>
						</h1>
						<p className="mt-8 text-xl font-bold leading-relaxed text-text-secondary md:text-2xl">
							Have a lot that needs a brain? Or just want to say hi? We&apos;re building the future
							of parking and we&apos;d love to have you along.
						</p>

						<div className="mt-12 space-y-6">
							<div className="flex items-center gap-4">
								<div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-text-inverse">
									<Envelope size={24} weight="duotone" />
								</div>
								<div>
									<p className="text-sm font-bold text-text-secondary uppercase tracking-widest">
										Email us
									</p>
									<p className="text-lg font-bold">hello@zlot.ops</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="flex size-12 items-center justify-center rounded-2xl bg-accent-1 text-text-inverse">
									<Phone size={24} weight="duotone" />
								</div>
								<div>
									<p className="text-sm font-bold text-text-secondary uppercase tracking-widest">
										Call us
									</p>
									<p className="text-lg font-bold">+1 (555) ZLOT-OPS</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="flex size-12 items-center justify-center rounded-2xl bg-accent-2 text-text-inverse">
									<MapPin size={24} weight="duotone" />
								</div>
								<div>
									<p className="text-sm font-bold text-text-secondary uppercase tracking-widest">
										Our HQ
									</p>
									<p className="text-lg font-bold">The Terminal, Digital District</p>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Form Side */}
					<motion.div
						initial={{ x: 20, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						className="relative"
					>
						<AnimatePresence mode="wait">
							{formState === "sent" ? (
								<motion.div
									key="success"
									initial={{ scale: 0.9, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0.9, opacity: 0 }}
									className="flex h-full flex-col items-center justify-center rounded-[40px] bg-primary p-12 text-center text-text-inverse shadow-2xl"
								>
									<div className="mb-8 flex size-24 items-center justify-center rounded-full bg-white/10 text-accent-2">
										<CheckCircle size={64} weight="duotone" />
									</div>
									<h2 className="font-display text-4xl font-bold">Sent!</h2>
									<p className="mt-4 text-xl text-text-inverse/70">
										We&apos;ll get back to you faster than a car clearing the gate.
									</p>
									<button
										onClick={() => setFormState("idle")}
										className="mt-12 rounded-full bg-white px-10 py-4 text-lg font-bold text-primary transition-transform hover:scale-105"
									>
										Send Another
									</button>
								</motion.div>
							) : (
								<motion.form
									key="form"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									onSubmit={handleSubmit}
									noValidate
									className="rounded-[40px] border border-border bg-surface p-10 shadow-xl"
								>
									<div className="space-y-8">
										<div>
											<label className="mb-3 block text-sm font-bold uppercase tracking-widest text-text-secondary">
												Your Name
											</label>
											<input
												name="name"
												placeholder="John Wick"
												className="w-full rounded-2xl border-2 border-border bg-surface px-6 py-4 text-lg font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
											/>
											{errors.name && (
												<p className="mt-2 text-sm font-bold text-danger">{errors.name}</p>
											)}
										</div>
										<div>
											<label className="mb-3 block text-sm font-bold uppercase tracking-widest text-text-secondary">
												Work Email
											</label>
											<input
												name="email"
												type="email"
												placeholder="john@continent.al"
												className="w-full rounded-2xl border-2 border-border bg-surface px-6 py-4 text-lg font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
											/>
											{errors.email && (
												<p className="mt-2 text-sm font-bold text-danger">{errors.email}</p>
											)}
										</div>
										<div>
											<label className="mb-3 block text-sm font-bold uppercase tracking-widest text-text-secondary">
												The Brief
											</label>
											<textarea
												name="message"
												rows={4}
												placeholder="Tell us about your parking empire..."
												className="w-full resize-none rounded-2xl border-2 border-border bg-surface px-6 py-4 text-lg font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
											/>
											{errors.message && (
												<p className="mt-2 text-sm font-bold text-danger">{errors.message}</p>
											)}
										</div>
										<button
											type="submit"
											disabled={formState === "sending"}
											className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-5 text-xl font-bold text-text-inverse shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
										>
											{formState === "sending" ? (
												"Dispatching..."
											) : (
												<>
													Send Message
													<PaperPlaneTilt
														size={24}
														weight="bold"
														className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
													/>
												</>
											)}
										</button>
									</div>
								</motion.form>
							)}
						</AnimatePresence>
					</motion.div>
				</div>
			</div>
		</div>
	);
};

export default ContactPage;
