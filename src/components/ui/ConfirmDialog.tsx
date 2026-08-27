interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 id="confirm-title" className="text-base font-semibold text-slate-900">
          {title}
        </h2>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}