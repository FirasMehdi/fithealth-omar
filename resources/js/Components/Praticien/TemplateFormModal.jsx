import { useForm } from '@inertiajs/react';
import { Plus, X } from 'lucide-react';
import { useEffect } from 'react';
import Modal from '../Modal';
import { useTranslation } from '../../i18n';

function days(t) {
    return [
        { value: 1, label: t('Lun') },
        { value: 2, label: t('Mar') },
        { value: 3, label: t('Mer') },
        { value: 4, label: t('Jeu') },
        { value: 5, label: t('Ven') },
        { value: 6, label: t('Sam') },
        { value: 7, label: t('Dim') },
    ];
}

const EMPTY_ITEM = { pillar: 'mouvement', title: '', sets: '', reps: '', permanent: true, days: [] };

const inputClass = 'rounded-lg border border-sand bg-white px-2.5 py-1.5 text-sm text-forest focus:ring-2 focus:ring-sage focus:outline-none';

/**
 * Un template stocke ses items à plat (une ligne par jour, day_of_week null
 * pour les permanents) — on les regroupe ici pour retrouver une ligne de
 * formulaire par exercice/consigne, avec sa liste de jours.
 */
function groupItemsForForm(items) {
    const groups = new Map();

    for (const item of items) {
        const key = `${item.pillar}|${item.title}|${item.sets ?? ''}|${item.reps ?? ''}`;

        if (!groups.has(key)) {
            groups.set(key, {
                pillar: item.pillar,
                title: item.title,
                sets: item.sets ?? '',
                reps: item.reps ?? '',
                permanent: false,
                days: [],
            });
        }

        const group = groups.get(key);

        if (item.day_of_week === null) {
            group.permanent = true;
        } else {
            group.days.push(item.day_of_week);
        }
    }

    return Array.from(groups.values());
}

/**
 * Ré-aplatit les lignes de formulaire vers le format stocké : une entrée par
 * jour sélectionné, ou une seule entrée day_of_week=null si permanent.
 */
function flattenItems(items) {
    const flat = [];
    const position = { mouvement: 0, nutrition: 0 };

    for (const item of items) {
        if (!item.title.trim()) continue;

        position[item.pillar] += 1;

        const base = {
            pillar: item.pillar,
            title: item.title,
            sets: item.pillar === 'mouvement' && item.sets ? Number(item.sets) : null,
            reps: item.pillar === 'mouvement' && item.reps ? item.reps : null,
            position: position[item.pillar],
        };

        if (item.permanent) {
            flat.push({ ...base, day_of_week: null });
        } else {
            for (const day of item.days) {
                flat.push({ ...base, day_of_week: day });
            }
        }
    }

    return flat;
}

