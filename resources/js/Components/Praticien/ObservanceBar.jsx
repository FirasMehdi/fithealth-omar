import { useTranslation } from '../../i18n';

export default function ObservanceBar({ value }) {
    const { t } = useTranslation();

    if (value === null || value === undefined) {
        return (
            <div>
                <div className="mb-1.5 text-xs text-forest/50">{t('Observance — 7 derniers jours')}</div>
                <div className="h-2 rounded-full bg-sand/40" />
                <div className="mt-1 text-xs text-forest/50">{t('Pas de protocole actif')}</div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between gap-2 text-xs text-forest/50">
                <span>{t('Observance — 7 derniers jours')}</span>
                <span className="font-semibold text-forest">{value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-sand/40">
                <div className="h-full rounded-full bg-sage" style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}
