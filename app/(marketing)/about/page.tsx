"use client";

import { Users, Target, RocketLaunch, ChatCenteredDots, Heart } from "@phosphor-icons/react";
import { motion } from "framer-motion";

const VALUES = [
	{
		icon: RocketLaunch,
		title: "Built for Speed",
		description:
			"We obsess over the milliseconds. Your team shouldn&apos;t wait for the software to catch up to the cars.",
		color: "text-primary bg-primary/10",
	},
	{
		icon: Users,
		title: "Human Focused",
		description:
			"From the admin setting rates to the employee at the gate, we build for the humans behind the screen.",
		color: "text-accent-1 bg-accent-1/10",
	},
	{
		icon: Heart,
		title: "Passion for Ops",
		description:
			"We think parking operations are beautiful. We build tools that treat them with the respect they deserve.",
		color: "text-accent-2 bg-accent-2/10",
	},
] as const;

const AboutPage = () => {
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
					<motion.h1
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						className="font-display text-5xl font-black tracking-tighter md:text-8xl"
					>
						Parking, <br />
						<span className="text-secondary italic">Redefined.</span>
					</motion.h1>
					<motion.p
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.1 }}
						className="mx-auto mt-(--space-lg) max-w-2xl text-lg leading-relaxed text-text-secondary md:text-2xl font-bold"
					>
						Zlot isn&apos;t just a database. It&apos;s a movement to bring parking management into
						the 21st century. No more clunky 2005 interfaces. Just smooth, fast, and reliable ops.
					</motion.p>
				</div>

				<div className="grid gap-12 md:grid-cols-2 mt-20">
					{/* Story */}
					<motion.div
						initial={{ x: -20, opacity: 0 }}
						whileInView={{ x: 0, opacity: 1 }}
						viewport={{ once: true }}
						className="rounded-3xl border border-border bg-surface p-10 shadow-sm"
					>
						<h2 className="font-display text-3xl font-bold flex items-center gap-3">
							<ChatCenteredDots weight="duotone" className="text-primary" />
							The Zlot Story
						</h2>
						<p className="mt-(--space-md) text-lg leading-relaxed text-text-secondary">
							We spent weeks watching parking lots operate. We saw the clipboards, the frozen
							screens, and the frustrated owners. We knew there was a better way. Zlot was born from
							a desire to make operations invisible—so smooth you forget the software is even there.
						</p>
					</motion.div>

					{/* Vision */}
					<motion.div
						initial={{ x: 20, opacity: 0 }}
						whileInView={{ x: 0, opacity: 1 }}
						viewport={{ once: true }}
						className="rounded-3xl border border-border bg-primary p-10 text-text-inverse shadow-xl"
					>
						<h2 className="font-display text-3xl font-bold flex items-center gap-3">
							<Target weight="duotone" className="text-accent-2" />
							Our Vision
						</h2>
						<p className="mt-(--space-md) text-lg leading-relaxed text-text-inverse/80">
							Our goal is to be the heartbeat of every high-performance parking lot worldwide.
							We&apos;re building the infrastructure that lets business owners scale from one lot to
							one thousand without breaking a sweat.
						</p>
					</motion.div>
				</div>

				{/* Values */}
				<div className="mt-32 grid gap-8 md:grid-cols-3">
					{VALUES.map((value, i) => (
						<motion.div
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
						</motion.div>
					))}
				</div>
			</div>
		</div>
	);
};

export default AboutPage;
