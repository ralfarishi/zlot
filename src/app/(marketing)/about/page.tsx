"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { Users, Target, RocketLaunch, ChatCenteredDots, Heart } from "@phosphor-icons/react";
import { m } from "framer-motion";

const AboutPage = () => {
	const { t } = useLocale();

	const VALUES = [
		{
			icon: RocketLaunch,
			title: t("about.values.speed.title"),
			description: t("about.values.speed.description"),
			color: "text-primary bg-primary/10",
		},
		{
			icon: Users,
			title: t("about.values.human.title"),
			description: t("about.values.human.description"),
			color: "text-accent-1 bg-accent-1/10",
		},
		{
			icon: Heart,
			title: t("about.values.passion.title"),
			description: t("about.values.passion.description"),
			color: "text-accent-2 bg-accent-2/10",
		},
	];

	return (
		<div className="relative px-(--space-lg) pt-40 pb-(--space-2xl) md:pt-48 md:pb-32 overflow-hidden">
			{/* Background Decorations */}
			<div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
				<div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
				<div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] translate-y-1/2 translate-x-1/4" />
			</div>

			<div className="mx-auto max-w-5xl">
				{/* Heading */}
				<div className="mb-(--space-2xl) text-center">
					<m.h1
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						className="font-display text-5xl font-black tracking-tighter md:text-8xl"
					>
						{t("about.hero.title")} <br />
						<span className="text-secondary italic">{t("about.hero.subtitle")}</span>
					</m.h1>
					<m.p
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.1 }}
						className="mx-auto mt-(--space-lg) max-w-2xl text-lg leading-relaxed text-text-secondary md:text-2xl font-bold"
					>
						{t("about.hero.description")}
					</m.p>
				</div>

				<div className="grid gap-12 md:grid-cols-2 mt-20">
					{/* Story */}
					<m.div
						initial={{ x: -20, opacity: 0 }}
						whileInView={{ x: 0, opacity: 1 }}
						viewport={{ once: true }}
						className="rounded-3xl border border-border bg-surface p-10 shadow-sm"
					>
						<h2 className="font-display text-3xl font-bold flex items-center gap-3">
							<ChatCenteredDots weight="duotone" className="text-primary" />
							{t("about.story.title")}
						</h2>
						<p className="mt-(--space-md) text-lg leading-relaxed text-text-secondary">
							{t("about.story.body")}
						</p>
					</m.div>

					{/* Vision */}
					<m.div
						initial={{ x: 20, opacity: 0 }}
						whileInView={{ x: 0, opacity: 1 }}
						viewport={{ once: true }}
						className="rounded-3xl border border-border bg-primary p-10 text-text-inverse shadow-xl"
					>
						<h2 className="font-display text-3xl font-bold flex items-center gap-3">
							<Target weight="duotone" className="text-accent-2" />
							{t("about.vision.title")}
						</h2>
						<p className="mt-(--space-md) text-lg leading-relaxed text-text-inverse/80">
							{t("about.vision.body")}
						</p>
					</m.div>
				</div>

				{/* Values */}
				<div className="mt-32 grid gap-8 md:grid-cols-3">
					{VALUES.map((value, i) => (
						<m.div
							key={value.title}
							initial={{ y: 20, opacity: 0 }}
							whileInView={{ y: 0, opacity: 1 }}
							viewport={{ once: true }}
							transition={{ delay: i * 0.1 }}
							className="rounded-3xl border border-border bg-surface p-8 transition-all hover:border-primary/20 hover:shadow-lg"
						>
							<div
								className={`mb-6 flex size-14 items-center justify-center rounded-2xl ${value.color}`}
							>
								<value.icon size={32} weight="duotone" />
							</div>
							<h3 className="font-display text-xl font-bold">{value.title}</h3>
							<p className="mt-(--space-sm) text-text-secondary leading-relaxed">
								{value.description}
							</p>
						</m.div>
					))}
				</div>
			</div>
		</div>
	);
};

export default AboutPage;
