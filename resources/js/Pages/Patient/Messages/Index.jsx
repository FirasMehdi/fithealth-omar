import { useForm } from '@inertiajs/react';
import { Send } from 'lucide-react';
import { useEffect, useRef } from 'react';
import PatientLayout from '../../../Layouts/PatientLayout';

function DateSeparator({ label }) {
    return (
        <div style={{ fontSize: '12px' }} className="mt-4 mb-2.5 text-center text-forest/50">
            {label}
        </div>
    );
}

function MessageBubble({ fromPatient, text }) {
    return (
        <div className={'mb-1 flex ' + (fromPatient ? 'justify-end' : 'justify-start')}>
            <div
                style={{ maxWidth: '68%', fontSize: '14.5px', borderWidth: '1.5px' }}
                className={
                    'rounded-2xl px-4 py-3 leading-normal ' +
                    (fromPatient ? 'border-none bg-forest text-cream' : 'border-sand bg-white text-forest')
                }
            >
                {text}
            </div>
        </div>
    );
}

function Composer() {
    const { data, setData, post, processing, reset } = useForm({ body: '' });

    function submit(e) {
        e.preventDefault();
        post('/patient/messages', {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    return (
        <form onSubmit={submit} className="flex shrink-0 gap-2.5 border-t border-sand/35 py-5">
            <input
                type="text"
                placeholder="Écrire un message…"
                value={data.body}
                onChange={(e) => setData('body', e.target.value)}
                style={{ borderWidth: '1.5px', fontSize: '14.5px' }}
                className="flex-1 rounded-full border-sand bg-white px-4.5 py-3 text-forest placeholder:text-forest/40"
            />
            <button
                type="submit"
                disabled={processing || !data.body}
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sage disabled:opacity-50"
            >
                <Send size={18} strokeWidth={1.7} className="text-forest" />
            </button>
        </form>
    );
}

export default function MessagesIndex({ practitioner, messages }) {
    return (
        <PatientLayout title="Messages">
            <div className="-mt-6 -mb-16 flex min-h-0 flex-1 flex-col">
                <div className="sticky top-14 z-20 flex shrink-0 items-center gap-3.5 border-b border-sand/35 bg-cream pt-4 pb-5.5 lg:top-0">
                    <div style={{ fontSize: '15px' }} className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest font-bold text-cream">
                        {practitioner.initials}
                    </div>
                    <div>
                        <div style={{ fontSize: '15.5px' }} className="font-semibold text-forest">
                            {practitioner.name}
                        </div>
                        <div style={{ fontSize: '12.5px' }} className="text-sage">
                            Naturopathe &amp; coach
                        </div>
                    </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto py-7">
                    {messages.length === 0 && (
                        <div className="flex h-full items-center justify-center text-center">
                            <p className="text-sm text-forest/60">Aucun message pour l'instant, commencez la conversation.</p>
                        </div>
                    )}

                    {messages.map((m, i) =>
                        m.isDateSeparator ? (
                            <DateSeparator key={`sep-${i}`} label={m.label} />
                        ) : (
                            <MessageBubble key={m.id} fromPatient={m.fromPatient} text={m.text} />
                        ),
                    )}
                </div>

                <Composer />
            </div>
        </PatientLayout>
    );
}
