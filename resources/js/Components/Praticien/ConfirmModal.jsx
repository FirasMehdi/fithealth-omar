import Modal from '../Modal';

export default function ConfirmModal({ open, onClose, onConfirm, processing, title, message, confirmLabel = 'Confirmer' }) {
    return (
        <Modal open={open} onClose={onClose} title={title} maxWidth={400}>
            <p className="mb-6 text-center text-sm text-forest/70">{message}</p>
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-xl border border-sand py-2.75 text-sm font-semibold text-forest"
                >
                    Annuler
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={processing}
                    className="flex-1 rounded-xl bg-terracotta py-2.75 text-sm font-semibold text-cream disabled:opacity-50"
                >
                    {confirmLabel}
                </button>
            </div>
        </Modal>
    );
}
