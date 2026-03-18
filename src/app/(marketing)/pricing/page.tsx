"use client";

import Link from "next/link";
import { Check, Sparkle, Crown, Rocket } from "@phosphor-icons/react";
import { m } from "framer-motion";
import { useLocale } from "@/components/providers/locale-provider";

const PricingPage = () => {
	const { t } = useLocale();

	const TIERS = [
		{
			name: t("pricing.starter.name"),
			price: "Free",
			period: "",
			description: t("pricing.starter.description"),
			icon: Sparkle,
			features: [
				t("pricing.starter.f1"),
				t("pricing.starter.f2"),
				t("pricing.starter.f3"),
				t("pricing.starter.f4"),
			],
			cta: t("pricing.starter.cta"),
			highlighted: false,
			color: "border-border",
		},
		{
			name: t("pricing.pro.name"),
			price: "$49",
			period: "/mo",
			description: t("pricing.pro.description"),
			icon: Rocket,
			features: [
				t("pricing.pro.f1"),
				t("pricing.pro.f2"),
				t("pricing.pro.f3"),
				t("pricing.pro.f4"),
				t("pricing.pro.f5"),
				t("pricing.pro.f6"),
			],
			cta: t("pricing.pro.cta"),
			highlighted: true,
			color: "border-primary bg-primary/5 ring-4 ring-primary/10",
		},
		{
			name: t("pricing.elite.name"),
			price: "Custom",
			period: "",
			description: t("pricing.elite.description"),
			icon: Crown,
			features: [
				t("pricing.elite.f1"),
				t("pricing.elite.f2"),
				t("pricing.elite.f3"),
				t("pricing.elite.f4"),
				t("pricing.elite.f5"),
				t("pricing.elite.f6"),
			],
			cta: t("pricing.elite.cta"),
			highlighted: false,
			color: "border-border",
		},
	];

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
						{t("pricing.hero.title")} <br />
						<span className="text-secondary italic">{t("pricing.hero.subtitle")}</span>
					</m.h1>
					<p className="mt-(--space-lg) text-lg text-text-secondary md:text-2xl font-bold">
						{t("pricing.hero.description")}
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
									{t("pricing.popular")}
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
								href={tier.name === t("pricing.elite.name") ? "/contact" : "/login"}
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
