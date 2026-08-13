import { useForm } from '@inertiajs/react';
import Modal from '../Modal';
import { useTranslation } from '../../i18n';

const inputClass =
    'w-full rounded-xl border border-sand bg-white px-3.5 py-2.5 text-sm text-forest focus:ring-2 focus:ring-sage focus:outline-none';

function Field({ label, htmlFor, error, children }) {
    return (
        <div>
            <label htmlFor={htmlFor} className="mb-1 block text-sm font-semibold text-forest">
                {label}
            </label>
            {children}
            {error && <p className="mt-1 text-sm text-terracotta">{error}</p>}
        </div>
    );
}

export default function AddPatientModal({ open, onClose }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        birth_date: '',
        sex: '',
        goal: '',
        height_cm: '',
        initial_weight: '',
        medical_background: '',
        current_treatments: '',
    });

    function close() {
        reset();
        onClose();
    }

    function submit(e) {
        e.preventDefault();
        post('/praticien/patients', {
            preserveScroll: true,
            onSuccess: close,
        });
    }

    return (
        <Modal open={open} onClose={close} title={t('Nouveau patient')} maxWidth={560}>
            <form onSubmit={submit} className="flex flex-col gap-4">
                <Field label={t('Nom complet')} htmlFor="patient-name" error={errors.name}>
                    <input
                        id="patient-name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        autoFocus
                        className={inputClass}
                    />
                </Field>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label={t('Email')} htmlFor="patient-email" error={errors.email}>
                        <input
                            id="patient-email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className={inputClass}
                        />
                    </Field>
                    <Field label={t('Mot de passe')} htmlFor="patient-password" error={errors.password}>
                        <input
                            id="patient-password"
                            type="text"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className={inputClass}
                        />
                    </Field>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label={t('Téléphone')} htmlFor="patient-phone" error={errors.phone}>
                        <input
                            id="patient-phone"
                            type="text"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            className={inputClass}
                        />
                    </Field>
                    <Field label={t('Date de naissance')} htmlFor="patient-birth-date" error={errors.birth_date}>
                        <input
                            id="patient-birth-date"
                            type="date"
                            value={data.birth_date}
                            onChange={(e) => setData('birth_date', e.target.value)}
                            className={inputClass}
                        />
                    </Field>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label={t('Sexe')} htmlFor="patient-sex" error={errors.sex}>
                        <select
                            id="patient-sex"
                            value={data.sex}
                            onChange={(e) => setData('sex', e.target.value)}
                            className={inputClass}
                        >
                            <option value="">—</option>
                            <option value="femme">{t('Femme')}</option>
                            <option value="homme">{t('Homme')}</option>
                        </select>
                    </Field>
                    <Field label={t('Objectif')} htmlFor="patient-goal" error={errors.goal}>
                        <input
                            id="patient-goal"
                            type="text"
                            placeholder="Retrouver de l'énergie…"
                            value={data.goal}
                            onChange={(e) => setData('goal', e.target.value)}
                            className={inputClass}
                        />
                    </Field>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label={t('Taille (cm)')} htmlFor="patient-height" error={errors.height_cm}>
                        <input
                            id="patient-height"
                            type="number"
                            min="1"
                            value={data.height_cm}
                            onChange={(e) => setData('height_cm', e.target.value)}
                            className={inputClass}
                        />
                    </Field>
                    <Field label={t('Poids initial (kg)')} htmlFor="patient-weight" error={errors.initial_weight}>
                        <input
                            id="patient-weight"
                            type="number"
                            step="0.1"
                            min="1"
                            value={data.initial_weight}
                            onChange={(e) => setData('initial_weight', e.target.value)}
                            className={inputClass}
                        />
                    </Field>
                </div>

                <Field label={t('Antécédents médicaux')} htmlFor="patient-medical-background" error={errors.medical_background}>
                    <textarea
                        id="patient-medical-background"
                        rows={2}
                        value={data.medical_background}
                        onChange={(e) => setData('medical_background', e.target.value)}
                        className={inputClass}
                    />
                </Field>

                <Field label={t('Traitements en cours')} htmlFor="patient-current-treatments" error={errors.current_treatments}>
                    <textarea
                        id="patient-current-treatments"
                        rows={2}
                        value={data.current_treatments}
                        onChange={(e) => setData('current_treatments', e.target.value)}
                        className={inputClass}
                    />
                </Field>

                <button
                    type="submit"
                    disabled={processing || !data.name || !data.email || !data.password}
                    className="rounded-xl bg-forest py-2.75 text-sm font-semibold text-cream disabled:opacity-50"
                >
                    {t('Créer le patient')}
                </button>
            </form>
        </Modal>
    );
}
