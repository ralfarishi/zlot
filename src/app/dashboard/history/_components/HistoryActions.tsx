"use client";

import { useState, useTransition } from "react";
import { Receipt, Trash } from "@phosphor-icons/react";
import { useLocale } from "@/src/components/providers/locale-provider";
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
	const { t } = useLocale();

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
			{transaction.status === "keluar" && (
				<button
					onClick={() => onViewReceipt(transaction)}
					className={cn(
						"flex size-8 items-center justify-center rounded-lg border transition-all active:scale-95",
						"border-border bg-surface text-text-secondary hover:bg-surface-elevated hover:text-primary",
					)}
					title={t("history.actions.viewReceipt")}
					aria-label={t("history.actions.viewReceipt")}
				>
					<Receipt size={16} weight="bold" />
				</button>
			)}
			<button
				onClick={() => setIsDeleteDialogOpen(true)}
				className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-all hover:bg-error/5 hover:text-error active:scale-95"
				title={t("history.actions.deleteTransaction")}
			>
				<Trash size={16} weight="bold" />
			</button>
			{/* Delete Alert */}
			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="text-xl text-danger uppercase tracking-tight">
							{t("history.actions.deleteTitle")}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t("history.actions.deleteDesc")}{" "}
							<span className="font-mono font-bold text-text-primary">
								{transaction.nomorTransaksi}
							</span>{" "}
							{t("history.actions.deleteDesc2")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="mt-8 flex sm:flex-row flex-col gap-3">
						<AlertDialogCancel className="w-full sm:flex-1 rounded-xl bg-surface border-2 border-border h-14 text-xs font-black uppercase tracking-[0.2em] transition-all hover:bg-surface-elevated active:scale-95 m-0">
							{t("history.actions.abort")}
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isPending}
							className="w-full sm:flex-1 rounded-xl bg-danger h-14 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-danger/20 transition-all hover:bg-danger/90 active:scale-95 disabled:opacity-50 m-0 border-none"
						>
							{isPending ? t("history.actions.purging") : t("history.actions.confirmPurge")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};
