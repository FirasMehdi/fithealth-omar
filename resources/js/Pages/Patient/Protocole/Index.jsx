import { router } from '@inertiajs/react';
import { Check, Dumbbell, Heart, Moon } from 'lucide-react';
import { useState } from 'react';
import PatientLayout from '../../../Layouts/PatientLayout';

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

function ItemRow({ item, date }) {
    function toggle() {
        router.post(`/patient/protocol-items/${item.id}/toggle`, { date }, { preserveScroll: true });
    }

    return (
        <div onClick={toggle} className="flex cursor-pointer items-center gap-3">
            <span
                className={
                    'flex size-5 shrink-0 items-center justify-center rounded-full border ' +
                    (item.done ? 'border-sage bg-sage' : 'border-sand bg-transparent')
                }
            >
                {item.done && <Check size={10} strokeWidth={2.2} className="text-cream" />}
            </span>
            <span className={'text-sm ' + (item.done ? 'text-forest/40' : 'text-forest')}>{item.text}</span>
        </div>
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

function RestDayState() {
    return (
        <div className="px-2.5 py-7.5 text-center">
            <div className="mx-auto mb-3.5 flex size-11.5 items-center justify-center rounded-full bg-sand/30">
                <Moon size={22} className="text-sage" />
            </div>
            <p className="mb-1 text-base font-semibold text-forest">Jour de repos</p>
            <p className="text-sm text-forest/60">Aucune séance prévue — profitez-en pour récupérer.</p>
        </div>
    );
}

export default function ProtocoleIndex({ weekPlan }) {
    const todayIndex = (new Date().getDay() + 6) % 7;
    const [selected, setSelected] = useState(weekPlan.length > 0 ? todayIndex : 0);

    return (
        <PatientLayout title="Protocole">
            <div style={{ maxWidth: '900px' }}>
                <h1 className="font-display mb-6.5 text-2xl font-semibold text-forest">Protocole de la semaine</h1>

                {weekPlan.length === 0 ? (
                    <div className="rounded-2xl bg-white px-6 py-16 text-center">
                        <p className="mb-1 text-base font-semibold text-forest">Aucun protocole actif</p>
                        <p className="text-sm text-forest/60">Votre praticien ne vous a pas encore assigné de protocole.</p>
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
                                <RestDayState />
                            ) : (
                                <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                    <div className="border-r border-sand/30 pr-8">
                                        <ColumnHeader icon={Dumbbell} label="Sport" />
                                        {weekPlan[selected].sport.length === 0 ? (
                                            <p className="text-sm text-forest/40">Aucune séance ce jour.</p>
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                {weekPlan[selected].sport.map((item) => (
                                                    <ItemRow key={item.id} item={item} date={weekPlan[selected].date} />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <ColumnHeader icon={Heart} label="Alimentation" />
                                        {weekPlan[selected].nutrition.length === 0 ? (
                                            <p className="text-sm text-forest/40">Aucune consigne ce jour.</p>
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                {weekPlan[selected].nutrition.map((item) => (
                                                    <ItemRow key={item.id} item={item} date={weekPlan[selected].date} />
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
