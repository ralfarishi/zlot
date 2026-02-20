"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, HouseLine, ListDashes } from "@phosphor-icons/react";
import { cn } from "@/src/lib/utils";

interface NavItem {
	title: string;
	slug: string;
}

interface DocsLayoutProps {
	children: React.ReactNode;
	title: string;
	navigation?: NavItem[];
}

export const DocsLayout = ({ children, title, navigation = [] }: DocsLayoutProps) => {
	const pathname = usePathname();

	// Calculate Next/Prev
	const currentIndex = navigation.findIndex((item) => pathname.includes(item.slug));
	const prevStep = currentIndex > 0 ? navigation[currentIndex - 1] : null;
	const nextStep = currentIndex < navigation.length - 1 ? navigation[currentIndex + 1] : null;

	return (
		<div className="relative min-h-screen bg-background overflow-hidden selection:bg-primary/30 selection:text-text-primary">
			{/* Persistent Industrial Background Elements */}
			<div className="fixed inset-0 pointer-events-none">
				<div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border/20 to-transparent" />
				<div className="absolute inset-0 opacity-[0.03] dot-matrix" />
				<div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px]" />
				<div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[40%] bg-secondary/3 rounded-full blur-[100px]" />
				<div className="absolute left-10 inset-y-0 w-px bg-border/20 hidden lg:block" />
				<div className="absolute left-12 inset-y-0 w-px bg-border/10 hidden lg:block" />
			</div>

			<div className="container relative mx-auto max-w-6xl px-6 py-24 sm:py-32 flex flex-col lg:flex-row gap-20">
				{/* Sidebar Navigation */}
				<m.aside
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6 }}
					className="hidden lg:block w-64 shrink-0 sticky top-32 h-fit"
				>
					<div className="space-y-12">
						{/* Brand/Root */}
						<div className="space-y-4">
							<span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-text-secondary/40">
								Access Layer
							</span>
							<Link
								href="/"
								className="group flex items-center gap-3 text-sm font-bold text-text-secondary hover:text-primary transition-colors"
							>
								<div className="size-8 rounded-lg bg-surface/50 border border-border/40 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
									<HouseLine size={16} />
								</div>
								Main Terminal
							</Link>
						</div>

						{/* Doc Links */}
						<div className="space-y-6">
							<div className="flex items-center gap-3">
								<BookOpen size={14} className="text-primary" />
								<span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-text-primary">
									Core Modules
								</span>
							</div>
							<nav className="flex flex-col gap-1 border-l border-border/20 pl-4 py-2">
								{navigation.map((item) => {
									const isActive = pathname.includes(item.slug);
									return (
										<Link
											key={item.slug}
											href={`/docs/${item.slug}`}
											className={cn(
												"text-[13px] py-2 transition-all relative group flex items-center justify-between",
												isActive
													? "text-primary font-bold"
													: "text-text-secondary/60 hover:text-text-primary",
											)}
										>
											{item.title}
											{isActive && (
												<m.div
													layoutId="active-pill"
													className="absolute -left-[17px] w-0.5 h-4 bg-primary rounded-full"
												/>
											)}
										</Link>
									);
								})}
							</nav>
						</div>

						{/* System Metadata Overlay */}
						<div className="p-5 rounded-2xl bg-surface/30 border border-border/20 backdrop-blur-md">
							<div className="flex items-center gap-2 mb-4">
								<ListDashes size={14} className="text-secondary" />
								<span className="text-[10px] font-mono font-bold uppercase text-text-primary tracking-widest">
									System_Meta
								</span>
							</div>
							<div className="space-y-3">
								<div className="flex justify-between text-[10px] font-mono">
									<span className="text-text-secondary/30 uppercase">Build</span>
									<span className="text-text-secondary/80 font-bold">ALPHA_2.0</span>
								</div>
								<div className="flex justify-between text-[10px] font-mono">
									<span className="text-text-secondary/30 uppercase">Nodes</span>
									<span className="text-text-secondary/80 font-bold">04_ACTIVE</span>
								</div>
							</div>
						</div>
					</div>
				</m.aside>

				{/* Content Section */}
				<m.main
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
					className="flex-1 min-w-0"
				>
					{/* Header Metadata */}
					<div className="mb-20">
						<m.div
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.2 }}
							className="flex items-center gap-3 mb-6"
						>
							<div className="h-px w-8 bg-primary/40" />
							<span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-primary">
								Documentation // {title}
							</span>
						</m.div>

						<m.h1
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							className="text-6xl sm:text-8xl font-display font-black tracking-tighter text-text-primary mb-8"
						>
							{title}
						</m.h1>

						<m.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.4 }}
							className="flex items-center gap-6 text-[10px] font-mono text-text-secondary/40 uppercase tracking-widest"
						>
							<div className="flex items-center gap-2">
								<span className="size-1 bg-success rounded-full" />
								<span>Verified_Doc</span>
							</div>
							<span className="h-4 w-px bg-border/20" />
							<span>Proprietary_Zlot_Protocol</span>
						</m.div>
					</div>

					{/* The Article Rendering */}
					<div className="zlot-docs-article prose-custom">{children}</div>

					{/* Navigation Pagination */}
					<div className="mt-32 grid grid-cols-1 sm:grid-cols-2 gap-6 pb-20 border-b border-border/20">
						{prevStep ? (
							<Link
								href={`/docs/${prevStep.slug}`}
								className="group flex flex-col p-8 rounded-2xl bg-surface/30 border border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
							>
								<span className="text-[10px] font-mono font-bold text-text-secondary/40 uppercase tracking-widest mb-4 flex items-center gap-2">
									<ArrowLeft
										size={12}
										className="group-hover:-translate-x-1 transition-transform"
									/>{" "}
									Previous Module
								</span>
								<span className="text-xl font-display font-black text-text-primary group-hover:text-primary transition-colors uppercase">
									{prevStep.title}
								</span>
							</Link>
						) : (
							<div />
						)}

						{nextStep ? (
							<Link
								href={`/docs/${nextStep.slug}`}
								className="group flex flex-col p-8 rounded-2xl bg-surface/30 border border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all text-right"
							>
								<span className="text-[10px] font-mono font-bold text-text-secondary/40 uppercase tracking-widest mb-4 flex items-center gap-2 justify-end">
									Next Module{" "}
									<ArrowRight
										size={12}
										className="group-hover:translate-x-1 transition-transform"
									/>
								</span>
								<span className="text-xl font-display font-black text-text-primary group-hover:text-primary transition-colors uppercase">
									{nextStep.title}
								</span>
							</Link>
						) : (
							<div />
						)}
					</div>

					{/* Footer Metadata */}
					<div className="mt-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-24">
						<div className="flex flex-col gap-1">
							<span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-text-secondary/30">
								Terminal Outpost
							</span>
							<div className="flex items-center gap-2">
								<div className="size-1 rounded-full bg-success/60 shadow-[0_0_8px_rgba(var(--success),0.5)]" />
								<span className="text-[10px] font-mono text-text-secondary/50 uppercase">
									Encryption Secure // Link Stable
								</span>
							</div>
						</div>

						<div className="text-[9px] font-mono text-text-secondary/30 text-right uppercase tracking-tighter leading-relaxed">
							&copy; 2026 Antigravity Systems. Internal Release.
							<br />
							Zlot Protocol V2 // Clearance Level_01 Required
						</div>
					</div>
				</m.main>
			</div>
		</div>
	);
};
