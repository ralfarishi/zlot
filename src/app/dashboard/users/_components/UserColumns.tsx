"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { User, IdentificationBadge, ChartLineUp, Calendar } from "@phosphor-icons/react";
import { cn } from "@/src/lib/utils";
import { Profile } from "./types";
import { UserActions } from "./UserActions";

const columnHelper = createColumnHelper<Profile>();

const ROLE_COLORS: Record<string, string> = {
	admin: "bg-danger/10 text-danger ring-danger/20",
	employee: "bg-primary/10 text-primary ring-primary/20",
	owner: "bg-secondary/10 text-secondary ring-secondary/20",
};

export const createColumns = (currentUser?: { id: string; role: string }) => [
	columnHelper.accessor("fullName", {
		header: () => (
			<div className="flex items-center gap-2">
				<User size={14} weight="bold" />
				Name
			</div>
		),
		cell: (info) => (
			<div className="flex items-center gap-3">
				<div className="flex size-8 items-center justify-center rounded-full bg-surface-elevated font-bold text-text-secondary ring-1 ring-border">
					{info.getValue().charAt(0).toUpperCase()}
				</div>
				<span className="font-bold text-text-primary tracking-tight">{info.getValue()}</span>
			</div>
		),
	}),
	columnHelper.accessor("role", {
		header: () => (
			<div className="flex items-center gap-2">
				<IdentificationBadge size={14} weight="bold" />
				Role
			</div>
		),
		cell: (info) => (
			<span
				className={cn(
					"inline-flex rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ring-1 ring-inset",
					ROLE_COLORS[info.getValue()] || "bg-secondary/10 text-secondary",
				)}
			>
				{info.getValue()}
			</span>
		),
	}),
	columnHelper.accessor("isActive", {
		header: () => (
			<div className="flex items-center gap-2">
				<ChartLineUp size={14} weight="bold" />
				Status
			</div>
		),
		cell: (info) => (
			<div className="flex items-center gap-2">
				<div
					className={cn(
						"size-1.5 rounded-full",
						info.getValue() ? "bg-success animate-pulse" : "bg-text-secondary/30",
					)}
				/>
				<span
					className={cn(
						"text-xs font-bold uppercase tracking-tight",
						info.getValue() ? "text-success" : "text-text-secondary/60",
					)}
				>
					{info.getValue() ? "Active" : "Offline"}
				</span>
			</div>
		),
	}),
	columnHelper.accessor("createdAt", {
		header: () => (
			<div className="flex items-center gap-2">
				<Calendar size={14} weight="bold" />
				Joined
			</div>
		),
		cell: (info) => (
			<div className="flex flex-col">
				<span className="text-xs font-bold text-text-primary">
					{new Date(info.getValue()).toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
						year: "numeric",
					})}
				</span>
				<span className="text-[10px] text-text-secondary/50 font-bold uppercase tracking-tighter">
					SYSTEM AGENT
				</span>
			</div>
		),
	}),
	columnHelper.display({
		id: "actions",
		header: () => <div className="text-right">Actions</div>,
		cell: (info) => <UserActions profile={info.row.original} currentUser={currentUser} />,
	}),
];
