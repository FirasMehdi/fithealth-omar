import { usePage } from '@inertiajs/react';

export function useTranslation() {
    const { translations = {}, locale = { current: 'fr', direction: 'ltr' } } = usePage().props;

    function t(key, params = {}) {
        let text = translations[key] ?? key;

        for (const [name, value] of Object.entries(params)) {
            text = text.replaceAll(`:${name}`, value);
        }

        return text;
    }

    return { t, locale: locale.current, direction: locale.direction };
}
