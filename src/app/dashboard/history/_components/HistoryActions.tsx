"use client";

import { useState, useTransition } from "react";
import { Receipt, Trash } from "@phosphor-icons/react";
import { deleteTransaction } from "@/src/actions/transactions";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/src/lib/utils";
import { HistoryTransaction } from "./types";

interface HistoryActionsProps {
	transaction: HistoryTransaction;
	onViewReceipt: (tx: HistoryTransaction) => void;
}

export const HistoryActions = ({ transaction, onViewReceipt }: HistoryActionsProps) => {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isPending, startTransition] = useTransition();

	const handleDelete = () => {
		startTransition(async () => {
			try {
				await deleteTransaction(transaction.id.toString());
				setIsDeleteDialogOpen(false);
			} catch (err) {
				console.error("Delete failed", err);
			}
		});
	};

	return (
		<div className="flex justify-end gap-2">
			{transaction.status === "exited" && (
				<button
					onClick={() => onViewReceipt(transaction)}
					className={cn(
						"flex size-8 items-center justify-center rounded-lg border transition-all active:scale-95",
						"border-border bg-surface text-text-secondary hover:bg-surface-elevated hover:text-primary",
					)}
					title="View Receipt"
					aria-label="View receipt"
				>
					<Receipt size={16} weight="bold" />
				</button>
			)}
			<button
				onClick={() => setIsDeleteDialogOpen(true)}
				className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-all hover:bg-error/5 hover:text-error active:scale-95"
				title="Delete Transaction"
			>
				<Trash size={16} weight="bold" />
			</button>
			{/* Delete Alert */}
			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="text-xl text-danger uppercase tracking-tight">
							Irreversible Deletion
						</AlertDialogTitle>
						<AlertDialogDescription>
							You are about to purge transaction{" "}
							<span className="font-mono font-bold text-text-primary">
								{transaction.transactionNumber}
							</span>{" "}
							from the registry. This action is terminal and cannot be undone.
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
							{isPending ? "Purging..." : "Confirm Purge"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};
