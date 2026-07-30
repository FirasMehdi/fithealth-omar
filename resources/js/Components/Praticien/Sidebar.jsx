import { Link, useForm, usePage } from '@inertiajs/react';
import { ClipboardList, LayoutDashboard, LogOut, MessageSquare, Settings, Users } from 'lucide-react';

const NAV_ITEMS = [
    { label: 'Tableau de bord', href: '/praticien/dashboard', icon: LayoutDashboard },
    { label: 'Patients', href: '/praticien/patients', icon: Users },
    { label: 'Protocoles', href: '/praticien/protocoles', icon: ClipboardList },
    { label: 'Messages', href: '/praticien/messages', icon: MessageSquare },
    { label: 'Réglages', href: '/praticien/reglages', icon: Settings },
];

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

    function logout(e) {
        e.preventDefault();
        post('/logout');
    }

    return (
        <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-forest px-4 py-6">
            <div className="mb-5 ml-2 self-start whitespace-nowrap">
                <span className="font-display text-xl font-semibold text-white">Doctor</span>
                <span className="font-display text-xl font-semibold text-white"> Panel</span>
            </div>

            <div className="mb-5 border-t border-cream/15" />

            <nav className="flex flex-1 flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                    const active = url.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
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
                        className="flex items-center gap-1 text-xs text-cream/60 hover:text-cream cursor-pointer"
                    >
                        <LogOut size={12} />
                        Se déconnecter
                    </button>
                </div>
            </div>
        </aside>
    );
}
