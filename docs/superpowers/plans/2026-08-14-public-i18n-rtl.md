# Site public — i18n/RTL + simplification du contenu — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre la page vitrine publique de FitHealth (`Public/Accueil.jsx` + `LoginModal`/`ParcoursModal`/`PlanInterestModal`) utilisable en français simplifié ou en derja tunisienne (arabe, RTL), avec deux passages de contenu simplifiés (section "Le praticien", cartes de formules) — en réutilisant intégralement l'infrastructure i18n/RTL posée aux sous-projets 1 et 2.

**Architecture:** Aucune nouvelle infrastructure. Contrairement aux sous-projets précédents (classes Tailwind), cette page utilise des styles inline (`style={{...}}`) : le RTL se fait donc via des propriétés CSS logiques (`insetInlineStart`/`insetInlineEnd`, `marginInlineStart`, `paddingInlineStart`, `textAlign: 'start'/'end'`) qui se résolvent automatiquement selon l'attribut `dir` du document, sans JS conditionnel. Les tableaux de données du composant (`NAV_LINKS`, `PROFILES`, etc.) deviennent des fonctions `xxx(t)`, même pattern que les sous-projets précédents. Aucun contrôleur ne change : toute la page est statique côté backend.

**Tech Stack:** Laravel 12 (PHP 8.2+), Inertia.js 3 + React 19 (JSX), PostgreSQL, PHPUnit. Pas de Tailwind sur ces fichiers (styles inline).

**Spec de référence :** `docs/superpowers/specs/2026-08-14-public-i18n-rtl-design.md`

## Global Constraints

