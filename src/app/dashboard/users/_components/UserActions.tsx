"use client";

import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import {
	PencilSimple,
	ToggleLeft,
	ToggleRight,
	Trash,
	ArrowsClockwise,
} from "@phosphor-icons/react";
import { toggleProfileActive, deleteProfile } from "@/src/actions/profiles";
import { cn } from "@/src/lib/utils";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { Profile } from "./types";

interface UserActionsProps {
	profile: Profile;
	currentUser?: { id: string; role: string };
}

export const UserActions = ({ profile, currentUser }: UserActionsProps) => {
	const [isPending, startTransition] = useTransition();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const isAdmin = currentUser?.role === "admin";
	const isSelf = currentUser?.id === profile.id;
	const canManage = isAdmin && !isSelf;

	const handleToggle = useCallback(() => {
		if (!canManage) return;
		startTransition(async () => {
			await toggleProfileActive(profile.id, !profile.isActive);
		});
	}, [profile.id, profile.isActive, canManage]);

	const handleDelete = useCallback(() => {
		if (!canManage) return;
		startTransition(async () => {
			try {
				await deleteProfile(profile.id);
				setIsDeleteDialogOpen(false);
			} catch (err) {
				console.error("Delete failed", err);
			}
		});
	}, [profile.id, canManage]);

	return (
		<div className="flex items-center justify-end gap-1">
			{isAdmin && (
				<Link
					href={`/dashboard/users/${profile.id}`}
					className="flex size-9 items-center justify-center rounded-lg text-text-secondary transition-all hover:bg-primary/10 hover:text-primary active:scale-90"
					aria-label={`Edit ${profile.namaLengkap}`}
				>
					<PencilSimple size={18} weight="duotone" />
				</Link>
			)}
			<button
				type="button"
				onClick={handleToggle}
				disabled={isPending || !canManage}
				className={cn(
					"flex size-9 items-center justify-center rounded-lg text-text-secondary transition-all hover:bg-surface-elevated hover:text-text-primary active:scale-90",
					(isPending || !canManage) && "opacity-30 cursor-not-allowed",
				)}
				title={isSelf ? "Self-deactivation restricted" : !isAdmin ? "Admin access required" : ""}
				aria-label={`${profile.isActive ? "Deactivate" : "Activate"} ${profile.namaLengkap}`}
			>
				{profile.isActive ? (
					<ToggleRight size={24} weight="fill" className="text-success" />
				) : (
					<ToggleLeft size={24} className="text-text-secondary/40" />
				)}
			</button>
			<button
				type="button"
				onClick={() => setIsDeleteDialogOpen(true)}
				disabled={isPending || !canManage}
				className={cn(
					"flex size-9 items-center justify-center rounded-lg text-text-secondary transition-all hover:bg-danger/10 hover:text-danger active:scale-90",
					(isPending || !canManage) && "opacity-30 cursor-not-allowed",
				)}
				title={isSelf ? "Self-deletion restricted" : !isAdmin ? "Admin access required" : ""}
				aria-label={`Delete ${profile.namaLengkap}`}
			>
				<Trash size={18} weight="duotone" />
			</button>

			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="text-xl text-danger uppercase tracking-tight font-black">
							Security Protocol: Decommission
						</AlertDialogTitle>
						<AlertDialogDescription className="text-sm font-medium leading-relaxed">
							You are about to terminate all system access for{" "}
							<span className="font-black text-text-primary uppercase tracking-tighter">
								{profile.namaLengkap}
							</span>
							. This action will immediately void their credentials and is terminal.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="mt-8 flex sm:flex-row flex-col gap-3">
						<AlertDialogCancel className="w-full sm:flex-1 rounded-xl bg-surface border-2 border-border h-14 text-xs font-black uppercase tracking-[0.2em] transition-all hover:bg-surface-elevated active:scale-95 m-0">
							Abort
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isPending}
							className="w-full sm:flex-1 rounded-xl bg-danger h-14 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-danger/20 transition-all hover:bg-danger/90 active:scale-95 disabled:opacity-50 m-0 border-none"
						>
							{isPending ? (
								<ArrowsClockwise size={20} weight="bold" className="animate-spin" />
							) : (
								"Confirm Decommission"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};
