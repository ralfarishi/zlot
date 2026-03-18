import { ShieldSlash, House, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { getTranslator } from "@/src/lib/i18n/server";

const UnauthorizedPage = async () => {
	const t = await getTranslator();
	return (
		<div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
			<div className="relative mb-8">
				<div className="absolute inset-0 animate-ping rounded-full bg-danger/10" />
				<div className="relative flex size-24 items-center justify-center rounded-3xl bg-danger/10 ring-1 ring-danger/20">
					<ShieldSlash size={48} weight="duotone" className="text-danger" />
				</div>
				<WarningCircle
					size={24}
					weight="fill"
					className="absolute -bottom-1 -right-1 text-danger animate-bounce"
				/>
			</div>

			<h1 className="mb-2 font-display text-4xl font-black tracking-tighter text-text-primary uppercase">
				{t("unauthorized.title")}
			</h1>

			<div className="max-w-md space-y-4">
				<p className="text-xs font-black uppercase tracking-[0.2em] text-text-secondary/60">
					{t("unauthorized.protocol")}
				</p>

				<p className="text-sm font-medium leading-relaxed text-text-secondary">
					{t("unauthorized.desc")}
				</p>

				<div className="pt-6">
					<Link
						href="/dashboard"
						className="inline-flex items-center gap-2 rounded-xl bg-surface-elevated px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-text-primary shadow-lg ring-1 ring-border transition-all hover:bg-surface hover:scale-105 active:scale-95"
					>
						<House size={16} weight="bold" />
						{t("unauthorized.return")}
					</Link>
				</div>
			</div>

			{/* Decorative background elements */}
			<div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[500px] -translate-x-1/2 -translate-y-1/2 overflow-hidden opacity-10 blur-3xl">
				<div className="absolute inset-0 bg-danger/20" />
			</div>
		</div>
	);
};

export default UnauthorizedPage;
