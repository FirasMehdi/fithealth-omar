import { Link, usePage } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import GrowthChart from '../../Components/Praticien/Charts/GrowthChart';
import ObservanceChart from '../../Components/Praticien/Charts/ObservanceChart';
import TierBreakdownChart from '../../Components/Praticien/Charts/TierBreakdownChart';
import PraticienLayout from '../../Layouts/PraticienLayout';
import { useTranslation } from '../../i18n';

function StatCard({ label, value, tone = 'forest' }) {
    return (
        <div className="min-w-35 flex-1 rounded-2xl bg-white px-5.5 py-3.5 shadow-lg shadow-forest/20">
            <div className="mb-1.5 text-xs text-forest/60">{label}</div>
            <div className={'text-2xl font-bold tabular-nums ' + (tone === 'terracotta' ? 'text-terracotta' : 'text-forest')}>
                {value}
            </div>
        </div>
    );
}

function ChartCard({ title, subtitle, children }) {
    return (
        <div className="rounded-2xl bg-white px-6 py-5.5 shadow-lg shadow-forest/20">
            <h2 className="font-display text-base font-semibold text-forest">{title}</h2>
            <p className="mb-4 text-xs text-forest/60">{subtitle}</p>
            {children}
        </div>
    );
}

function Watchlist({ patients, t }) {
    return (
        <div className="rounded-2xl bg-white px-6 py-5.5 shadow-lg shadow-forest/20">
            <div className="mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-terracotta" />
                <h2 className="font-display text-base font-semibold text-forest">{t('À traiter cette semaine')}</h2>
            </div>

            {patients.length === 0 ? (
                <p className="text-sm text-forest/60">{t('Rien à signaler — tous vos patients sont à jour.')}</p>
            ) : (
                <div className="flex flex-col gap-2.5">
                    {patients.map((p) => (
                        <Link
                            key={p.id}
                            href={`/praticien/patients/${p.id}`}
                            className="flex items-center gap-3 rounded-xl bg-cream px-4 py-3 hover:bg-sand/20"
                        >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sage/20 text-sm font-bold text-forest">
                                {p.initials}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-forest">{p.name}</span>
                                <span className="block text-xs text-terracotta">{p.reason}</span>
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Dashboard({ todayLabel, stats, growthTrend, observanceTrend, observanceTiers, watchlist }) {
    const practitionerName = usePage().props.auth.user.name;
    const { t } = useTranslation();

    return (
        <PraticienLayout title={t('Tableau de bord')}>
            <div className="mb-6">
                <h1 className="font-display mb-1 text-2xl font-semibold text-forest">{t('Bonjour, :name', { name: practitionerName })}</h1>
                <p className="text-sm text-forest/60">{todayLabel}</p>
            </div>

            <div className="mb-5 flex flex-wrap gap-3.5">
                <StatCard label={t('Patients actifs')} value={stats.activePatients} />
                <StatCard label={t('Nouveaux ce mois-ci')} value={stats.newPatientsThisMonth} />
                <StatCard label={t('Check-ins cette semaine')} value={stats.checkinsThisWeek} />
                <StatCard label={t('Messages non lus')} value={stats.unreadMessages} tone="terracotta" />
            </div>

            <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                <ChartCard title={t('Croissance du cabinet')} subtitle={t('Total de patients suivis et nouveaux patients, 12 derniers mois')}>
                    <GrowthChart trend={growthTrend} t={t} />
                </ChartCard>
                <ChartCard title={t('Observance moyenne du cabinet')} subtitle={t('Moyenne des patients actifs, 12 dernières semaines')}>
                    <ObservanceChart trend={observanceTrend} t={t} />
                </ChartCard>
            </div>

            <div className="mb-5">
                <ChartCard title={t('Répartition de l’observance')} subtitle={t('Cliquez sur une tranche pour voir les patients concernés')}>
                    <TierBreakdownChart tiers={observanceTiers} t={t} />
                </ChartCard>
            </div>

            <Watchlist patients={watchlist} t={t} />
        </PraticienLayout>
    );
}
