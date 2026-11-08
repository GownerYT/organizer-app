import { useEffect, useRef } from "react";

export default function ConfirmDialog({ open, onCancel, onConfirm, isBusy }) {
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    cancelButtonRef.current?.focus();
    function handleEscape(event) {
      if (event.key === "Escape") onCancel();
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onCancel]);

  if (!open) return null;

  async function handleConfirm() {
    try {
      await onConfirm();
    } catch {
      // The app-level alert contains the safe database error.
    }
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <p className="eyebrow">This cannot be undone</p>
        <h2 id="delete-dialog-title">Delete all tasks?</h2>
        <p>Every saved task will be permanently deleted from this device.</p>
        <div className="dialog-actions">
          <button
            ref={cancelButtonRef}
            className="button button-ghost"
            type="button"
            onClick={onCancel}
            disabled={isBusy}
          >
            Cancel
          </button>
          <button
            className="button button-danger"
            type="button"
            onClick={() => void handleConfirm()}
            disabled={isBusy}
          >
            Delete All
          </button>
        </div>
      </div>
    </div>
  );
}
