import { useEffect, useState } from 'react';

const EMPTY_FORM = { lastName: '', firstName: '', phone: '', email: '', goal: '', message: '' };

const fieldStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #D9C9A8',
    background: '#FFFFFF',
    color: '#1B3A2F',
    fontSize: 15,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
};

const labelStyle = { display: 'block', marginBottom: 6, fontSize: 14, color: '#1B3A2F' };

function Field({ label, htmlFor, children }) {
    return (
        <div>
            <label htmlFor={htmlFor} style={labelStyle}>
                {label}
            </label>
            {children}
        </div>
    );
}

export default function PlanInterestModal({ open, planTitle, onClose }) {
    const [data, setData] = useState(EMPTY_FORM);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!open) return;

        function onKeyDown(e) {
            if (e.key === 'Escape') onClose();
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    useEffect(() => {
        if (open) {
            setData(EMPTY_FORM);
            setSubmitted(false);
        }
    }, [open]);

    if (!open) return null;

    function set(field, value) {
        setData((d) => ({ ...d, [field]: value }));
    }

    function submit(e) {
        e.preventDefault();
        setSubmitted(true);
    }

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(27,58,47,0.55)',
                backdropFilter: 'blur(2px)',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
                overflowY: 'auto',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#F7F4ED',
                    borderRadius: 20,
                    padding: '40px 36px',
                    width: '100%',
                    maxWidth: 480,
                    position: 'relative',
                    boxShadow: '0 40px 80px -20px rgba(0,0,0,0.4)',
                    maxHeight: '85vh',
                    overflowY: 'auto',
                }}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Fermer"
                    style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M1 1L15 15M15 1L1 15" stroke="#1B3A2F" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                </button>

                {submitted ? (
                    <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
                        <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22, color: '#1B3A2F', margin: '0 0 12px' }}>
                            Demande envoyée
                        </h2>
                        <p style={{ fontSize: 15, color: '#3E5449', lineHeight: 1.6, margin: 0 }}>
                            Merci, votre demande pour « {planTitle} » a bien été prise en compte. Vous serez recontacté·e rapidement.
                        </p>
                    </div>
                ) : (
                    <>
                        <h2
                            style={{
                                fontFamily: "'Fraunces', serif",
                                fontWeight: 600,
                                fontSize: 24,
                                color: '#1B3A2F',
                                textAlign: 'center',
                                margin: '0 0 4px',
                            }}
                        >
                            En savoir plus
                        </h2>
                        {planTitle && (
                            <p style={{ textAlign: 'center', fontSize: 14.5, color: '#6B7568', margin: '0 0 28px' }}>{planTitle}</p>
                        )}

                        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <Field label="Nom" htmlFor="interest-lastname">
                                    <input
                                        id="interest-lastname"
                                        type="text"
                                        required
                                        value={data.lastName}
                                        onChange={(e) => set('lastName', e.target.value)}
                                        autoFocus
                                        style={fieldStyle}
                                    />
                                </Field>
                                <Field label="Prénom" htmlFor="interest-firstname">
                                    <input
                                        id="interest-firstname"
                                        type="text"
                                        required
                                        value={data.firstName}
                                        onChange={(e) => set('firstName', e.target.value)}
                                        style={fieldStyle}
                                    />
                                </Field>
                            </div>

                            <Field label="Numéro de téléphone" htmlFor="interest-phone">
                                <input
                                    id="interest-phone"
                                    type="tel"
                                    required
                                    value={data.phone}
                                    onChange={(e) => set('phone', e.target.value)}
                                    style={fieldStyle}
                                />
                            </Field>

                            <Field label="Adresse mail" htmlFor="interest-email">
                                <input
                                    id="interest-email"
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => set('email', e.target.value)}
                                    style={fieldStyle}
                                />
                            </Field>

                            <Field label="Objectif" htmlFor="interest-goal">
                                <input
                                    id="interest-goal"
                                    type="text"
                                    placeholder="Retrouver de l'énergie…"
                                    value={data.goal}
                                    onChange={(e) => set('goal', e.target.value)}
                                    style={fieldStyle}
                                />
                            </Field>

                            <Field label="Autre remarque ou question" htmlFor="interest-message">
                                <textarea
                                    id="interest-message"
                                    rows={3}
                                    value={data.message}
                                    onChange={(e) => set('message', e.target.value)}
                                    style={{ ...fieldStyle, resize: 'vertical' }}
                                />
                            </Field>

                            <button
                                type="submit"
                                style={{
                                    marginTop: 8,
                                    padding: 12,
                                    borderRadius: 12,
                                    border: 'none',
                                    background: '#1B3A2F',
                                    color: '#F7F4ED',
                                    fontWeight: 600,
                                    fontSize: 15,
                                    cursor: 'pointer',
                                }}
                            >
                                Envoyer ma demande
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
