import { router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal from '../../../Components/Praticien/ConfirmModal';
import TemplateFormModal from '../../../Components/Praticien/TemplateFormModal';
import PraticienLayout from '../../../Layouts/PraticienLayout';

function TemplateCard({ template, onEdit, onDelete }) {
    const mouvementCount = template.items.filter((item) => item.pillar === 'mouvement').length;
    const nutritionCount = template.items.filter((item) => item.pillar === 'nutrition').length;
    const itemTitles = [...new Set(template.items.map((item) => item.title))];

    return (
        <div className="rounded-2xl bg-white px-5.5 py-4 shadow-lg shadow-forest/20">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="mb-1 text-base font-semibold text-forest">{template.title}</h2>
                    {template.description && <p className="text-sm text-forest/60">{template.description}</p>}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    {mouvementCount > 0 && (
                        <span className="rounded-full bg-sand px-2.5 py-0.75 text-xs font-semibold whitespace-nowrap text-forest">
                            {mouvementCount} mouvement
                        </span>
                    )}
                    {nutritionCount > 0 && (
                        <span className="rounded-full bg-sage/15 px-2.5 py-0.75 text-xs font-semibold whitespace-nowrap text-forest">
                            {nutritionCount} nutrition
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={onEdit}
                        aria-label="Modifier le modèle"
                        className="flex size-8 items-center justify-center rounded-lg text-forest/50 hover:bg-sage/10 hover:text-forest"
                    >
                        <Pencil size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        aria-label="Supprimer le modèle"
                        className="flex size-8 items-center justify-center rounded-lg text-forest/50 hover:bg-terracotta/10 hover:text-terracotta"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
                {itemTitles.map((item) => (
                    <span key={item} className="rounded-full bg-sand/30 px-2.5 py-1 text-xs text-forest/70">
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function ProtocolesIndex({ templates }) {
    const [formTemplate, setFormTemplate] = useState(undefined);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    function confirmDelete() {
        setDeleting(true);
        router.delete(`/praticien/protocoles/${deleteTarget.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    }

    return (
        <PraticienLayout title="Protocoles">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="font-display mb-1 text-2xl font-semibold text-forest">Protocoles</h1>
                    <p className="text-sm text-forest/60">Modèles réutilisables, applicables en un clic depuis la fiche d'un patient.</p>
                </div>

                <button
                    type="button"
                    onClick={() => setFormTemplate(null)}
                    className="flex items-center gap-1.5 rounded-xl bg-forest px-4.5 py-2.75 text-sm font-semibold text-cream hover:opacity-90"
                >
                    <Plus size={16} />
                    Nouveau modèle
                </button>
            </div>

            {templates.length === 0 ? (
                <div className="rounded-2xl bg-white px-6 py-16 text-center">
                    <p className="mb-1 text-base font-semibold text-forest">Aucun modèle pour l'instant</p>
                    <p className="text-sm text-forest/60">Créez votre premier modèle avec le bouton ci-dessus.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {templates.map((template) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onEdit={() => setFormTemplate(template)}
                            onDelete={() => setDeleteTarget(template)}
                        />
                    ))}
                </div>
            )}

            <TemplateFormModal open={formTemplate !== undefined} onClose={() => setFormTemplate(undefined)} template={formTemplate} />

            <ConfirmModal
                open={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                processing={deleting}
                title="Supprimer ce modèle ?"
                message={deleteTarget ? `« ${deleteTarget.title} » sera définitivement supprimé. Cette action est irréversible.` : ''}
                confirmLabel="Supprimer"
            />
        </PraticienLayout>
    );
}
