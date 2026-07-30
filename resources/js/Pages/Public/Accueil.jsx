import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import LoginModal from '../../Components/LoginModal';
import ParcoursModal from '../../Components/ParcoursModal';
import logo from '../../../images/fithealth.png';
import heroPhoto from '../../../images/herosection1.png';
import praticienPhoto from '../../../images/zou.png';

const IconFatigue = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8.5" stroke="#1B3A2F" strokeWidth="1.6" />
        <path d="M12 7.5V12l3 2" stroke="#1B3A2F" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);

const IconDigestif = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M8 5c-2 2-3 5-1 8s1 6-1 7" stroke="#1B3A2F" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M16 5c2 2 3 5 1 8s-1 6 1 7" stroke="#1B3A2F" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);

const IconActivite = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M5 15l4-5 3 3 6-7" stroke="#1B3A2F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 6h4v4" stroke="#1B3A2F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const IconMouvement = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="5" r="2" fill="#F7F4ED" />
        <path
            d="M12 8v6l4 4M12 14l-4 4M8 11l4-2 4 2"
            stroke="#F7F4ED"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const IconVitalite = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path
            d="M12 5c-3-2-8 0-8 5 0 5 8 9 8 9s8-4 8-9c0-5-5-7-8-5z"
            stroke="#F7F4ED"
            strokeWidth="1.6"
            strokeLinejoin="round"
        />
    </svg>
);

const IconCheck = () => (
    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
        <path d="M1 5L4.5 8.5L11 1.5" stroke="#1B3A2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const NAV_LINKS = [
    { href: '#methode', label: 'Méthode' },
    { href: '#accompagnements', label: 'Accompagnements' },
    { href: '#praticien', label: 'Le praticien' },
    { href: '#faq', label: 'Questions fréquentes' },
];

const HERO_INDICATORS = [
    { label: 'Énergie', pct: 72 },
    { label: 'Sommeil', pct: 64 },
    { label: 'Digestion', pct: 80 },
    { label: 'Humeur', pct: 68 },
];

const PROFILES = [
    {
        title: 'Fatigue persistante',
        text: "Vous vous sentez fatigué·e sans cause identifiée, malgré un sommeil correct. Nous cherchons ensemble les déséquilibres discrets.",
        icon: <IconFatigue />,
    },
    {
        title: 'Troubles digestifs',
        text: "Ballonnements, inconfort, transit irrégulier : le terrain digestif est souvent la première étape d'un rééquilibrage durable.",
        icon: <IconDigestif />,
    },
    {
        title: "Reprise d'activité",
        text: 'Vous voulez reprendre une activité physique en confiance, sans risque de blessure ni de rechute.',
        icon: <IconActivite />,
    },
];

const PILLARS = [
    {
        title: 'Mouvement',
        icon: <IconMouvement />,
        lines: [
            "Une activité physique adaptée à votre condition réelle, pas à un modèle générique.",
            'Progression mesurée, sans surentraînement ni promesse de performance.',
            "Des séances qui s'intègrent dans votre semaine, pas l'inverse.",
        ],
    },
    {
        title: 'Vitalité',
        icon: <IconVitalite />,
        lines: [
            'Une alimentation ajustée à votre métabolisme, sans régime restrictif.',
            'Sommeil, stress, hygiène de vie : les fondations souvent négligées.',
            'Des habitudes qui tiennent, construites une à une.',
        ],
    },
];

const STEPS_RAW = [
    { num: '01', title: 'Bilan', text: 'Un entretien approfondi sur votre histoire, votre mode de vie et vos objectifs.' },
    {
        num: '02',
        title: 'Protocole personnalisé',
        text: 'Un plan mouvement et vitalité conçu pour votre réalité, pas un programme standard.',
    },
    {
        num: '03',
        title: 'Suivi hebdomadaire',
        text: 'Des points réguliers via votre espace en ligne, entre les consultations.',
    },
    { num: '04', title: 'Ajustements', text: 'Le protocole évolue avec vous, selon vos progrès et vos retours.' },
];
const STEPS = STEPS_RAW.map((s, i) => ({
    ...s,
    connectorColor: i < STEPS_RAW.length - 1 ? '#7FA07E' : 'transparent',
}));

