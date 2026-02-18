"use client";

import Link from "next/link";
import {
	ArrowRight,
	ShieldCheck,
	ChartLineUp,
	Sparkle,
	CheckCircle,
	ArrowUpRight,
	Target,
	Lightning,
	Globe,
	Quotes,
} from "@phosphor-icons/react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const FEATURES = [
	{
		icon: ShieldCheck,
		title: "Unmatched Control",
		description:
			"The ultimate command center for parking lot owners. Manage staff, dynamically set rates, and define high-precision zones with zero friction.",
		color: "text-primary bg-primary/5",
		delay: 0.1,
	},
	{
		icon: ChartLineUp,
		title: "Real-Time Intelligence",
		description:
			"Stop guessing and start optimizing. Get instant insights into revenue trends and occupancy benchmarks through a high-performance analytics engine.",
		color: "text-secondary bg-secondary/5",
		delay: 0.2,
	},
	{
		icon: Lightning,
		title: "Lightning Operations",
		description:
			"Speed is everything on the front line. Our pro console allows your team to scan, park, and print receipts in under 3 seconds.",
		color: "text-accent-1 bg-accent-1/5",
		delay: 0.3,
	},
] as const;

const TESTIMONIALS = [
	{
		name: "Firaun Ngutangkhamun Akehtenan III",
		company: "Kerajaan Ngibulnesia",
		testimony:
			"Zlot's dynamic scaling alone increased our weekend revenue by 22%. It's the smartest investment we've made in years.",
	},
	{
		name: "Tuanku Imam Bohong",
		company: "Thorne Real Estate",
		testimony:
			"Total visibility into our multi-site operations. The audit trails are bulletproof and the print speed is unmatched.",
	},
	{
		name: "Pangeran Nipunegoro",
		company: "City Central Valet",
		testimony:
			"Zero learning curve for our staff. We went from manual logs to high-precision cloud sync in a single afternoon.",
	},
	{
		name: "Sunan Masukparit",
		company: "Peak Development",
		testimony:
			"Finally, a platform that understands occupancy velocity. Zlot transformed our most congested lots into efficient revenue engines.",
	},
	{
		name: "Benjamin Seskowi",
		company: "Sterling Airports",
		testimony:
			"Industrial-grade reliability. The offline buffering in the print engine saved us during a major network outage.",
	},
] as const;

const STATS = [
	{ value: "99.99%", label: "Operational Uptime", icon: Sparkle },
	{ value: "<3s", label: "Check-in Velocity", icon: Lightning },
	{ value: "50+", label: "Active Zones", icon: Globe },
	{ value: "24/7", label: "Global Availability", icon: CheckCircle },
] as const;

