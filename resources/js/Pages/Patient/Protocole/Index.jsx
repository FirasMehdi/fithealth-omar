import { router } from '@inertiajs/react';
import { Apple, Dumbbell, Moon } from 'lucide-react';
import { useState } from 'react';
import ChecklistItem from '../../../Components/Patient/ChecklistItem';
import PatientLayout from '../../../Layouts/PatientLayout';
import { useTranslation } from '../../../i18n';

function dayIsCompleted(day) {
    const all = [...day.sport, ...day.nutrition];
    return all.length > 0 && all.every((item) => item.done);
}

function DayButton({ day, selected, onSelect }) {
    return (
        <button
            type="button"
            onClick={onSelect}
            style={{ borderRadius: '14px' }}
            className={
                'flex min-w-19.5 flex-col items-center gap-1.5 px-4.5 py-3.5 ' +
                (selected ? 'bg-forest text-cream shadow-lg shadow-forest/30' : 'bg-white text-forest shadow-md shadow-forest/15')
            }
        >
            <span className="text-sm font-bold">{day.day}</span>
            <span className={'size-1.5 rounded-full ' + (dayIsCompleted(day) ? 'bg-sage' : 'bg-transparent')} />
        </button>
    );
}

function ColumnHeader({ icon: Icon, label }) {
    return (
        <div className="mb-3.5 flex items-center gap-2.5">
            <div className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-sage">
                <Icon size={16} className="text-cream" />
            </div>
            <h3 className="text-sm font-bold tracking-wide text-forest/60 uppercase">{label}</h3>
        </div>
    );
}

function RestDayState({ t }) {
    return (
        <div className="px-2.5 py-7.5 text-center">
            <div className="mx-auto mb-3.5 flex size-11.5 items-center justify-center rounded-full bg-sand/30">
                <Moon size={22} className="text-sage" />
            </div>
            <p className="mb-1 text-base font-semibold text-forest">{t('Jour de repos')}</p>
            <p className="text-sm text-forest/60">{t('Rien de prévu — repose-toi.')}</p>
        </div>
    );
}

export default function ProtocoleIndex({ weekPlan }) {
    const todayIndex = (new Date().getDay() + 6) % 7;
    const [selected, setSelected] = useState(weekPlan.length > 0 ? todayIndex : 0);
    const { t } = useTranslation();

    function toggle(item, date) {
        router.post(`/patient/protocol-items/${item.id}/toggle`, { date }, { preserveScroll: true });
    }

    return (
        <PatientLayout title={t('Mon programme')}>
            <div style={{ maxWidth: '900px' }}>
                <h1 className="font-display mb-6.5 text-2xl font-semibold text-forest">{t('Mon programme de la semaine')}</h1>

                {weekPlan.length === 0 ? (
                    <div className="rounded-2xl bg-white px-6 py-16 text-center">
                        <p className="mb-1 text-base font-semibold text-forest">{t('Pas encore de programme.')}</p>
                        <p className="text-sm text-forest/60">{t("Ton praticien va bientôt t'en créer un.")}</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-7.5 flex flex-wrap gap-2.5">
                            {weekPlan.map((day, i) => (
                                <DayButton key={day.date} day={day} selected={i === selected} onSelect={() => setSelected(i)} />
                            ))}
                        </div>

                        <div style={{ borderRadius: '18px' }} className="bg-white px-8 py-7.5 shadow-lg shadow-forest/20">
                            <h2 className="font-display mb-5 text-lg font-semibold text-forest">{weekPlan[selected].fullDay}</h2>

                            {weekPlan[selected].sport.length === 0 && weekPlan[selected].nutrition.length === 0 ? (
                                <RestDayState t={t} />
                            ) : (
                                <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                    <div className="border-e border-sand/30 pe-8">
                                        <ColumnHeader icon={Dumbbell} label={t('Sport')} />
                                        {weekPlan[selected].sport.length === 0 ? (
                                            <p className="text-sm text-forest/40">{t('Rien aujourd\'hui.')}</p>
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                {weekPlan[selected].sport.map((item) => (
                                                    <ChecklistItem
                                                        key={item.id}
                                                        icon={Dumbbell}
                                                        label={item.text}
                                                        done={item.done}
                                                        onToggle={() => toggle(item, weekPlan[selected].date)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <ColumnHeader icon={Apple} label={t('Alimentation')} />
                                        {weekPlan[selected].nutrition.length === 0 ? (
                                            <p className="text-sm text-forest/40">{t('Rien aujourd\'hui.')}</p>
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                {weekPlan[selected].nutrition.map((item) => (
                                                    <ChecklistItem
                                                        key={item.id}
                                                        icon={Apple}
                                                        label={item.text}
                                                        done={item.done}
                                                        onToggle={() => toggle(item, weekPlan[selected].date)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </PatientLayout>
    );
}
