import { useForm } from '@inertiajs/react';
import PatientLayout from '../../../Layouts/PatientLayout';

const SLIDERS = [
    { key: 'energy', label: 'Énergie' },
    { key: 'sleep', label: 'Sommeil' },
    { key: 'digestion', label: 'Digestion' },
    { key: 'mood', label: 'Humeur' },
];

const ADHERENCE_OPTIONS = [
    { key: 'totalement', label: 'Totalement' },
    { key: 'partiellement', label: 'En partie' },
    { key: 'peu', label: 'Peu' },
];

export default function CheckInIndex({ todayLabel }) {
    const { data, setData, post, processing } = useForm({
        energy: 6,
        sleep: 5,
        digestion: 7,
        mood: 6,
        adherence: 'totalement',
        note: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/patient/checkin');
    }

    return (
        <PatientLayout title="Check-in">
            <div className="flex justify-center">
                <form onSubmit={submit} style={{ width: '100%', maxWidth: '480px' }}>
                    <h1 style={{ fontSize: '26px' }} className="font-display mb-2 text-center font-semibold text-forest">
                        Comment vous sentez-vous ?
                    </h1>
                    <p className="mb-9 text-center text-sm text-forest/60">{todayLabel}</p>

                    <div style={{ borderRadius: '18px' }} className="mb-5 bg-white px-8 py-7.5 shadow-lg shadow-forest/22">
                        {SLIDERS.map((slider) => (
                            <div key={slider.key} className="mb-6.5">
                                <div className="mb-2.5 flex items-baseline justify-between">
                                    <label style={{ fontSize: '15px' }} className="font-semibold text-forest">
                                        {slider.label}
                                    </label>
                                    <span style={{ fontSize: '22px' }} className="font-display font-semibold text-forest tabular-nums">
                                        {data[slider.key]}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={1}
                                    max={10}
                                    step={1}
                                    value={data[slider.key]}
                                    onChange={(e) => setData(slider.key, Number(e.target.value))}
                                    className="range-slider w-full"
                                />
                            </div>
                        ))}

                        <div className="mb-5.5">
                            <label style={{ fontSize: '15px' }} className="mb-2.5 block font-semibold text-forest">
                                Avez-vous suivi le plan ?
                            </label>
                            <div className="flex gap-2">
                                {ADHERENCE_OPTIONS.map((option) => (
                                    <button
                                        key={option.key}
                                        type="button"
                                        onClick={() => setData('adherence', option.key)}
                                        style={{ borderRadius: '10px', fontSize: '13.5px' }}
                                        className={
                                            'flex-1 border-none py-2.75 px-2 font-semibold ' +
                                            (data.adherence === option.key ? 'bg-forest text-cream' : 'bg-sand/30 text-forest')
                                        }
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '15px' }} className="mb-2.5 block font-semibold text-forest">
                                Une note pour votre praticien <span className="font-normal text-forest/50">(optionnel)</span>
                            </label>
                            <textarea
                                value={data.note}
                                onChange={(e) => setData('note', e.target.value)}
                                placeholder="Ce que vous voulez partager…"
                                style={{ borderWidth: '1.5px', borderRadius: '12px', fontSize: '14.5px' }}
                                className="min-h-20 w-full resize-y border-sand bg-cream px-3.5 py-3 text-forest"
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={processing} className="w-full rounded bg-forest py-4 text-base font-semibold text-cream">
                        Envoyer mon check-in
                    </button>
                </form>
            </div>
        </PatientLayout>
    );
}