const LandingPage = () => {
	const targetRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: targetRef,
		offset: ["start start", "end start"],
	});

	const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
	const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

	return (
		<div className="flex flex-col bg-background selection:bg-primary/10">
			{/* Hero Section */}
			<section
				ref={targetRef}
				className="relative min-h-[90vh] flex flex-col items-center justify-center px-(--space-lg) pt-32 pb-20"
			>
				{/* Background Decorations */}
				<div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
					<div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
					<div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
				</div>

				<motion.div
					style={{ opacity, scale }}
					className="mx-auto flex max-w-6xl flex-col items-center text-center"
				>
					<motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.5 }}
						className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-secondary/20 bg-secondary/5 px-4 py-1.5 text-[10px] font-black tracking-[0.2em] text-secondary uppercase"
					>
						<Sparkle weight="fill" className="animate-pulse" />
						Future-Proof Parking Operations
					</motion.div>

					<motion.h1
						initial={{ y: 30, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
						className="relative font-display text-6xl font-black leading-[0.95] tracking-tighter sm:text-8xl md:text-[120px] lg:text-[140px] text-text-primary"
					>
						Parking, <br />
						<span className="text-secondary italic">Simplified.</span>
					</motion.h1>

					<motion.p
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.2, duration: 0.8 }}
						className="mt-10 max-w-2xl text-lg font-bold leading-relaxed text-text-secondary md:text-2xl"
					>
						Scale your revenue, automate your lot, and outpace the competition. Zlot is the elite
						command center for modern parking operators.
					</motion.p>

					<motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.3, duration: 0.8 }}
						className="mt-14 flex flex-col gap-5 sm:flex-row"
					>
						<Link
							href="/login"
							className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-primary px-10 py-5 text-xl font-black text-text-inverse shadow-2xl transition-all hover:-translate-y-1 active:scale-95"
						>
							<span className="relative z-10">Launch Console</span>
							<ArrowRight
								size={22}
								weight="bold"
								className="relative z-10 transition-transform group-hover:translate-x-1"
							/>
							<div className="absolute inset-0 bg-secondary translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
						</Link>
						<Link
							href="/about"
							className="flex items-center justify-center gap-2 rounded-full border-2 border-border bg-surface/50 backdrop-blur-sm px-10 py-5 text-xl font-bold text-text-primary transition-all hover:bg-surface-elevated hover:border-primary/20"
						>
							See Performance
							<ArrowUpRight size={20} weight="bold" className="text-text-secondary" />
						</Link>
					</motion.div>
				</motion.div>

				{/* Floating scroll indicator */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 1, duration: 1 }}
					className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block"
				>
					<div className="w-px h-16 bg-linear-to-b from-primary/50 to-transparent" />
				</motion.div>
			</section>

			{/* Stats Section */}
			<section className="relative py-20 bg-primary overflow-hidden">
				<div className="absolute inset-0 opacity-10 pointer-events-none">
					<div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--color-secondary)_1px,transparent_1px)] bg-size-[32px_32px]" />
				</div>
				<div className="mx-auto grid max-w-6xl grid-cols-2 gap-12 px-(--space-lg) md:grid-cols-4 relative z-10">
					{STATS.map((stat, i) => (
						<motion.div
							key={stat.label}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: i * 0.1 }}
							className="flex flex-col items-center text-center"
						>
							<div className="mb-4 flex size-14 items-center justify-center rounded-2xl text-text-inverse shadow-inner ring-1 ring-text-inverse/10">
								<stat.icon size={32} weight="duotone" />
							</div>
							<p className="font-display text-5xl font-black tracking-tighter text-text-inverse">
								{stat.value}
							</p>
							<p className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-text-inverse/50">
								{stat.label}
							</p>
						</motion.div>
					))}
				</div>
			</section>

			{/* Core Features */}
			<section className="px-(--space-lg) py-32 md:py-48">
				<div className="mx-auto max-w-6xl">
					<div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
						<div className="max-w-xl">
							<h2 className="font-display text-5xl font-black tracking-tighter md:text-7xl text-text-primary">
								Built for the <br /> <span className="text-secondary italic">Modern Fleet.</span>
							</h2>
						</div>
						<p className="text-lg font-bold text-text-secondary max-w-xs">
							Enterprise-grade tools condensed into a lightning-fast dashboard.
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-3">
						{FEATURES.map((feature) => (
							<motion.div
								key={feature.title}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: feature.delay }}
								className="group flex flex-col rounded-[32px] border border-border bg-surface p-10 transition-all duration-500 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5"
							>
								<div
									className={`mb-8 flex size-16 items-center justify-center rounded-2xl ${feature.color} shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
								>
									<feature.icon size={32} weight="duotone" />
								</div>
								<h3 className="mb-4 font-display text-2xl font-black tracking-tight text-text-primary">
									{feature.title}
								</h3>
								<p className="text-lg font-medium leading-relaxed text-text-secondary/80">
									{feature.description}
								</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Testimonial Section */}
			<section className="relative py-32 overflow-hidden bg-surface-elevated/30">
				<div className="mx-auto max-w-6xl px-(--space-lg) mb-16">
					<h2 className="font-display text-4xl font-black tracking-tighter md:text-6xl text-text-primary text-center">
						Trusted by the <br /> <span className="text-secondary italic">Industry Leaders.</span>
					</h2>
				</div>

				<div className="flex overflow-hidden">
					<motion.div
						animate={{
							x: [0, -1920],
						}}
						transition={{
							duration: 30,
							ease: "linear",
							repeat: Infinity,
						}}
						className="flex gap-8 whitespace-nowrap py-10"
					>
						{[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
							<div
								key={`${t.name}-${i}`}
								className="flex w-[400px] flex-col rounded-[32px] border border-border bg-surface p-8 shadow-sm transition-all hover:border-primary/20 hover:shadow-xl shrink-0"
							>
								<div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-secondary/5 text-secondary">
									<Quotes size={24} weight="fill" />
								</div>
								<p className="text-lg font-medium leading-relaxed text-text-primary whitespace-normal">
									&quot;{t.testimony}&quot;
								</p>
								<div className="mt-8 pt-6 border-t border-border/50">
									<p className="font-black text-text-primary uppercase tracking-tight">{t.name}</p>
									<p className="text-xs font-bold text-text-secondary/60 uppercase tracking-widest">
										{t.company}
									</p>
								</div>
							</div>
						))}
					</motion.div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="px-(--space-lg) py-32">
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mx-auto max-w-6xl rounded-[48px] bg-secondary p-12 text-center text-text-inverse md:py-24 md:px-16 relative overflow-hidden shadow-2xl shadow-secondary/20"
				>
					<div className="relative z-10 flex flex-col items-center">
						<div className="mb-8 flex size-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 ring-1 ring-text-inverse/10 text-text-inverse">
							<Target size={40} weight="duotone" />
						</div>
						<h2 className="font-display text-4xl font-black tracking-tighter md:text-6xl max-w-4xl">
							Ready to dominate your market?
						</h2>
						<p className="mx-auto mt-10 max-w-xl text-xl font-bold text-text-inverse/80 leading-relaxed">
							Join the elite operators running their business on Zlot. Ultimate precision, total
							security, zero compromises.
						</p>
						<Link
							href="/login"
							className="mt-10 inline-flex items-center gap-4 rounded-full bg-white px-10 py-5 text-xl font-black text-primary transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] active:scale-95 group"
						>
							Get Expert Access
							<ArrowRight
								size={22}
								weight="bold"
								className="transition-transform group-hover:translate-x-2"
							/>
						</Link>
					</div>
					{/* Complex abstract shapes */}
					<div className="absolute top-0 right-0 -mr-32 -mt-32 size-96 rounded-full bg-white/5 blur-3xl animate-pulse" />
					<div className="absolute bottom-0 left-0 -ml-32 -mb-32 size-96 rounded-full bg-primary/20 blur-3xl" />
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,var(--color-primary)_1px,transparent_1px)] bg-size-[64px_64px] opacity-10" />
				</motion.div>
			</section>
		</div>
	);
};

export default LandingPage;
