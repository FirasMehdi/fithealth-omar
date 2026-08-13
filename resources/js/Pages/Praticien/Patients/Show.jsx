import { Link } from '@inertiajs/react';
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import AddItemModal from '../../../Components/Praticien/AddItemModal';
import AddVitaliteItemModal from '../../../Components/Praticien/AddVitaliteItemModal';
import AssignProtocolModal from '../../../Components/Praticien/AssignProtocolModal';
import PraticienLayout from '../../../Layouts/PraticienLayout';
import { useTranslation } from '../../../i18n';

function tabs(t) {
    return [
        { key: 'protocole', label: t('Protocole') },
        { key: 'suivi', label: t('Suivi') },
        { key: 'checkins', label: t('Check-ins') },
    ];
}

function scoreLabels(t) {
    return [
        ['energy', t('Énergie')],
        ['sleep', t('Sommeil')],
        ['digestion', t('Digestion')],
        ['mood', t('Humeur')],
    ];
}

function scoreTone(value) {
    if (value >= 7) return 'bg-sage/18 text-forest';
    if (value >= 5) return 'bg-sand/35 text-forest';
    return 'bg-terracotta/15 text-terracotta';
}

function InertButton({ children, variant = 'outline', t }) {
    const base = 'cursor-not-allowed whitespace-nowrap rounded-xl font-semibold opacity-50';
    const variants = {
        outline: 'border border-sage px-4.5 py-2.75 text-sm text-forest',
        small: 'border border-sage px-3.5 py-2 text-xs text-forest',
    };

    return (
        <button type="button" disabled title={t('Bientôt disponible')} className={`${base} ${variants[variant]}`}>
            {children}
        </button>
    );
}

function AddButton({ children, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="rounded-xl border border-dashed border-sage/35 px-3.5 py-2 text-sm font-semibold text-forest hover:border-sage hover:bg-sage/10"
        >
            {children}
        </button>
    );
}

/**
 * Nutrition (gauche) et Mouvement (droite) viennent tous deux du protocole
 * courant — regroupés dans une seule carte avec une barre verticale, comme
 * demandé, plutôt que deux cartes empilées.
 */
