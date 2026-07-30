import { useForm } from '@inertiajs/react';
import Modal from '../Modal';

const DAYS = [
    { value: 1, label: 'Lun' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Mer' },
    { value: 4, label: 'Jeu' },
    { value: 5, label: 'Ven' },
    { value: 6, label: 'Sam' },
    { value: 7, label: 'Dim' },
];

const inputClass =
    'w-full rounded-xl border border-sand bg-white px-3.5 py-2.5 text-sm text-forest focus:ring-2 focus:ring-sage focus:outline-none';

export default function AddItemModal({ open, onClose, protocolId, pillar }) {
    const isMouvement = pillar === 'mouvement';
    const { data, setData, post, processing, errors, reset } = useForm({
        pillar,
        title: '',
        sets: '',
        reps: '',
        permanent: true,
        days: [],
    });

    function toggleDay(day) {
        setData('days', data.days.includes(day) ? data.days.filter((d) => d !== day) : [...data.days, day].sort());
    }

    function close() {
        reset();
        onClose();
    }

    function submit(e) {
        e.preventDefault();
        post(`/praticien/protocols/${protocolId}/items`, {
            preserveScroll: true,
            onSuccess: close,
        });
    }

    return (
        <Modal open={open} onClose={close} title={isMouvement ? 'Ajouter un exercice' : 'Ajouter un élément nutrition'} maxWidth={440}>
            <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                    <label htmlFor="item-title" className="mb-1 block text-sm font-semibold text-forest">
                        {isMouvement ? 'Exercice' : 'Repas ou consigne'}
                    </label>
                    <input
                        id="item-title"
                        type="text"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        autoFocus
                        className={inputClass}
                    />
                    {errors.title && <p className="mt-1 text-sm text-terracotta">{errors.title}</p>}
                </div>

                {isMouvement && (
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label htmlFor="item-sets" className="mb-1 block text-sm font-semibold text-forest">
                                Séries
                            </label>
                            <input
                                id="item-sets"
                                type="number"
                                min="1"
                                value={data.sets}
                                onChange={(e) => setData('sets', e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="item-reps" className="mb-1 block text-sm font-semibold text-forest">
                                Volume
                            </label>
                            <input
                                id="item-reps"
                                type="text"
                                placeholder="12 reps, 30 min…"
                                value={data.reps}
                                onChange={(e) => setData('reps', e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-forest">
                        <input
                            type="checkbox"
                            checked={data.permanent}
                            onChange={(e) => setData('permanent', e.target.checked)}
                            className="size-4 accent-sage"
                        />
                        Tous les jours
                    </label>

                    {!data.permanent && (
                        <div className="flex flex-wrap gap-1.5">
                            {DAYS.map((day) => (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => toggleDay(day.value)}
                                    className={
                                        'rounded-full px-3 py-1.5 text-xs font-semibold ' +
                                        (data.days.includes(day.value) ? 'bg-forest text-cream' : 'bg-sand/40 text-forest')
                                    }
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    )}
                    {errors.days && <p className="mt-1 text-sm text-terracotta">{errors.days}</p>}
                </div>

                <button
                    type="submit"
                    disabled={processing || !data.title || (!data.permanent && data.days.length === 0)}
                    className="rounded-xl bg-forest py-2.75 text-sm font-semibold text-cream disabled:opacity-50"
                >
                    Ajouter
                </button>
            </form>
        </Modal>
    );
}
