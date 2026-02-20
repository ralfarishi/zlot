"use client";

import Link from "next/link";
import { House, TwitterLogo, GithubLogo, DiscordLogo } from "@phosphor-icons/react";
import { m } from "framer-motion";

const FOOTER_LINKS = [
	{
		title: "Product",
		links: [
			{ href: "/about", label: "About" },
			{ href: "/pricing", label: "Pricing" },
			{ href: "/contact", label: "Contact" },
		],
	},
	{
		title: "Resources",
		links: [
			{ href: "#", label: "Documentation" },
			{ href: "#", label: "API Status" },
			{ href: "#", label: "Community" },
		],
	},
	{
		title: "Company",
		links: [
			{ href: "#", label: "Privacy" },
			{ href: "#", label: "Terms" },
			{ href: "#", label: "Support" },
		],
	},
] as const;

export const Footer = () => {
	const year = new Date().getFullYear();

	return (
		<footer className="border-t border-border bg-surface px-(--space-lg) py-(--space-2xl)">
			<div className="mx-auto max-w-6xl">
				<div className="grid grid-cols-1 gap-(--space-2xl) md:grid-cols-4">
					{/* Brand Column */}
					<div className="md:col-span-1">
						<Link
							href="/"
							className="group flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-primary"
						>
							<div className="flex size-8 items-center justify-center rounded-lg bg-primary text-text-inverse transition-transform group-hover:rotate-12">
								<House weight="fill" size={18} />
							</div>
							<span>Zlot</span>
						</Link>
						<p className="mt-(--space-md) text-sm leading-relaxed text-text-secondary">
							Reimagining parking management for the modern era. Efficient, reliable, and built for
							speed.
						</p>
						<div className="mt-(--space-lg) flex gap-(--space-md)">
							{[TwitterLogo, GithubLogo, DiscordLogo].map((Icon, i) => (
								<m.a
									key={i}
									href="#"
									whileHover={{ y: -3, color: "var(--color-primary)" }}
									className="text-text-secondary transition-colors"
								>
									<Icon size={24} weight="duotone" />
								</m.a>
							))}
						</div>
					</div>

					{/* Links Columns */}
					{FOOTER_LINKS.map((group) => (
						<div key={group.title}>
							<h4 className="font-display text-sm font-bold uppercase tracking-wider text-text-primary">
								{group.title}
							</h4>
							<ul className="mt-(--space-md) space-y-(--space-sm)">
								{group.links.map((link) => (
									<li key={link.label}>
										<Link
											href={link.href}
											className="text-sm text-text-secondary transition-colors hover:text-primary hover:underline hover:underline-offset-4"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<div className="mt-(--space-2xl) border-t border-border pt-(--space-lg)">
					<div className="flex flex-col items-center justify-between gap-(--space-md) sm:flex-row">
						<p className="text-xs text-text-secondary">
							&copy; {year} Zlot Ops. All rights reserved. Built with precision.
						</p>
						<div className="flex items-center gap-(--space-md) text-xs text-text-secondary">
							<span>
								System Status: <span className="text-success font-medium">Operational</span>
							</span>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};