function MouvementNutritionCard({ mouvementItems, nutritionItems, open, onToggle, onAddMouvement, onAddNutrition, t }) {
    return (
        <div className="rounded-2xl bg-white shadow-lg shadow-forest/20">
            <div onClick={onToggle} className="flex cursor-pointer items-center gap-6 px-6 py-4.5">
                <h3 className="font-display flex-1 text-lg font-semibold text-forest">{t('Nutrition')}</h3>
                <h3 className="font-display flex-1 text-lg font-semibold text-forest">{t('Mouvement')}</h3>
                <ChevronDown size={18} className={'shrink-0 text-sage transition-transform ' + (open ? '' : '-rotate-90')} />
            </div>

            {open && (
                <div className="flex flex-col gap-6 px-6 pb-5 md:flex-row">
                    <div className="flex-1">
                        <ul>
                            {nutritionItems.map((item) => (
                                <li key={item.title} className="relative mb-2 ps-4 text-sm leading-7 text-forest/80">
                                    <span className="absolute top-2 start-0 size-1.25 rounded-full bg-sage" />
                                    {item.title}
                                    {item.days && <span className="text-forest/50"> · {item.days}</span>}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-2">
                            <AddButton onClick={onAddNutrition}>+ {t('Ajouter un élément nutrition')}</AddButton>
                        </div>
                    </div>

                    <div className="hidden w-px shrink-0 bg-sand md:block" />

                    <div className="flex-1">
                        {mouvementItems.length > 0 && (
                            <div className="overflow-x-auto">
                                <div
                                    className="grid gap-x-3 gap-y-2 text-sm"
                                    style={{ gridTemplateColumns: '1.6fr 0.7fr 0.9fr 1.1fr', minWidth: '360px' }}
                                >
                                    <div className="text-xs font-bold tracking-wide text-forest/50 uppercase">{t('Exercice')}</div>
                                    <div className="text-xs font-bold tracking-wide text-forest/50 uppercase">{t('Séries')}</div>
                                    <div className="text-xs font-bold tracking-wide text-forest/50 uppercase">{t('Volume')}</div>
                                    <div className="text-xs font-bold tracking-wide text-forest/50 uppercase">{t('Jours')}</div>

                                    {mouvementItems.map((item) => (
                                        <div key={item.title} className="contents">
                                            <div className="border-t border-sand/30 py-2 font-medium text-forest">{item.title}</div>
                                            <div className="border-t border-sand/30 py-2 tabular-nums text-forest">{item.sets ?? '—'}</div>
                                            <div className="border-t border-sand/30 py-2 tabular-nums text-forest">{item.reps ?? '—'}</div>
                                            <div className="border-t border-sand/30 py-2 text-forest/60">{item.days}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="mt-3.5">
                            <AddButton onClick={onAddMouvement}>+ {t('Ajouter un exercice')}</AddButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Consignes de vitalité : indépendantes du protocole, rattachées au patient
 * directement (voir docs/MODELE-DONNEES.md). Toujours visibles, pas liées
 * aux onglets Protocole/Suivi/Check-ins.
 */
function VitaliteSection({ items, onAdd, t }) {
    return (
        <div className="mb-4 rounded-2xl bg-white px-6 py-4.5 shadow-lg shadow-forest/20">
            <h3 className="font-display mb-3 text-lg font-semibold text-forest">{t('Vitalité')}</h3>

            {items.length === 0 ? (
                <p className="mb-3 text-sm text-forest/60">{t('Aucune consigne pour l’instant.')}</p>
            ) : (
                <ul className="mb-3">
                    {items.map((item) => (
                        <li key={item.id} className="relative mb-2 ps-4 text-sm leading-7 text-forest/80">
                            <span className="absolute top-2 start-0 size-1.25 rounded-full bg-sage" />
                            {item.text}
                        </li>
                    ))}
                </ul>
            )}

            <AddButton onClick={onAdd}>+ {t('Ajouter une consigne')}</AddButton>
        </div>
    );
}

function DaySection({ label, items }) {
    return (
        <div>
            <div className="mb-1 text-xs font-bold tracking-wide text-sage/70 uppercase">{label}</div>
            <div className="flex flex-col gap-1.5">
                {items.length === 0 && <span className="text-xs text-forest/25">—</span>}
                {items.map((item, i) => (
                    <div key={i} className={'flex items-center gap-2 text-sm ' + (item.done ? 'text-forest' : 'text-forest/40')}>
                        <span
                            className={
                                'flex size-4 shrink-0 items-center justify-center rounded-full border ' +
                                (item.done ? 'border-sage bg-sage' : 'border-sand bg-transparent')
                            }
                        >
                            {item.done && <Check size={9} strokeWidth={2.5} className="text-cream" />}
                        </span>
                        {item.text}
                    </div>
                ))}
            </div>
        </div>
    );
}

function WeekPlanCard({ weekPlan, t }) {
    return (
        <div className="rounded-2xl bg-white px-6 py-5.5 shadow-lg shadow-forest/20">
            <h3 className="font-display mb-4 text-base font-semibold text-forest">{t('Semaine en cours')}</h3>
            <div>
                {weekPlan.map((day) => (
                    <div key={day.day} className="flex gap-3.5 border-t border-sand/30 py-2.5 first:border-t-0 first:pt-0">
                        <div className="w-8.5 shrink-0 pt-px text-xs font-bold text-forest/50">{day.day}</div>
                        <div className="flex flex-1 flex-col gap-2.5">
                            <DaySection label={t('Sport')} items={day.sport} />
                            <DaySection label={t('Nutrition')} items={day.nutrition} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ScoreBadge({ label, value }) {
    return (
        <div className="text-center">
            <div className={'flex size-6.5 items-center justify-center rounded-full text-xs font-bold tabular-nums ' + scoreTone(value)}>
                {value}
            </div>
            <div className="mt-0.75 text-xs text-forest/50">{label}</div>
        </div>
    );
}

function CheckinHistoryCard({ checkins, t }) {
    const SCORE_LABELS = scoreLabels(t);

    return (
        <div className="rounded-2xl bg-white px-6 py-5.5 shadow-lg shadow-forest/20">
            <h3 className="font-display mb-4 text-base font-semibold text-forest">{t('Historique des check-ins')}</h3>
            <div>
                {checkins.length === 0 && <p className="text-sm text-forest/60">{t('Aucun check-in pour l’instant.')}</p>}
                {checkins.map((c, i) => (
                    <div key={i} className="border-t border-sand/30 py-3.5 first:border-t-0 first:pt-0">
                        <div className="mb-2 text-sm font-semibold text-forest">{c.date}</div>
                        <div className="mb-2 flex gap-3.5">
                            {SCORE_LABELS.map(([key, label]) => (
                                <ScoreBadge key={key} label={label} value={c[key]} />
                            ))}
                        </div>
                        {c.note && <p className="text-sm text-forest/80">« {c.note} »</p>}
                    </div>
                ))}
            </div>
        </div>
    );
}

function SuiviTab({ weekPlan, checkins, t }) {
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
            <WeekPlanCard weekPlan={weekPlan} t={t} />
            <CheckinHistoryCard checkins={checkins} t={t} />
        </div>
    );
}

function CheckinCard({ checkin, t }) {
    const SCORE_LABELS = scoreLabels(t);

    return (
        <div className="flex flex-wrap items-center gap-6 rounded-2xl bg-white px-6 py-5 shadow-lg shadow-forest/20">
            <div className="min-w-35 text-sm font-semibold text-forest">{checkin.date}</div>

            <div className="flex min-w-60 flex-1 gap-5">
                {SCORE_LABELS.map(([key, label]) => (
                    <div key={key} className="min-w-15">
                        <div className="mb-1 text-xs text-forest/50">{label}</div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-11 rounded-full bg-sand/40">
                                <div className="h-full rounded-full bg-sage" style={{ width: `${checkin[key] * 10}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-forest tabular-nums">{checkin[key]}</span>
                        </div>
                    </div>
                ))}
            </div>

            {checkin.note && <p className="min-w-55 flex-1 text-sm text-forest/80">« {checkin.note} »</p>}

            <InertButton variant="small" t={t}>
                {t('Répondre')}
            </InertButton>
        </div>
    );
}

function CheckinsTab({ checkins, t }) {
    if (checkins.length === 0) {
        return (
            <div className="rounded-2xl bg-white px-6 py-16 text-center">
                <p className="mb-1 text-base font-semibold text-forest">{t('Aucun check-in reçu')}</p>
                <p className="text-sm text-forest/60">{t('Ce patient n’a pas encore complété de check-in.')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3.5">
            {checkins.map((c, i) => (
                <CheckinCard key={i} checkin={c} t={t} />
            ))}
        </div>
    );
}

export default function Show({ patient, protocol, weekPlan, checkins, templates, vitalite }) {
    const [tab, setTab] = useState('protocole');
    const [protocolOpen, setProtocolOpen] = useState(true);
    const [assignOpen, setAssignOpen] = useState(false);
    const [addItemPillar, setAddItemPillar] = useState(null);
    const [addVitaliteOpen, setAddVitaliteOpen] = useState(false);
    const { t } = useTranslation();
    const TABS = tabs(t);

    return (
        <PraticienLayout title={patient.name}>
            <div className="mx-auto" style={{ maxWidth: '1180px' }}>
                <div className="mb-5 text-sm text-forest/60">
                    <Link href="/praticien/patients" className="hover:text-forest">
                        {t('Patients')}
                    </Link>
                    <span className="mx-1.5 text-forest/30">/</span>
                    <span className="text-forest">{patient.name}</span>
                </div>

                <div className="mb-7 flex flex-wrap items-start justify-between gap-6 rounded-2xl bg-white px-8 py-7 shadow-lg shadow-forest/20">
                    <div className="flex items-center gap-5">
                        <div className="flex size-17 shrink-0 items-center justify-center rounded-full bg-sage/15 text-2xl font-bold text-forest">
                            {patient.initials}
                        </div>
                        <div>
                            <h1 className="font-display mb-1 text-2xl font-semibold text-forest">{patient.name}</h1>
                            <p className="mb-1.5 text-sm text-forest/60">
                                {[patient.age ? `${patient.age} ans` : null, patient.pillars].filter(Boolean).join(' · ')}
                            </p>
                            {patient.goal && (
                                <p className="text-sm text-forest/80" style={{ maxWidth: '46ch' }}>
                                    {patient.goal}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex shrink-0 gap-2.5">
                        <Link
                            href={`/praticien/messages/${patient.id}`}
                            className="rounded-xl border border-sage px-4.5 py-2.75 text-sm font-semibold text-forest hover:bg-sage/10"
                        >
                            {t('Message')}
                        </Link>
                        <button
                            type="button"
                            onClick={() => setAssignOpen(true)}
                            className="rounded-xl bg-forest px-4.5 py-2.75 text-sm font-semibold text-cream hover:opacity-90"
                        >
                            {t('Assigner un protocole')}
                        </button>
                    </div>
                </div>

                <VitaliteSection items={vitalite} onAdd={() => setAddVitaliteOpen(true)} t={t} />

                <div className="mb-6.5 flex gap-1 border-b border-sand">
                    {TABS.map((tabItem) => (
                        <button
                            key={tabItem.key}
                            type="button"
                            onClick={() => setTab(tabItem.key)}
                            className={
                                '-mb-px rounded-t-lg border-b-2 px-4.5 py-3 text-sm font-semibold ' +
                                (tab === tabItem.key ? 'border-sage text-forest' : 'border-transparent text-forest/50')
                            }
                        >
                            {tabItem.label}
                        </button>
                    ))}
                </div>

                {tab === 'protocole' &&
                    (protocol ? (
                        <MouvementNutritionCard
                            mouvementItems={protocol.mouvement}
                            nutritionItems={protocol.nutrition}
                            open={protocolOpen}
                            onToggle={() => setProtocolOpen((v) => !v)}
                            onAddMouvement={() => setAddItemPillar('mouvement')}
                            onAddNutrition={() => setAddItemPillar('nutrition')}
                            t={t}
                        />
                    ) : (
                        <div className="rounded-2xl bg-white px-6 py-16 text-center">
                            <p className="mb-1 text-base font-semibold text-forest">{t('Aucun protocole actif')}</p>
                            <p className="mb-4 text-sm text-forest/60">{t('Ce patient n’a pas encore de protocole assigné.')}</p>
                            <button
                                type="button"
                                onClick={() => setAssignOpen(true)}
                                className="rounded-xl bg-forest px-4.5 py-2.75 text-sm font-semibold text-cream hover:opacity-90"
                            >
                                {t('Assigner un protocole')}
                            </button>
                        </div>
                    ))}

                {tab === 'suivi' && <SuiviTab weekPlan={weekPlan} checkins={checkins} t={t} />}
                {tab === 'checkins' && <CheckinsTab checkins={checkins} t={t} />}
            </div>

            <AssignProtocolModal
                open={assignOpen}
                onClose={() => setAssignOpen(false)}
                patientId={patient.id}
                templates={templates}
                activeProtocolTitle={protocol?.title ?? null}
            />

            {protocol && (
                <AddItemModal
                    open={addItemPillar !== null}
                    onClose={() => setAddItemPillar(null)}
                    protocolId={protocol.id}
                    pillar={addItemPillar ?? 'mouvement'}
                />
            )}

            <AddVitaliteItemModal open={addVitaliteOpen} onClose={() => setAddVitaliteOpen(false)} patientId={patient.id} />
        </PraticienLayout>
    );
}
