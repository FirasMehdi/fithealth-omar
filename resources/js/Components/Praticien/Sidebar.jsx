import { Link, useForm, usePage } from '@inertiajs/react';
import { ClipboardList, LayoutDashboard, LogOut, Menu, MessageSquare, Settings, Users, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '../../i18n';
import LanguageSwitcher from '../LanguageSwitcher';

function initials(name) {
    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join('');
}

export default function Sidebar() {
    const { url, props } = usePage();
    const user = props.auth.user;
    const { post, processing } = useForm();
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const navItems = [
        { label: t('Tableau de bord'), href: '/praticien/dashboard', icon: LayoutDashboard },
        { label: t('Patients'), href: '/praticien/patients', icon: Users },
        { label: t('Protocoles'), href: '/praticien/protocoles', icon: ClipboardList },
        { label: t('Messages'), href: '/praticien/messages', icon: MessageSquare },
        { label: t('Réglages'), href: '/praticien/reglages', icon: Settings },
    ];

    function logout(e) {
        e.preventDefault();
        post('/logout');
    }

    return (
        <>
            <div className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 bg-forest px-4 lg:hidden">
                <button type="button" onClick={() => setOpen(true)} aria-label={t('Ouvrir le menu')} className="text-cream">
                    <Menu size={22} />
                </button>
                <span className="font-display text-lg font-semibold text-white">FitHealth</span>
            </div>

            {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-forest/50 lg:hidden" />}

            <aside
                className={
                    'fixed inset-y-0 start-0 z-50 flex h-screen w-60 shrink-0 flex-col bg-forest px-4 py-6 transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0 ' +
                    (open ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full')
                }
            >
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label={t('Fermer le menu')}
                    className="mb-3 self-end text-cream lg:hidden"
                >
                    <X size={20} />
                </button>

                <div className="mb-5 ms-2 self-start whitespace-nowrap">
                    <span className="font-display text-xl font-semibold text-white">FitHealth</span>
                </div>

                <div className="mb-4">
                    <LanguageSwitcher tone="dark" />
                </div>

                <div className="mb-5 border-t border-cream/15" />

                <nav className="flex flex-1 flex-col gap-1">
                    {navItems.map((item) => {
                        const active = url.startsWith(item.href);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={
                                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold whitespace-nowrap ' +
                                    (active ? 'bg-sage text-forest' : 'text-cream/70 hover:bg-cream/10')
                                }
                            >
                                <Icon size={18} className="shrink-0" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-2 flex items-center gap-2.5 border-t border-cream/15 pt-4">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sage text-sm font-bold text-forest">
                        {initials(user.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-cream">{user.name}</div>
                        <button
                            type="button"
                            onClick={logout}
                            disabled={processing}
                            className="flex cursor-pointer items-center gap-1 text-xs text-cream/60 hover:text-cream"
                        >
                            <LogOut size={12} />
                            {t('Se déconnecter')}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