const SPACE_BENEFITS = [
    'Suivi de vos indicateurs clés (énergie, sommeil, digestion, humeur)',
    'Messagerie directe avec votre praticien',
    'Accès à votre protocole et à son historique',
];

const PLAN_DEFS = [
    {
        key: 'ponctuelle',
        title: 'Consultation ponctuelle',
        tagline: 'Pour un bilan ciblé ou une question précise.',
        features: ['Bilan initial approfondi', 'Recommandations écrites', 'Un point de suivi à 15 jours'],
    },
    {
        key: 'suivi1mois',
        title: 'Suivi 1 mois',
        tagline: 'Pour amorcer un changement en profondeur.',
        features: [
            'Bilan complet et protocole personnalisé',
            "Suivi hebdomadaire via l'espace en ligne",
            'Ajustements réguliers',
            'Messagerie illimitée',
        ],
    },
    {
        key: 'suivi3mois',
        title: 'Suivi 3 mois',
        tagline: 'Pour un accompagnement dans la durée.',
        features: [
            'Tout le suivi 1 mois',
            'Bilans intermédiaires à 6 et 10 semaines',
            'Priorité sur les créneaux de consultation',
        ],
    },
];
const HIGHLIGHTED_PLAN = 'suivi1mois';
const PLANS = PLAN_DEFS.map((p) => {
    const featured = p.key === HIGHLIGHTED_PLAN;
    return {
        ...p,
        featured,
        bg: featured ? '#1B3A2F' : '#FFFFFF',
        color: featured ? '#F7F4ED' : '#1B3A2F',
        dot: '#7FA07E',
        shadow: featured ? '0 30px 60px -24px rgba(27,58,47,0.45)' : '0 20px 40px -30px rgba(27,58,47,0.2)',
        btnBg: featured ? '#7FA07E' : 'transparent',
        btnColor: '#1B3A2F',
        btnBorder: featured ? 'none' : '1.5px solid #7FA07E',
    };
});

const FAQ_RAW = [
    {
        q: 'Est-ce que cela remplace le suivi de mon médecin traitant ?',
        a: "Non. Mon accompagnement complète le suivi de votre médecin traitant, il ne s'y substitue pas. Toute pathologie diagnostiquée reste suivie par votre médecin habituel.",
    },
    {
        q: 'Comment se déroule le suivi à distance ?',
        a: 'Entre les consultations, vous renseignez vos indicateurs et vos ressentis dans votre espace personnel. Je les consulte et ajuste votre protocole si nécessaire, avec des échanges par messagerie.',
    },
    {
        q: 'Combien de temps avant de ressentir des effets ?',
        a: "Cela dépend de chaque personne et de son point de départ. Les premiers ajustements se ressentent souvent dès les premières semaines, mais un changement durable s'installe sur plusieurs mois.",
    },
    {
        q: 'Les consultations sont-elles remboursées ?',
        a: "La naturopathie et le coaching ne sont pas remboursés par la sécurité sociale. Certaines mutuelles proposent une prise en charge partielle : renseignez-vous auprès de la vôtre.",
    },
];

