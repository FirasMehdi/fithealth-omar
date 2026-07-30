import { useForm } from '@inertiajs/react';
import Modal from '../Modal';

export default function AddVitaliteItemModal({ open, onClose, patientId }) {
    const { data, setData, post, processing, errors, reset } = useForm({ text: '' });

    function close() {
        reset();
        onClose();
    }

    function submit(e) {
        e.preventDefault();
        post(`/praticien/patients/${patientId}/vitalite-items`, {
            preserveScroll: true,
            onSuccess: close,
        });
    }

    return (
        <Modal open={open} onClose={close} title="Ajouter une consigne" maxWidth={420}>
            <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                    <label htmlFor="vitalite-text" className="mb-1 block text-sm font-semibold text-forest">
                        Consigne
                    </label>
                    <input
                        id="vitalite-text"
                        type="text"
                        placeholder="Se coucher avant 23h…"
                        value={data.text}
                        onChange={(e) => setData('text', e.target.value)}
                        autoFocus
                        className="w-full rounded-xl border border-sand bg-white px-3.5 py-2.5 text-sm text-forest focus:ring-2 focus:ring-sage focus:outline-none"
                    />
                    {errors.text && <p className="mt-1 text-sm text-terracotta">{errors.text}</p>}
                </div>

                <button
                    type="submit"
                    disabled={processing || !data.text}
                    className="rounded-xl bg-forest py-2.75 text-sm font-semibold text-cream disabled:opacity-50"
                >
                    Ajouter
                </button>
            </form>
        </Modal>
    );
}
