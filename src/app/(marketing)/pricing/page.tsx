"use client";

import Link from "next/link";
import { Check, Sparkle, Crown, Rocket } from "@phosphor-icons/react";
import { m } from "framer-motion";

const TIERS = [
	{
		name: "Starter",
		price: "Free",
		period: "",
		description: "For small lots getting started with digital management.",
		icon: Sparkle,
		features: [
			"Up to 50 parking spots",
			"1 employee account",
			"Basic entry/exit tracking",
			"Daily reports",
		],
		cta: "Get Started",
		highlighted: false,
		color: "border-border",
	},
	{
		name: "Pro",
		price: "$49",
		period: "/mo",
		description: "For growing operations that need full visibility.",
		icon: Rocket,
		features: [
			"Unlimited parking spots",
			"Up to 10 employee accounts",
			"Real-time occupancy tracking",
			"Revenue analytics & charts",
			"Custom rate management",
			"Priority support",
		],
		cta: "Start Free Trial",
		highlighted: true,
		color: "border-primary bg-primary/5 ring-4 ring-primary/10",
	},
	{
		name: "Elite",
		price: "Custom",
		period: "",
		description: "For multi-site operators with advanced needs.",
		icon: Crown,
		features: [
			"Everything in Professional",
			"Unlimited employees",
			"Multi-site management",
			"API access",
			"Custom integrations",
			"Dedicated account manager",
		],
		cta: "Contact Sales",
		highlighted: false,
		color: "border-border",
	},
] as const;

const PricingPage = () => {
	return (
		<div className="relative px-(--space-lg) pt-40 pb-(--space-2xl) md:pt-48 md:pb-32 overflow-hidden">
			{/* Background Decorations */}
			<div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
				<div className="absolute top-1/4 right-0 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
				<div className="absolute top-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/4" />
			</div>

			<div className="mx-auto max-w-6xl">
				{/* Heading */}
				<div className="mb-(--space-2xl) text-center">
					<m.h1
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						className="font-display text-5xl font-black tracking-tighter md:text-8xl"
					>
						Simple pricing. <br />
						<span className="text-secondary italic">No hidden fees.</span>
					</m.h1>
					<p className="mt-(--space-lg) text-lg text-text-secondary md:text-2xl font-bold">
						Pick the plan that fits your ambition. Upgrade anytime.
					</p>
				</div>

				{/* Tier Cards */}
				<div className="grid gap-8 md:grid-cols-3">
					{TIERS.map((tier, i) => (
						<m.div
							key={tier.name}
							initial={{ y: 20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: i * 0.1 }}
							whileHover={{ y: -10 }}
							className={`relative flex flex-col rounded-[32px] border p-10 shadow-sm transition-all ${tier.color}`}
						>
							{tier.highlighted && (
								<div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-text-inverse uppercase tracking-widest">
									Most Popular
								</div>
							)}

							<div className="mb-8 flex size-14 items-center justify-center rounded-2xl bg-surface-elevated shadow-inner">
								<tier.icon
									size={32}
									weight="duotone"
									className={tier.highlighted ? "text-primary" : "text-text-secondary"}
								/>
							</div>

							<h2 className="font-display text-2xl font-bold">{tier.name}</h2>
							<p className="mt-2 text-text-secondary font-medium">{tier.description}</p>

							<div className="mt-8 flex items-baseline gap-2">
								<span className="font-display text-5xl font-extrabold">{tier.price}</span>
								{tier.period && (
									<span className="text-lg font-bold text-text-secondary">{tier.period}</span>
								)}
							</div>

							<ul className="mt-10 flex-1 space-y-4">
								{tier.features.map((feature) => (
									<li key={feature} className="flex items-start gap-3">
										<Check size={20} weight="bold" className="mt-1 shrink-0 text-success" />
										<span className="text-text-secondary font-medium">{feature}</span>
									</li>
								))}
							</ul>

							<Link
								href={tier.name === "Elite" ? "/contact" : "/login"}
								className={`mt-12 block rounded-2xl py-4 text-center text-lg font-bold transition-all ${
									tier.highlighted
										? "bg-primary text-text-inverse shadow-xl hover:opacity-90 active:scale-95"
										: "bg-surface-elevated text-text-primary hover:bg-surface border border-border active:scale-95"
								}`}
							>
								{tier.cta}
							</Link>
						</m.div>
					))}
				</div>
			</div>
		</div>
	);
};

export default PricingPage;
