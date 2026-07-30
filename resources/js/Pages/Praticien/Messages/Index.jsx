import { Link, useForm } from '@inertiajs/react';
import { MessageSquare, Send } from 'lucide-react';
import PraticienLayout from '../../../Layouts/PraticienLayout';

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

function Composer({ patientId }) {
    const { data, setData, post, processing, reset } = useForm({ body: '' });

    function submit(e) {
        e.preventDefault();
        post(`/praticien/messages/${patientId}`, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    return (
        <form onSubmit={submit} className="flex gap-2.5 border-t border-sand/50 px-6 py-4">
            <input
                type="text"
                placeholder="Écrire un message…"
                value={data.body}
                onChange={(e) => setData('body', e.target.value)}
                className="flex-1 rounded-xl border border-sand bg-white px-3.5 py-2.5 text-sm text-forest focus:ring-2 focus:ring-sage focus:outline-none"
            />
            <button
                type="submit"
                disabled={processing || !data.body}
                className="flex items-center gap-1.5 rounded-xl bg-forest px-4.5 py-2.75 text-sm font-semibold text-cream disabled:opacity-50"
            >
                <Send size={15} />
                Envoyer
            </button>
        </form>
    );
}

function ConversationPanel({ activePatient, messages }) {
    return (
        <div className="flex flex-1 flex-col rounded-2xl bg-white shadow-lg shadow-forest/20">
            <div className="border-b border-sand/50 px-6 py-4">
                {activePatient ? (
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sage/15 text-sm font-bold text-forest">
                            {activePatient.initials}
                        </div>
                        <h2 className="font-display text-lg font-semibold text-forest">{activePatient.name}</h2>
                    </div>
                ) : (
                    <h2 className="font-display text-lg font-semibold text-forest">Messages</h2>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
                {!activePatient && (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <MessageSquare className="mb-3 text-forest/30" size={36} />
                        <p className="text-sm text-forest/60">Sélectionnez un patient pour voir la conversation.</p>
                    </div>
                )}

                {activePatient && messages.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <p className="text-sm text-forest/60">Aucun message pour l'instant, commencez la conversation.</p>
                    </div>
                )}

                {activePatient && messages.map((m) => <MessageBubble key={m.id} message={m} />)}
            </div>

            {activePatient && <Composer patientId={activePatient.id} />}
        </div>
    );
}

function ConversationsList({ conversations, activePatientId }) {
    return (
        <div className="flex w-72 shrink-0 flex-col rounded-2xl bg-white shadow-lg shadow-forest/20">
            <div className="border-b border-sand/50 px-5 py-4">
                <h3 className="font-display text-base font-semibold text-forest">Patients</h3>
            </div>

            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 && <p className="px-5 py-6 text-sm text-forest/60">Aucun patient pour l'instant.</p>}

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
                                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-terracotta text-xs font-bold text-white">
                                    {c.unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <span className="truncate text-sm font-semibold text-forest">{c.name}</span>
                                {c.lastMessageAt && <span className="shrink-0 text-xs text-forest/40">{c.lastMessageAt}</span>}
                            </div>
                            <p className="truncate text-xs text-forest/60">{c.lastMessage ?? 'Aucun message'}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default function MessagesIndex({ conversations, activePatient, messages }) {
    return (
        <PraticienLayout title="Messages">
            <div className="flex gap-5" style={{ height: 'calc(100vh - 150px)' }}>
                <ConversationPanel activePatient={activePatient} messages={messages} />
                <ConversationsList conversations={conversations} activePatientId={activePatient?.id} />
            </div>
        </PraticienLayout>
    );
}
