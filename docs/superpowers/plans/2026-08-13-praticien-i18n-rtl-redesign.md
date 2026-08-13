# Espace praticien — i18n/RTL + refonte visuelle — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre l'espace praticien de FitHealth (dashboard, liste patients, fiche patient, protocoles/templates, messagerie, réglages) utilisable en français simplifié ou en derja tunisienne (arabe, RTL), avec un habillage visuel Style A adapté à chaque type d'écran — en réutilisant intégralement l'infrastructure i18n/RTL posée au sous-projet 1.

**Architecture:** Aucune nouvelle infrastructure : `App\Enums\Locale`, le middleware `SetLocale`, la route `POST /langue`, `HandleInertiaRequests::share()`, le hook `useTranslation()` et `<LanguageSwitcher>` sont consommés tels quels. Le travail est un passage de traduction (`__()` côté backend, `t()` côté frontend) écran par écran, plus des corrections RTL ciblées (classes Tailwind logiques, un bug de miroir de menu mobile déjà connu) et un habillage visuel Style A qui ne change pas la structure des écrans déjà organisés en cartes.

**Tech Stack:** Laravel 12 (PHP 8.2+), Inertia.js 3 + React 19 (JSX), Tailwind CSS 4, Chart.js 4 + react-chartjs-2, PostgreSQL, PHPUnit, lucide-react.

**Spec de référence :** `docs/superpowers/specs/2026-08-13-praticien-i18n-rtl-redesign-design.md`

## Global Constraints

- Aucune nouvelle dépendance npm/composer.
- Toute chaîne visible par l'utilisateur dans le périmètre de ce plan passe par `__()` côté backend ou `t()` côté frontend — jamais de texte en dur (hors nom de marque "FitHealth", laissé littéral comme dans l'espace patient).
- Convention de clé de traduction : la clé **est** la phrase française simplifiée exacte. Réutiliser une clé existante de `lang/ar.json` (sous-projet 1) chaque fois que la phrase est identique mot pour mot — voir Task 1 pour la liste exacte des clés réutilisées vs. nouvelles.
- Classes Tailwind physiques (`pl-`, `pr-`, `ml-`, `mr-`, `left-`, `right-`, `text-left`, `text-right`) → équivalents logiques (`ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`, `text-start`, `text-end`) dans tous les fichiers touchés par ce plan.
- Graphiques Chart.js (`GrowthChart`, `ObservanceChart`, `TierBreakdownChart`) : le tracé (axes, direction temporelle) reste toujours LTR, quelle que soit la locale — seuls les libellés/légendes/tooltips sont traduits. Ne pas ajouter d'option `rtl`/`reverse` aux graphiques.
- `LocaleController` n'est **pas modifié** dans ce plan — aucun garde-fou de rôle à ajouter (voir spec, section "Architecture / 1").
- Pas de suite de tests JS : les tâches frontend se vérifient par `npm run build` (0 erreur) + vérification manuelle au navigateur. Les tâches backend suivent TDD avec PHPUnit.
- PostgreSQL doit tourner localement (`"C:\laragon\bin\postgresql\postgresql\bin\pg_ctl.exe" -D "C:\laragon\data\postgresql" status` / `... start`).
- Traductions derja rédigées par un assistant IA non-locuteur natif — même réserve que le sous-projet 1, à faire relire avant usage réel.

---

### Task 1: Dictionnaire — nouvelles entrées `lang/ar.json`

**Files:**
- Modify: `lang/ar.json`

**Interfaces:**
- Produces: toutes les clés de traduction consommées par les tâches 2 à 13 (liste exacte ci-dessous). `lang/fr.json` reste `{}` (aucun changement).

- [ ] **Step 1: Ajouter les nouvelles entrées**

Dans `lang/ar.json`, ajouter les entrées suivantes (garder les entrées existantes du sous-projet 1 inchangées ; ce sous-projet réutilise telles quelles `Messages`, `Se déconnecter`, `Ouvrir le menu`, `Fermer le menu`, `Email`, `Mot de passe`, `Bonjour, :name`, `Sport`, `Énergie`, `Sommeil`, `Digestion`, `Humeur`, `Écrire un message…`, et les 14 clés de jours `Lun`…`Dimanche`) :

```json
{
    "Fermer": "سكّر",
    "Tableau de bord": "لوحة القيادة",
    "Patients": "المرضى",
    "Protocoles": "البرامج",
    "Réglages": "الإعدادات",

    "Patients actifs": "المرضى الناشطين",
    "Nouveaux ce mois-ci": "جداد هاذ الشهر",
    "Check-ins cette semaine": "الشيك-إن هاذ الجمعة",
    "Messages non lus": "رسائل ما تقراتش",
    "Croissance du cabinet": "نمو العيادة",
    "Total de patients suivis et nouveaux patients, 12 derniers mois": "مجموع المرضى المتابعين والجداد، آخر 12 شهر",
    "Observance moyenne du cabinet": "معدل الالتزام متاع العيادة",
    "Moyenne des patients actifs, 12 dernières semaines": "معدل المرضى الناشطين، آخر 12 جمعة",
    "Répartition de l’observance": "توزيع الالتزام",
    "Cliquez sur une tranche pour voir les patients concernés": "اكبس على قطعة باش تشوف المرضى",
    "À traiter cette semaine": "لازم تتعالج هاذ الجمعة",
    "Rien à signaler — tous vos patients sont à jour.": "ما فما حتى حاجة — كل مرضاك محدثين.",
    "Check-in en retard": "الشيك-إن متأخر",
    "Observance faible (:n%)": "الالتزام ضعيف (:n%)",

    "Total patients suivis": "مجموع المرضى المتابعين",
    "Nouveaux patients": "مرضى جداد",
    "Zone de référence": "المنطقة المرجعية",
    "Objectif 70%": "الهدف 70%",
    "Observance moyenne": "معدل الالتزام",
    "Aucun patient actif": "ما فما حتى مريض ناشط",
    ":n% d’observance": "التزام :n%",
    "Moins de 25%": "أقل من 25%",
    "25 – 50%": "25 – 50%",
    "50 – 75%": "50 – 75%",
    "Plus de 75%": "أكثر من 75%",
    ":n patient": "مريض :n",
    ":n patients": ":n مرضى",

    "Tous": "الكل",
    "En retard": "متأخرين",
    "Nouveaux": "جداد",
    "Observance : moins de 25%": "الالتزام: أقل من 25%",
    "Observance : 25 – 50%": "الالتزام: 25 – 50%",
    "Observance : 50 – 75%": "الالتزام: 50 – 75%",
    "Observance : plus de 75%": "الالتزام: أكثر من 75%",
    "Filtré": "مفلتر",
    "Nouveau patient": "مريض جديد",
    "Aucun patient pour l’instant": "ما عندكش مرضى توا",
    "Créez votre premier patient avec le bouton ci-dessus.": "زيد أول مريض بالزر فوق.",
    "Aucun patient dans ce filtre": "ما فما حتى مريض في هاذ الفلتر",
    "Essayez un autre filtre, ou revenez à « Tous ».": "جرب فلتر آخر، ولا رجع لـ« الكل ».",
    "À jour": "محدث",
    "Aucun check-in": "ما فما حتى شيك-إن",

    "Protocole": "البرنامج",
    "Suivi": "المتابعة",
    "Check-ins": "الشيك-إن",
    "Bientôt disponible": "قريب باش يوصل",
    "Répondre": "جاوب",
    "Message": "رسالة",
    "Assigner un protocole": "خصص برنامج",
    "Nutrition": "الأكل",
    "Mouvement": "الرياضة",
    "Ajouter un élément nutrition": "زيد حاجة أكل",
    "Ajouter un exercice": "زيد تمرين",
    "Exercice": "تمرين",
    "Séries": "مجموعات",
    "Volume": "الكمية",
    "Jours": "الأيام",
    "Vitalité": "الحيوية",
    "Aucune consigne pour l’instant.": "ما فما حتى نصيحة توا.",
    "Ajouter une consigne": "زيد نصيحة",
    "Semaine en cours": "الجمعة الحالية",
    "Historique des check-ins": "تاريخ الشيك-إن",
    "Aucun check-in pour l’instant.": "ما فما حتى شيك-إن توا.",
    "Aucun protocole actif": "ما فما حتى برنامج ناشط",
    "Ce patient n’a pas encore de protocole assigné.": "هاذ المريض ما عندوش برنامج توا.",
    "Aucun check-in reçu": "ما وصل حتى شيك-إن",
    "Ce patient n’a pas encore complété de check-in.": "هاذ المريض ما عملش شيك-إن توا.",

    "Un protocole actif existe déjà (« :title »). Confirmer ci-dessous archivera automatiquement ce protocole.": "كاين برنامج ناشط توا (« :title »). إذا تأكدت، هاذ البرنامج باش يترشف أوتوماتيكيا.",
    "Point de départ": "نقطة البداية",
    "Protocole vierge": "برنامج فارغ",
    "Partir de zéro, ajouter les items ensuite": "ابدا من الصفر، زيد الحاجات بعدين",
    "Titre du protocole": "عنوان البرنامج",
    "Archiver et assigner": "رشف وخصص",
    "Assigner le protocole": "خصص البرنامج",

    "Repas ou consigne": "ماكلة ولا نصيحة",
    "Tous les jours": "كل الأيام",
    "Ajouter": "زيد",
    "Consigne": "نصيحة",

    "Nom complet": "الاسم الكامل",
    "Téléphone": "التليفون",
    "Date de naissance": "تاريخ الميلاد",
    "Sexe": "الجنس",
    "Femme": "مرا",
    "Homme": "راجل",
    "Objectif": "الهدف",
    "Taille (cm)": "الطول (سم)",
    "Poids initial (kg)": "الوزن الأول (كغ)",
    "Antécédents médicaux": "التاريخ الطبي",
    "Traitements en cours": "العلاجات الحالية",
    "Créer le patient": "أعمل المريض",

    "Annuler": "إلغاء",
    "Confirmer": "أكد",
    "Supprimer ce modèle ?": "تحب تمسح هاذ الموديل؟",
    "« :title » sera définitivement supprimé. Cette action est irréversible.": "« :title » باش يتمسح نهائيا. ما ينمحاش.",
    "Supprimer": "امسح",
    "Modèles réutilisables, applicables en un clic depuis la fiche d’un patient.": "موديلات تنجم تعاود تستعملها، تطبقها بكبسة وحدة من ملف المريض.",
    "Nouveau modèle": "موديل جديد",
    "Aucun modèle pour l’instant": "ما فما حتى موديل توا",
    "Créez votre premier modèle avec le bouton ci-dessus.": "زيد أول موديل بالزر فوق.",
    "mouvement": "رياضة",
    "nutrition": "أكل",
    "Modifier le modèle": "بدل الموديل",
    "Supprimer le modèle": "امسح الموديل",
    "Titre du modèle": "عنوان الموديل",
    "Description": "الوصف",
    "Items": "الحاجات",
    "Titre": "العنوان",
    "Ajouter un item": "زيد حاجة",
    "Merci de vérifier les items du modèle.": "تأكد من حاجات الموديل.",
    "Enregistrer": "سجل",

    "Envoyer": "إبعث",
    "Sélectionnez un patient pour voir la conversation.": "اختار مريض باش تشوف الحديث.",
    "Aucun message pour l’instant, commencez la conversation.": "ما فما حتى رسالة توا، ابدا الحديث.",
    "Aucun message": "ما فما رسائل",
    "Aucun patient pour l’instant.": "ما عندكش مرضى توا.",

    "Cette page arrive bientôt.": "هاذ الصفحة جاية قريب."
}
```

