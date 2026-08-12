import { router, usePage } from '@inertiajs/react';

export default function LanguageSwitcher({ tone = 'dark' }) {
    const { locale } = usePage().props;

    function switchTo(value) {
        if (value === locale.current) return;
        router.post('/langue', { locale: value }, { preserveScroll: true, preserveState: false });
    }

    const trackClass = tone === 'dark' ? 'bg-cream/10' : 'bg-sand/25';
    const inactiveTextClass = tone === 'dark' ? 'text-cream/70' : 'text-forest/60';

    return (
        <div className={'flex items-center gap-1 rounded-full p-1 text-xs font-bold ' + trackClass}>
            <button
                type="button"
                onClick={() => switchTo('fr')}
                className={'rounded-full px-2.5 py-1 ' + (locale.current === 'fr' ? 'bg-sage text-forest' : inactiveTextClass)}
            >
                FR
            </button>
            <button
                type="button"
                onClick={() => switchTo('ar')}
                className={'rounded-full px-2.5 py-1 ' + (locale.current === 'ar' ? 'bg-sage text-forest' : inactiveTextClass)}
            >
                عربي
            </button>
        </div>
    );
}
