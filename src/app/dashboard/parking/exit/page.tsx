import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import * as React from "react";
import { getTranslator } from "@/src/lib/i18n/server";
import { ExitForm } from "./exit-form";

export const metadata: Metadata = {
	title: "Vehicle Exit | Zlot",
};

const ExitPage = async () => {
	const t = await getTranslator();
	return (
		<div className="mx-auto max-w-5xl space-y-(--space-lg)">
			<Link
				href="/dashboard/parking"
				className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary transition-colors hover:text-text-primary"
			>
				<ArrowLeft
					size={14}
					weight="bold"
					className="transition-transform group-hover:-translate-x-1"
				/>
				{t("exit.backToConsole")}
			</Link>

			<React.Suspense
				fallback={<div className="h-96 w-full animate-pulse rounded-card bg-surface-elevated/50" />}
			>
				<ExitForm />
			</React.Suspense>
		</div>
	);
};

export default ExitPage;
