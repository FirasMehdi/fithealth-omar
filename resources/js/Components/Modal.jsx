import { useEffect } from 'react';
import { useTranslation } from '../i18n';

export default function Modal({ open, onClose, title, children, maxWidth = 440 }) {
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

    return (
        <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-forest/55 p-5 backdrop-blur-xs">
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative flex w-full flex-col rounded-2xl bg-cream shadow-xl shadow-forest/30"
                style={{ maxWidth: `${maxWidth}px`, maxHeight: '90vh' }}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={t('Fermer')}
                    className="absolute top-4 end-4 flex size-8 items-center justify-center rounded-full text-forest hover:bg-forest/10"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M1 1L15 15M15 1L1 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                </button>

                <div className="overflow-y-auto p-9">
                    {title && <h2 className="font-display mb-6 text-center text-2xl font-semibold text-forest">{title}</h2>}

                    {children}
                </div>
            </div>
        </div>
    );
}
