import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { useEffect, useRef } from 'react';
import PraticienLayout from '../../../Layouts/PraticienLayout';
import { useTranslation } from '../../../i18n';

function MessageBubble({ message }) {
    const mine = message.fromPractitioner;

    return (
        <div className={'mb-3 flex ' + (mine ? 'justify-end' : 'justify-start')}>
            <div
                style={{ maxWidth: '75%' }}
                className={'rounded-2xl px-4 py-2.5 text-sm ' + (mine ? 'bg-forest text-cream' : 'bg-sand/30 text-forest')}
            >
                <p>{message.body}</p>
                <p className={'mt-1 text-xs ' + (mine ? 'text-cream/60' : 'text-forest/50')}>{message.createdAt}</p>
            </div>
        </div>
    );
}

function Composer({ patientId, t }) {
    const { data, setData, post, processing, reset } = useForm({ body: '' });
    const inputRef = useRef(null);

    // Sur mobile, passer de la liste à la discussion monte ce champ pile sous
    // le doigt qui vient de taper le lien — certains navigateurs mobiles
    // interprètent ça comme un focus et ouvrent le clavier tout seuls. On le
    // désamorce explicitement à chaque changement de conversation. On force
    // aussi le champ dans la vue : Inertia remet le scroll de la page à zéro
    // à la navigation, donc on scrolle après, dans une frame séparée, pour
    // ne pas se faire écraser par ce reset.
    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            inputRef.current?.scrollIntoView({ block: 'end', behavior: 'auto' });
            inputRef.current?.blur();
        });

        return () => cancelAnimationFrame(frame);
    }, [patientId]);

    function submit(e) {
        e.preventDefault();
        post(`/praticien/messages/${patientId}`, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    return (
        <form onSubmit={submit} className="flex shrink-0 gap-2.5 border-t border-sand/50 px-6 py-4">
            <input
                ref={inputRef}
                type="text"
                placeholder={t('Écrire un message…')}
                value={data.body}
                onChange={(e) => setData('body', e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-sand bg-white px-3.5 py-2.5 text-sm text-forest focus:ring-2 focus:ring-sage focus:outline-none"
            />
            <button
                type="submit"
                disabled={processing || !data.body}
                aria-label={t('Envoyer')}
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest disabled:opacity-50"
            >
                <Send size={18} strokeWidth={1.7} className="text-cream" />
            </button>
        </form>
    );
}

function ConversationPanel({ activePatient, messages, visible, t }) {
    const listRef = useRef(null);

    // À l'ouverture d'une discussion (ou à l'arrivée d'un nouveau message),
    // on se cale en bas de la liste — sur la conversation la plus récente et
    // à portée du champ pour écrire, pas sur le premier message de l'historique.
    useEffect(() => {
        if (!activePatient || !listRef.current) return;
        listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [activePatient?.id, messages.length]);

    return (
        <div
            className={
                (visible ? 'flex' : 'hidden') +
                ' -mx-4 -mt-6 -mb-10 h-[calc(100vh-56px)] flex-1 flex-col bg-white sm:-mx-7' +
                ' lg:mx-0 lg:my-0 lg:flex lg:h-auto lg:rounded-2xl lg:shadow-lg lg:shadow-forest/20'
            }
        >
            <div className="flex shrink-0 items-center gap-3 border-b border-sand/50 px-4 py-4 sm:px-6">
                <Link href="/praticien/messages" className="shrink-0 rounded-lg p-1 text-forest hover:bg-cream/60 lg:hidden">
                    <ArrowLeft size={20} />
                </Link>

                {activePatient ? (
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sage/15 text-sm font-bold text-forest">
                            {activePatient.initials}
                        </div>
                        <h2 className="font-display truncate text-lg font-semibold text-forest">{activePatient.name}</h2>
                    </div>
                ) : (
                    <h2 className="font-display text-lg font-semibold text-forest">{t('Messages')}</h2>
                )}
            </div>

            <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                {!activePatient && (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <MessageSquare className="mb-3 text-forest/30" size={36} />
                        <p className="text-sm text-forest/60">{t('Sélectionnez un patient pour voir la conversation.')}</p>
                    </div>
                )}

                {activePatient && messages.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <p className="text-sm text-forest/60">{t('Aucun message pour l’instant, commencez la conversation.')}</p>
                    </div>
                )}

                {activePatient && messages.map((m) => <MessageBubble key={m.id} message={m} />)}
            </div>

            {activePatient && <Composer patientId={activePatient.id} t={t} />}
        </div>
    );
}

function ConversationsList({ conversations, activePatientId, visible, t }) {
    return (
        <div
            className={
                (visible ? 'flex' : 'hidden') +
                ' -mx-4 -mt-6 -mb-10 h-[calc(100vh-56px)] w-full shrink-0 flex-col bg-white sm:-mx-7' +
                ' lg:mx-0 lg:my-0 lg:flex lg:h-auto lg:w-72 lg:rounded-2xl lg:shadow-lg lg:shadow-forest/20'
            }
        >
            <div className="shrink-0 border-b border-sand/50 px-5 py-4">
                <h3 className="font-display text-base font-semibold text-forest">{t('Patients')}</h3>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
                {conversations.length === 0 && <p className="px-5 py-6 text-sm text-forest/60">{t('Aucun patient pour l’instant.')}</p>}

                {conversations.map((c) => (
                    <Link
                        key={c.id}
                        href={`/praticien/messages/${c.id}`}
                        className={
                            'flex items-center gap-3 border-b border-sand/30 px-5 py-3.5 last:border-0 ' +
                            (c.id === activePatientId ? 'bg-sage/10' : 'hover:bg-cream/60')
                        }
                    >
                        <div className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-sage/15 text-sm font-bold text-forest">
                            {c.initials}
                            {c.unreadCount > 0 && (
                                <span className="absolute -top-1 -end-1 flex size-4 items-center justify-center rounded-full bg-terracotta text-xs font-bold text-white">
                                    {c.unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <span className="truncate text-sm font-semibold text-forest">{c.name}</span>
                                {c.lastMessageAt && <span className="shrink-0 text-xs text-forest/40">{c.lastMessageAt}</span>}
                            </div>
                            <p className="truncate text-xs text-forest/60">{c.lastMessage ?? t('Aucun message')}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default function MessagesIndex({ conversations, activePatient, messages }) {
    const { t } = useTranslation();

    return (
        <PraticienLayout title={t('Messages')}>
            <div className="flex flex-col gap-5 lg:h-[calc(100vh-150px)] lg:flex-row">
                <ConversationPanel activePatient={activePatient} messages={messages} visible={Boolean(activePatient)} t={t} />
                <ConversationsList conversations={conversations} activePatientId={activePatient?.id} visible={!activePatient} t={t} />
            </div>
        </PraticienLayout>
    );
}
