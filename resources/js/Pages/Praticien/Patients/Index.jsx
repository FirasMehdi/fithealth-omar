import { Plus, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import AddPatientModal from '../../../Components/Praticien/AddPatientModal';
import PatientCard from '../../../Components/Praticien/PatientCard';
import PraticienLayout from '../../../Layouts/PraticienLayout';
import { useTranslation } from '../../../i18n';

function filters(t) {
    return [
        { key: 'tous', label: t('Tous') },
        { key: 'retard', label: t('En retard') },
        { key: 'nouveaux', label: t('Nouveaux') },
    ];
}

function tierLabels(t) {
    return {
        under25: t('Observance : moins de 25%'),
        '25to50': t('Observance : 25 – 50%'),
        '50to75': t('Observance : 50 – 75%'),
        over75: t('Observance : plus de 75%'),
    };
}

function inTier(observance, tier) {
    if (observance === null || observance === undefined) return false;
    if (tier === 'under25') return observance < 25;
    if (tier === '25to50') return observance >= 25 && observance < 50;
    if (tier === '50to75') return observance >= 50 && observance < 75;
    return observance >= 75;
}

export default function PatientsIndex({ patients, initialObservanceTier }) {
    const [filter, setFilter] = useState('tous');
    const [tierFilter, setTierFilter] = useState(initialObservanceTier ?? null);
    const [addPatientOpen, setAddPatientOpen] = useState(false);
    const { t } = useTranslation();
    const FILTERS = filters(t);
    const TIER_LABELS = tierLabels(t);

    const filtered = useMemo(() => {
        let list = patients;

        if (filter === 'retard') list = list.filter((p) => p.status === 'en_retard');
        if (filter === 'nouveaux') list = list.filter((p) => p.status === 'nouveau');
        if (tierFilter) list = list.filter((p) => inTier(p.observance, tierFilter));

        return list;
    }, [filter, tierFilter, patients]);

    const hasNoPatientsAtAll = patients.length === 0;
    const filterHasNoResults = !hasNoPatientsAtAll && filtered.length === 0;

    return (
        <PraticienLayout title={t('Patients')}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h1 className="font-display text-2xl font-semibold text-forest">{t('Patients')}</h1>

                <button
                    type="button"
                    onClick={() => setAddPatientOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-forest px-4.5 py-2.75 text-sm font-semibold text-cream hover:opacity-90"
                >
                    <Plus size={16} />
                    {t('Nouveau patient')}
                </button>
            </div>

            {tierFilter && (
                <div className="mb-4">
                    <button
                        type="button"
                        onClick={() => setTierFilter(null)}
                        className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream"
                    >
                        {TIER_LABELS[tierFilter] ?? t('Filtré')}
                        <X size={14} />
                    </button>
                </div>
            )}

            <div className="mb-5 flex gap-2">
                {FILTERS.map((f) => (
                    <button
                        key={f.key}
                        type="button"
                        onClick={() => setFilter(f.key)}
                        className={
                            'rounded-full px-4 py-2 text-sm font-semibold ' +
                            (filter === f.key ? 'bg-forest text-cream' : 'bg-sand/40 text-forest')
                        }
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {hasNoPatientsAtAll && (
                <div className="rounded-2xl bg-white px-6 py-16 text-center">
                    <Users className="mx-auto mb-4 text-forest/30" size={40} />
                    <p className="mb-1 text-base font-semibold text-forest">{t('Aucun patient pour l’instant')}</p>
                    <p className="text-sm text-forest/60">{t('Créez votre premier patient avec le bouton ci-dessus.')}</p>
                </div>
            )}

            {filterHasNoResults && (
                <div className="rounded-2xl bg-white px-5 py-14 text-center">
                    <p className="mb-1 text-base font-semibold text-forest">{t('Aucun patient dans ce filtre')}</p>
                    <p className="text-sm text-forest/60">{t('Essayez un autre filtre, ou revenez à « Tous ».')}</p>
                </div>
            )}

            {!hasNoPatientsAtAll && !filterHasNoResults && (
                <div className="flex flex-col gap-3">
                    {filtered.map((patient) => (
                        <PatientCard key={patient.id} patient={patient} />
                    ))}
                </div>
            )}

            <AddPatientModal open={addPatientOpen} onClose={() => setAddPatientOpen(false)} />
        </PraticienLayout>
    );
}