function ItemRow({ item, onChange, onRemove, canRemove, t }) {
    const isMouvement = item.pillar === 'mouvement';
    const DAYS = days(t);

    function set(field, value) {
        onChange({ ...item, [field]: value });
    }

    function toggleDay(day) {
        set('days', item.days.includes(day) ? item.days.filter((d) => d !== day) : [...item.days, day].sort());
    }

    return (
        <div className="rounded-xl border border-sand/50 p-3.5">
            <div className="mb-2 flex flex-wrap items-start gap-2">
                <select value={item.pillar} onChange={(e) => set('pillar', e.target.value)} className={inputClass + ' shrink-0'}>
                    <option value="mouvement">{t('Mouvement')}</option>
                    <option value="nutrition">{t('Nutrition')}</option>
                </select>
                <input
                    type="text"
                    placeholder={t('Titre')}
                    value={item.title}
                    onChange={(e) => set('title', e.target.value)}
                    className={inputClass + ' min-w-0 flex-1 basis-40'}
                />
                <button
                    type="button"
                    onClick={onRemove}
                    disabled={!canRemove}
                    className="shrink-0 rounded-lg p-1.5 text-forest/40 hover:bg-terracotta/10 hover:text-terracotta disabled:opacity-30"
                >
                    <X size={16} />
                </button>
            </div>

            {isMouvement && (
                <div className="mb-2 flex flex-wrap gap-2">
                    <input
                        type="number"
                        min="1"
                        placeholder={t('Séries')}
                        value={item.sets}
                        onChange={(e) => set('sets', e.target.value)}
                        className={inputClass + ' min-w-0 flex-1 basis-24'}
                    />
                    <input
                        type="text"
                        placeholder="12 reps, 30 min…"
                        value={item.reps}
                        onChange={(e) => set('reps', e.target.value)}
                        className={inputClass + ' min-w-0 flex-1 basis-40'}
                    />
                </div>
            )}

            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-forest">
                <input
                    type="checkbox"
                    checked={item.permanent}
                    onChange={(e) => set('permanent', e.target.checked)}
                    className="size-3.5 accent-sage"
                />
                {t('Tous les jours')}
            </label>

            {!item.permanent && (
                <div className="flex flex-wrap gap-1">
                    {DAYS.map((day) => (
                        <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleDay(day.value)}
                            className={
                                'rounded-full px-2.5 py-1 text-xs font-semibold ' +
                                (item.days.includes(day.value) ? 'bg-forest text-cream' : 'bg-sand/40 text-forest')
                            }
                        >
                            {day.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function TemplateFormModal({ open, onClose, template }) {
    const isEdit = Boolean(template);
    const { t } = useTranslation();
    const { data, setData, post, put, transform, processing, errors, reset } = useForm({
        title: '',
        description: '',
        items: [{ ...EMPTY_ITEM }],
    });

    useEffect(() => {
        if (!open) return;

        if (template) {
            setData({
                title: template.title,
                description: template.description ?? '',
                items: groupItemsForForm(template.items),
            });
        } else {
            setData({ title: '', description: '', items: [{ ...EMPTY_ITEM }] });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, template]);

    function updateItem(index, newItem) {
        const items = [...data.items];
        items[index] = newItem;
        setData('items', items);
    }

    function addItem() {
        setData('items', [...data.items, { ...EMPTY_ITEM }]);
    }

    function removeItem(index) {
        setData('items', data.items.filter((_, i) => i !== index));
    }

    function close() {
        reset();
        onClose();
    }

    const canSubmit =
        data.title.trim() !== '' &&
        data.items.some((item) => item.title.trim() !== '') &&
        data.items.every((item) => item.title.trim() === '' || item.permanent || item.days.length > 0);

    function submit(e) {
        e.preventDefault();

        transform((formData) => ({
            title: formData.title,
            description: formData.description,
            items: flattenItems(formData.items),
        }));

        const options = { preserveScroll: true, onSuccess: close };

        if (isEdit) {
            put(`/praticien/protocoles/${template.id}`, options);
        } else {
            post('/praticien/protocoles', options);
        }
    }

    return (
        <Modal open={open} onClose={close} title={isEdit ? t('Modifier le modèle') : t('Nouveau modèle')} maxWidth={560}>
            <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                    <label htmlFor="template-title" className="mb-1 block text-sm font-semibold text-forest">
                        {t('Titre du modèle')}
                    </label>
                    <input
                        id="template-title"
                        type="text"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        className={inputClass + ' w-full'}
                    />
                    {errors.title && <p className="mt-1 text-sm text-terracotta">{errors.title}</p>}
                </div>

                <div>
                    <label htmlFor="template-description" className="mb-1 block text-sm font-semibold text-forest">
                        {t('Description')}
                    </label>
                    <textarea
                        id="template-description"
                        rows={2}
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        className={inputClass + ' w-full'}
                    />
                </div>

                <div>
                    <p className="mb-2 text-sm font-semibold text-forest">{t('Items')}</p>
                    <div className="flex max-h-80 flex-col gap-2.5 overflow-y-auto pe-1">
                        {data.items.map((item, index) => (
                            <ItemRow
                                key={index}
                                item={item}
                                onChange={(newItem) => updateItem(index, newItem)}
                                onRemove={() => removeItem(index)}
                                canRemove={data.items.length > 1}
                                t={t}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addItem}
                        className="mt-2.5 flex items-center gap-1.5 text-sm font-semibold text-forest hover:text-sage"
                    >
                        <Plus size={16} />
                        {t('Ajouter un item')}
                    </button>

                    {errors.items && <p className="mt-2 text-sm text-terracotta">{t('Merci de vérifier les items du modèle.')}</p>}
                </div>

                <button
                    type="submit"
                    disabled={processing || !canSubmit}
                    className="rounded-xl bg-forest py-2.75 text-sm font-semibold text-cream disabled:opacity-50"
                >
                    {isEdit ? t('Enregistrer') : t('Créer le modèle')}
                </button>
            </form>
        </Modal>
    );
}
