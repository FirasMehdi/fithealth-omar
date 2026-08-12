import '../css/app.css';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

function syncDocumentDirection(props) {
    const locale = props?.locale;

    if (!locale) return;

    document.documentElement.lang = locale.current;
    document.documentElement.dir = locale.direction;
}

router.on('navigate', (event) => {
    syncDocumentDirection(event.detail.page.props);
});

createInertiaApp({
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        syncDocumentDirection(props.initialPage.props);
        createRoot(el).render(<App {...props} />);
    },
});
