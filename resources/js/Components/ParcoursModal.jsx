import { useEffect } from 'react';

const TIMELINE = [
    {
        year: 'Formation',
        title: 'Médecine générale',
        text: "Diplôme de médecine, avec une pratique clinique qui m'a très vite confronté aux limites d'une approche purement symptomatique.",
    },
    {
        year: 'Spécialisation',
        title: 'Naturopathie & coaching en activité physique adaptée',
        text: "Une double formation complémentaire pour agir sur le terrain — sommeil, alimentation, mouvement — plutôt que sur le seul symptôme.",
    },
    {
        year: 'Aujourd’hui',
        title: 'Cabinet à Tunis, suivi à distance',
        text: 'Un accompagnement qui combine rigueur médicale et suivi personnalisé, en cabinet comme à distance, sans jamais se substituer à votre médecin traitant.',
    },
];

export default function ParcoursModal({ open, onClose }) {
    useEffect(() => {
        if (!open) return;

        function onKeyDown(e) {
            if (e.key === 'Escape') onClose();
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

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
                    maxWidth: 520,
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

                <h2
                    style={{
                        fontFamily: "'Fraunces', serif",
                        fontWeight: 600,
                        fontSize: 24,
                        color: '#1B3A2F',
                        margin: '0 0 8px',
                    }}
                >
                    Mon parcours
                </h2>
                <p style={{ fontSize: 15, color: '#6B7568', margin: '0 0 28px' }}>
                    Médecin avant tout, coach ensuite.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                    {TIMELINE.map((step, i) => (
                        <div key={step.title} style={{ display: 'flex', gap: 16 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                <div
                                    style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        background: '#7FA07E',
                                        marginTop: 5,
                                        flexShrink: 0,
                                    }}
                                />
                                {i < TIMELINE.length - 1 && <div style={{ width: 1.5, flex: 1, background: '#D9C9A8', marginTop: 4 }} />}
                            </div>
                            <div style={{ paddingBottom: 4 }}>
                                <span
                                    style={{
                                        display: 'block',
                                        fontSize: 12.5,
                                        fontWeight: 600,
                                        letterSpacing: '0.04em',
                                        textTransform: 'uppercase',
                                        color: '#7FA07E',
                                        marginBottom: 4,
                                    }}
                                >
                                    {step.year}
                                </span>
                                <h3 style={{ fontSize: 16.5, fontWeight: 600, color: '#1B3A2F', margin: '0 0 6px' }}>{step.title}</h3>
                                <p style={{ fontSize: 14.5, lineHeight: 1.65, color: '#3E5449', margin: 0 }}>{step.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
