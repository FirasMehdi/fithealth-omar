import PraticienLayout from '../../Layouts/PraticienLayout';

export default function Placeholder({ title }) {
    return (
        <PraticienLayout title={title}>
            <h1 className="font-display mb-2 text-2xl font-semibold text-forest">{title}</h1>
            <p className="text-sm text-forest/60">Cette page arrive bientôt.</p>
        </PraticienLayout>
    );
}
