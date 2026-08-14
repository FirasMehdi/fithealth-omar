import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { useTranslation } from '../i18n';

export default function LoginModal({ open, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
    });
    const { t } = useTranslation();

    useEffect(() => {
        if (!open) return;

        function onKeyDown(e) {
            if (e.key === 'Escape') onClose();
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    function submit(e) {
        e.preventDefault();
        post('/login', {
            onSuccess: () => reset('password'),
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
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#F7F4ED',
                    borderRadius: 20,
                    padding: '40px 36px',
                    width: '100%',
                    maxWidth: 380,
                    position: 'relative',
                    boxShadow: '0 40px 80px -20px rgba(0,0,0,0.4)',
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

                <h2
                    style={{
                        fontFamily: "'Fraunces', 'Cairo', serif",
                        fontWeight: 600,
                        fontSize: 24,
                        color: '#1B3A2F',
                        textAlign: 'center',
                        margin: '0 0 28px',
                    }}
                >
                    {t('Connexion')}
                </h2>

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label htmlFor="modal-email" style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#1B3A2F' }}>
                            {t('Email')}
                        </label>
                        <input
                            id="modal-email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: 10,
                                border: '1px solid #D9C9A8',
                                background: '#FFFFFF',
                                color: '#1B3A2F',
                                fontSize: 15,
                                boxSizing: 'border-box',
                            }}
                        />
                        {errors.email && <p style={{ color: '#C4643F', fontSize: 13, margin: '6px 0 0' }}>{errors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="modal-password" style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#1B3A2F' }}>
                            {t('Mot de passe')}
                        </label>
                        <input
                            id="modal-password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: 10,
                                border: '1px solid #D9C9A8',
                                background: '#FFFFFF',
                                color: '#1B3A2F',
                                fontSize: 15,
                                boxSizing: 'border-box',
                            }}
                        />
                        {errors.password && <p style={{ color: '#C4643F', fontSize: 13, margin: '6px 0 0' }}>{errors.password}</p>}
                    </div>

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
                        {t('Se connecter')}
                    </button>
                </form>
            </div>
        </div>
    );
}