export default function Accueil() {
    const [isNarrow, setIsNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < 900);
    const [navOpen, setNavOpen] = useState(false);
    const [faqOpen, setFaqOpen] = useState(0);
    const [loginOpen, setLoginOpen] = useState(false);
    const [parcoursOpen, setParcoursOpen] = useState(false);

    useEffect(() => {
        const onResize = () => setIsNarrow(window.innerWidth < 900);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const isWide = !isNarrow;

    return (
        <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", background: '#F7F4ED', color: '#1B3A2F', overflowX: 'hidden' }}>
            <Head title="FitHealth — Naturopathie & coaching" />

            {/* NAV */}
            <nav
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    padding: '10px clamp(20px,4vw,64px)',
                    background: 'rgba(247,244,237,0.92)',
                    backdropFilter: 'blur(8px)',
                    borderBottom: '1px solid #D9C9A8',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                    <img src={logo} alt="FitHealth" style={{ height: 'clamp(38px, 5.5vw, 52px)', width: 'auto', display: 'block', flexShrink: 0 }} />

                    {isWide && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(16px,3vw,36px)', fontSize: 15, fontWeight: 500, whiteSpace: 'nowrap' }}>
                                {NAV_LINKS.map((nl) => (
                                    <a key={nl.href} href={nl.href} style={{ textDecoration: 'none' }}>
                                        {nl.label}
                                    </a>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => setLoginOpen(true)}
                                style={{
                                    fontFamily: 'inherit',
                                    textDecoration: 'none',
                                    padding: '10px 22px',
                                    border: '1.5px solid #7FA07E',
                                    borderRadius: 999,
                                    background: 'transparent',
                                    color: '#1B3A2F',
                                    fontWeight: 600,
                                    fontSize: 14,
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer',
                                }}
                            >
                                Connexion
                            </button>
                        </>
                    )}

                    {isNarrow && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button
                                type="button"
                                onClick={() => setLoginOpen(true)}
                                style={{
                                    fontFamily: 'inherit',
                                    textDecoration: 'none',
                                    padding: '9px 18px',
                                    border: '1.5px solid #7FA07E',
                                    borderRadius: 999,
                                    background: 'transparent',
                                    color: '#1B3A2F',
                                    fontWeight: 600,
                                    fontSize: 13.5,
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer',
                                }}
                            >
                                Connexion
                            </button>
                            <button
                                onClick={() => setNavOpen((v) => !v)}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    border: '1.5px solid #D9C9A8',
                                    background: 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                }}
                            >
                                <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                                    <path d="M1 1H17M1 7H17M1 13H17" stroke="#1B3A2F" strokeWidth="1.6" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {navOpen && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 18 }}>
                        {NAV_LINKS.map((nl) => (
                            <a
                                key={nl.href}
                                href={nl.href}
                                style={{
                                    textDecoration: 'none',
                                    color: '#1B3A2F',
                                    fontWeight: 500,
                                    fontSize: 16,
                                    padding: '12px 4px',
                                    borderBottom: '1px solid #D9C9A8',
                                }}
                            >
                                {nl.label}
                            </a>
                        ))}
                    </div>
                )}
            </nav>

            {/* HERO */}
            <section
                style={{
                    padding: 'clamp(40px,7vw,88px) clamp(20px,4vw,64px) clamp(48px,6vw,80px)',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(300px,1fr) minmax(320px,1fr)',
                    gap: 'clamp(32px,5vw,64px)',
                    alignItems: 'center',
                    maxWidth: 1320,
                    margin: '0 auto',
                }}
            >
                <div>
                    <span
                        style={{
                            display: 'inline-block',
                            background: '#D9C9A8',
                            color: '#1B3A2F',
                            fontSize: 13,
                            fontWeight: 600,
                            letterSpacing: '0.04em',
                            padding: '7px 16px',
                            borderRadius: 999,
                            marginBottom: 22,
                        }}
                    >
                        Naturopathie &amp; coaching
                    </span>
                    <h1
                        style={{
                            fontFamily: "'Fraunces', serif",
                            fontWeight: 600,
                            fontSize: 'clamp(36px,5.2vw,60px)',
                            lineHeight: 1.08,
                            margin: '0 0 22px',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        Retrouvez votre énergie, durablement
                    </h1>
                    <p style={{ fontSize: 'clamp(16px,1.6vw,19px)', lineHeight: 1.6, color: '#3E5449', maxWidth: '46ch', margin: '0 0 34px' }}>
                        Un accompagnement personnalisé qui allie mouvement et vitalité, avec un suivi entre chaque
                        consultation — pour des résultats qui s'installent dans la durée.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
                        <a
                            href="#rendez-vous"
                            style={{
                                textDecoration: 'none',
                                background: '#1B3A2F',
                                color: '#F7F4ED',
                                fontWeight: 600,
                                fontSize: 16,
                                padding: '15px 30px',
                                borderRadius: 14,
                                boxShadow: '0 12px 30px -14px rgba(27,58,47,0.5)',
                            }}
                        >
                            Réserver un premier échange
                        </a>
                        <a
                            href="#methode"
                            style={{
                                textDecoration: 'none',
                                color: '#1B3A2F',
                                fontWeight: 600,
                                fontSize: 16,
                                borderBottom: '2px solid #7FA07E',
                                paddingBottom: 2,
                            }}
                        >
                            Découvrir la méthode →
                        </a>
                    </div>
                </div>
                <div style={{ position: 'relative' }}>
                    <div
                        style={{
                            borderRadius: 20,
                            overflow: 'hidden',
                            aspectRatio: '4/4.6',
                            boxShadow: '0 30px 60px -30px rgba(27,58,47,0.35)',
                        }}
                    >
                        <img
                            src={heroPhoto}
                            alt="Le praticien en séance, portrait éditorial"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                    </div>
                    <div
                        style={{
                            position: 'absolute',
                            left: 'clamp(-16px,-3vw,10px)',
                            bottom: 'clamp(16px,4vw,40px)',
                            background: '#FFFFFF',
                            borderRadius: 16,
                            boxShadow: '0 24px 48px -20px rgba(27,58,47,0.28)',
                            padding: '20px 22px',
                            width: 'min(260px, 78%)',
                        }}
                    >
                        <p
                            style={{
                                margin: '0 0 12px',
                                fontSize: 12.5,
                                fontWeight: 600,
                                color: '#7A8F81',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                            }}
                        >
                            Votre suivi · semaine 6
                        </p>
                        {HERO_INDICATORS.map((ind) => (
                            <div key={ind.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                <span style={{ fontSize: 13, width: 62, flexShrink: 0, color: '#1B3A2F' }}>{ind.label}</span>
                                <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#EDE6D6', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', borderRadius: 999, background: '#7FA07E', width: `${ind.pct}%` }} />
                                </div>
                                <span style={{ fontSize: 12, color: '#7A8F81', width: 30, textAlign: 'right' }}>{ind.pct}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* A QUI JE M'ADRESSE */}
            <section style={{ padding: 'clamp(48px,6vw,80px) clamp(20px,4vw,64px)', maxWidth: 1320, margin: '0 auto' }}>
                <h2
                    style={{
                        fontFamily: "'Fraunces', serif",
                        fontWeight: 600,
                        fontSize: 'clamp(26px,3.2vw,38px)',
                        textAlign: 'center',
                        margin: '0 0 44px',
                    }}
                >
                    Vous vous reconnaissez ?
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: 24 }}>
                    {PROFILES.map((p) => (
                        <div
                            key={p.title}
                            style={{ background: '#FFFFFF', borderRadius: 16, padding: '32px 28px', boxShadow: '0 20px 40px -30px rgba(27,58,47,0.2)' }}
                        >
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 12,
                                    background: '#F1EBDD',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 18,
                                }}
                            >
                                {p.icon}
                            </div>
                            <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 20, margin: '0 0 10px' }}>{p.title}</h3>
                            <p style={{ fontSize: 15, lineHeight: 1.6, color: '#3E5449', margin: 0 }}>{p.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* LES DEUX PILIERS */}
            <section id="methode" style={{ padding: 'clamp(48px,6vw,80px) clamp(20px,4vw,64px)', maxWidth: 1320, margin: '0 auto' }}>
                <h2
                    style={{
                        fontFamily: "'Fraunces', serif",
                        fontWeight: 600,
                        fontSize: 'clamp(26px,3.2vw,38px)',
                        textAlign: 'center',
                        margin: '0 0 44px',
                    }}
                >
                    Une méthode, deux piliers
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 28 }}>
                    {PILLARS.map((pl) => (
                        <div
                            key={pl.title}
                            style={{ background: '#FFFFFF', borderRadius: 18, padding: '40px 36px', boxShadow: '0 20px 44px -32px rgba(27,58,47,0.22)' }}
                        >
                            <div
                                style={{
                                    width: 54,
                                    height: 54,
                                    borderRadius: 14,
                                    background: '#7FA07E',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 22,
                                }}
                            >
                                {pl.icon}
                            </div>
                            <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 24, margin: '0 0 16px' }}>{pl.title}</h3>
                            {pl.lines.map((line) => (
                                <p key={line} style={{ fontSize: 15.5, lineHeight: 1.7, color: '#3E5449', margin: '0 0 10px', paddingLeft: 18, position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 0, top: 9, width: 6, height: 6, borderRadius: '50%', background: '#7FA07E' }} />
                                    {line}
                                </p>
                            ))}
                        </div>
                    ))}
                </div>
            </section>

            {/* 4 ETAPES */}
            <section style={{ padding: 'clamp(48px,6vw,80px) clamp(20px,4vw,64px)', maxWidth: 1320, margin: '0 auto' }}>
                <h2
                    style={{
                        fontFamily: "'Fraunces', serif",
                        fontWeight: 600,
                        fontSize: 'clamp(26px,3.2vw,38px)',
                        textAlign: 'center',
                        margin: '0 0 52px',
                    }}
                >
                    Comment se déroule l'accompagnement
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {STEPS.map((st) => (
                        <div key={st.num} style={{ flex: '1 1 200px', minWidth: 200, textAlign: 'center', padding: '0 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <span style={{ flex: 1, borderTop: '2px dashed transparent' }} />
                                <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 44, color: '#D9C9A8', lineHeight: 1 }}>
                                    {st.num}
                                </span>
                                <span style={{ flex: 1, borderTop: `2px dashed ${st.connectorColor}` }} />
                            </div>
                            <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 10px' }}>{st.title}</h3>
                            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: '#3E5449', margin: 0 }}>{st.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* LE PRATICIEN */}
            <section
                id="praticien"
                style={{
                    padding: 'clamp(48px,6vw,80px) clamp(20px,4vw,64px)',
                    maxWidth: 1320,
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(280px,0.85fr) minmax(320px,1.15fr)',
                    gap: 'clamp(32px,5vw,64px)',
                    alignItems: 'center',
                }}
            >
                <div
                    style={{
                        borderRadius: 20,
                        overflow: 'hidden',
                        aspectRatio: '3/3.6',
                        boxShadow: '0 30px 60px -30px rgba(27,58,47,0.35)',
                    }}
                >
                    <img
                        src={praticienPhoto}
                        alt="Portrait du praticien"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                </div>
                <div>
                    <span
                        style={{
                            display: 'inline-block',
                            background: '#D9C9A8',
                            color: '#1B3A2F',
                            fontSize: 13,
                            fontWeight: 600,
                            letterSpacing: '0.04em',
                            padding: '7px 16px',
                            borderRadius: 999,
                            marginBottom: 20,
                        }}
                    >
                        Le praticien
                    </span>
                    <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 20px' }}>
                        Médecin avant tout, coach ensuite
                    </h2>
                    <p style={{ fontSize: 16.5, lineHeight: 1.75, color: '#3E5449', margin: '0 0 24px', maxWidth: '56ch' }}>
                        Je suis médecin, formé à la naturopathie et au coaching en activité physique adaptée. Cette double
                        approche me permet d'allier la rigueur médicale à un accompagnement humain, sur la durée — sans
                        promesse de résultat chiffré, avec une exigence de sécurité avant tout.
                    </p>
                    <button
                        type="button"
                        onClick={() => setParcoursOpen(true)}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            textDecoration: 'none',
                            color: '#1B3A2F',
                            fontWeight: 600,
                            fontSize: 15.5,
                            fontFamily: 'inherit',
                            borderBottom: '2px solid #7FA07E',
                            paddingBottom: 2,
                        }}
                    >
                        Découvrir mon parcours →
                    </button>
                </div>
            </section>

            {/* ESPACE DE SUIVI */}
            <section
                style={{
                    margin: 'clamp(40px,6vw,72px) auto',
                    background: '#1B3A2F',
                    borderRadius: 28,
                    padding: 'clamp(40px,6vw,72px) clamp(28px,5vw,64px)',
                    color: '#F7F4ED',
                    maxWidth: 1320,
                }}
            >
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(280px,1fr) minmax(320px,1.1fr)',
                        gap: 'clamp(32px,5vw,56px)',
                        alignItems: 'center',
                    }}
                >
                    <div>
                        <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 20px' }}>
                            Un suivi qui continue entre les consultations
                        </h2>
                        <p style={{ fontSize: 16, lineHeight: 1.7, color: '#C9D6CC', margin: '0 0 26px', maxWidth: '48ch' }}>
                            Chaque patient dispose d'un espace personnel pour suivre son évolution, consigner ses ressentis
                            et rester en lien avec son praticien entre deux rendez-vous.
                        </p>
                        {SPACE_BENEFITS.map((b) => (
                            <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                                <span
                                    style={{
                                        flexShrink: 0,
                                        width: 22,
                                        height: 22,
                                        borderRadius: '50%',
                                        background: '#7FA07E',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginTop: 1,
                                    }}
                                >
                                    <IconCheck />
                                </span>
                                <span style={{ fontSize: 15.5, lineHeight: 1.5, color: '#EDE9DE' }}>{b}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ background: '#F7F4ED', borderRadius: 16, overflow: 'hidden', boxShadow: '0 30px 60px -20px rgba(0,0,0,0.35)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '12px 16px', background: '#EDE6D6' }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#C4643F' }} />
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#D9C9A8' }} />
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#7FA07E' }} />
                            <span style={{ marginLeft: 10, fontSize: 12, color: '#6B7568', fontFamily: 'monospace' }}>
                                espace.fithealth.tn/tableau-de-bord
                            </span>
                        </div>
                        <div style={{ padding: '26px 24px' }}>
                            <p style={{ margin: '0 0 18px', fontSize: 13, fontWeight: 600, color: '#6B7568', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Tableau de bord patient
                            </p>
                            {HERO_INDICATORS.map((ind) => (
                                <div key={ind.label} style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 6, color: '#1B3A2F' }}>
                                        <span>{ind.label}</span>
                                        <span style={{ color: '#7A8F81' }}>{ind.pct}%</span>
                                    </div>
                                    <div style={{ height: 8, borderRadius: 999, background: '#E3D9C4', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', borderRadius: 999, background: '#7FA07E', width: `${ind.pct}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ACCOMPAGNEMENTS */}
            <section id="accompagnements" style={{ padding: 'clamp(48px,6vw,80px) clamp(20px,4vw,64px)', maxWidth: 1320, margin: '0 auto' }}>
                <h2
                    style={{
                        fontFamily: "'Fraunces', serif",
                        fontWeight: 600,
                        fontSize: 'clamp(26px,3.2vw,38px)',
                        textAlign: 'center',
                        margin: '0 0 12px',
                    }}
                >
                    Trois formules, un même accompagnement
                </h2>
                <p style={{ textAlign: 'center', color: '#6B7568', fontSize: 15.5, maxWidth: '52ch', margin: '0 auto 48px' }}>
                    Tarifs communiqués lors du premier échange, selon votre situation.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px,1fr))', gap: 24, alignItems: 'stretch' }}>
                    {PLANS.map((plan) => (
                        <div
                            key={plan.key}
                            style={{
                                background: plan.bg,
                                color: plan.color,
                                borderRadius: 20,
                                padding: '36px 30px',
                                boxShadow: plan.shadow,
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            {plan.featured && (
                                <span
                                    style={{
                                        position: 'absolute',
                                        top: -14,
                                        left: 30,
                                        background: '#D9C9A8',
                                        color: '#1B3A2F',
                                        fontSize: 12,
                                        fontWeight: 700,
                                        letterSpacing: '0.03em',
                                        padding: '6px 14px',
                                        borderRadius: 999,
                                    }}
                                >
                                    Recommandé
                                </span>
                            )}
                            <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22, margin: '8px 0 10px' }}>{plan.title}</h3>
                            <p style={{ fontSize: 14.5, opacity: 0.85, margin: '0 0 22px', lineHeight: 1.5 }}>{plan.tagline}</p>
                            <div style={{ flex: 1 }}>
                                {plan.features.map((f) => (
                                    <p key={f} style={{ fontSize: 14.5, lineHeight: 1.6, margin: '0 0 10px', paddingLeft: 18, position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: 0, top: 8, width: 6, height: 6, borderRadius: '50%', background: plan.dot }} />
                                        {f}
                                    </p>
                                ))}
                            </div>
                            <a
                                href="#rendez-vous"
                                style={{
                                    marginTop: 22,
                                    textAlign: 'center',
                                    textDecoration: 'none',
                                    padding: 13,
                                    borderRadius: 12,
                                    fontWeight: 600,
                                    fontSize: 15,
                                    background: plan.btnBg,
                                    color: plan.btnColor,
                                    border: plan.btnBorder,
                                }}
                            >
                                En savoir plus
                            </a>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" style={{ padding: 'clamp(48px,6vw,80px) clamp(20px,4vw,64px)', maxWidth: 820, margin: '0 auto' }}>
                <h2
                    style={{
                        fontFamily: "'Fraunces', serif",
                        fontWeight: 600,
                        fontSize: 'clamp(26px,3.2vw,38px)',
                        textAlign: 'center',
                        margin: '0 0 40px',
                    }}
                >
                    Questions fréquentes
                </h2>
                {FAQ_RAW.map((item, i) => {
                    const open = faqOpen === i;
                    return (
                        <div key={item.q} style={{ borderBottom: '1px solid #D9C9A8' }}>
                            <div
                                onClick={() => setFaqOpen((cur) => (cur === i ? null : i))}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: 16,
                                    padding: '22px 4px',
                                    cursor: 'pointer',
                                }}
                            >
                                <span style={{ fontSize: 16.5, fontWeight: 600 }}>{item.q}</span>
                                <span
                                    style={{
                                        flexShrink: 0,
                                        width: 26,
                                        height: 26,
                                        borderRadius: '50%',
                                        border: '1.5px solid #7FA07E',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 16,
                                        transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s',
                                    }}
                                >
                                    +
                                </span>
                            </div>
                            {open && (
                                <p style={{ fontSize: 15, lineHeight: 1.7, color: '#3E5449', margin: '0 0 24px', padding: '0 4px' }}>{item.a}</p>
                            )}
                        </div>
                    );
                })}
            </section>

            {/* CTA FINAL */}
            <section id="rendez-vous" style={{ padding: 'clamp(56px,7vw,90px) clamp(20px,4vw,64px)', textAlign: 'center' }}>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 'clamp(26px,3.4vw,40px)', margin: '0 0 22px' }}>
                    Prêt·e à faire le premier pas ?
                </h2>
                <p style={{ fontSize: 16, color: '#3E5449', maxWidth: '46ch', margin: '0 auto 30px' }}>
                    Un premier échange de 20 minutes, sans engagement, pour comprendre votre situation.
                </p>
                <a
                    href="#"
                    style={{
                        textDecoration: 'none',
                        background: '#1B3A2F',
                        color: '#F7F4ED',
                        fontWeight: 600,
                        fontSize: 16.5,
                        padding: '16px 34px',
                        borderRadius: 14,
                        display: 'inline-block',
                    }}
                >
                    Réserver un premier échange
                </a>
            </section>

            {/* FOOTER */}
            <footer style={{ background: '#1B3A2F', color: '#C9D6CC', padding: 'clamp(40px,5vw,60px) clamp(20px,4vw,64px) 28px' }}>
                <div
                    style={{
                        maxWidth: 1320,
                        margin: '0 auto',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))',
                        gap: 32,
                        paddingBottom: 32,
                        borderBottom: '1px solid rgba(255,255,255,0.12)',
                    }}
                >
                    <div>
                        <div style={{ background: '#F7F4ED', display: 'inline-block', padding: '8px 12px', borderRadius: 10, marginBottom: 14 }}>
                            <img src={logo} alt="FitHealth" style={{ height: 26, width: 'auto', display: 'block' }} />
                        </div>
                        <p style={{ fontSize: 14, lineHeight: 1.6, color: '#9FB0A4', margin: 0, maxWidth: '26ch' }}>
                            Naturopathie et coaching en activité physique adaptée, à Tunis et à distance.
                        </p>
                    </div>
                    <div>
                        <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#7FA07E', margin: '0 0 14px' }}>
                            Navigation
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <a href="#methode" style={{ color: '#C9D6CC', textDecoration: 'none', fontSize: 14.5 }}>
                                Méthode
                            </a>
                            <a href="#accompagnements" style={{ color: '#C9D6CC', textDecoration: 'none', fontSize: 14.5 }}>
                                Accompagnements
                            </a>
                            <a href="#praticien" style={{ color: '#C9D6CC', textDecoration: 'none', fontSize: 14.5 }}>
                                Le praticien
                            </a>
                            <a href="#faq" style={{ color: '#C9D6CC', textDecoration: 'none', fontSize: 14.5 }}>
                                Questions fréquentes
                            </a>
                        </div>
                    </div>
                    <div>
                        <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#7FA07E', margin: '0 0 14px' }}>
                            Contact
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14.5, color: '#C9D6CC' }}>
                            <span>Tunis &amp; Sousse — sur rendez-vous</span>
                            <a href="mailto:contact@fithealth.tn" style={{ color: '#C9D6CC', textDecoration: 'none' }}>
                                contact@fithealth.tn
                            </a>
                            <a href="tel:+21600000000" style={{ color: '#C9D6CC', textDecoration: 'none' }}>
                                +216 00 000 000
                            </a>
                        </div>
                    </div>
                    <div>
                        <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#7FA07E', margin: '0 0 14px' }}>
                            Légal
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <a href="#mentions-legales" style={{ color: '#C9D6CC', textDecoration: 'none', fontSize: 14.5 }}>
                                Mentions légales
                            </a>
                            <a href="#confidentialite" style={{ color: '#C9D6CC', textDecoration: 'none', fontSize: 14.5 }}>
                                Confidentialité
                            </a>
                        </div>
                    </div>
                </div>
                <p style={{ textAlign: 'center', fontSize: 13, color: '#7C8C81', margin: '22px 0 0' }}>
                    © 2026 FitHealth — Cabinet de naturopathie et coaching, Tunisie
                </p>
            </footer>

            <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
            <ParcoursModal open={parcoursOpen} onClose={() => setParcoursOpen(false)} />
        </div>
    );
}
