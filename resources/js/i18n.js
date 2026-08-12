import { usePage } from '@inertiajs/react';

export function useTranslation() {
    const { translations = {}, locale = { current: 'fr', direction: 'ltr' } } = usePage().props;

    function t(key, params = {}) {
        let text = translations[key] ?? key;

        const entries = Object.entries(params).sort(([a], [b]) => b.length - a.length);

        for (const [name, value] of entries) {
            text = text.replaceAll(`:${name}`, value);
        }

        return text;
    }

    return { t, locale: locale.current, direction: locale.direction };
}
