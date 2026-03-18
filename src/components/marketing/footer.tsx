"use client";

import Link from "next/link";
import { House, TwitterLogo, GithubLogo, DiscordLogo } from "@phosphor-icons/react";
import { useLocale } from "@/components/providers/locale-provider";
import { m } from "framer-motion";

export const Footer = () => {
	const { t } = useLocale();
	const year = new Date().getFullYear();

	const FOOTER_LINKS = [
		{
			title: t("footer.product"),
			links: [
				{ href: "/about", label: t("nav.about") },
				{ href: "/pricing", label: t("nav.pricing") },
				{ href: "/contact", label: t("nav.contact") },
			],
		},
		{
			title: t("footer.resources"),
			links: [
				{ href: "#", label: t("footer.docs") },
				{ href: "#", label: t("footer.apiStatus") },
				{ href: "#", label: t("footer.community") },
			],
		},
		{
			title: t("footer.company"),
			links: [
				{ href: "#", label: t("footer.privacy") },
				{ href: "#", label: t("footer.terms") },
				{ href: "#", label: t("footer.support") },
			],
		},
	];

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
							{t("footer.tagline")}
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
							&copy; {year} Zlot Ops. {t("footer.copyright")}
						</p>
						<div className="flex items-center gap-(--space-md) text-xs text-text-secondary">
							<span>
								{t("footer.status")}:{" "}
								<span className="text-success font-medium">{t("footer.operational")}</span>
							</span>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};
