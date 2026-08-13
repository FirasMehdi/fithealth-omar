import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '../Modal';
import { useTranslation } from '../../i18n';

export default function AssignProtocolModal({ open, onClose, patientId, templates, activeProtocolTitle }) {
    const [choice, setChoice] = useState('blank');
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        template_id: null,
    });

    function selectBlank() {
        setChoice('blank');
        setData({ title: '', template_id: null });
    }

    function selectTemplate(template) {
        setChoice(template.id);
        setData({ title: template.title, template_id: template.id });
    }

    function close() {
        reset();
        setChoice('blank');
        onClose();
    }

    function submit(e) {
        e.preventDefault();
        post(`/praticien/patients/${patientId}/protocol`, {
            preserveScroll: true,
            onSuccess: close,
        });
    }

    return (
        <Modal open={open} onClose={close} title={t('Assigner un protocole')} maxWidth={520}>
            {activeProtocolTitle && (
                <div className="mb-5 rounded-xl border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-sm text-forest">
                    {t('Un protocole actif existe déjà (« :title »). Confirmer ci-dessous archivera automatiquement ce protocole.', {
                        title: activeProtocolTitle,
                    })}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-5">
                <div>
                    <p className="mb-2 text-sm font-semibold text-forest">{t('Point de départ')}</p>
                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={selectBlank}
                            className={
                                'rounded-xl border px-4 py-3 text-start text-sm ' +
                                (choice === 'blank' ? 'border-sage bg-sage/10 font-semibold text-forest' : 'border-sand text-forest/70')
                            }
                        >
                            {t('Protocole vierge')}
                            <span className="block text-xs text-forest/50">{t('Partir de zéro, ajouter les items ensuite')}</span>
                        </button>

                        {templates.map((template) => (
                            <button
                                key={template.id}
                                type="button"
                                onClick={() => selectTemplate(template)}
                                className={
                                    'rounded-xl border px-4 py-3 text-start text-sm ' +
                                    (choice === template.id
                                        ? 'border-sage bg-sage/10 font-semibold text-forest'
                                        : 'border-sand text-forest/70')
                                }
                            >
                                {template.title}
                                {template.description && <span className="block text-xs text-forest/50">{template.description}</span>}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="protocol-title" className="mb-1 block text-sm font-semibold text-forest">
                        {t('Titre du protocole')}
                    </label>
                    <input
                        id="protocol-title"
                        type="text"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        className="w-full rounded-xl border border-sand bg-white px-3.5 py-2.5 text-sm text-forest focus:ring-2 focus:ring-sage focus:outline-none"
                    />
                    {errors.title && <p className="mt-1 text-sm text-terracotta">{errors.title}</p>}
                </div>

                <button
                    type="submit"
                    disabled={processing || !data.title}
                    className="rounded-xl bg-forest py-2.75 text-sm font-semibold text-cream disabled:opacity-50"
                >
                    {activeProtocolTitle ? t('Archiver et assigner') : t('Assigner le protocole')}
                </button>
            </form>
        </Modal>
    );
}