- Aucune nouvelle dépendance npm/composer.
- Toute chaîne visible par l'utilisateur passe par `t()` — sauf le texte d'exemple du placeholder `"Retrouver de l'énergie…"` (déjà établi comme non traduit dans les sous-projets précédents) et l'URL technique `espace.fithealth.tn/tableau-de-bord` (littérale, pas un libellé).
- Convention de clé : la clé **est** la phrase française exacte, caractère pour caractère. **Contrairement aux sous-projets 1/2**, ce fichier source utilise l'apostrophe droite (`'`, U+0027) presque partout — vérifié ligne par ligne contre le code réel avant d'écrire ce plan. Une seule exception : `'Aujourd’hui'` dans `ParcoursModal.jsx` utilise l'apostrophe typographique (`'`, U+2019) — les deux clés `"Aujourd'hui"` (existante, sous-projet 1) et `"Aujourd’hui"` (nouvelle, Task 1) coexistent, ce n'est pas une erreur.
- RTL : propriétés CSS logiques dans les objets `style={{}}` — jamais de classe Tailwind (cette page n'en utilise pas), jamais de logique JS conditionnelle sur `locale.direction` pour du positionnement (le navigateur le fait déjà via `dir`).
- Les deux passages de contenu simplifié (praticien, cartes de formules) sont **la seule** réécriture de contenu de ce plan — tout le reste du texte est traduit tel quel, pas réécrit.
- Pas de suite de tests JS : vérification par `npm run build` (0 erreur) + vérification manuelle au navigateur (LTR et RTL).
- PostgreSQL doit tourner localement pour les tests (`"C:\laragon\bin\postgresql\postgresql\bin\pg_ctl.exe" -D "C:\laragon\data\postgresql" status` / `... start`).
- Traductions derja rédigées par un assistant IA non-locuteur natif — à faire relire avant usage réel (réserve d'autant plus importante ici : contenu public à fort trafic).

---

### Task 1: Dictionnaire — nouvelles entrées `lang/ar.json`

**Files:**
- Modify: `lang/ar.json`

**Interfaces:**
- Produces: toutes les clés consommées par les tâches 2 à 10.

- [ ] **Step 1: Ajouter les nouvelles entrées**

Dans `lang/ar.json`, ajouter (réutiliser sans les redéfinir les clés déjà existantes : `Fermer`, `Email`, `Mot de passe`, `Se connecter`, `Énergie`, `Sommeil`, `Digestion`, `Humeur`, `Mouvement`, `Objectif`) :

```json
{
    "Méthode": "الطريقة",
    "Accompagnements": "المرافقة",
    "Le praticien": "الطبيب",
    "Questions fréquentes": "الأسئلة اللي تتكرر",
    "Connexion": "الدخول",

    "Naturopathie & coaching": "طب طبيعي ومرافقة",
    "Retrouvez votre énergie, durablement": "رجّع طاقتك، وابقى فيها",
    "Un accompagnement personnalisé qui allie mouvement et vitalité, avec un suivi entre chaque consultation — pour des résultats qui s'installent dans la durée.": "مرافقة على قدك، تجمع بين الرياضة والحيوية، مع متابعة بين كل جلسة وأخرى — باش النتيجة تدوم.",
    "Réserver un premier échange": "احجز أول لقاء",
    "Découvrir la méthode →": "اكتشف الطريقة ←",
    "Votre suivi · semaine 6": "المتابعة متاعك · الجمعة 6",

    "Vous vous reconnaissez ?": "تحس بروحك فهاذوما؟",
    "Fatigue persistante": "تعب ما يهدأش",
    "Vous vous sentez fatigué·e sans cause identifiée, malgré un sommeil correct. Nous cherchons ensemble les déséquilibres discrets.": "تحس بالتعب بلا سبب واضح، حتى لو رقادك مليح. نلقاو مع بعضنا الخلل اللي ما يبانش.",
    "Troubles digestifs": "مشاكل في الهضم",
    "Ballonnements, inconfort, transit irrégulier : le terrain digestif est souvent la première étape d'un rééquilibrage durable.": "انتفاخ، ضيقة، هضم ما ينتظمش: الجهاز الهضمي غالبا أول خطوة باش نرجعو التوازن يدوم.",
    "Reprise d'activité": "الرجوع للرياضة",
    "Vous voulez reprendre une activité physique en confiance, sans risque de blessure ni de rechute.": "تحب ترجع تعمل رياضة بالثقة، بلا خطر إصابة ولا نكسة.",

    "Une méthode, deux piliers": "طريقة وحدة، ركيزتين",
    "Vitalité": "الحيوية",
    "Une activité physique adaptée à votre condition réelle, pas à un modèle générique.": "رياضة على قد حالتك الحقيقية، موش على موديل عام.",
    "Progression mesurée, sans surentraînement ni promesse de performance.": "تطور بشوية بشوية، بلا إفراط ولا وعود بنتائج خارقة.",
    "Des séances qui s'intègrent dans votre semaine, pas l'inverse.": "حصص تتلائم مع جمعتك، موش العكس.",
    "Une alimentation ajustée à votre métabolisme, sans régime restrictif.": "أكل يتلائم مع جسمك، بلا حمية قاسية.",
    "Sommeil, stress, hygiène de vie : les fondations souvent négligées.": "الرقاد، الضغط، نمط الحياة: الأساسيات اللي غالبا ننساوها.",
    "Des habitudes qui tiennent, construites une à une.": "عادات تدوم، نبنيوها وحدة وحدة.",

    "Comment se déroule l'accompagnement": "كيفاش تمشي المرافقة",
    "Bilan": "التشخيص",
    "Un entretien approfondi sur votre histoire, votre mode de vie et vos objectifs.": "حديث معمق على تاريخك، نمط حياتك، وأهدافك.",
    "Protocole personnalisé": "برنامج على قدك",
    "Un plan mouvement et vitalité conçu pour votre réalité, pas un programme standard.": "خطة رياضة وحيوية معمولة على حالتك، موش برنامج عادي.",
    "Suivi hebdomadaire": "متابعة أسبوعية",
    "Des points réguliers via votre espace en ligne, entre les consultations.": "نقاط منتظمة عبر الفضاء متاعك أونلاين، بين الجلسات.",
    "Ajustements": "التعديلات",
    "Le protocole évolue avec vous, selon vos progrès et vos retours.": "البرنامج يتطور معاك، على حسب تقدمك وردود فعلك.",

    "Médecin avant tout, coach ensuite": "طبيب قبل كل شيء، مدرب بعدها",
    "Je suis médecin, formé aussi à la naturopathie et au coaching sportif. Cette double casquette me permet de vous accompagner sérieusement, mais simplement — sans jargon, à votre rythme.": "أنا طبيب، تكوّنت زادة في الطب الطبيعي والتدريب الرياضي. هاذي الجمعة بين الاثنين تخليني نرافقك بجدية، ولكن ببساطة — بلا كلام صعيب، على قدك.",
    "Découvrir mon parcours →": "اكتشف مسيرتي ←",

    "Un suivi qui continue entre les consultations": "متابعة تكمل بين الجلسات",
    "Chaque patient dispose d'un espace personnel pour suivre son évolution, consigner ses ressentis et rester en lien avec son praticien entre deux rendez-vous.": "كل مريض عندو فضاء خاص بيه باش يتابع تطوره، يسجل حالتو، ويبقى مرتبط بطبيبو بين موعد وآخر.",
    "Suivi de vos indicateurs clés (énergie, sommeil, digestion, humeur)": "متابعة المؤشرات المهمة متاعك (الطاقة، الرقاد، الهضم، المزاج)",
    "Messagerie directe avec votre praticien": "رسائل مباشرة مع طبيبك",
    "Accès à votre protocole et à son historique": "وصول لبرنامجك وتاريخو",
    "Tableau de bord patient": "لوحة القيادة متاع المريض",

    "Trois formules, un même accompagnement": "ثلاث صيغ، مرافقة وحدة",
    "Tarifs communiqués lors du premier échange, selon votre situation.": "الأسعار نعطيوها في أول لقاء، على حسب حالتك.",
    "Recommandé": "منصوح بيه",
    "Consultation ponctuelle": "استشارة وحدة",
    "Une réponse claire à votre situation, en un seul échange.": "جواب واضح على حالتك، في لقاء وحيد.",
    "Bilan initial approfondi": "تشخيص أولي معمق",
    "Recommandations écrites": "نصائح مكتوبة",
    "Un point de suivi à 15 jours": "نقطة متابعة بعد 15 يوم",
    "Réserver mon bilan": "احجز التشخيص متاعي",
    "Suivi 1 mois": "متابعة شهر",
    "Le déclic pour changer, avec un vrai suivi derrière vous.": "الدفعة باش تبدل، مع متابعة حقيقية وراك.",
    "Bilan complet et protocole personnalisé": "تشخيص كامل وبرنامج على قدك",
    "Suivi hebdomadaire via l'espace en ligne": "متابعة أسبوعية عبر الفضاء أونلاين",
    "Ajustements réguliers": "تعديلات منتظمة",
    "Messagerie illimitée": "رسائل بلا حدود",
    "Commencer mon suivi": "ابدا المتابعة متاعي",
    "Suivi 3 mois": "متابعة 3 أشهر",
    "Le temps qu'il faut pour que ça tienne, vraiment.": "الوقت اللي يلزم باش النتيجة تدوم، بالفعل.",
    "Tout le suivi 1 mois": "كل حاجة متاع متابعة الشهر",
    "Bilans intermédiaires à 6 et 10 semaines": "تشخيصات وسطى في الجمعة 6 و10",
    "Priorité sur les créneaux de consultation": "أولوية في مواعيد الاستشارة",
    "Choisir cette formule": "اختار هاذي الصيغة",

    "Est-ce que cela remplace le suivi de mon médecin traitant ?": "واش هاذا يعوض متابعة طبيبي العادي؟",
    "Non. Mon accompagnement complète le suivi de votre médecin traitant, il ne s'y substitue pas. Toute pathologie diagnostiquée reste suivie par votre médecin habituel.": "لا. المرافقة متاعي تكمل متابعة طبيبك العادي، ما تعوضهاش. أي مرض تشخص يبقى تحت متابعة طبيبك المعتاد.",
    "Comment se déroule le suivi à distance ?": "كيفاش تمشي المتابعة عن بعد؟",
    "Entre les consultations, vous renseignez vos indicateurs et vos ressentis dans votre espace personnel. Je les consulte et ajuste votre protocole si nécessaire, avec des échanges par messagerie.": "بين الجلسات، تسجل المؤشرات وحالتك في الفضاء الخاص بيك. نتابعهم ونعدل برنامجك إذا لزم، مع رسائل بيناتنا.",
    "Combien de temps avant de ressentir des effets ?": "قداش من وقت باش نحس بالنتيجة؟",
    "Cela dépend de chaque personne et de son point de départ. Les premiers ajustements se ressentent souvent dès les premières semaines, mais un changement durable s'installe sur plusieurs mois.": "يتبدل من واحد لآخر وعلى حسب نقطة البداية. أول التعديلات تتحس غالبا من أول جمعات، ولكن التبديل اللي يدوم ياخذ شهور.",
    "Les consultations sont-elles remboursées ?": "واش الاستشارات ترجع فلوسها؟",
    "La naturopathie et le coaching ne sont pas remboursés par la sécurité sociale. Certaines mutuelles proposent une prise en charge partielle : renseignez-vous auprès de la vôtre.": "الطب الطبيعي والتدريب ما يرجعوش من الضمان الاجتماعي. بعض التأمينات تعوض جزء: اسأل التأمين متاعك.",

    "Prêt·e à faire le premier pas ?": "لباس تعمل الخطوة الأولى؟",
    "Un premier échange de 20 minutes, sans engagement, pour comprendre votre situation.": "لقاء أول مدتو 20 دقيقة، بلا التزام، باش نفهمو حالتك.",

    "Naturopathie et coaching en activité physique adaptée, à Tunis et à distance.": "طب طبيعي وتدريب رياضي على قدك، في تونس وعن بعد.",
    "Navigation": "التصفح",
    "Contact": "اتصل بينا",
    "Tunis & Sousse — sur rendez-vous": "تونس وسوسة — بموعد",
    "Légal": "القانوني",
    "Mentions légales": "المعلومات القانونية",
    "Confidentialité": "الخصوصية",
    "© 2026 FitHealth — Cabinet de naturopathie et coaching, Tunisie": "© 2026 FitHealth — عيادة طب طبيعي وتدريب، تونس",

    "Mon parcours": "مسيرتي",
    "Médecin avant tout, coach ensuite.": "طبيب قبل كل شيء، مدرب بعدها.",
    "Formation": "التكوين",
    "Médecine générale": "طب عام",
    "Diplôme de médecine, avec une pratique clinique qui m'a très vite confronté aux limites d'une approche purement symptomatique.": "دبلوم طب، مع ممارسة كلينيكية خلاتني نحس بسرعة بحدود نهج يعالج الأعراض برك.",
    "Spécialisation": "التخصص",
    "Naturopathie & coaching en activité physique adaptée": "طب طبيعي وتدريب رياضي على قدك",
    "Une double formation complémentaire pour agir sur le terrain — sommeil, alimentation, mouvement — plutôt que sur le seul symptôme.": "تكوين مزدوج مكمل باش نخدم على الأساس — الرقاد، الأكل، الرياضة — موش غير على العرض.",
    "Aujourd’hui": "اليوم",
    "Cabinet à Tunis, suivi à distance": "عيادة في تونس، متابعة عن بعد",
    "Un accompagnement qui combine rigueur médicale et suivi personnalisé, en cabinet comme à distance, sans jamais se substituer à votre médecin traitant.": "مرافقة تجمع بين الجدية الطبية والمتابعة الشخصية، في العيادة أو عن بعد، بلا ما تعوض طبيبك العادي أبدا.",

    "En savoir plus": "اعرف أكثر",
    "Demande envoyée": "الطلب تبعث",
    "Merci, votre demande pour « :plan » a bien été prise en compte. Vous serez recontacté·e rapidement.": "شكرا، طلبك متاع « :plan » وصل بالسلامة. باش نتصلو بيك قريب.",
    "Nom": "اللقب",
    "Prénom": "الاسم",
    "Numéro de téléphone": "رقم التليفون",
    "Adresse mail": "عنوان الإيميل",
    "Autre remarque ou question": "ملاحظة أو سؤال آخر",
    "Envoyer ma demande": "إبعث طلبي"
}
```

Note : `"Aujourd’hui"` (apostrophe typographique, utilisée dans `ParcoursModal.jsx`) est une clé **distincte** de `"Aujourd'hui"` (apostrophe droite, déjà dans le dictionnaire depuis le sous-projet 1, utilisée ailleurs) — les deux existent en parallèle, c'est intentionnel, pas un doublon à fusionner.

- [ ] **Step 2: Vérifier que le JSON est valide et sans clé dupliquée**

Run: `php -r '$d = json_decode(file_get_contents("lang/ar.json"), true); echo $d === null ? "INVALID\n" : "OK, " . count($d) . " keys\n";'`
Expected: `OK, <N> keys` (pas `INVALID`).

- [ ] **Step 3: Commit**

```bash
git add lang/ar.json
git commit -m "feat(i18n): add public-site translation keys to ar.json"
```

---

### Task 2: Navigation, sélecteur de langue, et section Hero

**Files:**
- Modify: `resources/js/Pages/Public/Accueil.jsx`

**Interfaces:**
- Consumes: `useTranslation()`, `<LanguageSwitcher>` (sous-projets 1/2), clés Task 1.
- Produces: `navLinks(t)` et `heroIndicators(t)`, fonctions locales au fichier — consommées par la nav (ce task) et par la section "Espace de suivi" (Task 5, qui réutilise les mêmes libellés `Énergie`/`Sommeil`/`Digestion`/`Humeur` déjà traduits).

- [ ] **Step 1: Ajouter les imports**

En haut de `resources/js/Pages/Public/Accueil.jsx`, ajouter :

```jsx
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import LanguageSwitcher from '../../Components/LanguageSwitcher';
import LoginModal from '../../Components/LoginModal';
import ParcoursModal from '../../Components/ParcoursModal';
import PlanInterestModal from '../../Components/PlanInterestModal';
import { useTranslation } from '../../i18n';
import logo from '../../../images/fithealth.png';
import heroPhoto from '../../../images/herosection1.png';
import praticienPhoto from '../../../images/zou.png';
```

- [ ] **Step 2: Convertir `NAV_LINKS` et `HERO_INDICATORS` en fonctions**

Remplacer :

```jsx
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
```

par :

```jsx
function navLinks(t) {
    return [
        { href: '#methode', label: t('Méthode') },
        { href: '#accompagnements', label: t('Accompagnements') },
        { href: '#praticien', label: t('Le praticien') },
        { href: '#faq', label: t('Questions fréquentes') },
    ];
}

function heroIndicators(t) {
    return [
        { label: t('Énergie'), pct: 72 },
        { label: t('Sommeil'), pct: 64 },
        { label: t('Digestion'), pct: 80 },
        { label: t('Humeur'), pct: 68 },
    ];
}
```

- [ ] **Step 3: Câbler `t`, `NAV_LINKS`, `HERO_INDICATORS` au début du composant**

Remplacer :

```jsx
export default function Accueil() {
    const [isNarrow, setIsNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < 900);
    const [navOpen, setNavOpen] = useState(false);
    const [faqOpen, setFaqOpen] = useState(0);
    const [loginOpen, setLoginOpen] = useState(false);
    const [parcoursOpen, setParcoursOpen] = useState(false);
    const [interestPlan, setInterestPlan] = useState(null);
```

par :

```jsx
export default function Accueil() {
    const { t } = useTranslation();
    const NAV_LINKS = navLinks(t);
    const HERO_INDICATORS = heroIndicators(t);
    const [isNarrow, setIsNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < 900);
    const [navOpen, setNavOpen] = useState(false);
    const [faqOpen, setFaqOpen] = useState(0);
    const [loginOpen, setLoginOpen] = useState(false);
    const [parcoursOpen, setParcoursOpen] = useState(false);
    const [interestPlan, setInterestPlan] = useState(null);
```

- [ ] **Step 4: Ajouter le sélecteur de langue dans la nav (desktop et mobile)**

Remplacer le bloc `{isWide && (...)}` de la nav :

```jsx
                    {isWide && (
                        <>
```

garder tel quel juste après, puis remplacer le bouton "Connexion" desktop :

```jsx
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
```

par :

```jsx
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <LanguageSwitcher tone="light" />
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
                                    {t('Connexion')}
                                </button>
                            </div>
                        </>
                    )}
```

Remplacer le bloc mobile (`{isNarrow && (...)}`) :

```jsx
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
```

par :

```jsx
                    {isNarrow && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <LanguageSwitcher tone="light" />
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
                                {t('Connexion')}
                            </button>
```

(Le reste du bloc mobile — bouton hamburger et son SVG — ne change pas.)

- [ ] **Step 5: Traduire le menu mobile déplié**

Remplacer :

```jsx
                {navOpen && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 18 }}>
                        {NAV_LINKS.map((nl) => (
```

Le reste de ce bloc ne change pas — `NAV_LINKS` est déjà résolu avec les libellés traduits depuis le Step 3, `{nl.label}` reste tel quel.

- [ ] **Step 6: Traduire le Hero**

Remplacer :

```jsx
                        Naturopathie &amp; coaching
```
par :
```jsx
                        {t('Naturopathie & coaching')}
```

Remplacer :
```jsx
                        Retrouvez votre énergie, durablement
```
par :
```jsx
                        {t('Retrouvez votre énergie, durablement')}
```

Remplacer :
```jsx
                        Un accompagnement personnalisé qui allie mouvement et vitalité, avec un suivi entre chaque
                        consultation — pour des résultats qui s'installent dans la durée.
```
par :
```jsx
                        {t('Un accompagnement personnalisé qui allie mouvement et vitalité, avec un suivi entre chaque consultation — pour des résultats qui s'installent dans la durée.')}
```

Remplacer :
```jsx
                            Réserver un premier échange
                        </a>
                        <a
                            href="#methode"
```
par :
```jsx
                            {t('Réserver un premier échange')}
                        </a>
                        <a
                            href="#methode"
```

Remplacer :
```jsx
                            Découvrir la méthode →
```
par :
```jsx
                            {t('Découvrir la méthode →')}
```

Remplacer :
```jsx
                        <div
                            style={{
                                position: 'absolute',
                                left: 'clamp(-16px,-3vw,10px)',
                                bottom: 'clamp(16px,4vw,40px)',
```
par :
```jsx
                        <div
                            style={{
                                position: 'absolute',
                                insetInlineStart: 'clamp(-16px,-3vw,10px)',
                                bottom: 'clamp(16px,4vw,40px)',
```

Remplacer :
```jsx
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
```
par :
```jsx
                            {t('Votre suivi · semaine 6')}
                        </p>
                        {HERO_INDICATORS.map((ind) => (
                            <div key={ind.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                <span style={{ fontSize: 13, width: 62, flexShrink: 0, color: '#1B3A2F' }}>{ind.label}</span>
                                <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#EDE6D6', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', borderRadius: 999, background: '#7FA07E', width: `${ind.pct}%` }} />
                                </div>
                                <span style={{ fontSize: 12, color: '#7A8F81', width: 30, textAlign: 'end' }}>{ind.pct}%</span>
                            </div>
                        ))}
```

- [ ] **Step 7: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 8: Vérification manuelle**

`http://127.0.0.1:8000/`, cliquer le sélecteur FR/عربي dans la nav :
- Nav, hero, badge "suivi" en arabe, page RTL.
- La carte flottante (indicateurs) reste bien positionnée à l'opposé (elle était en bas-gauche en LTR ; en RTL elle doit apparaître en bas-droite).

- [ ] **Step 9: Commit**

```bash
git add resources/js/Pages/Public/Accueil.jsx
git commit -m "feat(i18n): translate and mirror the public nav and hero section"
```

---

### Task 3: Section "Vous vous reconnaissez ?" (profils) et "Une méthode, deux piliers"

**Files:**
- Modify: `resources/js/Pages/Public/Accueil.jsx`

**Interfaces:**
- Consumes: `useTranslation()` (déjà câblé Task 2), clés Task 1.
- Produces: `profiles(t)`, `pillars(t)`.

- [ ] **Step 1: Convertir `PROFILES` en fonction**

Remplacer :

```jsx
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
```

par :

```jsx
function profiles(t) {
    return [
        {
            title: t('Fatigue persistante'),
            text: t('Vous vous sentez fatigué·e sans cause identifiée, malgré un sommeil correct. Nous cherchons ensemble les déséquilibres discrets.'),
            icon: <IconFatigue />,
        },
        {
            title: t('Troubles digestifs'),
            text: t('Ballonnements, inconfort, transit irrégulier : le terrain digestif est souvent la première étape d'un rééquilibrage durable.'),
            icon: <IconDigestif />,
        },
        {
            title: t('Reprise d'activité'),
            text: t('Vous voulez reprendre une activité physique en confiance, sans risque de blessure ni de rechute.'),
            icon: <IconActivite />,
        },
    ];
}
```

- [ ] **Step 2: Convertir `PILLARS` en fonction**

Remplacer :

```jsx
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
```

par :

```jsx
function pillars(t) {
    return [
        {
            title: t('Mouvement'),
            icon: <IconMouvement />,
            lines: [
                t('Une activité physique adaptée à votre condition réelle, pas à un modèle générique.'),
                t('Progression mesurée, sans surentraînement ni promesse de performance.'),
                t('Des séances qui s'intègrent dans votre semaine, pas l'inverse.'),
            ],
        },
        {
            title: t('Vitalité'),
            icon: <IconVitalite />,
            lines: [
                t('Une alimentation ajustée à votre métabolisme, sans régime restrictif.'),
                t('Sommeil, stress, hygiène de vie : les fondations souvent négligées.'),
                t('Des habitudes qui tiennent, construites une à une.'),
            ],
        },
    ];
}
```

- [ ] **Step 3: Câbler `PROFILES`/`PILLARS` et traduire les titres de section**

Dans le composant `Accueil`, ajouter après la ligne `const HERO_INDICATORS = heroIndicators(t);` (Task 2, Step 3) :

```jsx
    const PROFILES = profiles(t);
    const PILLARS = pillars(t);
```

Remplacer :
```jsx
                    Vous vous reconnaissez ?
```
par :
```jsx
                    {t('Vous vous reconnaissez ?')}
```

Remplacer :
```jsx
                    Une méthode, deux piliers
```
par :
```jsx
                    {t('Une méthode, deux piliers')}
```

- [ ] **Step 4: Corriger le RTL de la puce de liste des piliers**

Remplacer :

```jsx
                            {pl.lines.map((line) => (
                                <p key={line} style={{ fontSize: 15.5, lineHeight: 1.7, color: '#3E5449', margin: '0 0 10px', paddingLeft: 18, position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 0, top: 9, width: 6, height: 6, borderRadius: '50%', background: '#7FA07E' }} />
                                    {line}
                                </p>
                            ))}
```

par :

```jsx
                            {pl.lines.map((line) => (
                                <p key={line} style={{ fontSize: 15.5, lineHeight: 1.7, color: '#3E5449', margin: '0 0 10px', paddingInlineStart: 18, position: 'relative' }}>
                                    <span style={{ position: 'absolute', insetInlineStart: 0, top: 9, width: 6, height: 6, borderRadius: '50%', background: '#7FA07E' }} />
                                    {line}
                                </p>
                            ))}
```

- [ ] **Step 5: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 6: Vérification manuelle**

En arabe (RTL) : les 3 cartes de profil et les 2 cartes de piliers sont traduites ; la puce devant chaque ligne de pilier est bien du côté droit du texte (départ de ligne en RTL), pas figée à gauche.

- [ ] **Step 7: Commit**

```bash
git add resources/js/Pages/Public/Accueil.jsx
git commit -m "feat(i18n): translate and mirror the profiles and pillars sections"
```

---

### Task 4: Section "Comment se déroule l'accompagnement" (étapes) et "Le praticien"

**Files:**
- Modify: `resources/js/Pages/Public/Accueil.jsx`

**Interfaces:**
- Consumes: `useTranslation()` (déjà câblé), clés Task 1.
- Produces: `stepsRaw(t)`.

- [ ] **Step 1: Convertir `STEPS_RAW` en fonction**

Remplacer :

```jsx
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
```

par :

```jsx
function stepsRaw(t) {
    return [
        { num: '01', title: t('Bilan'), text: t('Un entretien approfondi sur votre histoire, votre mode de vie et vos objectifs.') },
        {
            num: '02',
            title: t('Protocole personnalisé'),
            text: t('Un plan mouvement et vitalité conçu pour votre réalité, pas un programme standard.'),
        },
        {
            num: '03',
            title: t('Suivi hebdomadaire'),
            text: t('Des points réguliers via votre espace en ligne, entre les consultations.'),
        },
        { num: '04', title: t('Ajustements'), text: t('Le protocole évolue avec vous, selon vos progrès et vos retours.') },
    ];
}
```

(`STEPS` — dérivé avec `connectorColor` — reste calculé dans le composant, voir Step 2 : il ne peut plus être une constante de module puisqu'il dépend maintenant de `t`.)

- [ ] **Step 2: Câbler `STEPS` et traduire le titre de section**

Ajouter, à la suite des lignes du Task 3 Step 3 :

```jsx
    const STEPS_RAW_ITEMS = stepsRaw(t);
    const STEPS = STEPS_RAW_ITEMS.map((s, i) => ({
        ...s,
        connectorColor: i < STEPS_RAW_ITEMS.length - 1 ? '#7FA07E' : 'transparent',
    }));
```

Remplacer :
```jsx
                    Comment se déroule l'accompagnement
```
par :
```jsx
                    {t('Comment se déroule l'accompagnement')}
```

- [ ] **Step 3: Traduire la section "Le praticien" (contenu simplifié)**

Remplacer :
```jsx
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
```
par :
```jsx
                        {t('Le praticien')}
                    </span>
                    <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 20px' }}>
                        {t('Médecin avant tout, coach ensuite')}
                    </h2>
                    <p style={{ fontSize: 16.5, lineHeight: 1.75, color: '#3E5449', margin: '0 0 24px', maxWidth: '56ch' }}>
                        {t('Je suis médecin, formé aussi à la naturopathie et au coaching sportif. Cette double casquette me permet de vous accompagner sérieusement, mais simplement — sans jargon, à votre rythme.')}
                    </p>
```

(Ceci est le texte **déjà simplifié** — voir spec, section "Simplification du contenu / 1" — la clé de traduction est directement la version simplifiée, il n'y a qu'une seule réécriture à faire ici, pas une traduction de l'ancien texte.)

Remplacer :
```jsx
                        Découvrir mon parcours →
```
par :
```jsx
                        {t('Découvrir mon parcours →')}
```

- [ ] **Step 4: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 5: Vérification manuelle**

En français : le paragraphe "Le praticien" affiche bien la version simplifiée ("sans jargon, à votre rythme"), plus la version clinique précédente. En arabe : les 4 étapes et la section praticien sont traduites.

- [ ] **Step 6: Commit**

```bash
git add resources/js/Pages/Public/Accueil.jsx
git commit -m "feat(i18n): translate the steps section and simplify+translate the praticien copy"
```

---

### Task 5: Section "Espace de suivi"

**Files:**
- Modify: `resources/js/Pages/Public/Accueil.jsx`

**Interfaces:**
- Consumes: `useTranslation()` (déjà câblé), clés Task 1, `Énergie`/`Sommeil`/`Digestion`/`Humeur` (déjà traduites Task 2 via `HERO_INDICATORS`, réutilisées ici pour le mockup de tableau de bord).

- [ ] **Step 1: Convertir `SPACE_BENEFITS` en fonction**

Remplacer :

```jsx
const SPACE_BENEFITS = [
    'Suivi de vos indicateurs clés (énergie, sommeil, digestion, humeur)',
    'Messagerie directe avec votre praticien',
    'Accès à votre protocole et à son historique',
];
```

par :

```jsx
function spaceBenefits(t) {
    return [
        t('Suivi de vos indicateurs clés (énergie, sommeil, digestion, humeur)'),
        t('Messagerie directe avec votre praticien'),
        t('Accès à votre protocole et à son historique'),
    ];
}
```

- [ ] **Step 2: Câbler `SPACE_BENEFITS` et traduire le texte de section**

Ajouter à la suite des lignes précédentes :

```jsx
    const SPACE_BENEFITS = spaceBenefits(t);
```

Remplacer :
```jsx
                            Un suivi qui continue entre les consultations
                        </h2>
                        <p style={{ fontSize: 16, lineHeight: 1.7, color: '#C9D6CC', margin: '0 0 26px', maxWidth: '48ch' }}>
                            Chaque patient dispose d'un espace personnel pour suivre son évolution, consigner ses ressentis
                            et rester en lien avec son praticien entre deux rendez-vous.
                        </p>
```
par :
```jsx
                            {t('Un suivi qui continue entre les consultations')}
                        </h2>
                        <p style={{ fontSize: 16, lineHeight: 1.7, color: '#C9D6CC', margin: '0 0 26px', maxWidth: '48ch' }}>
                            {t('Chaque patient dispose d'un espace personnel pour suivre son évolution, consigner ses ressentis et rester en lien avec son praticien entre deux rendez-vous.')}
                        </p>
```

- [ ] **Step 3: Corriger le RTL et traduire le mockup de tableau de bord**

Remplacer :
```jsx
                            <span style={{ marginLeft: 10, fontSize: 12, color: '#6B7568', fontFamily: 'monospace' }}>
                                espace.fithealth.tn/tableau-de-bord
                            </span>
```
par :
```jsx
                            <span style={{ marginInlineStart: 10, fontSize: 12, color: '#6B7568', fontFamily: 'monospace' }}>
                                espace.fithealth.tn/tableau-de-bord
                            </span>
```

(L'URL reste littérale — c'est une adresse technique, pas un libellé.)

Remplacer :
```jsx
                                Tableau de bord patient
```
par :
```jsx
                                {t('Tableau de bord patient')}
```

Le `{HERO_INDICATORS.map(...)}` de cette section (mockup du tableau de bord, plus bas) réutilise déjà la variable `HERO_INDICATORS` câblée au Task 2 — aucun changement supplémentaire nécessaire, les libellés `Énergie`/`Sommeil`/`Digestion`/`Humeur` sont déjà traduits.

- [ ] **Step 4: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 5: Vérification manuelle**

En arabe : section "Espace de suivi" traduite (titre, paragraphe, 3 bénéfices, mockup "لوحة القيادة متاع المريض"), le préfixe `marginInlineStart` avant l'URL bascule bien de côté en RTL.

- [ ] **Step 6: Commit**

```bash
git add resources/js/Pages/Public/Accueil.jsx
git commit -m "feat(i18n): translate and mirror the online-space section"
```

---

### Task 6: Section "Accompagnements" (cartes de formules, contenu simplifié)

**Files:**
- Modify: `resources/js/Pages/Public/Accueil.jsx`

**Interfaces:**
- Consumes: `useTranslation()` (déjà câblé), clés Task 1.
- Produces: `planDefs(t)`.

- [ ] **Step 1: Convertir `PLAN_DEFS` en fonction, avec les nouvelles accroches et libellés de bouton**

Remplacer :

```jsx
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
```

par :

```jsx
function planDefs(t) {
    return [
        {
            key: 'ponctuelle',
            title: t('Consultation ponctuelle'),
            tagline: t('Une réponse claire à votre situation, en un seul échange.'),
            features: [t('Bilan initial approfondi'), t('Recommandations écrites'), t('Un point de suivi à 15 jours')],
            ctaLabel: t('Réserver mon bilan'),
        },
        {
            key: 'suivi1mois',
            title: t('Suivi 1 mois'),
            tagline: t('Le déclic pour changer, avec un vrai suivi derrière vous.'),
            features: [
                t('Bilan complet et protocole personnalisé'),
                t('Suivi hebdomadaire via l'espace en ligne'),
                t('Ajustements réguliers'),
                t('Messagerie illimitée'),
            ],
            ctaLabel: t('Commencer mon suivi'),
        },
        {
            key: 'suivi3mois',
            title: t('Suivi 3 mois'),
            tagline: t('Le temps qu'il faut pour que ça tienne, vraiment.'),
            features: [
                t('Tout le suivi 1 mois'),
                t('Bilans intermédiaires à 6 et 10 semaines'),
                t('Priorité sur les créneaux de consultation'),
            ],
            ctaLabel: t('Choisir cette formule'),
        },
    ];
}
```

Note : accroches et libellés de bouton sont **le contenu déjà réécrit** (voir spec, section "Simplification du contenu / 2") — la clé de traduction est directement la nouvelle version, pas l'ancienne ("Pour un bilan ciblé…" n'apparaît plus nulle part dans le code).

- [ ] **Step 2: Câbler `PLANS` (dérivé de `PLAN_DEFS`) et traduire le titre/sous-titre de section**

Remplacer :

```jsx
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
```

par :

```jsx
const HIGHLIGHTED_PLAN = 'suivi1mois';

function plans(t) {
    return planDefs(t).map((p) => {
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
}
```

Ajouter, à la suite des câblages précédents dans le composant `Accueil` :

```jsx
    const PLANS = plans(t);
```

Remplacer :
```jsx
                    Trois formules, un même accompagnement
                </h2>
                <p style={{ textAlign: 'center', color: '#6B7568', fontSize: 15.5, maxWidth: '52ch', margin: '0 auto 48px' }}>
                    Tarifs communiqués lors du premier échange, selon votre situation.
                </p>
```
par :
```jsx
                    {t('Trois formules, un même accompagnement')}
                </h2>
                <p style={{ textAlign: 'center', color: '#6B7568', fontSize: 15.5, maxWidth: '52ch', margin: '0 auto 48px' }}>
                    {t('Tarifs communiqués lors du premier échange, selon votre situation.')}
                </p>
```

- [ ] **Step 3: Traduire le badge "Recommandé" et corriger le RTL de son positionnement**

Remplacer :
```jsx
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
```
par :
```jsx
                            {plan.featured && (
                                <span
                                    style={{
                                        position: 'absolute',
                                        top: -14,
                                        insetInlineStart: 30,
                                        background: '#D9C9A8',
                                        color: '#1B3A2F',
                                        fontSize: 12,
                                        fontWeight: 700,
                                        letterSpacing: '0.03em',
                                        padding: '6px 14px',
                                        borderRadius: 999,
                                    }}
                                >
                                    {t('Recommandé')}
                                </span>
                            )}
```

- [ ] **Step 4: Corriger le RTL de la puce de fonctionnalité et remplacer le bouton**

Remplacer :
```jsx
                            <div style={{ flex: 1 }}>
                                {plan.features.map((f) => (
                                    <p key={f} style={{ fontSize: 14.5, lineHeight: 1.6, margin: '0 0 10px', paddingLeft: 18, position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: 0, top: 8, width: 6, height: 6, borderRadius: '50%', background: plan.dot }} />
                                        {f}
                                    </p>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => setInterestPlan(plan.title)}
                                style={{
                                    marginTop: 22,
                                    textAlign: 'center',
                                    textDecoration: 'none',
                                    padding: 13,
                                    borderRadius: 12,
                                    fontWeight: 600,
                                    fontSize: 15,
                                    fontFamily: 'inherit',
                                    cursor: 'pointer',
                                    background: plan.btnBg,
                                    color: plan.btnColor,
                                    border: plan.btnBorder,
                                }}
                            >
                                En savoir plus
                            </button>
```
par :
```jsx
                            <div style={{ flex: 1 }}>
                                {plan.features.map((f) => (
                                    <p key={f} style={{ fontSize: 14.5, lineHeight: 1.6, margin: '0 0 10px', paddingInlineStart: 18, position: 'relative' }}>
                                        <span style={{ position: 'absolute', insetInlineStart: 0, top: 8, width: 6, height: 6, borderRadius: '50%', background: plan.dot }} />
                                        {f}
                                    </p>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => setInterestPlan(plan.title)}
                                style={{
                                    marginTop: 22,
                                    textAlign: 'center',
                                    textDecoration: 'none',
                                    padding: 13,
                                    borderRadius: 12,
                                    fontWeight: 600,
                                    fontSize: 15,
                                    fontFamily: 'inherit',
                                    cursor: 'pointer',
                                    background: plan.btnBg,
                                    color: plan.btnColor,
                                    border: plan.btnBorder,
                                }}
                            >
                                {plan.ctaLabel}
                            </button>
```

(Le bouton utilise maintenant `plan.ctaLabel` — déjà résolu et traduit dans `planDefs(t)` — au lieu du texte fixe "En savoir plus".)

- [ ] **Step 5: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 6: Vérification manuelle**

En français : les 3 cartes affichent les nouvelles accroches et les 3 boutons différenciés ("Réserver mon bilan" / "Commencer mon suivi" / "Choisir cette formule"), plus "En savoir plus" partout. En arabe : cartes traduites, badge "Recommandé"/"منصوح بيه" et puces de fonctionnalité du bon côté (RTL).

- [ ] **Step 7: Commit**

```bash
git add resources/js/Pages/Public/Accueil.jsx
git commit -m "feat(i18n): translate the plans section and sharpen plan taglines/CTAs"
```

---

### Task 7: FAQ, CTA final, et pied de page

**Files:**
- Modify: `resources/js/Pages/Public/Accueil.jsx`

**Interfaces:**
- Consumes: `useTranslation()` (déjà câblé), clés Task 1, `Réserver un premier échange`/`Questions fréquentes`/`Le praticien`/`Méthode`/`Accompagnements` (déjà traduites, réutilisées).

- [ ] **Step 1: Convertir `FAQ_RAW` en fonction**

Remplacer :

```jsx
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
```

par :

```jsx
function faqRaw(t) {
    return [
        {
            q: t('Est-ce que cela remplace le suivi de mon médecin traitant ?'),
            a: t('Non. Mon accompagnement complète le suivi de votre médecin traitant, il ne s'y substitue pas. Toute pathologie diagnostiquée reste suivie par votre médecin habituel.'),
        },
        {
            q: t('Comment se déroule le suivi à distance ?'),
            a: t('Entre les consultations, vous renseignez vos indicateurs et vos ressentis dans votre espace personnel. Je les consulte et ajuste votre protocole si nécessaire, avec des échanges par messagerie.'),
        },
        {
            q: t('Combien de temps avant de ressentir des effets ?'),
            a: t('Cela dépend de chaque personne et de son point de départ. Les premiers ajustements se ressentent souvent dès les premières semaines, mais un changement durable s'installe sur plusieurs mois.'),
        },
        {
            q: t('Les consultations sont-elles remboursées ?'),
            a: t('La naturopathie et le coaching ne sont pas remboursés par la sécurité sociale. Certaines mutuelles proposent une prise en charge partielle : renseignez-vous auprès de la vôtre.'),
        },
    ];
}
```

- [ ] **Step 2: Câbler `FAQ_RAW` et traduire le titre de section**

Ajouter à la suite des câblages précédents :

```jsx
    const FAQ_RAW = faqRaw(t);
```

Remplacer :
```jsx
                    Questions fréquentes
                </h2>
                {FAQ_RAW.map((item, i) => {
```
par :
```jsx
                    {t('Questions fréquentes')}
                </h2>
                {FAQ_RAW.map((item, i) => {
```

- [ ] **Step 3: Traduire le CTA final**

Remplacer :
```jsx
                    Prêt·e à faire le premier pas ?
                </h2>
                <p style={{ fontSize: 16, color: '#3E5449', maxWidth: '46ch', margin: '0 auto 30px' }}>
                    Un premier échange de 20 minutes, sans engagement, pour comprendre votre situation.
                </p>
                <a
                    href="#"
```
par :
```jsx
                    {t('Prêt·e à faire le premier pas ?')}
                </h2>
                <p style={{ fontSize: 16, color: '#3E5449', maxWidth: '46ch', margin: '0 auto 30px' }}>
                    {t('Un premier échange de 20 minutes, sans engagement, pour comprendre votre situation.')}
                </p>
                <a
                    href="#"
```

Remplacer (2e occurrence de ce bouton dans le fichier, celle du CTA final) :
```jsx
                    Réserver un premier échange
                </a>
            </section>

            {/* FOOTER */}
```
par :
```jsx
                    {t('Réserver un premier échange')}
                </a>
            </section>

            {/* FOOTER */}
```

- [ ] **Step 4: Traduire le pied de page**

Remplacer :
```jsx
                        <p style={{ fontSize: 14, lineHeight: 1.6, color: '#9FB0A4', margin: 0, maxWidth: '26ch' }}>
                            Naturopathie et coaching en activité physique adaptée, à Tunis et à distance.
                        </p>
```
par :
```jsx
                        <p style={{ fontSize: 14, lineHeight: 1.6, color: '#9FB0A4', margin: 0, maxWidth: '26ch' }}>
                            {t('Naturopathie et coaching en activité physique adaptée, à Tunis et à distance.')}
                        </p>
```

Remplacer :
```jsx
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
```
par :
```jsx
                            {t('Navigation')}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <a href="#methode" style={{ color: '#C9D6CC', textDecoration: 'none', fontSize: 14.5 }}>
                                {t('Méthode')}
                            </a>
                            <a href="#accompagnements" style={{ color: '#C9D6CC', textDecoration: 'none', fontSize: 14.5 }}>
                                {t('Accompagnements')}
                            </a>
                            <a href="#praticien" style={{ color: '#C9D6CC', textDecoration: 'none', fontSize: 14.5 }}>
                                {t('Le praticien')}
                            </a>
                            <a href="#faq" style={{ color: '#C9D6CC', textDecoration: 'none', fontSize: 14.5 }}>
                                {t('Questions fréquentes')}
                            </a>
                        </div>
```

Remplacer :
```jsx
                            Contact
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14.5, color: '#C9D6CC' }}>
                            <span>Tunis &amp; Sousse — sur rendez-vous</span>
```
par :
```jsx
                            {t('Contact')}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14.5, color: '#C9D6CC' }}>
                            <span>{t('Tunis & Sousse — sur rendez-vous')}</span>
```

Remplacer :
```jsx
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
```
par :
```jsx
                            {t('Légal')}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <a href="#mentions-legales" style={{ color: '#C9D6CC', textDecoration: 'none', fontSize: 14.5 }}>
                                {t('Mentions légales')}
                            </a>
                            <a href="#confidentialite" style={{ color: '#C9D6CC', textDecoration: 'none', fontSize: 14.5 }}>
                                {t('Confidentialité')}
                            </a>
                        </div>
                    </div>
                </div>
                <p style={{ textAlign: 'center', fontSize: 13, color: '#7C8C81', margin: '22px 0 0' }}>
                    {t('© 2026 FitHealth — Cabinet de naturopathie et coaching, Tunisie')}
                </p>
```

- [ ] **Step 5: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 6: Vérification manuelle**

En arabe : FAQ (questions + réponses dépliables), CTA final, et les 4 blocs du pied de page sont traduits.

- [ ] **Step 7: Commit**

```bash
git add resources/js/Pages/Public/Accueil.jsx
git commit -m "feat(i18n): translate the FAQ, final CTA, and footer sections"
```

---

### Task 8: `LoginModal.jsx`

**Files:**
- Modify: `resources/js/Components/LoginModal.jsx`

**Interfaces:**
- Consumes: `useTranslation()`, clés `Fermer`/`Email`/`Mot de passe`/`Se connecter` (déjà existantes, réutilisées), `Connexion` (Task 1).

- [ ] **Step 1: Traduire et corriger le RTL de `LoginModal`**

Remplacer `resources/js/Components/LoginModal.jsx` :

```jsx
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { useTranslation } from '../i18n';

export default function LoginModal({ open, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
    });
    const { t } = useTranslation();

    useEffect(() => {
        if (!open) return;

        function onKeyDown(e) {
            if (e.key === 'Escape') onClose();
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    function submit(e) {
        e.preventDefault();
        post('/login', {
            onSuccess: () => reset('password'),
        });
    }

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(27,58,47,0.55)',
                backdropFilter: 'blur(2px)',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#F7F4ED',
                    borderRadius: 20,
                    padding: '40px 36px',
                    width: '100%',
                    maxWidth: 380,
                    position: 'relative',
                    boxShadow: '0 40px 80px -20px rgba(0,0,0,0.4)',
                }}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={t('Fermer')}
                    style={{
                        position: 'absolute',
                        top: 16,
                        insetInlineEnd: 16,
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M1 1L15 15M15 1L1 15" stroke="#1B3A2F" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                </button>

                <h2
                    style={{
                        fontFamily: "'Fraunces', serif",
                        fontWeight: 600,
                        fontSize: 24,
                        color: '#1B3A2F',
                        textAlign: 'center',
                        margin: '0 0 28px',
                    }}
                >
                    {t('Connexion')}
                </h2>

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label htmlFor="modal-email" style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#1B3A2F' }}>
                            {t('Email')}
                        </label>
                        <input
                            id="modal-email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: 10,
                                border: '1px solid #D9C9A8',
                                background: '#FFFFFF',
                                color: '#1B3A2F',
                                fontSize: 15,
                                boxSizing: 'border-box',
                            }}
                        />
                        {errors.email && <p style={{ color: '#C4643F', fontSize: 13, margin: '6px 0 0' }}>{errors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="modal-password" style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#1B3A2F' }}>
                            {t('Mot de passe')}
                        </label>
                        <input
                            id="modal-password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: 10,
                                border: '1px solid #D9C9A8',
                                background: '#FFFFFF',
                                color: '#1B3A2F',
                                fontSize: 15,
                                boxSizing: 'border-box',
                            }}
                        />
                        {errors.password && <p style={{ color: '#C4643F', fontSize: 13, margin: '6px 0 0' }}>{errors.password}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        style={{
                            marginTop: 8,
                            padding: 12,
                            borderRadius: 12,
                            border: 'none',
                            background: '#1B3A2F',
                            color: '#F7F4ED',
                            fontWeight: 600,
                            fontSize: 15,
                            cursor: processing ? 'default' : 'pointer',
                            opacity: processing ? 0.6 : 1,
                        }}
                    >
                        {t('Se connecter')}
                    </button>
                </form>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 3: Vérification manuelle**

Ouvrir la modal de connexion depuis la page publique en arabe : titre, libellés, bouton traduits ; bouton de fermeture bien positionné en haut-gauche (au lieu de haut-droite en LTR).

- [ ] **Step 4: Commit**

```bash
git add resources/js/Components/LoginModal.jsx
git commit -m "feat(i18n): translate and mirror the login modal"
```

---

### Task 9: `ParcoursModal.jsx`

**Files:**
- Modify: `resources/js/Components/ParcoursModal.jsx`

**Interfaces:**
- Consumes: `useTranslation()`, clé `Fermer` (réutilisée), clés Task 1 (`Mon parcours`, `Médecin avant tout, coach ensuite.`, `Formation`, `Médecine générale`, `Spécialisation`, `Naturopathie & coaching en activité physique adaptée`, `Aujourd'hui`, `Cabinet à Tunis, suivi à distance`, et les 3 textes longs correspondants).

- [ ] **Step 1: Convertir `TIMELINE` en fonction, traduire, corriger le RTL**

Remplacer `resources/js/Components/ParcoursModal.jsx` :

```jsx
import { useEffect } from 'react';
import { useTranslation } from '../i18n';

function timeline(t) {
    return [
        {
            year: t('Formation'),
            title: t('Médecine générale'),
            text: t('Diplôme de médecine, avec une pratique clinique qui m'a très vite confronté aux limites d'une approche purement symptomatique.'),
        },
        {
            year: t('Spécialisation'),
            title: t('Naturopathie & coaching en activité physique adaptée'),
            text: t('Une double formation complémentaire pour agir sur le terrain — sommeil, alimentation, mouvement — plutôt que sur le seul symptôme.'),
        },
        {
            year: t('Aujourd’hui'),
            title: t('Cabinet à Tunis, suivi à distance'),
            text: t('Un accompagnement qui combine rigueur médicale et suivi personnalisé, en cabinet comme à distance, sans jamais se substituer à votre médecin traitant.'),
        },
    ];
}

export default function ParcoursModal({ open, onClose }) {
    const { t } = useTranslation();
    const TIMELINE = timeline(t);

    useEffect(() => {
        if (!open) return;

        function onKeyDown(e) {
            if (e.key === 'Escape') onClose();
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(27,58,47,0.55)',
                backdropFilter: 'blur(2px)',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
                overflowY: 'auto',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#F7F4ED',
                    borderRadius: 20,
                    padding: '40px 36px',
                    width: '100%',
                    maxWidth: 520,
                    position: 'relative',
                    boxShadow: '0 40px 80px -20px rgba(0,0,0,0.4)',
                    maxHeight: '85vh',
                    overflowY: 'auto',
                }}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={t('Fermer')}
                    style={{
                        position: 'absolute',
                        top: 16,
                        insetInlineEnd: 16,
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M1 1L15 15M15 1L1 15" stroke="#1B3A2F" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                </button>

                <h2
                    style={{
                        fontFamily: "'Fraunces', serif",
                        fontWeight: 600,
                        fontSize: 24,
                        color: '#1B3A2F',
                        margin: '0 0 8px',
                    }}
                >
                    {t('Mon parcours')}
                </h2>
                <p style={{ fontSize: 15, color: '#6B7568', margin: '0 0 28px' }}>
                    {t('Médecin avant tout, coach ensuite.')}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                    {TIMELINE.map((step, i) => (
                        <div key={step.title} style={{ display: 'flex', gap: 16 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                <div
                                    style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        background: '#7FA07E',
                                        marginTop: 5,
                                        flexShrink: 0,
                                    }}
                                />
                                {i < TIMELINE.length - 1 && <div style={{ width: 1.5, flex: 1, background: '#D9C9A8', marginTop: 4 }} />}
                            </div>
                            <div style={{ paddingBottom: 4 }}>
                                <span
                                    style={{
                                        display: 'block',
                                        fontSize: 12.5,
                                        fontWeight: 600,
                                        letterSpacing: '0.04em',
                                        textTransform: 'uppercase',
                                        color: '#7FA07E',
                                        marginBottom: 4,
                                    }}
                                >
                                    {step.year}
                                </span>
                                <h3 style={{ fontSize: 16.5, fontWeight: 600, color: '#1B3A2F', margin: '0 0 6px' }}>{step.title}</h3>
                                <p style={{ fontSize: 14.5, lineHeight: 1.65, color: '#3E5449', margin: 0 }}>{step.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 3: Vérification manuelle**

Ouvrir "Découvrir mon parcours" depuis la section praticien en arabe : titre, sous-titre, 3 étapes de la timeline traduites ; bouton de fermeture en haut-gauche.

- [ ] **Step 4: Commit**

```bash
git add resources/js/Components/ParcoursModal.jsx
git commit -m "feat(i18n): translate and mirror the parcours modal"
```

---

### Task 10: `PlanInterestModal.jsx`

**Files:**
- Modify: `resources/js/Components/PlanInterestModal.jsx`

**Interfaces:**
- Consumes: `useTranslation()`, clés `Fermer`/`Objectif` (réutilisées), clés Task 1 (`En savoir plus`, `Demande envoyée`, message interpolé `:plan`, `Nom`, `Prénom`, `Numéro de téléphone`, `Adresse mail`, `Autre remarque ou question`, `Envoyer ma demande`).

- [ ] **Step 1: Traduire et corriger le RTL de `PlanInterestModal`**

Ajouter l'import en haut du fichier :

```jsx
import { useEffect, useState } from 'react';
import { useTranslation } from '../i18n';
```

Ajouter l'appel au hook au début du composant :

```jsx
export default function PlanInterestModal({ open, planTitle, onClose }) {
    const { t } = useTranslation();
    const [data, setData] = useState(EMPTY_FORM);
    const [submitted, setSubmitted] = useState(false);
```

Remplacer :

```jsx
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Fermer"
                    style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
```

par :

```jsx
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={t('Fermer')}
                    style={{
                        position: 'absolute',
                        top: 16,
                        insetInlineEnd: 16,
```

Remplacer le bloc "demande envoyée" :

```jsx
                {submitted ? (
                    <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
                        <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22, color: '#1B3A2F', margin: '0 0 12px' }}>
                            Demande envoyée
                        </h2>
                        <p style={{ fontSize: 15, color: '#3E5449', lineHeight: 1.6, margin: 0 }}>
                            Merci, votre demande pour « {planTitle} » a bien été prise en compte. Vous serez recontacté·e rapidement.
                        </p>
                    </div>
                ) : (
```

par :

```jsx
                {submitted ? (
                    <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
                        <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22, color: '#1B3A2F', margin: '0 0 12px' }}>
                            {t('Demande envoyée')}
                        </h2>
                        <p style={{ fontSize: 15, color: '#3E5449', lineHeight: 1.6, margin: 0 }}>
                            {t('Merci, votre demande pour « :plan » a bien été prise en compte. Vous serez recontacté·e rapidement.', { plan: planTitle })}
                        </p>
                    </div>
                ) : (
```

Remplacer le titre du formulaire :

```jsx
                        <h2
                            style={{
                                fontFamily: "'Fraunces', serif",
                                fontWeight: 600,
                                fontSize: 24,
                                color: '#1B3A2F',
                                textAlign: 'center',
                                margin: '0 0 4px',
                            }}
                        >
                            En savoir plus
                        </h2>
```

par :

```jsx
                        <h2
                            style={{
                                fontFamily: "'Fraunces', serif",
                                fontWeight: 600,
                                fontSize: 24,
                                color: '#1B3A2F',
                                textAlign: 'center',
                                margin: '0 0 4px',
                            }}
                        >
                            {t('En savoir plus')}
                        </h2>
```

Remplacer les 6 champs du formulaire (labels) :

```jsx
                                <Field label="Nom" htmlFor="interest-lastname">
```
par
```jsx
                                <Field label={t('Nom')} htmlFor="interest-lastname">
```

```jsx
                                <Field label="Prénom" htmlFor="interest-firstname">
```
par
```jsx
                                <Field label={t('Prénom')} htmlFor="interest-firstname">
```

```jsx
                            <Field label="Numéro de téléphone" htmlFor="interest-phone">
```
par
```jsx
                            <Field label={t('Numéro de téléphone')} htmlFor="interest-phone">
```

```jsx
                            <Field label="Adresse mail" htmlFor="interest-email">
```
par
```jsx
                            <Field label={t('Adresse mail')} htmlFor="interest-email">
```

```jsx
                            <Field label="Objectif" htmlFor="interest-goal">
```
par
```jsx
                            <Field label={t('Objectif')} htmlFor="interest-goal">
```

```jsx
                            <Field label="Autre remarque ou question" htmlFor="interest-message">
```
par
```jsx
                            <Field label={t('Autre remarque ou question')} htmlFor="interest-message">
```

(Le `placeholder="Retrouver de l'énergie…"` du champ Objectif reste littéral, texte d'exemple — même traitement que partout ailleurs dans le projet.)

Remplacer le bouton d'envoi :

```jsx
                            <button
                                type="submit"
                                style={{
                                    marginTop: 8,
                                    padding: 12,
                                    borderRadius: 12,
                                    border: 'none',
                                    background: '#1B3A2F',
                                    color: '#F7F4ED',
                                    fontWeight: 600,
                                    fontSize: 15,
                                    cursor: 'pointer',
                                }}
                            >
                                Envoyer ma demande
                            </button>
```

par :

```jsx
                            <button
                                type="submit"
                                style={{
                                    marginTop: 8,
                                    padding: 12,
                                    borderRadius: 12,
                                    border: 'none',
                                    background: '#1B3A2F',
                                    color: '#F7F4ED',
                                    fontWeight: 600,
                                    fontSize: 15,
                                    cursor: 'pointer',
                                }}
                            >
                                {t('Envoyer ma demande')}
                            </button>
```

- [ ] **Step 2: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 3: Vérification manuelle**

Cliquer un bouton de formule en arabe : formulaire traduit, bouton de fermeture en haut-gauche. Soumettre : message de confirmation traduit avec le nom de la formule interpolé correctement en arabe.

- [ ] **Step 4: Commit**

```bash
git add resources/js/Components/PlanInterestModal.jsx
git commit -m "feat(i18n): translate and mirror the plan interest modal"
```

---

### Task 11: Vérification finale bilingue + régression patient/praticien

**Files:** aucun (tâche de vérification et de clôture).

- [ ] **Step 1: Lancer toute la suite de tests backend**

Run: `php artisan test`
Expected: PASS, tous les tests — y compris `test_le_document_html_est_en_rtl_en_derja`/`test_le_document_html_est_en_ltr_en_francais` (`LocaleTest`, déjà existants depuis le sous-projet 1, portant sur `GET /`, la route de ce sous-projet) et `PraticienLocaleTest`. Aucun nouveau test backend n'a été ajouté par ce plan (voir spec, section "Tests" — aucun contrôleur ne change).

- [ ] **Step 2: Build de production frontend**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 3: Parcours complet de la page publique en derja**

Démarrer `php artisan serve`, ouvrir `http://127.0.0.1:8000/` déconnecté, basculer en arabe via le sélecteur de la nav :
- [ ] Nav, hero, sections "Vous vous reconnaissez ?", "Une méthode, deux piliers", étapes, praticien, espace de suivi, formules, FAQ, CTA final, pied de page : toutes traduites, page en RTL.
- [ ] Les éléments à positionnement absolu (carte flottante du hero, badge "Recommandé", puces de liste) sont bien du bon côté en RTL (testé par les vérifications manuelles de chaque tâche, revérifié ici globalement).
- [ ] Ouvrir "Connexion", "Découvrir mon parcours", et un bouton de formule : les 3 modals sont traduites et RTL-safe.
- [ ] Soumettre le formulaire "Connexion" avec un mauvais mot de passe : le message d'erreur (`Email ou mot de passe incorrect.`, déjà traduit depuis le sous-projet 1) s'affiche en arabe.
- [ ] Basculer en FR : tout repasse en français, LTR, sans recharger la page (bascule côté session, comme les sous-projets précédents).

- [ ] **Step 4: Vérifier le contenu simplifié en français**

Repasser en français, relire :
- [ ] Section "Le praticien" : nouveau paragraphe ("sans jargon, à votre rythme"), pas l'ancien texte clinique.
- [ ] Section "Accompagnements" : les 3 nouvelles accroches et les 3 boutons différenciés ("Réserver mon bilan" / "Commencer mon suivi" / "Choisir cette formule").

- [ ] **Step 5: Non-régression espace patient et praticien**

Se connecter en tant que `amina.trabelsi@example.com` / `password` (patiente) puis `praticien@fithealth.tn` / `password` (praticien) :
- [ ] Les deux espaces restent identiques à leur état laissé par les sous-projets 1 et 2 — aucun fichier `Patient/*`/`Praticien/*` n'a été modifié par ce plan.

- [ ] **Step 6: Commit final (si des ajustements ont été faits pendant la vérification)**

```bash
git add -A
git commit -m "chore(i18n): final QA pass for public site i18n/RTL sub-project"
```

(Si aucun ajustement n'a été nécessaire, ce commit est à sauter.)

- [ ] **Step 7: Marquer le sous-projet — et le programme des 3 sous-projets — comme terminé**

Ce sous-projet clôt le périmètre défini au sous-projet 1 (spec `2026-08-12-patient-i18n-rtl-redesign-design.md`, section "Décomposition en sous-projets") : espace patient, espace praticien, et site public sont désormais tous bilingues français/derja et RTL-safe, sur la même infrastructure partagée (`Locale`, `SetLocale`, `POST /langue`, `useTranslation()`, `LanguageSwitcher`).
