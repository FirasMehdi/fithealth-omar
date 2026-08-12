import { useForm } from '@inertiajs/react';
import PatientLayout from '../../../Layouts/PatientLayout';
import { useTranslation } from '../../../i18n';

const SLIDER_KEYS = ['energy', 'sleep', 'digestion', 'mood'];

const ADHERENCE_KEYS = ['totalement', 'partiellement', 'peu'];

export default function CheckInIndex({ todayLabel }) {
    const { t } = useTranslation();
    const { data, setData, post, processing } = useForm({
        energy: 6,
        sleep: 5,
        digestion: 7,
        mood: 6,
        adherence: 'totalement',
        note: '',
    });

    const sliderLabels = {
        energy: t('Énergie'),
        sleep: t('Sommeil'),
        digestion: t('Digestion'),
        mood: t('Humeur'),
    };

    const adherenceLabels = {
        totalement: t('Totalement'),
        partiellement: t('En partie'),
        peu: t('Peu'),
    };

    function submit(e) {
        e.preventDefault();
        post('/patient/checkin');
    }

    return (
        <PatientLayout title={t('Comment je vais')}>
            <div className="flex justify-center">
                <form onSubmit={submit} style={{ width: '100%', maxWidth: '480px' }}>
                    <h1 style={{ fontSize: '26px' }} className="font-display mb-2 text-center font-semibold text-forest">
                        {t('Comment tu te sens ?')}
                    </h1>
                    <p className="mb-9 text-center text-sm text-forest/60">{todayLabel}</p>

                    <div style={{ borderRadius: '18px' }} className="mb-5 bg-white px-8 py-7.5 shadow-lg shadow-forest/22">
                        {SLIDER_KEYS.map((key) => (
                            <div key={key} className="mb-6.5">
                                <div className="mb-2.5 flex items-baseline justify-between">
                                    <label style={{ fontSize: '15px' }} className="font-semibold text-forest">
                                        {sliderLabels[key]}
                                    </label>
                                    <span style={{ fontSize: '22px' }} className="font-display font-semibold text-forest tabular-nums">
                                        {data[key]}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={1}
                                    max={10}
                                    step={1}
                                    value={data[key]}
                                    onChange={(e) => setData(key, Number(e.target.value))}
                                    className="range-slider w-full"
                                />
                            </div>
                        ))}

                        <div className="mb-5.5">
                            <label style={{ fontSize: '15px' }} className="mb-2.5 block font-semibold text-forest">
                                {t('Tu as fait ton programme ?')}
                            </label>
                            <div className="flex gap-2">
                                {ADHERENCE_KEYS.map((key) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setData('adherence', key)}
                                        style={{ borderRadius: '10px', fontSize: '13.5px' }}
                                        className={
                                            'flex-1 border-none py-2.75 px-2 font-semibold ' +
                                            (data.adherence === key ? 'bg-forest text-cream' : 'bg-sand/30 text-forest')
                                        }
                                    >
                                        {adherenceLabels[key]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '15px' }} className="mb-2.5 block font-semibold text-forest">
                                {t('Une note pour ton praticien')} <span className="font-normal text-forest/50">{t('(optionnel)')}</span>
                            </label>
                            <textarea
                                value={data.note}
                                onChange={(e) => setData('note', e.target.value)}
                                placeholder={t('Ce que tu veux dire…')}
                                style={{ borderWidth: '1.5px', borderRadius: '12px', fontSize: '14.5px' }}
                                className="min-h-20 w-full resize-y border-sand bg-cream px-3.5 py-3 text-forest"
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={processing} className="w-full rounded bg-forest py-4 text-base font-semibold text-cream">
                        {t('Envoyer mon check-in')}
                    </button>
                </form>
            </div>
        </PatientLayout>
    );
}
