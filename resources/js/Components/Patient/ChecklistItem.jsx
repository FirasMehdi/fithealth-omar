import { Apple, Check, Dumbbell } from 'lucide-react';

export const PILLAR_ICONS = {
    mouvement: Dumbbell,
    nutrition: Apple,
};

function IconTile({ icon: Icon }) {
    return (
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sage/20">
            <Icon size={22} className="text-sage" strokeWidth={1.8} />
        </div>
    );
}

export default function ChecklistItem({ icon, label, detail, done = false, onToggle }) {
    const interactive = typeof onToggle === 'function';

    function handleKeyDown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            if (event.key === ' ') {
                event.preventDefault();
            }
            onToggle();
        }
    }

    return (
        <div
            onClick={interactive ? onToggle : undefined}
            onKeyDown={interactive ? handleKeyDown : undefined}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-pressed={interactive ? done : undefined}
            className={
                'flex items-center gap-3.5 rounded-2xl bg-white px-4 py-3.5 shadow-md shadow-forest/10 ' +
                (interactive ? 'cursor-pointer' : '')
            }
        >
            <IconTile icon={icon} />
            <div className="min-w-0 flex-1">
                <div className={'text-sm font-semibold ' + (done ? 'text-forest/40 line-through' : 'text-forest')}>{label}</div>
                {detail && <div className="text-xs text-forest/50">{detail}</div>}
            </div>
            {interactive && (
                <span
                    className={
                        'flex size-7 shrink-0 items-center justify-center rounded-full border-2 ' +
                        (done ? 'border-sage bg-sage' : 'border-sand bg-transparent')
                    }
                >
                    {done && <Check size={14} strokeWidth={3} className="text-cream" />}
                </span>
            )}
        </div>
    );
}
