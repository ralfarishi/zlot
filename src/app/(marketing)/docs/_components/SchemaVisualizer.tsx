"use client";

import { Key, Link as LinkIcon, Fingerprint, Table as TableIcon } from "@phosphor-icons/react";
import { cn } from "@/src/lib/utils";

interface ColumnProps {
	name: string;
	type: string;
	isPk?: boolean;
	isFk?: boolean;
	isUnique?: boolean;
	references?: string;
}

const Column = ({ name, type, isPk, isFk, isUnique, references }: ColumnProps) => (
	<div className="flex items-center justify-between px-5 py-3 hover:bg-white/2 border-b border-border/40 last:border-0 transition-colors group/row">
		<div className="flex items-center gap-3 min-w-0">
			<div className="flex items-center justify-center w-6 shrink-0">
				{isPk ? (
					<Key size={12} weight="fill" className="text-primary" />
				) : isUnique ? (
					<Fingerprint size={12} weight="bold" className="text-secondary" />
				) : isFk ? (
					<LinkIcon size={12} weight="bold" className="text-accent-1" />
				) : (
					<div className="size-1 bg-white/10 rounded-full" />
				)}
			</div>
			<div className="flex flex-col min-w-0 max-w-[200px]">
				<span
					className={cn(
						"text-[12px] font-mono tracking-tight transition-colors whitespace-nowrap overflow-x-auto scrollbar-hide",
						isPk ? "text-primary font-bold" : "text-text-primary/95",
					)}
				>
					{name}
				</span>
				{references && (
					<span className="text-[9px] font-mono text-text-secondary/40 flex items-center gap-1 uppercase tracking-tighter whitespace-nowrap overflow-x-auto scrollbar-hide">
						<LinkIcon size={8} /> {references}
					</span>
				)}
			</div>
		</div>
		<span className="text-[10px] font-mono text-text-secondary/30 group-hover/row:text-text-secondary/50 transition-colors uppercase tracking-widest ml-6 shrink-0 font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
			{type}
		</span>
	</div>
);

interface ERDTableProps {
	title: string;
	columns: ColumnProps[];
	description?: string;
}

const ERDTable = ({ title, columns, description }: ERDTableProps) => (
	<div className="flex flex-col rounded-xl bg-surface/50 border border-border/60 overflow-hidden shadow-2xl hover:border-primary/20 transition-all group min-w-[320px] max-w-sm h-fit">
		<div className="px-5 py-4 bg-white/3 border-b border-border/60">
			<div className="flex items-start gap-3">
				<div className="size-6 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
					<TableIcon size={14} className="text-primary" weight="bold" />
				</div>
				<div className="flex flex-col min-w-0">
					<h3 className="m-0 p-0 font-display font-black text-sm tracking-widest text-text-primary uppercase leading-6 truncate">
						{title}
					</h3>
					{description && (
						<p className="m-0 p-0 mt-1 text-[9px] text-text-secondary/40 font-black uppercase tracking-widest leading-none">
							{description}
						</p>
					)}
				</div>
			</div>
		</div>
		<div className="flex flex-col">
			{columns.map((col, idx) => (
				<Column key={idx} {...col} />
			))}
		</div>
	</div>
);

