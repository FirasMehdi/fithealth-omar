import { Link, router, usePage } from '@inertiajs/react';
import { Heart, SquareCheck } from 'lucide-react';
import ChecklistItem, { PILLAR_ICONS } from '../../Components/Patient/ChecklistItem';
import PatientLayout from '../../Layouts/PatientLayout';
import { useTranslation } from '../../i18n';

function CardIcon({ icon: Icon }) {
    return (
        <div className="flex size-9.5 shrink-0 items-center justify-center rounded-xl bg-sage">
            <Icon size={19} className="text-cream" />
        </div>
    );
}

export default function Dashboard({ todayLabel, nextCheckIn, todayItems, vitalite }) {
    const firstName = usePage().props.auth.user.name.split(' ')[0];
    const { t } = useTranslation();

    function toggleItem(item) {
        router.post(`/patient/protocol-items/${item.id}/toggle`, {}, { preserveScroll: true });
    }

    return (
        <PatientLayout title={t('Accueil')}>
            <div style={{ maxWidth: '1000px' }}>
                <div className="mb-7.5 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="font-display mb-1 text-2xl font-semibold text-forest">
                            {t('Bonjour, :name', { name: firstName })}
                        </h1>
                        <p className="text-sm text-forest/60">{todayLabel}</p>
                    </div>
                    <span className="rounded-full bg-sand px-4 py-2 text-sm font-semibold text-forest">{nextCheckIn}</span>
                </div>

                <div className="mb-5 grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
                    <div className="rounded-2xl bg-white px-7 py-6.5 shadow-lg shadow-forest/20">
                        <div className="mb-4.5 flex items-center gap-3">
                            <CardIcon icon={SquareCheck} />
                            <h2 className="font-display text-lg font-semibold text-forest">{t("Aujourd'hui")}</h2>
                        </div>

                        {todayItems.length === 0 ? (
                            <p className="text-sm text-forest/60">{t('Rien de prévu aujourd\'hui.')}</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {todayItems.map((item) => (
                                    <ChecklistItem
                                        key={item.id}
                                        icon={PILLAR_ICONS[item.pillar]}
                                        label={item.title}
                                        detail={item.detail}
                                        done={item.done}
                                        onToggle={() => toggleItem(item)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl bg-white px-7 py-6.5 shadow-lg shadow-forest/20">
                        <div className="mb-4.5 flex items-center gap-3">
                            <CardIcon icon={Heart} />
                            <h2 className="font-display text-lg font-semibold text-forest">{t('Conseils')}</h2>
                        </div>

                        {vitalite.length === 0 ? (
                            <p className="text-sm text-forest/60">{t('Pas encore de conseils.')}</p>
                        ) : (
                            <div className="flex flex-col gap-2.5">
                                {vitalite.map((item) => (
                                    <ChecklistItem key={item.id} icon={Heart} label={item.text} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-forest px-8 py-7.5">
                    <div>
                        <h2 className="font-display mb-1.5 text-lg font-semibold text-cream">
                            {t('Comment tu te sens aujourd\'hui ?')}
                        </h2>
                        <p className="text-sm text-cream/70" style={{ maxWidth: '44ch' }}>
                            {t('Une question rapide, en quelques secondes.')}
                        </p>
                    </div>
                    <Link
                        href="/patient/checkin"
                        className="rounded-xl bg-sage px-6.5 py-3.25 text-sm font-semibold whitespace-nowrap text-forest hover:opacity-90"
                    >
                        {t('Faire mon check-in')}
                    </Link>
                </div>
            </div>
        </PatientLayout>
    );
}
