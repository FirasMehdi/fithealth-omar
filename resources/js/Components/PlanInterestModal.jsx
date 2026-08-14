import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from '../i18n';

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
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        lastName: '',
        firstName: '',
        phone: '',
        email: '',
        goal: '',
        message: '',
        planTitle: '',
    });
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
            reset();
            clearErrors();
            setData('planTitle', planTitle ?? '');
            setSubmitted(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, planTitle]);

    if (!open) return null;

    function set(field, value) {
        setData(field, value);
    }

    function submit(e) {
        e.preventDefault();
        post('/interet', {
            preserveScroll: true,
            onSuccess: () => setSubmitted(true),
        });
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
                    aria-label={t('Fermer')}
                    style={{
                        position: 'absolute',
                        top: 16,
                        insetInlineEnd: 16,
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
                        <h2 style={{ fontFamily: "'Fraunces', 'Cairo', serif", fontWeight: 600, fontSize: 22, color: '#1B3A2F', margin: '0 0 12px' }}>
                            {t('Demande envoyée')}
                        </h2>
                        <p style={{ fontSize: 15, color: '#3E5449', lineHeight: 1.6, margin: 0 }}>
                            {t('Merci, votre demande pour « :plan » a bien été prise en compte. Vous serez recontacté·e rapidement.', { plan: planTitle })}
                        </p>
                    </div>
                ) : (
                    <>
                        <h2
                            style={{
                                fontFamily: "'Fraunces', 'Cairo', serif",
                                fontWeight: 600,
                                fontSize: 24,
                                color: '#1B3A2F',
                                textAlign: 'center',
                                margin: '0 0 4px',
                            }}
                        >
                            {t('En savoir plus')}
                        </h2>
                        {planTitle && (
                            <p style={{ textAlign: 'center', fontSize: 14.5, color: '#6B7568', margin: '0 0 28px' }}>{planTitle}</p>
                        )}

                        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <Field label={t('Nom')} htmlFor="interest-lastname">
                                    <input
                                        id="interest-lastname"
                                        type="text"
                                        required
                                        value={data.lastName}
                                        onChange={(e) => set('lastName', e.target.value)}
                                        autoFocus
                                        style={fieldStyle}
                                    />
                                    {errors.lastName && <p style={{ color: '#C4643F', fontSize: 13, margin: '6px 0 0' }}>{errors.lastName}</p>}
                                </Field>
                                <Field label={t('Prénom')} htmlFor="interest-firstname">
                                    <input
                                        id="interest-firstname"
                                        type="text"
                                        required
                                        value={data.firstName}
                                        onChange={(e) => set('firstName', e.target.value)}
                                        style={fieldStyle}
                                    />
                                    {errors.firstName && <p style={{ color: '#C4643F', fontSize: 13, margin: '6px 0 0' }}>{errors.firstName}</p>}
                                </Field>
                            </div>

                            <Field label={t('Numéro de téléphone')} htmlFor="interest-phone">
                                <input
                                    id="interest-phone"
                                    type="tel"
                                    required
                                    value={data.phone}
                                    onChange={(e) => set('phone', e.target.value)}
                                    style={fieldStyle}
                                />
                                {errors.phone && <p style={{ color: '#C4643F', fontSize: 13, margin: '6px 0 0' }}>{errors.phone}</p>}
                            </Field>

                            <Field label={t('Adresse mail')} htmlFor="interest-email">
                                <input
                                    id="interest-email"
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => set('email', e.target.value)}
                                    style={fieldStyle}
                                />
                                {errors.email && <p style={{ color: '#C4643F', fontSize: 13, margin: '6px 0 0' }}>{errors.email}</p>}
                            </Field>

                            <Field label={t('Objectif')} htmlFor="interest-goal">
                                <input
                                    id="interest-goal"
                                    type="text"
                                    placeholder="Retrouver de l'énergie…"
                                    value={data.goal}
                                    onChange={(e) => set('goal', e.target.value)}
                                    style={fieldStyle}
                                />
                            </Field>

                            <Field label={t('Autre remarque ou question')} htmlFor="interest-message">
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
                                disabled={processing}
                                style={{
                                    marginTop: 8,
                                    padding: 12,
                                    borderRadius: 12,
                                    border: 'none',
                                    background: '#1B3A2F',
                                    color: '#F7F4ED',
                                    fontWeight: 600,
                                    fontSize: 15,
                                    cursor: processing ? 'default' : 'pointer',
                                    opacity: processing ? 0.6 : 1,
                                }}
                            >
                                {t('Envoyer ma demande')}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
