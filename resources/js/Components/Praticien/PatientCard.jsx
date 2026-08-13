import { Link } from '@inertiajs/react';
import { useTranslation } from '../../i18n';
import ObservanceBar from './ObservanceBar';

export default function PatientCard({ patient }) {
    const { t } = useTranslation();

    const STATUS = {
        a_jour: { dot: 'bg-sage', bg: 'bg-sage/15', text: 'text-forest', label: t('À jour') },
        en_retard: { dot: 'bg-terracotta', bg: 'bg-terracotta/12', text: 'text-terracotta', label: t('Check-in en retard') },
        nouveau: { dot: 'bg-sand', bg: 'bg-sand/50', text: 'text-forest', label: t('Nouveaux') },
    };

    const status = STATUS[patient.status];

    return (
        <Link
            href={`/praticien/patients/${patient.id}`}
            className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-5 text-forest shadow-md shadow-forest/10 transition hover:shadow-lg hover:shadow-forest/15"
        >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sage/15 text-sm font-bold text-forest">
                {patient.initials}
            </div>

            <div className="min-w-40 flex-1 basis-44">
                <div className="mb-1.5 text-base font-semibold">{patient.name}</div>
                <span className="inline-block rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-forest">
                    {patient.goal}
                </span>
            </div>

            <div className="min-w-32 flex-1 basis-40">
                <ObservanceBar value={patient.observance} />
            </div>

            <div className="basis-28 text-sm text-forest/60">{patient.lastCheckIn ?? t('Aucun check-in')}</div>

            <div className="ms-auto shrink-0">
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${status.bg} ${status.text}`}
                >
                    <span className={`size-1.5 shrink-0 rounded-full ${status.dot}`} />
                    {status.label}
                </span>
            </div>
        </Link>
    );
}