export const SchemaVisualizer = () => {
	const data = {
		transactions: [
			{ name: "id", type: "int8", isPk: true },
			{ name: "transaction_number", type: "varchar", isUnique: true },
			{ name: "vehicle_id", type: "int8", isFk: true, references: "vehicles.id" },
			{ name: "area_id", type: "int8", isFk: true, references: "parking_areas.id" },
			{ name: "rate_id", type: "int8", isFk: true, references: "rates.id" },
			{ name: "profile_id", type: "uuid", isFk: true, references: "profiles.id" },
			{ name: "status", type: "status_enum" },
			{ name: "total_cost", type: "numeric" },
			{ name: "payment_method", type: "payment_method_enum" },
			{ name: "entry_time", type: "timestamptz" },
			{ name: "exit_time", type: "timestamptz" },
		],
		vehicles: [
			{ name: "id", type: "int8", isPk: true },
			{ name: "plate_number", type: "text", isUnique: true },
			{ name: "profile_id", type: "uuid", isFk: true, references: "profiles.id" },
			{ name: "vehicle_type", type: "type_enum" },
			{ name: "color", type: "text" },
			{ name: "owner_name", type: "text" },
		],
		profiles: [
			{ name: "id", type: "uuid", isPk: true },
			{ name: "full_name", type: "text" },
			{ name: "role", type: "role_enum" },
			{ name: "is_active", type: "bool" },
		],
		areas: [
			{ name: "id", type: "int8", isPk: true },
			{ name: "area_name", type: "text" },
			{ name: "capacity", type: "int4" },
			{ name: "occupied", type: "int4" },
		],
		rates: [
			{ name: "id", type: "int8", isPk: true },
			{ name: "vehicle_type", type: "type_enum" },
			{ name: "hourly_rate", type: "numeric" },
		],
		activity_logs: [
			{ name: "id", type: "int8", isPk: true },
			{ name: "profile_id", type: "uuid", isFk: true, references: "profiles.id" },
			{ name: "action", type: "text" },
			{ name: "details", type: "jsonb" },
			{ name: "created_at", type: "timestamptz" },
		],
	};

	return (
		<div className="w-full py-12">
			{/* Scrollable Container */}
			<div className="w-full overflow-x-auto pb-12 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/20">
				<div className="flex gap-8 min-w-max pr-8 scale-80 origin-top-left transition-transform hover:scale-100 duration-500">
					{/* Transactions Column */}
					<div className="flex flex-col gap-10">
						<header className="px-1 border-l-2 border-primary/40">
							<span className="text-[10px] font-mono font-black text-primary uppercase tracking-[0.2em]">
								Primary Ledger
							</span>
						</header>
						<div className="flex flex-col gap-8">
							<ERDTable
								title="transactions"
								description="Main Activity Stream"
								columns={data.transactions}
							/>
							<ERDTable
								title="activity_logs"
								description="System Audit Trail"
								columns={data.activity_logs}
							/>
						</div>
					</div>

					{/* Core Data Column */}
					<div className="flex flex-col gap-10">
						<header className="px-1 border-l-2 border-secondary/40">
							<span className="text-[10px] font-mono font-black text-secondary uppercase tracking-[0.2em]">
								Domain Entities
							</span>
						</header>
						<div className="flex flex-col gap-8">
							<ERDTable title="vehicles" description="Asset Repository" columns={data.vehicles} />
							<ERDTable
								title="profiles"
								description="Identity Management"
								columns={data.profiles}
							/>
						</div>
					</div>

					{/* Config Column */}
					<div className="flex flex-col gap-10">
						<header className="px-1 border-l-2 border-accent-1/40">
							<span className="text-[10px] font-mono font-black text-accent-1 uppercase tracking-[0.2em]">
								Global Config
							</span>
						</header>
						<div className="flex flex-col gap-8">
							<ERDTable
								title="parking_areas"
								description="Operational Zones"
								columns={data.areas}
							/>
							<ERDTable title="rates" description="Billing Policies" columns={data.rates} />
						</div>
					</div>
				</div>
			</div>

			{/* Simple Legend */}
			<div className="mt-12 p-8 rounded-2xl bg-surface/30 border border-border/40 backdrop-blur-sm shadow-inner">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
					<div className="flex items-center gap-3">
						<Key size={14} className="text-primary" weight="fill" />
						<div className="flex flex-col">
							<span className="text-[11px] font-mono font-bold text-text-primary uppercase tracking-wider">
								Primary Key
							</span>
							<span className="text-[9px] text-text-secondary/40 font-medium">
								Record Identifier
							</span>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<Fingerprint size={14} className="text-secondary" weight="bold" />
						<div className="flex flex-col">
							<span className="text-[11px] font-mono font-bold text-text-secondary uppercase tracking-wider">
								Unique
							</span>
							<span className="text-[9px] text-text-secondary/40 font-medium">
								Duplicate Protection
							</span>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<LinkIcon size={14} className="text-accent-1" weight="bold" />
						<div className="flex flex-col">
							<span className="text-[11px] font-mono font-bold text-accent-1 uppercase tracking-wider">
								Foreign Key
							</span>
							<span className="text-[9px] text-text-secondary/40 font-medium">
								Domain Relationship
							</span>
						</div>
					</div>
					<div className="flex items-center gap-3 opacity-40">
						<div className="size-1.5 bg-white rounded-full mx-1.5" />
						<div className="flex flex-col">
							<span className="text-[11px] font-mono font-bold text-text-secondary uppercase tracking-wider">
								Scalar Field
							</span>
							<span className="text-[9px] text-text-secondary/40 font-medium">
								Standard Attribute
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
