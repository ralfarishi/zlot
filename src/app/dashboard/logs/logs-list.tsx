"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
	UserCircle,
	MagnifyingGlass,
	Circle,
	CheckCircle,
	Info,
	Warning,
	ArrowsClockwise,
	Trash,
	CaretLeft,
	CaretRight,
} from "@phosphor-icons/react";
import { m } from "framer-motion";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { cn } from "@/lib/utils";
import { deleteLog } from "@/src/actions/activity-logs";

interface LogEntry {
	id: string;
	activity: string;
	profileName: string;
	createdAt: Date;
}

interface LogsListProps {
	data: LogEntry[];
	page: number;
	perPage: number;
	total: number;
}

export const LogsList = ({ data, page, perPage, total }: LogsListProps) => {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const [search, setSearch] = useQueryState(
		"q",
		parseAsString.withDefault("").withOptions({ shallow: false, throttleMs: 300 }),
	);
	const [, setPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1).withOptions({ shallow: false }),
	);

	const totalPages = Math.max(1, Math.ceil(total / perPage));

	const handleDelete = (id: string) => {
		startTransition(async () => {
			await deleteLog(parseInt(id));
			router.refresh();
		});
	};

	const getLogIcon = (activity: string) => {
		const act = activity.toLowerCase();
		if (act.includes("created") || act.includes("added"))
			return <CheckCircle size={18} className="text-success" weight="duotone" />;
		if (act.includes("updated") || act.includes("changed"))
			return <Info size={18} className="text-secondary" weight="duotone" />;
		if (act.includes("deleted") || act.includes("removed"))
			return <Warning size={18} className="text-danger" weight="duotone" />;
		return <Circle size={12} className="text-primary" weight="fill" />;
	};

	return (
		<div className="space-y-(--space-md)">
			{/* Filters & Controls */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
				<div>
					<h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">
						Activity Telemetry
					</h3>
					<p className="text-[10px] text-text-secondary uppercase tracking-tight mt-0.5">
						System interaction & event audit log
					</p>
				</div>
				<div className="flex flex-1 items-center justify-end gap-3 max-w-2xl">
					<div className="relative flex-1 max-w-sm group">
						<MagnifyingGlass
							className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/40 group-focus-within:text-primary transition-colors"
							size={16}
							weight="bold"
						/>
						<input
							type="text"
							placeholder="SCAN AUDIT LOG..."
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setPage(1);
							}}
							className="h-9 w-full rounded-button border border-border bg-surface pl-9 pr-4 text-[10px] font-black uppercase tracking-widest outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20"
						/>
					</div>
					<div className="flex items-center gap-2 text-[10px] font-black text-text-secondary/40 uppercase tracking-widest whitespace-nowrap">
						<ArrowsClockwise size={12} className={cn(isPending && "animate-spin")} />
						{isPending ? "Syncing..." : `${total.toLocaleString()} entries`}
					</div>
				</div>
			</div>

			{/* Logs Grid */}
			<div className="rounded-card border border-border bg-surface shadow-card overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border bg-surface-elevated/50">
								<th className="px-(--space-md) py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">
									Event Signal
								</th>
								<th className="px-(--space-md) py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">
									Operator
								</th>
								<th className="px-(--space-md) py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">
									Timestamp
								</th>
								<th className="px-(--space-md) py-4 w-12" />
							</tr>
						</thead>
						<m.tbody
							key={data.map((d) => d.id).join()}
							variants={{
								show: { transition: { staggerChildren: 0.05 } },
							}}
							initial="hidden"
							animate="show"
						>
							{data.length === 0 ? (
								<tr className="border-t border-border">
									<td
										colSpan={4}
										className="px-(--space-md) py-12 text-center text-sm text-text-secondary italic"
									>
										No telemetry signals detected
									</td>
								</tr>
							) : (
								data.map((log) => (
									<m.tr
										key={log.id}
										variants={{
											hidden: { opacity: 0, x: -5 },
											show: { opacity: 1, x: 0 },
										}}
										className="group border-b border-border transition-colors last:border-0 hover:bg-primary/2"
									>
										<td className="px-(--space-md) py-4">
											<div className="flex items-center gap-3">
												<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-elevated ring-1 ring-border group-hover:ring-primary/30 group-hover:bg-primary/5 transition-all">
													{getLogIcon(log.activity)}
												</div>
												<div className="flex flex-col">
													<span className="text-xs font-bold text-text-primary uppercase tracking-tight">
														{log.activity}
													</span>
													<span className="text-[10px] text-text-secondary/60 font-medium">
														PROTOCOL_ID: {log.id.slice(0, 8)}
													</span>
												</div>
											</div>
										</td>
										<td className="px-(--space-md) py-4">
											<div className="flex items-center gap-2">
												<UserCircle size={14} className="text-text-secondary/40" />
												<span className="text-xs font-bold text-text-secondary italic">
													{log.profileName}
												</span>
											</div>
										</td>
										<td className="px-(--space-md) py-4 text-right">
											<div className="flex flex-col items-end">
												<span className="text-xs font-bold text-text-primary tracking-tighter">
													{new Date(log.createdAt).toLocaleTimeString("id-ID", {
														hour: "2-digit",
														minute: "2-digit",
														second: "2-digit",
														hour12: false,
													})}
												</span>
												<span className="text-[10px] text-text-secondary/40 font-bold uppercase tracking-tighter">
													{new Date(log.createdAt).toLocaleDateString("id-ID")}
												</span>
											</div>
										</td>
										<td className="px-(--space-md) py-4">
											<button
												type="button"
												onClick={() => handleDelete(log.id)}
												disabled={isPending}
												className="flex size-8 items-center justify-center rounded-lg text-text-secondary/30 transition-all hover:bg-danger/10 hover:text-danger active:scale-90 disabled:opacity-50 sm:opacity-0 group-hover:opacity-100"
												aria-label={`Delete log ${log.id}`}
											>
												<Trash size={16} weight="duotone" />
											</button>
										</td>
									</m.tr>
								))
							)}
						</m.tbody>
					</table>
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex items-center justify-between border-t border-border bg-surface-elevated/30 px-(--space-md) py-3">
						<span className="text-[10px] font-black uppercase tracking-widest text-text-secondary/50">
							Page {page} of {totalPages}
						</span>
						<div className="flex items-center gap-2">
							<button
								type="button"
								disabled={page <= 1 || isPending}
								onClick={() => setPage(page - 1)}
								className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-all hover:bg-surface-elevated hover:text-text-primary active:scale-90 disabled:opacity-30"
								aria-label="Previous page"
							>
								<CaretLeft size={14} weight="bold" />
							</button>
							<button
								type="button"
								disabled={page >= totalPages || isPending}
								onClick={() => setPage(page + 1)}
								className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-all hover:bg-surface-elevated hover:text-text-primary active:scale-90 disabled:opacity-30"
								aria-label="Next page"
							>
								<CaretRight size={14} weight="bold" />
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