Note : les apostrophes typographiques (`’`) sont utilisées dans les clés pour matcher exactement le texte source JSX/PHP existant (`l’instant`, `l’observance`) — vérifier au moment de câbler chaque `t()`/`__()` dans les tâches suivantes que la clé utilisée correspond caractère pour caractère à cette apostrophe, pas à l'apostrophe droite `'`.

- [ ] **Step 2: Vérifier que le JSON est valide**

Run: `php -r "json_decode(file_get_contents('lang/ar.json'), true) === null ? exit(1) : exit(0);"`
Expected: exit code `0` (pas d'erreur de syntaxe JSON).

- [ ] **Step 3: Commit**

```bash
git add lang/ar.json
git commit -m "feat(i18n): add praticien-space translation keys to ar.json"
```

---

### Task 2: Composant partagé `Modal.jsx`

**Files:**
- Modify: `resources/js/Components/Modal.jsx`

**Interfaces:**
- Consumes: `useTranslation()` (sous-projet 1), clé `Fermer` (Task 1).
- Produces: `<Modal>` RTL-safe et traduit — consommé par toutes les tâches suivantes qui affichent une modal praticien (7 à 11).

- [ ] **Step 1: Traduire et corriger le positionnement RTL du bouton de fermeture**

Dans `resources/js/Components/Modal.jsx`, ajouter l'import en haut du fichier :

```jsx
import { useEffect } from 'react';
import { useTranslation } from '../i18n';
```

Ajouter l'appel au hook au début du composant :

```jsx
export default function Modal({ open, onClose, title, children, maxWidth = 440 }) {
    const { t } = useTranslation();

    useEffect(() => {
```

Remplacer :

```jsx
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Fermer"
                    className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full text-forest hover:bg-forest/10"
                >
```

par :

```jsx
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={t('Fermer')}
                    className="absolute top-4 end-4 flex size-8 items-center justify-center rounded-full text-forest hover:bg-forest/10"
                >
```

- [ ] **Step 2: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 3: Commit**

```bash
git add resources/js/Components/Modal.jsx
git commit -m "feat(i18n): translate and mirror the shared Modal close button"
```

---

### Task 3: Sidebar et layout praticien

**Files:**
- Modify: `resources/js/Components/Praticien/Sidebar.jsx`
- Modify: `app/Http/Controllers/Praticien/PlaceholderController.php`

**Interfaces:**
- Consumes: `useTranslation()`, `<LanguageSwitcher>` (sous-projet 1), clés `Tableau de bord`, `Patients`, `Protocoles`, `Réglages`, `Messages`, `Se déconnecter`, `Ouvrir le menu`, `Fermer le menu` (Task 1, certaines réutilisées du sous-projet 1).
- Produces: sidebar praticien traduite et RTL-safe, consommée visuellement par toutes les pages `Praticien/*`.

- [ ] **Step 1: Traduire le titre de la page Réglages côté backend**

Dans `app/Http/Controllers/Praticien/PlaceholderController.php`, remplacer :

```php
    public function reglages(): Response
    {
        return Inertia::render('Praticien/Placeholder', ['title' => 'Réglages']);
    }
```

par :

```php
    public function reglages(): Response
    {
        return Inertia::render('Praticien/Placeholder', ['title' => __('Réglages')]);
    }
```

- [ ] **Step 2: Réécrire la sidebar praticien**

Remplacer `resources/js/Components/Praticien/Sidebar.jsx` :

```jsx
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
```

Note : titre de marque harmonisé sur "FitHealth" (au lieu de "Doctor Panel"), cohérent avec la sidebar patient et la page de connexion — texte littéral, pas de clé de traduction (même choix que le sous-projet 1). Correction RTL identique à celle appliquée à la sidebar patient lors de la fusion avec `origin/master` : `left-0`/`-translate-x-full` → `start-0`/`-translate-x-full rtl:translate-x-full`, `ml-2` → `ms-2`.

- [ ] **Step 3: Lancer la suite backend, vérifier qu'elle passe toujours**

Run: `php artisan test`
Expected: PASS (aucune régression).

- [ ] **Step 4: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 5: Vérification manuelle**

`http://127.0.0.1:8000/praticien/dashboard` connecté en tant que `praticien@fithealth.tn` :
- La sidebar reste en français par défaut (compte praticien seedé en `locale=fr`).
- Le sélecteur FR/عربي est visible sous le logo.
- Cliquer "عربي" : sidebar en arabe, alignée à droite, icônes à droite du texte.
- Réduire la fenêtre sous `lg` : le menu mobile (hamburger) s'ouvre depuis la droite en arabe, depuis la gauche en français.
- Cliquer "Réglages" : titre de page "الإعدادات" en arabe.

- [ ] **Step 6: Commit**

```bash
git add resources/js/Components/Praticien/Sidebar.jsx app/Http/Controllers/Praticien/PlaceholderController.php
git commit -m "feat(i18n): translate and mirror the praticien sidebar"
```

---

### Task 4: Libellés de jour/pilier partagés (`PatientsController`, dates)

**Files:**
- Modify: `app/Http/Controllers/Praticien/PatientsController.php`
- Test: `tests/Feature/PraticienLocaleTest.php` (nouveau fichier)

**Interfaces:**
- Consumes: `App\Enums\Locale`, `App\Enums\Pillar` (existants), clés `Mouvement`, `Nutrition`, `Jours` implicitement via `Lun`…`Dim` (sous-projet 1, réutilisées).
- Produces: `pillarsLabel()`/`daysLabel()` traduits — résout le scénario relevé par la revue de code sur le sous-projet 1 (page praticien à moitié traduite si `locale=ar` sur un compte praticien).

- [ ] **Step 1: Écrire le test (échoue, rien n'est encore traduit)**

Créer `tests/Feature/PraticienLocaleTest.php` :

```php
<?php

namespace Tests\Feature;

use App\Enums\Locale;
use App\Enums\Pillar;
use App\Models\Protocol;
use App\Models\ProtocolItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PraticienLocaleTest extends TestCase
{
    use RefreshDatabase;

    private function createProtocolWithMouvementItem(User $patient): Protocol
    {
        $protocol = Protocol::factory()->forPatient($patient)->create();

        ProtocolItem::create([
            'protocol_id' => $protocol->id,
            'pillar' => Pillar::Mouvement,
            'day_of_week' => null,
            'title' => 'Marche',
            'position' => 1,
        ]);

        return $protocol;
    }

    public function test_la_fiche_patient_affiche_les_libelles_de_jour_en_derja_si_le_praticien_est_en_arabe(): void
    {
        $practitioner = User::factory()->praticien()->create(['locale' => Locale::Ar]);
        $patient = User::factory()->patient($practitioner)->create();
        $this->createProtocolWithMouvementItem($patient);

        $response = $this->actingAs($practitioner)->get("/praticien/patients/{$patient->id}");

        $response->assertInertia(fn (Assert $page) => $page
            ->where('patient.pillars', 'الرياضة')
        );
    }

    public function test_la_fiche_patient_affiche_toujours_les_libelles_en_francais_par_defaut(): void
    {
        $practitioner = User::factory()->praticien()->create();
        $patient = User::factory()->patient($practitioner)->create();
        $this->createProtocolWithMouvementItem($patient);

        $response = $this->actingAs($practitioner)->get("/praticien/patients/{$patient->id}");

        $response->assertInertia(fn (Assert $page) => $page
            ->where('patient.pillars', 'Mouvement')
        );
    }
}
```

Vérifié contre le code existant : `Protocol::factory()` a un état `forPatient(User $patient)` (pas un `for()` générique) — même convention que `tests/Feature/PatientIsolationTest.php`. `ProtocolItem` n'a pas de factory dédiée ; `protocol_items.position` est une colonne `NOT NULL` sans défaut (voir migration `create_protocol_items_table`), d'où la création directe via `ProtocolItem::create([...])` avec `position` fourni explicitement.

- [ ] **Step 2: Lancer le test, vérifier qu'il échoue**

Run: `php artisan test --filter=PraticienLocaleTest`
Expected: FAIL sur `test_la_fiche_patient_affiche_les_libelles_de_jour_en_derja...` (`pillars` reste `'Mouvement'` même en `locale=ar`).

- [ ] **Step 3: Traduire `pillarsLabel()`, `daysLabel()`, `DAY_LABELS`**

Dans `app/Http/Controllers/Praticien/PatientsController.php`, remplacer :

```php
    private const DAY_LABELS = [1 => 'Lun', 2 => 'Mar', 3 => 'Mer', 4 => 'Jeu', 5 => 'Ven', 6 => 'Sam', 7 => 'Dim'];
```

par :

```php
    private function dayLabels(): array
    {
        return [
            1 => __('Lun'), 2 => __('Mar'), 3 => __('Mer'), 4 => __('Jeu'),
            5 => __('Ven'), 6 => __('Sam'), 7 => __('Dim'),
        ];
    }
```

(Constante devenue méthode, car `__()` dépend de la locale résolue à la requête — une `const` figerait la traduction au chargement de la classe.)

Remplacer :

```php
        $labels = array_filter([
            $pillars->contains(Pillar::Mouvement) ? 'Mouvement' : null,
            $pillars->contains(Pillar::Nutrition) ? 'Nutrition' : null,
        ]);
```

par :

```php
        $labels = array_filter([
            $pillars->contains(Pillar::Mouvement) ? __('Mouvement') : null,
            $pillars->contains(Pillar::Nutrition) ? __('Nutrition') : null,
        ]);
```

Remplacer :

```php
    private function daysLabel(Collection $items): string
    {
        if ($items->contains(fn (ProtocolItem $item) => $item->day_of_week === null)) {
            return 'Tous les jours';
        }

        return $items->pluck('day_of_week')->unique()->sort()
            ->map(fn (int $day) => self::DAY_LABELS[$day])
            ->implode(', ');
    }
```

par :

```php
    private function daysLabel(Collection $items): string
    {
        if ($items->contains(fn (ProtocolItem $item) => $item->day_of_week === null)) {
            return __('Tous les jours');
        }

        $labels = $this->dayLabels();

        return $items->pluck('day_of_week')->unique()->sort()
            ->map(fn (int $day) => $labels[$day])
            ->implode(', ');
    }
```

- [ ] **Step 4: Rendre les dates de la fiche patient et de la liste sensibles à la locale**

Dans la méthode `index()`, remplacer :

```php
                'lastCheckIn' => $patient->latestCheckIn?->submitted_at->translatedFormat('d M Y'),
```

par :

```php
                'lastCheckIn' => $patient->latestCheckIn?->submitted_at->locale(app()->getLocale())->translatedFormat('d M Y'),
```

Dans la méthode `show()`, remplacer :

```php
            'checkins' => $patient->checkIns()->orderByDesc('submitted_at')->get()->map(fn ($checkIn) => [
                'date' => $checkIn->submitted_at->translatedFormat('d M Y'),
```

par :

```php
            'checkins' => $patient->checkIns()->orderByDesc('submitted_at')->get()->map(fn ($checkIn) => [
                'date' => $checkIn->submitted_at->locale(app()->getLocale())->translatedFormat('d M Y'),
```

(Ces deux appels utilisaient `translatedFormat()` sans `->locale()` explicite — contrairement au reste du projet depuis le sous-projet 1, ils suivaient la locale par défaut de Carbon, indépendante de `App::getLocale()`, jamais l'arabe même si le praticien l'avait choisi. Corrigé au passage.)

- [ ] **Step 5: Lancer le test, vérifier qu'il passe**

Run: `php artisan test --filter=PraticienLocaleTest`
Expected: PASS (2 tests).

- [ ] **Step 6: Lancer la suite complète, vérifier qu'elle passe toujours**

Run: `php artisan test`
Expected: PASS (aucune régression, notamment `PatientIsolationTest` et `LocaleTest`).

- [ ] **Step 7: Commit**

```bash
git add app/Http/Controllers/Praticien/PatientsController.php tests/Feature/PraticienLocaleTest.php
git commit -m "feat(i18n): translate day/pillar labels and locale-aware dates on patients controller"
```

---

### Task 5: Dashboard praticien

**Files:**
- Modify: `app/Http/Controllers/Praticien/DashboardController.php`
- Modify: `resources/js/Pages/Praticien/Dashboard.jsx`
- Modify: `resources/js/Components/Praticien/Charts/GrowthChart.jsx`
- Modify: `resources/js/Components/Praticien/Charts/ObservanceChart.jsx`
- Modify: `resources/js/Components/Praticien/Charts/TierBreakdownChart.jsx`

**Interfaces:**
- Consumes: `useTranslation()`, clés Task 1 (`Tableau de bord`, `Patients actifs`, …).
- Produces: aucune interface consommée par d'autres tâches (écran terminal).

- [ ] **Step 1: Traduire les libellés calculés côté backend**

Dans `app/Http/Controllers/Praticien/DashboardController.php`, remplacer :

```php
            'todayLabel' => ucfirst(Carbon::now()->locale('fr')->translatedFormat('l j F Y')),
```

par :

```php
            'todayLabel' => ucfirst(Carbon::now()->locale(app()->getLocale())->translatedFormat('l j F Y')),
```

Remplacer :

```php
            $trend[] = [
                'label' => ucfirst($month->locale('fr')->translatedFormat('M Y')),
```

par :

```php
            $trend[] = [
                'label' => ucfirst($month->locale(app()->getLocale())->translatedFormat('M Y')),
```

Remplacer :

```php
            ->map(fn (User $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'initials' => $p->initials,
                'reason' => $p->isCheckInLate
                    ? 'Check-in en retard'
                    : 'Observance faible ('.($observanceByPatient[$p->id] ?? 0).'%)',
            ])
```

par :

```php
            ->map(fn (User $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'initials' => $p->initials,
                'reason' => $p->isCheckInLate
                    ? __('Check-in en retard')
                    : __('Observance faible (:n%)', ['n' => $observanceByPatient[$p->id] ?? 0]),
            ])
```

- [ ] **Step 2: Traduire la page Dashboard**

Dans `resources/js/Pages/Praticien/Dashboard.jsx`, ajouter l'import :

```jsx
import { Link, usePage } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import GrowthChart from '../../Components/Praticien/Charts/GrowthChart';
import ObservanceChart from '../../Components/Praticien/Charts/ObservanceChart';
import TierBreakdownChart from '../../Components/Praticien/Charts/TierBreakdownChart';
import PraticienLayout from '../../Layouts/PraticienLayout';
import { useTranslation } from '../../i18n';
```

Remplacer le composant `Watchlist` :

```jsx
function Watchlist({ patients, t }) {
    return (
        <div className="rounded bg-white px-6 py-5.5 shadow-lg shadow-forest/25">
            <div className="mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-terracotta" />
                <h2 className="font-display text-base font-semibold text-forest">{t('À traiter cette semaine')}</h2>
            </div>

            {patients.length === 0 ? (
                <p className="text-sm text-forest/60">{t('Rien à signaler — tous vos patients sont à jour.')}</p>
            ) : (
                <div className="flex flex-col gap-2.5">
                    {patients.map((p) => (
                        <Link
                            key={p.id}
                            href={`/praticien/patients/${p.id}`}
                            className="flex items-center gap-3 rounded-xl bg-cream px-4 py-3 hover:bg-sand/20"
                        >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sage/20 text-sm font-bold text-forest">
                                {p.initials}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-forest">{p.name}</span>
                                <span className="block text-xs text-terracotta">{p.reason}</span>
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
```

Remplacer le composant `Dashboard` :

```jsx
export default function Dashboard({ todayLabel, stats, growthTrend, observanceTrend, observanceTiers, watchlist }) {
    const practitionerName = usePage().props.auth.user.name;
    const { t } = useTranslation();

    return (
        <PraticienLayout title={t('Tableau de bord')}>
            <div className="mb-6">
                <h1 className="font-display mb-1 text-2xl font-semibold text-forest">{t('Bonjour, :name', { name: practitionerName })}</h1>
                <p className="text-sm text-forest/60">{todayLabel}</p>
            </div>

            <div className="mb-5 flex flex-wrap gap-3.5">
                <StatCard label={t('Patients actifs')} value={stats.activePatients} />
                <StatCard label={t('Nouveaux ce mois-ci')} value={stats.newPatientsThisMonth} />
                <StatCard label={t('Check-ins cette semaine')} value={stats.checkinsThisWeek} />
                <StatCard label={t('Messages non lus')} value={stats.unreadMessages} tone="terracotta" />
            </div>

            <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                <ChartCard title={t('Croissance du cabinet')} subtitle={t('Total de patients suivis et nouveaux patients, 12 derniers mois')}>
                    <GrowthChart trend={growthTrend} t={t} />
                </ChartCard>
                <ChartCard title={t('Observance moyenne du cabinet')} subtitle={t('Moyenne des patients actifs, 12 dernières semaines')}>
                    <ObservanceChart trend={observanceTrend} t={t} />
                </ChartCard>
            </div>

            <div className="mb-5">
                <ChartCard title={t('Répartition de l’observance')} subtitle={t('Cliquez sur une tranche pour voir les patients concernés')}>
                    <TierBreakdownChart tiers={observanceTiers} t={t} />
                </ChartCard>
            </div>

            <Watchlist patients={watchlist} t={t} />
        </PraticienLayout>
    );
}
```

`StatCard` et `ChartCard` restent inchangés (ils ne contiennent aucun texte en dur, tout leur contenu vient déjà des props).

- [ ] **Step 3: Traduire les libellés de `GrowthChart`**

Dans `resources/js/Components/Praticien/Charts/GrowthChart.jsx`, remplacer la signature et l'usage :

```jsx
export default function GrowthChart({ trend, t }) {
    const data = {
        labels: trend.map((t) => t.label),
        datasets: [
            {
                type: 'line',
                label: t('Total patients suivis'),
```

(Attention au conflit de nom : le paramètre de callback `t` dans `trend.map((t) => t.label)` masque le `t` de traduction — renommer ce paramètre de callback en `entry` partout dans ce fichier : `trend.map((entry) => entry.label)`, `trend.map((entry) => entry.total)`, `trend.map((entry) => entry.new)`.)

Remplacer :

```jsx
                type: 'bar',
                label: 'Nouveaux patients',
```

par :

```jsx
                type: 'bar',
                label: t('Nouveaux patients'),
```

- [ ] **Step 4: Traduire les libellés de `ObservanceChart`**

Dans `resources/js/Components/Praticien/Charts/ObservanceChart.jsx`, remplacer la signature :

```jsx
export default function ObservanceChart({ trend, t }) {
    const labels = trend.map((t) => t.label);
    const flat = trend.map(() => TARGET);
```

par :

```jsx
export default function ObservanceChart({ trend, t }) {
    const labels = trend.map((entry) => entry.label);
    const flat = trend.map(() => TARGET);
```

Remplacer les 3 libellés de dataset :

```jsx
                label: 'Zone de référence',
```
→
```jsx
                label: t('Zone de référence'),
```

```jsx
                label: 'Objectif 70%',
```
→
```jsx
                label: t('Objectif 70%'),
```

```jsx
                label: 'Observance moyenne',
                data: trend.map((t) => t.average),
```
→
```jsx
                label: t('Observance moyenne'),
                data: trend.map((entry) => entry.average),
```

Remplacer le callback de tooltip :

```jsx
                callbacks: {
                    label: (item) => (item.raw === null ? 'Aucun patient actif' : `${item.raw}% d’observance`),
                },
```

par :

```jsx
                callbacks: {
                    label: (item) => (item.raw === null ? t('Aucun patient actif') : t(':n% d’observance', { n: item.raw })),
                },
```

- [ ] **Step 5: Traduire les libellés de `TierBreakdownChart`**

Dans `resources/js/Components/Praticien/Charts/TierBreakdownChart.jsx`, remplacer :

```jsx
const TIERS = [
    { key: 'under25', label: 'Moins de 25%', color: '#C4643F' },
    { key: '25to50', label: '25 – 50%', color: '#D9C9A8' },
    { key: '50to75', label: '50 – 75%', color: '#A9C4A8' },
    { key: 'over75', label: 'Plus de 75%', color: '#7FA07E' },
];

export default function TierBreakdownChart({ tiers }) {
    const data = {
        labels: TIERS.map((t) => t.label),
```

par :

```jsx
const TIER_KEYS = [
    { key: 'under25', labelKey: 'Moins de 25%', color: '#C4643F' },
    { key: '25to50', labelKey: '25 – 50%', color: '#D9C9A8' },
    { key: '50to75', labelKey: '50 – 75%', color: '#A9C4A8' },
    { key: 'over75', labelKey: 'Plus de 75%', color: '#7FA07E' },
];

export default function TierBreakdownChart({ tiers, t }) {
    const TIERS = TIER_KEYS.map((tier) => ({ ...tier, label: t(tier.labelKey) }));

    const data = {
        labels: TIERS.map((tier) => tier.label),
```

(Renommé la constante en `TIER_KEYS` pour porter les clés de traduction, puis dérivé `TIERS` avec les libellés résolus — `TIERS` reste utilisé tel quel plus bas dans `onClick`, pas de changement supplémentaire nécessaire.)

Remplacer le callback de tooltip :

```jsx
                callbacks: {
                    label: (item) => `${item.raw} patient${item.raw > 1 ? 's' : ''}`,
                },
```

par :

```jsx
                callbacks: {
                    label: (item) => (item.raw > 1 ? t(':n patients', { n: item.raw }) : t(':n patient', { n: item.raw })),
                },
```

- [ ] **Step 6: Lancer la suite backend, vérifier qu'elle passe toujours**

Run: `php artisan test`
Expected: PASS.

- [ ] **Step 7: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 8: Vérification manuelle**

`http://127.0.0.1:8000/praticien/dashboard`, basculer en arabe via le sélecteur :
- Cartes stats, titres/sous-titres de graphiques, watchlist en arabe.
- Les 3 graphiques restent en LTR (axe temporel gauche→droite, barres horizontales de `TierBreakdownChart` inchangées) — seuls les tooltips (survol) affichent du texte arabe.
- Cliquer une tranche du graphique de répartition : redirige toujours vers `/praticien/patients?observance=...`.
- Basculer en FR : identique à avant ce plan.

- [ ] **Step 9: Commit**

```bash
git add app/Http/Controllers/Praticien/DashboardController.php resources/js/Pages/Praticien/Dashboard.jsx resources/js/Components/Praticien/Charts/GrowthChart.jsx resources/js/Components/Praticien/Charts/ObservanceChart.jsx resources/js/Components/Praticien/Charts/TierBreakdownChart.jsx
git commit -m "feat(i18n): translate praticien dashboard and chart labels"
```

---

### Task 6: Liste des patients

**Files:**
- Modify: `resources/js/Components/Praticien/PatientCard.jsx`
- Modify: `resources/js/Pages/Praticien/Patients/Index.jsx`

**Interfaces:**
- Consumes: `useTranslation()`, clés Task 1 (`Tous`, `En retard`, `Nouveaux`, `Observance : …`, `À jour`, `Aucun check-in`, …).

- [ ] **Step 1: Traduire `PatientCard` et corriger le RTL**

Dans `resources/js/Components/Praticien/PatientCard.jsx`, ajouter l'import et remplacer le composant :

```jsx
import { Link } from '@inertiajs/react';
import { useTranslation } from '../../i18n';
import ObservanceBar from './ObservanceBar';

export default function PatientCard({ patient }) {
    const { t } = useTranslation();

    const STATUS = {
        a_jour: { dot: 'bg-sage', bg: 'bg-sage/15', text: 'text-forest', label: t('À jour') },
        en_retard: { dot: 'bg-terracotta', bg: 'bg-terracotta/12', text: 'text-terracotta', label: t('Check-in en retard') },
        nouveau: { dot: 'bg-sand', bg: 'bg-sand/50', text: 'text-forest', label: t('Nouveaux') },
    };

    const status = STATUS[patient.status];

    return (
        <Link
            href={`/praticien/patients/${patient.id}`}
            className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-5 text-forest shadow-md shadow-forest/10 transition hover:shadow-lg hover:shadow-forest/15"
        >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sage/15 text-sm font-bold text-forest">
                {patient.initials}
            </div>

            <div className="min-w-40 flex-1 basis-44">
                <div className="mb-1.5 text-base font-semibold">{patient.name}</div>
                <span className="inline-block rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-forest">
                    {patient.goal}
                </span>
            </div>

            <div className="min-w-32 flex-1 basis-40">
                <ObservanceBar value={patient.observance} />
            </div>

            <div className="basis-28 text-sm text-forest/60">{patient.lastCheckIn ?? t('Aucun check-in')}</div>

            <div className="ms-auto shrink-0">
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${status.bg} ${status.text}`}
                >
                    <span className={`size-1.5 shrink-0 rounded-full ${status.dot}`} />
                    {status.label}
                </span>
            </div>
        </Link>
    );
}
```

Note : `nouveau` réutilise la clé `Nouveaux` (déjà dans le dictionnaire pour le filtre) plutôt qu'une clé `Nouveau` séparée — même mot, accord au pluriel du filtre acceptable ici pour un badge singulier (simplification volontaire, cohérente avec l'esprit "AI non-locuteur natif, à faire relire").

- [ ] **Step 2: Traduire la page liste des patients**

Dans `resources/js/Pages/Praticien/Patients/Index.jsx`, ajouter l'import :

```jsx
import { Plus, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import AddPatientModal from '../../../Components/Praticien/AddPatientModal';
import PatientCard from '../../../Components/Praticien/PatientCard';
import PraticienLayout from '../../../Layouts/PraticienLayout';
import { useTranslation } from '../../../i18n';
```

Remplacer les constantes de module par des fonctions dépendantes de `t` (elles ne peuvent plus être des constantes de module puisqu'elles doivent réagir à la langue courante) :

```jsx
function filters(t) {
    return [
        { key: 'tous', label: t('Tous') },
        { key: 'retard', label: t('En retard') },
        { key: 'nouveaux', label: t('Nouveaux') },
    ];
}

function tierLabels(t) {
    return {
        under25: t('Observance : moins de 25%'),
        '25to50': t('Observance : 25 – 50%'),
        '50to75': t('Observance : 50 – 75%'),
        over75: t('Observance : plus de 75%'),
    };
}
```

Remplacer le début du composant :

```jsx
export default function PatientsIndex({ patients, initialObservanceTier }) {
    const [filter, setFilter] = useState('tous');
    const [tierFilter, setTierFilter] = useState(initialObservanceTier ?? null);
    const [addPatientOpen, setAddPatientOpen] = useState(false);
    const { t } = useTranslation();
    const FILTERS = filters(t);
    const TIER_LABELS = tierLabels(t);
```

Remplacer le JSX (titre, bouton, filtres, états vides) :

```jsx
    return (
        <PraticienLayout title={t('Patients')}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h1 className="font-display text-2xl font-semibold text-forest">{t('Patients')}</h1>

                <button
                    type="button"
                    onClick={() => setAddPatientOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-forest px-4.5 py-2.75 text-sm font-semibold text-cream hover:opacity-90"
                >
                    <Plus size={16} />
                    {t('Nouveau patient')}
                </button>
            </div>

            {tierFilter && (
                <div className="mb-4">
                    <button
                        type="button"
                        onClick={() => setTierFilter(null)}
                        className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream"
                    >
                        {TIER_LABELS[tierFilter] ?? t('Filtré')}
                        <X size={14} />
                    </button>
                </div>
            )}

            <div className="mb-5 flex gap-2">
                {FILTERS.map((f) => (
                    <button
                        key={f.key}
                        type="button"
                        onClick={() => setFilter(f.key)}
                        className={
                            'rounded-full px-4 py-2 text-sm font-semibold ' +
                            (filter === f.key ? 'bg-forest text-cream' : 'bg-sand/40 text-forest')
                        }
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {hasNoPatientsAtAll && (
                <div className="rounded-2xl bg-white px-6 py-16 text-center">
                    <Users className="mx-auto mb-4 text-forest/30" size={40} />
                    <p className="mb-1 text-base font-semibold text-forest">{t('Aucun patient pour l’instant')}</p>
                    <p className="text-sm text-forest/60">{t('Créez votre premier patient avec le bouton ci-dessus.')}</p>
                </div>
            )}

            {filterHasNoResults && (
                <div className="rounded-2xl bg-white px-5 py-14 text-center">
                    <p className="mb-1 text-base font-semibold text-forest">{t('Aucun patient dans ce filtre')}</p>
                    <p className="text-sm text-forest/60">{t('Essayez un autre filtre, ou revenez à « Tous ».')}</p>
                </div>
            )}
```

Le reste du composant (`useMemo` de filtrage, `hasNoPatientsAtAll`/`filterHasNoResults`, la liste `filtered.map`, `<AddPatientModal>`) ne change pas — `filter`/`tierFilter` continuent de stocker les clés stables (`'tous'`, `'retard'`, `under25`, etc.), seuls les libellés affichés changent.

- [ ] **Step 3: Lancer la suite backend, vérifier qu'elle passe toujours**

Run: `php artisan test`
Expected: PASS.

- [ ] **Step 4: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 5: Vérification manuelle**

`http://127.0.0.1:8000/praticien/patients`, basculer en arabe :
- Filtres, badges de statut, bouton "مريض جديد" en arabe.
- Le badge de statut reste aligné à gauche visuellement (`ms-auto` bascule bien à droite du texte en RTL, à gauche en LTR — vérifier que le badge est du côté opposé au nom/objectif dans les deux langues).
- Cliquer une tranche d'observance depuis le dashboard : le filtre pré-sélectionné affiche le bon libellé traduit.

- [ ] **Step 6: Commit**

```bash
git add resources/js/Components/Praticien/PatientCard.jsx resources/js/Pages/Praticien/Patients/Index.jsx
git commit -m "feat(i18n): translate and mirror the patients list page"
```

---

### Task 7: Fiche patient — en-tête, onglets, vitalité

**Files:**
- Modify: `resources/js/Pages/Praticien/Patients/Show.jsx`
- Modify: `resources/js/Components/Praticien/AddVitaliteItemModal.jsx`

**Interfaces:**
- Consumes: `useTranslation()`, `<Modal>` (Task 2), clés Task 1 (`Protocole`, `Suivi`, `Check-ins`, `Message`, `Assigner un protocole`, `Vitalité`, …).
- Produces: `TABS`, `SCORE_LABELS` restent des identifiants internes inchangés (`'protocole'`, `'suivi'`, `'checkins'`, `'energy'`, …) — seuls leurs libellés affichés passent par `t()`. Tasks 8 et 9 consomment le même fichier `Show.jsx` (parties `MouvementNutritionCard`/`SuiviTab`/`CheckinsTab` non touchées ici).

- [ ] **Step 1: Traduire `AddVitaliteItemModal`**

Dans `resources/js/Components/Praticien/AddVitaliteItemModal.jsx`, ajouter l'import et remplacer le composant :

```jsx
import { useForm } from '@inertiajs/react';
import Modal from '../Modal';
import { useTranslation } from '../../i18n';

export default function AddVitaliteItemModal({ open, onClose, patientId }) {
    const { data, setData, post, processing, errors, reset } = useForm({ text: '' });
    const { t } = useTranslation();

    function close() {
        reset();
        onClose();
    }

    function submit(e) {
        e.preventDefault();
        post(`/praticien/patients/${patientId}/vitalite-items`, {
            preserveScroll: true,
            onSuccess: close,
        });
    }

    return (
        <Modal open={open} onClose={close} title={t('Ajouter une consigne')} maxWidth={420}>
            <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                    <label htmlFor="vitalite-text" className="mb-1 block text-sm font-semibold text-forest">
                        {t('Consigne')}
                    </label>
                    <input
                        id="vitalite-text"
                        type="text"
                        placeholder="Se coucher avant 23h…"
                        value={data.text}
                        onChange={(e) => setData('text', e.target.value)}
                        autoFocus
                        className="w-full rounded-xl border border-sand bg-white px-3.5 py-2.5 text-sm text-forest focus:ring-2 focus:ring-sage focus:outline-none"
                    />
                    {errors.text && <p className="mt-1 text-sm text-terracotta">{errors.text}</p>}
                </div>

                <button
                    type="submit"
                    disabled={processing || !data.text}
                    className="rounded-xl bg-forest py-2.75 text-sm font-semibold text-cream disabled:opacity-50"
                >
                    {t('Ajouter')}
                </button>
            </form>
        </Modal>
    );
}
```

Le `placeholder` ("Se coucher avant 23h…") reste en français littéral, comme les placeholders d'exemple ailleurs dans le projet (texte d'exemple, pas un libellé d'interface — hors périmètre de traduction, cohérent avec le traitement des placeholders similaires dans `AddPatientModal`/`AddItemModal`/`TemplateFormModal`, non traduits non plus).

- [ ] **Step 2: Traduire l'en-tête, les onglets et la section vitalité de `Show.jsx`**

Dans `resources/js/Pages/Praticien/Patients/Show.jsx`, ajouter l'import :

```jsx
import { Link } from '@inertiajs/react';
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import AddItemModal from '../../../Components/Praticien/AddItemModal';
import AddVitaliteItemModal from '../../../Components/Praticien/AddVitaliteItemModal';
import AssignProtocolModal from '../../../Components/Praticien/AssignProtocolModal';
import PraticienLayout from '../../../Layouts/PraticienLayout';
import { useTranslation } from '../../../i18n';
```

Remplacer les constantes de module `TABS` et `SCORE_LABELS` par des fonctions dépendantes de `t` (même raison qu'au Task 6) :

```jsx
function tabs(t) {
    return [
        { key: 'protocole', label: t('Protocole') },
        { key: 'suivi', label: t('Suivi') },
        { key: 'checkins', label: t('Check-ins') },
    ];
}

function scoreLabels(t) {
    return [
        ['energy', t('Énergie')],
        ['sleep', t('Sommeil')],
        ['digestion', t('Digestion')],
        ['mood', t('Humeur')],
    ];
}
```

`SCORE_LABELS` est consommé par `CheckinHistoryCard` (Task 9) et `CheckinCard` (Task 9) — ces deux composants prendront `scoreLabels` en prop `t` plutôt qu'en import de module (voir Task 9).

Remplacer `InertButton` :

```jsx
function InertButton({ children, variant = 'outline', t }) {
    const base = 'cursor-not-allowed whitespace-nowrap rounded-xl font-semibold opacity-50';
    const variants = {
        outline: 'border border-sage px-4.5 py-2.75 text-sm text-forest',
        small: 'border border-sage px-3.5 py-2 text-xs text-forest',
    };

    return (
        <button type="button" disabled title={t('Bientôt disponible')} className={`${base} ${variants[variant]}`}>
            {children}
        </button>
    );
}
```

Remplacer `VitaliteSection` :

```jsx
function VitaliteSection({ items, onAdd, t }) {
    return (
        <div className="mb-4 rounded-2xl bg-white px-6 py-4.5 shadow-lg shadow-forest/20">
            <h3 className="font-display mb-3 text-lg font-semibold text-forest">{t('Vitalité')}</h3>

            {items.length === 0 ? (
                <p className="mb-3 text-sm text-forest/60">{t('Aucune consigne pour l’instant.')}</p>
            ) : (
                <ul className="mb-3">
                    {items.map((item) => (
                        <li key={item.id} className="relative mb-2 ps-4 text-sm leading-7 text-forest/80">
                            <span className="absolute top-2 start-0 size-1.25 rounded-full bg-sage" />
                            {item.text}
                        </li>
                    ))}
                </ul>
            )}

            <AddButton onClick={onAdd}>+ {t('Ajouter une consigne')}</AddButton>
        </div>
    );
}
```

Remplacer le début du composant `Show` et l'en-tête/les onglets :

```jsx
export default function Show({ patient, protocol, weekPlan, checkins, templates, vitalite }) {
    const [tab, setTab] = useState('protocole');
    const [protocolOpen, setProtocolOpen] = useState(true);
    const [assignOpen, setAssignOpen] = useState(false);
    const [addItemPillar, setAddItemPillar] = useState(null);
    const [addVitaliteOpen, setAddVitaliteOpen] = useState(false);
    const { t } = useTranslation();
    const TABS = tabs(t);

    return (
        <PraticienLayout title={patient.name}>
            <div className="mx-auto" style={{ maxWidth: '1180px' }}>
                <div className="mb-5 text-sm text-forest/60">
                    <Link href="/praticien/patients" className="hover:text-forest">
                        {t('Patients')}
                    </Link>
                    <span className="mx-1.5 text-forest/30">/</span>
                    <span className="text-forest">{patient.name}</span>
                </div>

                <div className="mb-7 flex flex-wrap items-start justify-between gap-6 rounded-2xl bg-white px-8 py-7 shadow-lg shadow-forest/20">
                    <div className="flex items-center gap-5">
                        <div className="flex size-17 shrink-0 items-center justify-center rounded-full bg-sage/15 text-2xl font-bold text-forest">
                            {patient.initials}
                        </div>
                        <div>
                            <h1 className="font-display mb-1 text-2xl font-semibold text-forest">{patient.name}</h1>
                            <p className="mb-1.5 text-sm text-forest/60">
                                {[patient.age ? `${patient.age} ans` : null, patient.pillars].filter(Boolean).join(' · ')}
                            </p>
                            {patient.goal && (
                                <p className="text-sm text-forest/80" style={{ maxWidth: '46ch' }}>
                                    {patient.goal}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex shrink-0 gap-2.5">
                        <Link
                            href={`/praticien/messages/${patient.id}`}
                            className="rounded-xl border border-sage px-4.5 py-2.75 text-sm font-semibold text-forest hover:bg-sage/10"
                        >
                            {t('Message')}
                        </Link>
                        <button
                            type="button"
                            onClick={() => setAssignOpen(true)}
                            className="rounded-xl bg-forest px-4.5 py-2.75 text-sm font-semibold text-cream hover:opacity-90"
                        >
                            {t('Assigner un protocole')}
                        </button>
                    </div>
                </div>

                <VitaliteSection items={vitalite} onAdd={() => setAddVitaliteOpen(true)} t={t} />

                <div className="mb-6.5 flex gap-1 border-b border-sand">
                    {TABS.map((tabItem) => (
                        <button
                            key={tabItem.key}
                            type="button"
                            onClick={() => setTab(tabItem.key)}
                            className={
                                '-mb-px rounded-t-lg border-b-2 px-4.5 py-3 text-sm font-semibold ' +
                                (tab === tabItem.key ? 'border-sage text-forest' : 'border-transparent text-forest/50')
                            }
                        >
                            {tabItem.label}
                        </button>
                    ))}
                </div>
```

(Renommé la variable de boucle `t` → `tabItem` : elle masquait la fonction de traduction `t` importée du hook.)

`patient.age ? \`${patient.age} ans\` : null` reste hors périmètre de traduction fine (unité "ans" — même simplification que le reste du texte généré dynamiquement non couvert explicitement par la spec ; à traiter dans une itération future si besoin).

- [ ] **Step 3: Build frontend, vérifier qu'il n'y a pas d'erreur**

Note : le build échouera à cette étape tant que les Tasks 8 et 9 (qui referment `MouvementNutritionCard`, `SuiviTab`, `CheckinsTab`, et le bloc de rendu final utilisant `t`/`InertButton` avec la nouvelle signature) n'ont pas été faites — `Show.jsx` est un seul fichier modifié progressivement sur 3 tâches. Ne pas commit avant la fin du Task 9 : garder les Tasks 7, 8 et 9 comme un seul commit de travail en cours localement (`git add -p` ou un commit unique après le Step 3 du Task 9), ou appliquer les 3 tâches d'affilée avant de builder/commit. Passer directement au Task 8.

---

### Task 8: Fiche patient — onglet Protocole

**Files:**
- Modify: `resources/js/Pages/Praticien/Patients/Show.jsx` (suite du Task 7)
- Modify: `resources/js/Components/Praticien/AddItemModal.jsx`
- Modify: `resources/js/Components/Praticien/AssignProtocolModal.jsx`

**Interfaces:**
- Consumes: `useTranslation()`, `<Modal>` (Task 2), clés Task 1 (`Nutrition`, `Mouvement`, `Exercice`, `Séries`, `Volume`, `Jours`, `Tous les jours`, `Ajouter`, `Point de départ`, `Protocole vierge`, …). Réutilise les clés `Lun`…`Dim` du sous-projet 1 pour les sélecteurs de jour.

- [ ] **Step 1: Traduire `AddItemModal`**

Dans `resources/js/Components/Praticien/AddItemModal.jsx`, ajouter l'import :

```jsx
import { useForm } from '@inertiajs/react';
import Modal from '../Modal';
import { useTranslation } from '../../i18n';
```

Remplacer la constante `DAYS` par une fonction :

```jsx
function days(t) {
    return [
        { value: 1, label: t('Lun') },
        { value: 2, label: t('Mar') },
        { value: 3, label: t('Mer') },
        { value: 4, label: t('Jeu') },
        { value: 5, label: t('Ven') },
        { value: 6, label: t('Sam') },
        { value: 7, label: t('Dim') },
    ];
}
```

Remplacer le début du composant et le JSX :

```jsx
export default function AddItemModal({ open, onClose, protocolId, pillar }) {
    const isMouvement = pillar === 'mouvement';
    const { t } = useTranslation();
    const DAYS = days(t);
    const { data, setData, post, processing, errors, reset } = useForm({
        pillar,
        title: '',
        sets: '',
        reps: '',
        permanent: true,
        days: [],
    });

    function toggleDay(day) {
        setData('days', data.days.includes(day) ? data.days.filter((d) => d !== day) : [...data.days, day].sort());
    }

    function close() {
        reset();
        onClose();
    }

    function submit(e) {
        e.preventDefault();
        post(`/praticien/protocols/${protocolId}/items`, {
            preserveScroll: true,
            onSuccess: close,
        });
    }

    return (
        <Modal open={open} onClose={close} title={isMouvement ? t('Ajouter un exercice') : t('Ajouter un élément nutrition')} maxWidth={440}>
            <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                    <label htmlFor="item-title" className="mb-1 block text-sm font-semibold text-forest">
                        {isMouvement ? t('Exercice') : t('Repas ou consigne')}
                    </label>
                    <input
                        id="item-title"
                        type="text"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        autoFocus
                        className="w-full rounded-xl border border-sand bg-white px-3.5 py-2.5 text-sm text-forest focus:ring-2 focus:ring-sage focus:outline-none"
                    />
                    {errors.title && <p className="mt-1 text-sm text-terracotta">{errors.title}</p>}
                </div>

                {isMouvement && (
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label htmlFor="item-sets" className="mb-1 block text-sm font-semibold text-forest">
                                {t('Séries')}
                            </label>
                            <input
                                id="item-sets"
                                type="number"
                                min="1"
                                value={data.sets}
                                onChange={(e) => setData('sets', e.target.value)}
                                className="w-full rounded-xl border border-sand bg-white px-3.5 py-2.5 text-sm text-forest focus:ring-2 focus:ring-sage focus:outline-none"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="item-reps" className="mb-1 block text-sm font-semibold text-forest">
                                {t('Volume')}
                            </label>
                            <input
                                id="item-reps"
                                type="text"
                                placeholder="12 reps, 30 min…"
                                value={data.reps}
                                onChange={(e) => setData('reps', e.target.value)}
                                className="w-full rounded-xl border border-sand bg-white px-3.5 py-2.5 text-sm text-forest focus:ring-2 focus:ring-sage focus:outline-none"
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-forest">
                        <input
                            type="checkbox"
                            checked={data.permanent}
                            onChange={(e) => setData('permanent', e.target.checked)}
                            className="size-4 accent-sage"
                        />
                        {t('Tous les jours')}
                    </label>

                    {!data.permanent && (
                        <div className="flex flex-wrap gap-1.5">
                            {DAYS.map((day) => (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => toggleDay(day.value)}
                                    className={
                                        'rounded-full px-3 py-1.5 text-xs font-semibold ' +
                                        (data.days.includes(day.value) ? 'bg-forest text-cream' : 'bg-sand/40 text-forest')
                                    }
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    )}
                    {errors.days && <p className="mt-1 text-sm text-terracotta">{errors.days}</p>}
                </div>

                <button
                    type="submit"
                    disabled={processing || !data.title || (!data.permanent && data.days.length === 0)}
                    className="rounded-xl bg-forest py-2.75 text-sm font-semibold text-cream disabled:opacity-50"
                >
                    {t('Ajouter')}
                </button>
            </form>
        </Modal>
    );
}
```

(Le `inputClass` const de module a été inlinée dans les 3 usages ci-dessus pour rester équivalente au fichier d'origine — reprendre `const inputClass = '...';` en haut du fichier comme avant si préféré, aucune obligation de l'inliner ; les deux sont strictement équivalents.)

- [ ] **Step 2: Traduire `AssignProtocolModal`**

Dans `resources/js/Components/Praticien/AssignProtocolModal.jsx`, ajouter l'import :

```jsx
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '../Modal';
import { useTranslation } from '../../i18n';
```

Remplacer le composant :

```jsx
export default function AssignProtocolModal({ open, onClose, patientId, templates, activeProtocolTitle }) {
    const [choice, setChoice] = useState('blank');
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        template_id: null,
    });

    function selectBlank() {
        setChoice('blank');
        setData({ title: '', template_id: null });
    }

    function selectTemplate(template) {
        setChoice(template.id);
        setData({ title: template.title, template_id: template.id });
    }

    function close() {
        reset();
        setChoice('blank');
        onClose();
    }

    function submit(e) {
        e.preventDefault();
        post(`/praticien/patients/${patientId}/protocol`, {
            preserveScroll: true,
            onSuccess: close,
        });
    }

    return (
        <Modal open={open} onClose={close} title={t('Assigner un protocole')} maxWidth={520}>
            {activeProtocolTitle && (
                <div className="mb-5 rounded-xl border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-sm text-forest">
                    {t('Un protocole actif existe déjà (« :title »). Confirmer ci-dessous archivera automatiquement ce protocole.', {
                        title: activeProtocolTitle,
                    })}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-5">
                <div>
                    <p className="mb-2 text-sm font-semibold text-forest">{t('Point de départ')}</p>
                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={selectBlank}
                            className={
                                'rounded-xl border px-4 py-3 text-start text-sm ' +
                                (choice === 'blank' ? 'border-sage bg-sage/10 font-semibold text-forest' : 'border-sand text-forest/70')
                            }
                        >
                            {t('Protocole vierge')}
                            <span className="block text-xs text-forest/50">{t('Partir de zéro, ajouter les items ensuite')}</span>
                        </button>

                        {templates.map((template) => (
                            <button
                                key={template.id}
                                type="button"
                                onClick={() => selectTemplate(template)}
                                className={
                                    'rounded-xl border px-4 py-3 text-start text-sm ' +
                                    (choice === template.id
                                        ? 'border-sage bg-sage/10 font-semibold text-forest'
                                        : 'border-sand text-forest/70')
                                }
                            >
                                {template.title}
                                {template.description && <span className="block text-xs text-forest/50">{template.description}</span>}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="protocol-title" className="mb-1 block text-sm font-semibold text-forest">
                        {t('Titre du protocole')}
                    </label>
                    <input
                        id="protocol-title"
                        type="text"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        className="w-full rounded-xl border border-sand bg-white px-3.5 py-2.5 text-sm text-forest focus:ring-2 focus:ring-sage focus:outline-none"
                    />
                    {errors.title && <p className="mt-1 text-sm text-terracotta">{errors.title}</p>}
                </div>

                <button
                    type="submit"
                    disabled={processing || !data.title}
                    className="rounded-xl bg-forest py-2.75 text-sm font-semibold text-cream disabled:opacity-50"
                >
                    {activeProtocolTitle ? t('Archiver et assigner') : t('Assigner le protocole')}
                </button>
            </form>
        </Modal>
    );
}
```

- [ ] **Step 3: Traduire `MouvementNutritionCard` dans `Show.jsx`**

Dans `resources/js/Pages/Praticien/Patients/Show.jsx`, remplacer :

```jsx
function MouvementNutritionCard({ mouvementItems, nutritionItems, open, onToggle, onAddMouvement, onAddNutrition }) {
    return (
        <div className="rounded-2xl bg-white shadow-lg shadow-forest/20">
            <div onClick={onToggle} className="flex cursor-pointer items-center gap-6 px-6 py-4.5">
                <h3 className="font-display flex-1 text-lg font-semibold text-forest">Nutrition</h3>
                <h3 className="font-display flex-1 text-lg font-semibold text-forest">Mouvement</h3>
                <ChevronDown size={18} className={'shrink-0 text-sage transition-transform ' + (open ? '' : '-rotate-90')} />
            </div>

            {open && (
                <div className="flex flex-col gap-6 px-6 pb-5 md:flex-row">
                    <div className="flex-1">
                        <ul>
                            {nutritionItems.map((item) => (
                                <li key={item.title} className="relative mb-2 pl-4 text-sm leading-7 text-forest/80">
                                    <span className="absolute top-2 left-0 size-1.25 rounded-full bg-sage" />
                                    {item.title}
                                    {item.days && <span className="text-forest/50"> · {item.days}</span>}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-2">
                            <AddButton onClick={onAddNutrition}>+ Ajouter un élément nutrition</AddButton>
                        </div>
                    </div>

                    <div className="hidden w-px shrink-0 bg-sand md:block" />

                    <div className="flex-1">
                        {mouvementItems.length > 0 && (
                            <div className="overflow-x-auto">
                                <div
                                    className="grid gap-x-3 gap-y-2 text-sm"
                                    style={{ gridTemplateColumns: '1.6fr 0.7fr 0.9fr 1.1fr', minWidth: '360px' }}
                                >
                                    <div className="text-xs font-bold tracking-wide text-forest/50 uppercase">Exercice</div>
                                    <div className="text-xs font-bold tracking-wide text-forest/50 uppercase">Séries</div>
                                    <div className="text-xs font-bold tracking-wide text-forest/50 uppercase">Volume</div>
                                    <div className="text-xs font-bold tracking-wide text-forest/50 uppercase">Jours</div>

                                    {mouvementItems.map((item) => (
                                        <div key={item.title} className="contents">
                                            <div className="border-t border-sand/30 py-2 font-medium text-forest">{item.title}</div>
                                            <div className="border-t border-sand/30 py-2 tabular-nums text-forest">{item.sets ?? '—'}</div>
                                            <div className="border-t border-sand/30 py-2 tabular-nums text-forest">{item.reps ?? '—'}</div>
                                            <div className="border-t border-sand/30 py-2 text-forest/60">{item.days}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="mt-3.5">
                            <AddButton onClick={onAddMouvement}>+ Ajouter un exercice</AddButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
```

par :

```jsx
function MouvementNutritionCard({ mouvementItems, nutritionItems, open, onToggle, onAddMouvement, onAddNutrition, t }) {
    return (
        <div className="rounded-2xl bg-white shadow-lg shadow-forest/20">
            <div onClick={onToggle} className="flex cursor-pointer items-center gap-6 px-6 py-4.5">
                <h3 className="font-display flex-1 text-lg font-semibold text-forest">{t('Nutrition')}</h3>
                <h3 className="font-display flex-1 text-lg font-semibold text-forest">{t('Mouvement')}</h3>
                <ChevronDown size={18} className={'shrink-0 text-sage transition-transform ' + (open ? '' : '-rotate-90')} />
            </div>

            {open && (
                <div className="flex flex-col gap-6 px-6 pb-5 md:flex-row">
                    <div className="flex-1">
                        <ul>
                            {nutritionItems.map((item) => (
                                <li key={item.title} className="relative mb-2 ps-4 text-sm leading-7 text-forest/80">
                                    <span className="absolute top-2 start-0 size-1.25 rounded-full bg-sage" />
                                    {item.title}
                                    {item.days && <span className="text-forest/50"> · {item.days}</span>}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-2">
                            <AddButton onClick={onAddNutrition}>+ {t('Ajouter un élément nutrition')}</AddButton>
                        </div>
                    </div>

                    <div className="hidden w-px shrink-0 bg-sand md:block" />

                    <div className="flex-1">
                        {mouvementItems.length > 0 && (
                            <div className="overflow-x-auto">
                                <div
                                    className="grid gap-x-3 gap-y-2 text-sm"
                                    style={{ gridTemplateColumns: '1.6fr 0.7fr 0.9fr 1.1fr', minWidth: '360px' }}
                                >
                                    <div className="text-xs font-bold tracking-wide text-forest/50 uppercase">{t('Exercice')}</div>
                                    <div className="text-xs font-bold tracking-wide text-forest/50 uppercase">{t('Séries')}</div>
                                    <div className="text-xs font-bold tracking-wide text-forest/50 uppercase">{t('Volume')}</div>
                                    <div className="text-xs font-bold tracking-wide text-forest/50 uppercase">{t('Jours')}</div>

                                    {mouvementItems.map((item) => (
                                        <div key={item.title} className="contents">
                                            <div className="border-t border-sand/30 py-2 font-medium text-forest">{item.title}</div>
                                            <div className="border-t border-sand/30 py-2 tabular-nums text-forest">{item.sets ?? '—'}</div>
                                            <div className="border-t border-sand/30 py-2 tabular-nums text-forest">{item.reps ?? '—'}</div>
                                            <div className="border-t border-sand/30 py-2 text-forest/60">{item.days}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="mt-3.5">
                            <AddButton onClick={onAddMouvement}>+ {t('Ajouter un exercice')}</AddButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
```

- [ ] **Step 4: Câbler `t` et corriger le bloc de rendu du protocole dans `Show`**

Dans le composant `Show` de `resources/js/Pages/Praticien/Patients/Show.jsx`, remplacer :

```jsx
                {tab === 'protocole' &&
                    (protocol ? (
                        <MouvementNutritionCard
                            mouvementItems={protocol.mouvement}
                            nutritionItems={protocol.nutrition}
                            open={protocolOpen}
                            onToggle={() => setProtocolOpen((v) => !v)}
                            onAddMouvement={() => setAddItemPillar('mouvement')}
                            onAddNutrition={() => setAddItemPillar('nutrition')}
                        />
                    ) : (
                        <div className="rounded-2xl bg-white px-6 py-16 text-center">
                            <p className="mb-1 text-base font-semibold text-forest">Aucun protocole actif</p>
                            <p className="mb-4 text-sm text-forest/60">Ce patient n'a pas encore de protocole assigné.</p>
                            <button
                                type="button"
                                onClick={() => setAssignOpen(true)}
                                className="rounded-xl bg-forest px-4.5 py-2.75 text-sm font-semibold text-cream hover:opacity-90"
                            >
                                Assigner un protocole
                            </button>
                        </div>
                    ))}
```

par :

```jsx
                {tab === 'protocole' &&
                    (protocol ? (
                        <MouvementNutritionCard
                            mouvementItems={protocol.mouvement}
                            nutritionItems={protocol.nutrition}
                            open={protocolOpen}
                            onToggle={() => setProtocolOpen((v) => !v)}
                            onAddMouvement={() => setAddItemPillar('mouvement')}
                            onAddNutrition={() => setAddItemPillar('nutrition')}
                            t={t}
                        />
                    ) : (
                        <div className="rounded-2xl bg-white px-6 py-16 text-center">
                            <p className="mb-1 text-base font-semibold text-forest">{t('Aucun protocole actif')}</p>
                            <p className="mb-4 text-sm text-forest/60">{t('Ce patient n’a pas encore de protocole assigné.')}</p>
                            <button
                                type="button"
                                onClick={() => setAssignOpen(true)}
                                className="rounded-xl bg-forest px-4.5 py-2.75 text-sm font-semibold text-cream hover:opacity-90"
                            >
                                {t('Assigner un protocole')}
                            </button>
                        </div>
                    ))}
```

- [ ] **Step 5: Build frontend, vérifier qu'il n'y a pas d'erreur**

Le build échouera encore : `SuiviTab`/`CheckinsTab` (Task 9) référencent `scoreLabels`/`t` non encore câblés. Passer directement au Task 9.

---

### Task 9: Fiche patient — onglets Suivi et Check-ins

**Files:**
- Modify: `resources/js/Pages/Praticien/Patients/Show.jsx` (suite et fin des Tasks 7-8)

**Interfaces:**
- Consumes: `useTranslation()`, `scoreLabels()` (Task 7), clés Task 1 (`Semaine en cours`, `Historique des check-ins`, `Répondre`, …). Réutilise `Sport`/`Nutrition` (sous-projet 1 pour `Sport`, Task 1 pour `Nutrition`).
- Produces: `Show.jsx` complet et fonctionnel — clôture les Tasks 7, 8, 9 en un seul fichier cohérent.

- [ ] **Step 1: Traduire `DaySection`, `WeekPlanCard`, `ScoreBadge`, `CheckinHistoryCard`, `SuiviTab`**

Dans `resources/js/Pages/Praticien/Patients/Show.jsx`, remplacer :

```jsx
function DaySection({ label, items }) {
```

par (signature inchangée — `label` est déjà résolu par l'appelant) :

```jsx
function DaySection({ label, items }) {
```

(Pas de changement de signature nécessaire ici : `WeekPlanCard` passera directement `t('Sport')`/`t('Nutrition')` en `label`.)

Remplacer :

```jsx
function WeekPlanCard({ weekPlan }) {
    return (
        <div className="rounded-2xl bg-white px-6 py-5.5 shadow-lg shadow-forest/20">
            <h3 className="font-display mb-4 text-base font-semibold text-forest">Semaine en cours</h3>
            <div>
                {weekPlan.map((day) => (
                    <div key={day.day} className="flex gap-3.5 border-t border-sand/30 py-2.5 first:border-t-0 first:pt-0">
                        <div className="w-8.5 shrink-0 pt-px text-xs font-bold text-forest/50">{day.day}</div>
                        <div className="flex flex-1 flex-col gap-2.5">
                            <DaySection label="Sport" items={day.sport} />
                            <DaySection label="Nutrition" items={day.nutrition} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

par :

```jsx
function WeekPlanCard({ weekPlan, t }) {
    return (
        <div className="rounded-2xl bg-white px-6 py-5.5 shadow-lg shadow-forest/20">
            <h3 className="font-display mb-4 text-base font-semibold text-forest">{t('Semaine en cours')}</h3>
            <div>
                {weekPlan.map((day) => (
                    <div key={day.day} className="flex gap-3.5 border-t border-sand/30 py-2.5 first:border-t-0 first:pt-0">
                        <div className="w-8.5 shrink-0 pt-px text-xs font-bold text-forest/50">{day.day}</div>
                        <div className="flex flex-1 flex-col gap-2.5">
                            <DaySection label={t('Sport')} items={day.sport} />
                            <DaySection label={t('Nutrition')} items={day.nutrition} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

(`day.day` vient déjà de `WeekPlanBuilder::dayLabels()`, traduit côté backend depuis le sous-projet 1 — inchangé.)

Remplacer `ScoreBadge` (signature inchangée, `label` déjà résolu par l'appelant — aucun changement de code, listé pour mémoire de la chaîne de dépendances).

Remplacer :

```jsx
function CheckinHistoryCard({ checkins }) {
    return (
        <div className="rounded-2xl bg-white px-6 py-5.5 shadow-lg shadow-forest/20">
            <h3 className="font-display mb-4 text-base font-semibold text-forest">Historique des check-ins</h3>
            <div>
                {checkins.length === 0 && <p className="text-sm text-forest/60">Aucun check-in pour l'instant.</p>}
                {checkins.map((c, i) => (
                    <div key={i} className="border-t border-sand/30 py-3.5 first:border-t-0 first:pt-0">
                        <div className="mb-2 text-sm font-semibold text-forest">{c.date}</div>
                        <div className="mb-2 flex gap-3.5">
                            {SCORE_LABELS.map(([key, label]) => (
                                <ScoreBadge key={key} label={label} value={c[key]} />
                            ))}
                        </div>
                        {c.note && <p className="text-sm text-forest/80">« {c.note} »</p>}
                    </div>
                ))}
            </div>
        </div>
    );
}
```

par :

```jsx
function CheckinHistoryCard({ checkins, t }) {
    const SCORE_LABELS = scoreLabels(t);

    return (
        <div className="rounded-2xl bg-white px-6 py-5.5 shadow-lg shadow-forest/20">
            <h3 className="font-display mb-4 text-base font-semibold text-forest">{t('Historique des check-ins')}</h3>
            <div>
                {checkins.length === 0 && <p className="text-sm text-forest/60">{t('Aucun check-in pour l’instant.')}</p>}
                {checkins.map((c, i) => (
                    <div key={i} className="border-t border-sand/30 py-3.5 first:border-t-0 first:pt-0">
                        <div className="mb-2 text-sm font-semibold text-forest">{c.date}</div>
                        <div className="mb-2 flex gap-3.5">
                            {SCORE_LABELS.map(([key, label]) => (
                                <ScoreBadge key={key} label={label} value={c[key]} />
                            ))}
                        </div>
                        {c.note && <p className="text-sm text-forest/80">« {c.note} »</p>}
                    </div>
                ))}
            </div>
        </div>
    );
}
```

Remplacer :

```jsx
function SuiviTab({ weekPlan, checkins }) {
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
            <WeekPlanCard weekPlan={weekPlan} />
            <CheckinHistoryCard checkins={checkins} />
        </div>
    );
}
```

par :

```jsx
function SuiviTab({ weekPlan, checkins, t }) {
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
            <WeekPlanCard weekPlan={weekPlan} t={t} />
            <CheckinHistoryCard checkins={checkins} t={t} />
        </div>
    );
}
```

- [ ] **Step 2: Traduire `CheckinCard` et `CheckinsTab`**

Remplacer :

```jsx
function CheckinCard({ checkin }) {
    return (
        <div className="flex flex-wrap items-center gap-6 rounded-2xl bg-white px-6 py-5 shadow-lg shadow-forest/20">
            <div className="min-w-35 text-sm font-semibold text-forest">{checkin.date}</div>

            <div className="flex min-w-60 flex-1 gap-5">
                {SCORE_LABELS.map(([key, label]) => (
                    <div key={key} className="min-w-15">
                        <div className="mb-1 text-xs text-forest/50">{label}</div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-11 rounded-full bg-sand/40">
                                <div className="h-full rounded-full bg-sage" style={{ width: `${checkin[key] * 10}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-forest tabular-nums">{checkin[key]}</span>
                        </div>
                    </div>
                ))}
            </div>

            {checkin.note && <p className="min-w-55 flex-1 text-sm text-forest/80">« {checkin.note} »</p>}

            <InertButton variant="small">Répondre</InertButton>
        </div>
    );
}

function CheckinsTab({ checkins }) {
    if (checkins.length === 0) {
        return (
            <div className="rounded-2xl bg-white px-6 py-16 text-center">
                <p className="mb-1 text-base font-semibold text-forest">Aucun check-in reçu</p>
                <p className="text-sm text-forest/60">Ce patient n'a pas encore complété de check-in.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3.5">
            {checkins.map((c, i) => (
                <CheckinCard key={i} checkin={c} />
            ))}
        </div>
    );
}
```

par :

```jsx
function CheckinCard({ checkin, t }) {
    const SCORE_LABELS = scoreLabels(t);

    return (
        <div className="flex flex-wrap items-center gap-6 rounded-2xl bg-white px-6 py-5 shadow-lg shadow-forest/20">
            <div className="min-w-35 text-sm font-semibold text-forest">{checkin.date}</div>

            <div className="flex min-w-60 flex-1 gap-5">
                {SCORE_LABELS.map(([key, label]) => (
                    <div key={key} className="min-w-15">
                        <div className="mb-1 text-xs text-forest/50">{label}</div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-11 rounded-full bg-sand/40">
                                <div className="h-full rounded-full bg-sage" style={{ width: `${checkin[key] * 10}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-forest tabular-nums">{checkin[key]}</span>
                        </div>
                    </div>
                ))}
            </div>

            {checkin.note && <p className="min-w-55 flex-1 text-sm text-forest/80">« {checkin.note} »</p>}

            <InertButton variant="small" t={t}>
                {t('Répondre')}
            </InertButton>
        </div>
    );
}

function CheckinsTab({ checkins, t }) {
    if (checkins.length === 0) {
        return (
            <div className="rounded-2xl bg-white px-6 py-16 text-center">
                <p className="mb-1 text-base font-semibold text-forest">{t('Aucun check-in reçu')}</p>
                <p className="text-sm text-forest/60">{t('Ce patient n’a pas encore complété de check-in.')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3.5">
            {checkins.map((c, i) => (
                <CheckinCard key={i} checkin={c} t={t} />
            ))}
        </div>
    );
}
```

- [ ] **Step 3: Câbler `t` sur les deux onglets restants dans `Show`**

Remplacer :

```jsx
                {tab === 'suivi' && <SuiviTab weekPlan={weekPlan} checkins={checkins} />}
                {tab === 'checkins' && <CheckinsTab checkins={checkins} />}
```

par :

```jsx
                {tab === 'suivi' && <SuiviTab weekPlan={weekPlan} checkins={checkins} t={t} />}
                {tab === 'checkins' && <CheckinsTab checkins={checkins} t={t} />}
```

- [ ] **Step 4: Lancer la suite backend, vérifier qu'elle passe toujours**

Run: `php artisan test`
Expected: PASS.

- [ ] **Step 5: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur — ceci confirme que `Show.jsx` (Tasks 7, 8, 9) est cohérent de bout en bout.

- [ ] **Step 6: Vérification manuelle**

`http://127.0.0.1:8000/praticien/patients/{id}` (un patient avec protocole et check-ins), basculer en arabe :
- En-tête, fil d'ariane, onglets, section Vitalité en arabe, alignés à droite.
- Onglet Protocole : colonnes Nutrition/Mouvement inversées visuellement (RTL), puces de liste à droite, tableau d'exercices aligné à droite.
- Onglet Suivi : jours de la semaine (déjà traduits depuis le sous-projet 1), libellés Sport/Nutrition traduits.
- Onglet Check-ins : scores, note, bouton "Répondre" désactivé avec tooltip "قريب باش يوصل" en arabe.
- Ouvrir chaque modal (Assigner un protocole, Ajouter un exercice, Ajouter une consigne) : traduites, boutons de choix alignés à droite (`text-start` bascule bien).
- Basculer en FR : identique à avant ce plan.

- [ ] **Step 7: Commit (Tasks 7, 8 et 9 groupées)**

```bash
git add resources/js/Pages/Praticien/Patients/Show.jsx resources/js/Components/Praticien/AddVitaliteItemModal.jsx resources/js/Components/Praticien/AddItemModal.jsx resources/js/Components/Praticien/AssignProtocolModal.jsx
git commit -m "feat(i18n): translate and mirror the patient detail page"
```

---

### Task 10: Page Protocoles (liste des modèles) et `ConfirmModal`

**Files:**
- Modify: `resources/js/Components/Praticien/ConfirmModal.jsx`
- Modify: `resources/js/Pages/Praticien/Protocoles/Index.jsx`

**Interfaces:**
- Consumes: `useTranslation()`, `<Modal>` (Task 2), clés Task 1 (`Annuler`, `Confirmer`, `Supprimer ce modèle ?`, `Nouveau modèle`, `mouvement`, `nutrition`, …).

- [ ] **Step 1: Traduire `ConfirmModal`**

Dans `resources/js/Components/Praticien/ConfirmModal.jsx`, remplacer :

```jsx
import Modal from '../Modal';

export default function ConfirmModal({ open, onClose, onConfirm, processing, title, message, confirmLabel = 'Confirmer' }) {
    return (
        <Modal open={open} onClose={onClose} title={title} maxWidth={400}>
            <p className="mb-6 text-center text-sm text-forest/70">{message}</p>
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-xl border border-sand py-2.75 text-sm font-semibold text-forest"
                >
                    Annuler
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={processing}
                    className="flex-1 rounded-xl bg-terracotta py-2.75 text-sm font-semibold text-cream disabled:opacity-50"
                >
                    {confirmLabel}
                </button>
            </div>
        </Modal>
    );
}
```

par :

```jsx
import Modal from '../Modal';
import { useTranslation } from '../../i18n';

export default function ConfirmModal({ open, onClose, onConfirm, processing, title, message, confirmLabel }) {
    const { t } = useTranslation();

    return (
        <Modal open={open} onClose={onClose} title={title} maxWidth={400}>
            <p className="mb-6 text-center text-sm text-forest/70">{message}</p>
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-xl border border-sand py-2.75 text-sm font-semibold text-forest"
                >
                    {t('Annuler')}
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={processing}
                    className="flex-1 rounded-xl bg-terracotta py-2.75 text-sm font-semibold text-cream disabled:opacity-50"
                >
                    {confirmLabel ?? t('Confirmer')}
                </button>
            </div>
        </Modal>
    );
}
```

(Le défaut `confirmLabel = 'Confirmer'` littéral devient `confirmLabel ?? t('Confirmer')` — un défaut de paramètre JS ne peut pas appeler un hook, donc le fallback traduit se fait dans le corps du composant.)

- [ ] **Step 2: Traduire `Protocoles/Index.jsx`**

Ajouter l'import :

```jsx
import { router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal from '../../../Components/Praticien/ConfirmModal';
import TemplateFormModal from '../../../Components/Praticien/TemplateFormModal';
import PraticienLayout from '../../../Layouts/PraticienLayout';
import { useTranslation } from '../../../i18n';
```

Remplacer `TemplateCard` :

```jsx
function TemplateCard({ template, onEdit, onDelete, t }) {
    const mouvementCount = template.items.filter((item) => item.pillar === 'mouvement').length;
    const nutritionCount = template.items.filter((item) => item.pillar === 'nutrition').length;
    const itemTitles = [...new Set(template.items.map((item) => item.title))];

    return (
        <div className="rounded-2xl bg-white px-5.5 py-4 shadow-lg shadow-forest/20">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="mb-1 text-base font-semibold text-forest">{template.title}</h2>
                    {template.description && <p className="text-sm text-forest/60">{template.description}</p>}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    {mouvementCount > 0 && (
                        <span className="rounded-full bg-sand px-2.5 py-0.75 text-xs font-semibold whitespace-nowrap text-forest">
                            {mouvementCount} {t('mouvement')}
                        </span>
                    )}
                    {nutritionCount > 0 && (
                        <span className="rounded-full bg-sage/15 px-2.5 py-0.75 text-xs font-semibold whitespace-nowrap text-forest">
                            {nutritionCount} {t('nutrition')}
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={onEdit}
                        aria-label={t('Modifier le modèle')}
                        className="flex size-8 items-center justify-center rounded-lg text-forest/50 hover:bg-sage/10 hover:text-forest"
                    >
                        <Pencil size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        aria-label={t('Supprimer le modèle')}
                        className="flex size-8 items-center justify-center rounded-lg text-forest/50 hover:bg-terracotta/10 hover:text-terracotta"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
                {itemTitles.map((item) => (
                    <span key={item} className="rounded-full bg-sand/30 px-2.5 py-1 text-xs text-forest/70">
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
}
```

Remplacer le composant `ProtocolesIndex` :

```jsx
export default function ProtocolesIndex({ templates }) {
    const [formTemplate, setFormTemplate] = useState(undefined);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const { t } = useTranslation();

    function confirmDelete() {
        setDeleting(true);
        router.delete(`/praticien/protocoles/${deleteTarget.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    }

    return (
        <PraticienLayout title={t('Protocoles')}>
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="font-display mb-1 text-2xl font-semibold text-forest">{t('Protocoles')}</h1>
                    <p className="text-sm text-forest/60">{t('Modèles réutilisables, applicables en un clic depuis la fiche d’un patient.')}</p>
                </div>

                <button
                    type="button"
                    onClick={() => setFormTemplate(null)}
                    className="flex items-center gap-1.5 rounded-xl bg-forest px-4.5 py-2.75 text-sm font-semibold text-cream hover:opacity-90"
                >
                    <Plus size={16} />
                    {t('Nouveau modèle')}
                </button>
            </div>

            {templates.length === 0 ? (
                <div className="rounded-2xl bg-white px-6 py-16 text-center">
                    <p className="mb-1 text-base font-semibold text-forest">{t('Aucun modèle pour l’instant')}</p>
                    <p className="text-sm text-forest/60">{t('Créez votre premier modèle avec le bouton ci-dessus.')}</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {templates.map((template) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onEdit={() => setFormTemplate(template)}
                            onDelete={() => setDeleteTarget(template)}
                            t={t}
                        />
                    ))}
                </div>
            )}

            <TemplateFormModal open={formTemplate !== undefined} onClose={() => setFormTemplate(undefined)} template={formTemplate} />

            <ConfirmModal
                open={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                processing={deleting}
                title={t('Supprimer ce modèle ?')}
                message={deleteTarget ? t('« :title » sera définitivement supprimé. Cette action est irréversible.', { title: deleteTarget.title }) : ''}
                confirmLabel={t('Supprimer')}
            />
        </PraticienLayout>
    );
}
```

- [ ] **Step 3: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi (`TemplateFormModal` n'est pas encore traduit — Task 11 — mais reste fonctionnel tel quel, en français, sans erreur de compilation).

- [ ] **Step 4: Commit**

```bash
git add resources/js/Components/Praticien/ConfirmModal.jsx resources/js/Pages/Praticien/Protocoles/Index.jsx
git commit -m "feat(i18n): translate the protocol templates list page"
```

---

### Task 11: `TemplateFormModal`

**Files:**
- Modify: `resources/js/Components/Praticien/TemplateFormModal.jsx`

**Interfaces:**
- Consumes: `useTranslation()`, `<Modal>` (Task 2), clés Task 1 (`Titre du modèle`, `Description`, `Items`, `Titre`, `Ajouter un item`, …). Réutilise `Mouvement`/`Nutrition` (Task 1), `Lun`…`Dim` (sous-projet 1), `Tous les jours`/`Ajouter` (Task 1, déjà utilisées Task 8).

- [ ] **Step 1: Traduire `TemplateFormModal`**

Ajouter l'import :

```jsx
import { useForm } from '@inertiajs/react';
import { Plus, X } from 'lucide-react';
import { useEffect } from 'react';
import Modal from '../Modal';
import { useTranslation } from '../../i18n';
```

Remplacer la constante `DAYS` par une fonction (même pattern que Task 8) :

```jsx
function days(t) {
    return [
        { value: 1, label: t('Lun') },
        { value: 2, label: t('Mar') },
        { value: 3, label: t('Mer') },
        { value: 4, label: t('Jeu') },
        { value: 5, label: t('Ven') },
        { value: 6, label: t('Sam') },
        { value: 7, label: t('Dim') },
    ];
}
```

`EMPTY_ITEM`, `inputClass`, `groupItemsForForm`, `flattenItems` restent inchangés (aucun texte en dur).

Remplacer `ItemRow` :

```jsx
function ItemRow({ item, onChange, onRemove, canRemove, t }) {
    const isMouvement = item.pillar === 'mouvement';
    const DAYS = days(t);

    function set(field, value) {
        onChange({ ...item, [field]: value });
    }

    function toggleDay(day) {
        set('days', item.days.includes(day) ? item.days.filter((d) => d !== day) : [...item.days, day].sort());
    }

    return (
        <div className="rounded-xl border border-sand/50 p-3.5">
            <div className="mb-2 flex flex-wrap items-start gap-2">
                <select value={item.pillar} onChange={(e) => set('pillar', e.target.value)} className={inputClass + ' shrink-0'}>
                    <option value="mouvement">{t('Mouvement')}</option>
                    <option value="nutrition">{t('Nutrition')}</option>
                </select>
                <input
                    type="text"
                    placeholder={t('Titre')}
                    value={item.title}
                    onChange={(e) => set('title', e.target.value)}
                    className={inputClass + ' min-w-0 flex-1 basis-40'}
                />
                <button
                    type="button"
                    onClick={onRemove}
                    disabled={!canRemove}
                    className="shrink-0 rounded-lg p-1.5 text-forest/40 hover:bg-terracotta/10 hover:text-terracotta disabled:opacity-30"
                >
                    <X size={16} />
                </button>
            </div>

            {isMouvement && (
                <div className="mb-2 flex flex-wrap gap-2">
                    <input
                        type="number"
                        min="1"
                        placeholder={t('Séries')}
                        value={item.sets}
                        onChange={(e) => set('sets', e.target.value)}
                        className={inputClass + ' min-w-0 flex-1 basis-24'}
                    />
                    <input
                        type="text"
                        placeholder="12 reps, 30 min…"
                        value={item.reps}
                        onChange={(e) => set('reps', e.target.value)}
                        className={inputClass + ' min-w-0 flex-1 basis-40'}
                    />
                </div>
            )}

            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-forest">
                <input
                    type="checkbox"
                    checked={item.permanent}
                    onChange={(e) => set('permanent', e.target.checked)}
                    className="size-3.5 accent-sage"
                />
                {t('Tous les jours')}
            </label>

            {!item.permanent && (
                <div className="flex flex-wrap gap-1">
                    {DAYS.map((day) => (
                        <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleDay(day.value)}
                            className={
                                'rounded-full px-2.5 py-1 text-xs font-semibold ' +
                                (item.days.includes(day.value) ? 'bg-forest text-cream' : 'bg-sand/40 text-forest')
                            }
                        >
                            {day.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
```

(`placeholder="12 reps, 30 min…"` reste littéral — texte d'exemple, même traitement que le reste des placeholders d'exemple du projet.)

Remplacer le début du composant `TemplateFormModal` et son JSX :

```jsx
export default function TemplateFormModal({ open, onClose, template }) {
    const isEdit = Boolean(template);
    const { t } = useTranslation();
    const { data, setData, post, put, transform, processing, errors, reset } = useForm({
        title: '',
        description: '',
        items: [{ ...EMPTY_ITEM }],
    });

    useEffect(() => {
        if (!open) return;

        if (template) {
            setData({
                title: template.title,
                description: template.description ?? '',
                items: groupItemsForForm(template.items),
            });
        } else {
            setData({ title: '', description: '', items: [{ ...EMPTY_ITEM }] });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, template]);

    function updateItem(index, newItem) {
        const items = [...data.items];
        items[index] = newItem;
        setData('items', items);
    }

    function addItem() {
        setData('items', [...data.items, { ...EMPTY_ITEM }]);
    }

    function removeItem(index) {
        setData('items', data.items.filter((_, i) => i !== index));
    }

    function close() {
        reset();
        onClose();
    }

    const canSubmit =
        data.title.trim() !== '' &&
        data.items.some((item) => item.title.trim() !== '') &&
        data.items.every((item) => item.title.trim() === '' || item.permanent || item.days.length > 0);

    function submit(e) {
        e.preventDefault();

        transform((formData) => ({
            title: formData.title,
            description: formData.description,
            items: flattenItems(formData.items),
        }));

        const options = { preserveScroll: true, onSuccess: close };

        if (isEdit) {
            put(`/praticien/protocoles/${template.id}`, options);
        } else {
            post('/praticien/protocoles', options);
        }
    }

    return (
        <Modal open={open} onClose={close} title={isEdit ? t('Modifier le modèle') : t('Nouveau modèle')} maxWidth={560}>
            <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                    <label htmlFor="template-title" className="mb-1 block text-sm font-semibold text-forest">
                        {t('Titre du modèle')}
                    </label>
                    <input
                        id="template-title"
                        type="text"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        className={inputClass + ' w-full'}
                    />
                    {errors.title && <p className="mt-1 text-sm text-terracotta">{errors.title}</p>}
                </div>

                <div>
                    <label htmlFor="template-description" className="mb-1 block text-sm font-semibold text-forest">
                        {t('Description')}
                    </label>
                    <textarea
                        id="template-description"
                        rows={2}
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        className={inputClass + ' w-full'}
                    />
                </div>

                <div>
                    <p className="mb-2 text-sm font-semibold text-forest">{t('Items')}</p>
                    <div className="flex max-h-80 flex-col gap-2.5 overflow-y-auto pe-1">
                        {data.items.map((item, index) => (
                            <ItemRow
                                key={index}
                                item={item}
                                onChange={(newItem) => updateItem(index, newItem)}
                                onRemove={() => removeItem(index)}
                                canRemove={data.items.length > 1}
                                t={t}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addItem}
                        className="mt-2.5 flex items-center gap-1.5 text-sm font-semibold text-forest hover:text-sage"
                    >
                        <Plus size={16} />
                        {t('Ajouter un item')}
                    </button>

                    {errors.items && <p className="mt-2 text-sm text-terracotta">{t('Merci de vérifier les items du modèle.')}</p>}
                </div>

                <button
                    type="submit"
                    disabled={processing || !canSubmit}
                    className="rounded-xl bg-forest py-2.75 text-sm font-semibold text-cream disabled:opacity-50"
                >
                    {isEdit ? t('Enregistrer') : t('Créer le modèle')}
                </button>
            </form>
        </Modal>
    );
}
```

Note : `pr-1` → `pe-1` (RTL logique) sur le conteneur scrollable de la liste d'items.

- [ ] **Step 2: Lancer la suite backend, vérifier qu'elle passe toujours**

Run: `php artisan test`
Expected: PASS.

- [ ] **Step 3: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 4: Vérification manuelle**

`http://127.0.0.1:8000/praticien/protocoles`, basculer en arabe :
- Liste des modèles : compteurs "X رياضة"/"X أكل" traduits, boutons d'action (modifier/supprimer) avec aria-labels traduits.
- Ouvrir "Nouveau modèle" : formulaire traduit, sélecteur Mouvement/Nutrition traduit, sélecteurs de jour traduits, liste scrollable alignée à droite (`pe-1`).
- Supprimer un modèle : `ConfirmModal` traduite (Task 10), message avec le titre du modèle interpolé correctement en arabe.
- Basculer en FR : identique à avant ce plan.

- [ ] **Step 5: Commit**

```bash
git add resources/js/Components/Praticien/TemplateFormModal.jsx
git commit -m "feat(i18n): translate and mirror the template form modal"
```

---

### Task 12: Messagerie praticien

**Files:**
- Modify: `app/Http/Controllers/Praticien/MessageController.php`
- Modify: `resources/js/Pages/Praticien/Messages/Index.jsx`

**Interfaces:**
- Consumes: `useTranslation()`, clés Task 1 (`Envoyer`, `Sélectionnez un patient…`, …), clé `Écrire un message…` (sous-projet 1, réutilisée), `Messages` (réutilisée).

- [ ] **Step 1: Rendre la date des messages sensible à la locale**

Dans `app/Http/Controllers/Praticien/MessageController.php`, remplacer :

```php
                    'createdAt' => $m->created_at->locale('fr')->translatedFormat('d M à H:i'),
```

par :

```php
                    'createdAt' => $m->created_at->locale(app()->getLocale())->translatedFormat('d M à H:i'),
```

- [ ] **Step 2: Traduire la page Messages praticien**

Ajouter l'import :

```jsx
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { useEffect, useRef } from 'react';
import PraticienLayout from '../../../Layouts/PraticienLayout';
import { useTranslation } from '../../../i18n';
```

Remplacer `Composer` :

```jsx
function Composer({ patientId, t }) {
    const { data, setData, post, processing, reset } = useForm({ body: '' });
    const inputRef = useRef(null);

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            inputRef.current?.scrollIntoView({ block: 'end', behavior: 'auto' });
            inputRef.current?.blur();
        });

        return () => cancelAnimationFrame(frame);
    }, [patientId]);

    function submit(e) {
        e.preventDefault();
        post(`/praticien/messages/${patientId}`, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    return (
        <form onSubmit={submit} className="flex shrink-0 gap-2.5 border-t border-sand/50 px-6 py-4">
            <input
                ref={inputRef}
                type="text"
                placeholder={t('Écrire un message…')}
                value={data.body}
                onChange={(e) => setData('body', e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-sand bg-white px-3.5 py-2.5 text-sm text-forest focus:ring-2 focus:ring-sage focus:outline-none"
            />
            <button
                type="submit"
                disabled={processing || !data.body}
                aria-label={t('Envoyer')}
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest disabled:opacity-50"
            >
                <Send size={18} strokeWidth={1.7} className="text-cream" />
            </button>
        </form>
    );
}
```

(Le commentaire explicatif au-dessus du `useEffect`, inchangé, n'est pas reproduit ici pour la lisibilité du diff — le laisser tel quel dans le fichier.)

Remplacer `ConversationPanel` :

```jsx
function ConversationPanel({ activePatient, messages, visible, t }) {
    const listRef = useRef(null);

    useEffect(() => {
        if (!activePatient || !listRef.current) return;
        listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [activePatient?.id, messages.length]);

    return (
        <div
            className={
                (visible ? 'flex' : 'hidden') +
                ' -mx-4 -mt-6 -mb-10 h-[calc(100vh-56px)] flex-1 flex-col bg-white sm:-mx-7' +
                ' lg:mx-0 lg:my-0 lg:flex lg:h-auto lg:rounded-2xl lg:shadow-lg lg:shadow-forest/20'
            }
        >
            <div className="flex shrink-0 items-center gap-3 border-b border-sand/50 px-4 py-4 sm:px-6">
                <Link href="/praticien/messages" className="shrink-0 rounded-lg p-1 text-forest hover:bg-cream/60 lg:hidden">
                    <ArrowLeft size={20} />
                </Link>

                {activePatient ? (
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sage/15 text-sm font-bold text-forest">
                            {activePatient.initials}
                        </div>
                        <h2 className="font-display truncate text-lg font-semibold text-forest">{activePatient.name}</h2>
                    </div>
                ) : (
                    <h2 className="font-display text-lg font-semibold text-forest">{t('Messages')}</h2>
                )}
            </div>

            <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                {!activePatient && (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <MessageSquare className="mb-3 text-forest/30" size={36} />
                        <p className="text-sm text-forest/60">{t('Sélectionnez un patient pour voir la conversation.')}</p>
                    </div>
                )}

                {activePatient && messages.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <p className="text-sm text-forest/60">{t('Aucun message pour l’instant, commencez la conversation.')}</p>
                    </div>
                )}

                {activePatient && messages.map((m) => <MessageBubble key={m.id} message={m} />)}
            </div>

            {activePatient && <Composer patientId={activePatient.id} t={t} />}
        </div>
    );
}
```

Remplacer `ConversationsList`, en particulier le badge de messages non lus (`-top-1 -right-1` physique → `-top-1 -end-1` logique) :

```jsx
function ConversationsList({ conversations, activePatientId, visible, t }) {
    return (
        <div
            className={
                (visible ? 'flex' : 'hidden') +
                ' -mx-4 -mt-6 -mb-10 h-[calc(100vh-56px)] w-full shrink-0 flex-col bg-white sm:-mx-7' +
                ' lg:mx-0 lg:my-0 lg:flex lg:h-auto lg:w-72 lg:rounded-2xl lg:shadow-lg lg:shadow-forest/20'
            }
        >
            <div className="shrink-0 border-b border-sand/50 px-5 py-4">
                <h3 className="font-display text-base font-semibold text-forest">{t('Patients')}</h3>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
                {conversations.length === 0 && <p className="px-5 py-6 text-sm text-forest/60">{t('Aucun patient pour l’instant.')}</p>}

                {conversations.map((c) => (
                    <Link
                        key={c.id}
                        href={`/praticien/messages/${c.id}`}
                        className={
                            'flex items-center gap-3 border-b border-sand/30 px-5 py-3.5 last:border-0 ' +
                            (c.id === activePatientId ? 'bg-sage/10' : 'hover:bg-cream/60')
                        }
                    >
                        <div className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-sage/15 text-sm font-bold text-forest">
                            {c.initials}
                            {c.unreadCount > 0 && (
                                <span className="absolute -top-1 -end-1 flex size-4 items-center justify-center rounded-full bg-terracotta text-xs font-bold text-white">
                                    {c.unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <span className="truncate text-sm font-semibold text-forest">{c.name}</span>
                                {c.lastMessageAt && <span className="shrink-0 text-xs text-forest/40">{c.lastMessageAt}</span>}
                            </div>
                            <p className="truncate text-xs text-forest/60">{c.lastMessage ?? t('Aucun message')}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
```

Remplacer `MessagesIndex` :

```jsx
export default function MessagesIndex({ conversations, activePatient, messages }) {
    const { t } = useTranslation();

    return (
        <PraticienLayout title={t('Messages')}>
            <div className="flex flex-col gap-5 lg:h-[calc(100vh-150px)] lg:flex-row">
                <ConversationPanel activePatient={activePatient} messages={messages} visible={Boolean(activePatient)} t={t} />
                <ConversationsList conversations={conversations} activePatientId={activePatient?.id} visible={!activePatient} t={t} />
            </div>
        </PraticienLayout>
    );
}
```

`MessageBubble` reste inchangé (aucun texte en dur — `message.body`/`message.createdAt` viennent des props).

- [ ] **Step 3: Lancer la suite backend, vérifier qu'elle passe toujours**

Run: `php artisan test`
Expected: PASS.

- [ ] **Step 4: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 5: Vérification manuelle**

`http://127.0.0.1:8000/praticien/messages`, basculer en arabe :
- Liste des conversations à droite (RTL), badge de messages non lus du bon côté de l'avatar.
- Ouvrir une conversation : en-tête, champ de saisie, bouton d'envoi traduits.
- Horodatage des messages en arabe (mois/heure traduits).
- Basculer en FR : identique à avant ce plan.

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/Praticien/MessageController.php resources/js/Pages/Praticien/Messages/Index.jsx
git commit -m "feat(i18n): translate and mirror the praticien messages page"
```

---

### Task 13: `ObservanceBar` — vérification RTL

**Files:**
- Modify: `resources/js/Components/Praticien/ObservanceBar.jsx`

**Interfaces:**
- Consumes: clé `Observance — 7 derniers jours` (nouvelle — absente de Task 1, ajoutée ici car identifiée tardivement pendant la lecture de ce composant).

- [ ] **Step 1: Ajouter la clé de traduction manquante**

Dans `lang/ar.json`, ajouter (avec les autres entrées, ordre indifférent) :

```json
    "Observance — 7 derniers jours": "الالتزام — آخر 7 أيام",
```

- [ ] **Step 2: Traduire `ObservanceBar`**

Remplacer `resources/js/Components/Praticien/ObservanceBar.jsx` :

```jsx
import { useTranslation } from '../../i18n';

export default function ObservanceBar({ value }) {
    const { t } = useTranslation();

    if (value === null || value === undefined) {
        return (
            <div>
                <div className="mb-1.5 text-xs text-forest/50">{t('Observance — 7 derniers jours')}</div>
                <div className="h-2 rounded-full bg-sand/40" />
                <div className="mt-1 text-xs text-forest/50">{t('Pas de protocole actif')}</div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between gap-2 text-xs text-forest/50">
                <span>{t('Observance — 7 derniers jours')}</span>
                <span className="font-semibold text-forest">{value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-sand/40">
                <div className="h-full rounded-full bg-sage" style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}
```

`"Pas de protocole actif"` est une nouvelle clé également absente de Task 1 — l'ajouter dans le même diff `lang/ar.json` que l'étape 1 :

```json
    "Pas de protocole actif": "ما فما برنامج ناشط",
```

**Vérification du sens de remplissage (pas de changement de code) :** la barre de remplissage (`<div style={{ width: '${value}%' }} />`) est un bloc en flux normal, sans `position`/`float` explicite — son bord de départ suit automatiquement `dir` (bord gauche en LTR, bord droit en RTL) sans classe logique à ajouter. Confirmé visuellement à l'étape 4.

- [ ] **Step 3: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 4: Vérification manuelle**

`http://127.0.0.1:8000/praticien/patients`, basculer en arabe :
- Sur une carte patient avec observance renseignée, la barre se remplit depuis la droite (bord de départ RTL), pas depuis la gauche.
- Sur un patient sans protocole actif, le texte "ما فما برنامج ناشط" s'affiche à la place de la barre.

- [ ] **Step 5: Commit**

```bash
git add lang/ar.json resources/js/Components/Praticien/ObservanceBar.jsx
git commit -m "feat(i18n): translate the observance bar and confirm its RTL fill direction"
```

---

### Task 14: Vérification finale bilingue + régression patient/publique

**Files:** aucun (tâche de vérification et de clôture).

- [ ] **Step 1: Réinitialiser et reseeder la base locale**

Run: `php artisan migrate:fresh --seed`
Expected: migrations + seed OK, aucune erreur.

- [ ] **Step 2: Lancer toute la suite de tests backend**

Run: `php artisan test`
Expected: PASS, tous les tests (y compris `PraticienLocaleTest`, `LocaleTest`, `PatientIsolationTest`).

- [ ] **Step 3: Build de production frontend**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 4: Parcours praticien complet en derja**

Démarrer `php artisan serve`, se connecter en tant que `praticien@fithealth.tn` / `password`, basculer en arabe via le sélecteur de la sidebar :
- [ ] Dashboard : stats, graphiques (tracé LTR, tooltips traduits), watchlist en arabe.
- [ ] Patients : filtres, cartes, badges de statut, ajout d'un nouveau patient (formulaire traduit).
- [ ] Fiche patient : en-tête, 3 onglets, section Vitalité, toutes les modals (Assigner un protocole, Ajouter un exercice/élément nutrition, Ajouter une consigne).
- [ ] Protocoles : liste des modèles, création/édition (`TemplateFormModal`), suppression (`ConfirmModal`).
- [ ] Messages : liste des conversations, envoi d'un message, horodatage en arabe.
- [ ] Réglages (placeholder) : titre traduit.
- [ ] Menu mobile (réduire la fenêtre) : s'ouvre du bon côté en RTL comme en LTR.

- [ ] **Step 5: Bascule de langue en cours de session**

Sur le dashboard praticien, cliquer "FR" dans le sélecteur :
- [ ] Toutes les pages repassent en français, LTR, sans avoir à se reconnecter.
- [ ] Se déconnecter puis se reconnecter : la langue choisie est mémorisée (persistée sur le compte, comme pour les patients depuis le sous-projet 1).

- [ ] **Step 6: Non-régression côté patient et page publique**

Se connecter en tant que `amina.trabelsi@example.com` / `password` (patiente, `locale=ar` par défaut) :
- [ ] Dashboard, programme, check-in, messages, sidebar patient : identiques à l'état laissé par le sous-projet 1 — aucun fichier `Patient/*`/`Components/Patient/*` n'a été modifié par ce plan (seul `Components/Modal.jsx`, partagé, a changé — vérifier qu'il n'est pas utilisé côté patient : `grep -rl "from '.*Components/Modal'" resources/js/Pages/Patient resources/js/Components/Patient` doit ne rien retourner, confirmant qu'aucune régression visuelle patient n'est possible via ce composant).

Ouvrir `/` en étant déconnecté :
- [ ] La page publique (`Public/Accueil.jsx`) reste non traduite (hors scope, sous-projet 3), comportement inchangé depuis le sous-projet 1.

- [ ] **Step 7: Commit final (si des ajustements ont été faits pendant la vérification)**

```bash
git add -A
git commit -m "chore(i18n): final QA pass for praticien i18n/RTL sub-project"
```

(Si aucun ajustement n'a été nécessaire, ce commit est à sauter.)

- [ ] **Step 8: Marquer le sous-projet comme terminé**

Mettre à jour le spec n'est pas nécessaire — le plan et son historique de commits en sont la trace. Le sous-projet 3 (site public, `Public/Accueil.jsx`) suit le même cycle spec → plan → implémentation, en réutilisant telle quelle l'infrastructure posée au sous-projet 1 et confirmée applicable à un second périmètre par ce sous-projet 2.
