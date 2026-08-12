# Fondations i18n/RTL + refonte espace patient — design

Date : 2026-08-12
Sous-projet 1 sur 3 (voir "Décomposition" ci-dessous).

## Contexte

Le praticien qui utilise FitHealth rapporte qu'une grande partie de ses
patients (60-70%) sont peu ou pas à l'aise avec la lecture. L'application est
aujourd'hui entièrement en français écrit, avec une interface dense pensée
pour un usage professionnel côté praticien et reprise telle quelle côté
patient. Deux besoins en découlent :

1. Rendre l'app compréhensible en derja tunisienne (langue orale/écrite du
   quotidien), en plus du français, avec un français lui-même simplifié.
2. Refaire le design pour qu'il s'appuie davantage sur des repères visuels
   (icônes, couleur, hiérarchie) que sur la lecture de texte.

## Décomposition en sous-projets

Le périmètre complet (bilingue + redesign sur toute l'app : espace patient,
espace praticien, site public) est trop large pour un seul plan
d'implémentation. Découpage retenu, chaque sous-projet ayant son propre cycle
spec → plan → implémentation :

1. **Ce spec** — fondations techniques (i18n, RTL, police) + application
   complète au périmètre où la valeur est la plus haute : l'espace patient
   (dashboard, protocole, check-in, messagerie, sidebar) et la page de
   connexion (point de passage obligé pour y arriver).
2. Espace praticien — même traitement (design + bilingue), réutilise
   l'infrastructure posée ici.
3. Site public (page vitrine `Public/Accueil.jsx`, ~960 lignes) — idem.

Audio/synthèse vocale explicitement écarté pour l'instant (voir "Décisions
prises pendant le brainstorming").

## Décisions prises pendant le brainstorming

- **Derja en alphabet arabe** (RTL), pas en arabizi latin.
- **Périmètre visuel/bilingue final = toute l'application**, mais on
  l'implémente en 3 sous-projets séquentiels ; celui-ci couvre l'espace
  patient.
- **Préférence de langue sauvegardée sur le compte** (colonne `users.locale`),
  pas seulement en session — un patient retrouve sa langue sur n'importe quel
  appareil.
- **Aide visuelle retenue : icônes + texte court partout.** Pas de synthèse
  vocale dans ce sous-projet (peut être ajouté plus tard si le besoin
  persiste après la mise en place du bilingue + icônes).
- **Direction visuelle : Style A ("Sauge doux")** — cartes blanches sur fond
  crème, couleur en accent (pas de blocs de couleur pleine par pilier).
  Évolution douce de la charte existante (forest/sage/cream/sand/terracotta
  inchangés), plus d'air, cibles tactiles plus grandes, pattern icône +
  libellé court.
- **Mise en page miroir automatique pour le RTL** : mêmes composants, mêmes
  couleurs, seule l'orientation change (`dir="rtl"`/`"ltr"` + classes
  Tailwind logiques). Pas de jeu de composants séparé par langue.
- **Police arabe : Cairo**, à côté de Fraunces (titres, LTR uniquement) et
  Hanken Grotesk (texte, LTR).
- **Nouveaux patients créés en derja par défaut**, modifiable par le
  praticien au moment de la création ou ensuite.

## Architecture

### 1. Modèle de données

- Nouvel enum backed `App\Enums\Locale` : `case Fr = 'fr'; case Ar = 'ar';`
  (même convention que `Role`, `Sex`, `Pillar`...).
- Migration : ajoute `locale` (string/enum, non nul, défaut `'fr'`) à
  `users`. Défaut `'fr'` au niveau colonne pour rester cohérent avec les
  comptes praticien ; le défaut `'ar'` pour les nouveaux patients est une
  règle applicative dans `PatientsController@store` /
  `StorePatientRequest`, pas un défaut de colonne.
- `User::casts()` : ajoute `'locale' => Locale::class`.
- `database/factories/UserFactory.php` : vérifier/ajouter un défaut
  cohérent (`fr` pour `praticien()`, `ar` pour `patient()`) pour que les
  tests et le seeder restent représentatifs.

### 2. Résolution de la langue (backend)

- Nouveau middleware `App\Http\Middleware\SetLocale`, à responsabilité
  unique (même esprit que `EnsureUserHasRole`) :
  - utilisateur connecté → `App::setLocale($request->user()->locale->value)`
  - invité → `App::setLocale(session('locale', 'fr'))`
- Enregistré dans le groupe `web` (`bootstrap/app.php`), avant
  `HandleInertiaRequests`, pour que la locale soit fixée avant que les props
  partagées et la vue Blade ne soient construites.
- `HandleInertiaRequests::share()` ajoute :
  ```php
  'locale' => [
      'current' => app()->getLocale(),
      'direction' => app()->getLocale() === 'ar' ? 'rtl' : 'ltr',
  ],
  'translations' => json_decode(
      file_get_contents(lang_path(app()->getLocale().'.json')),
      true
  ) ?? [],
  ```
  Lecture directe du fichier JSON de la locale courante (pas d'API Laravel
  dédiée à l'export du fichier JSON en tableau) — mis en cache applicatif
  (`Cache::rememberForever` ou équivalent) si la lecture disque à chaque
  requête s'avère mesurable en pratique, sinon lecture directe suffit vu la
  taille du dictionnaire.
- Nouvelle route `POST /langue` → `LocaleController@update` :
  - valide `locale` contre l'enum,
  - si connecté : `$request->user()->update(['locale' => ...])`,
  - sinon : `session(['locale' => ...])`,
  - `back()`.
  - Accessible sans middleware de rôle (fonctionne pour praticien, patient,
    et invité sur la page de connexion).

### 3. Traductions — source unique

- `lang/fr.json` et `lang/ar.json`, format JSON standard Laravel.
- Convention : la clé de traduction est la phrase française par défaut
  (ex. `__('Bonjour, :name')`). En français, `__()` retourne la clé telle
  quelle si `fr.json` ne la surcharge pas (utile pour ne pas dupliquer
  inutilement du contenu identique) ; en derja, `ar.json` fournit la
  traduction.
- Backend : tous les libellés actuellement en dur dans les contrôleurs du
  périmètre (`Patient\DashboardController`, `CheckInController`,
  `MessageController`, `ProtocolController`, `ProtocolLogController`,
  `AuthController`) passent par `__()`. Concerne notamment :
  - `nextCheckInLabel` ("Premier check-in à faire", "Check-in disponible",
    "Prochain check-in dans :n jours"...)
  - message d'erreur de connexion
  - séparateurs de date de la messagerie
- Frontend : `resources/js/i18n.js` — hook `useTranslation()` exposant
  `t(key, params?)` :
  - lit `usePage().props.translations` et `locale.current`,
  - `t()` cherche `translations[key]`, retombe sur `key` si absent (donc le
    français "juste marcher" même si une clé n'a pas encore de traduction
    arabe ajoutée),
  - remplace les placeholders `:xxx` par les valeurs de `params`, même
    convention que le backend.
- Pas de librairie i18n externe (react-i18next, etc.) — volume de texte
  gérable avec cet utilitaire maison, cohérent avec le reste du projet
  (pas de dépendances superflues).

### 4. RTL et police

- `resources/views/app.blade.php` :
  - `<html lang="{{ app()->getLocale() }}" dir="{{ app()->getLocale() === 'ar' ? 'rtl' : 'ltr' }}">`
  - ajout de Cairo au `<link>` Google Fonts existant (même mécanisme que
    Fraunces/Hanken Grotesk aujourd'hui, pas d'auto-hébergement).
- `resources/css/app.css` — bascule automatique des tokens de police en RTL,
  sans toucher aux composants :
  ```css
  [dir='rtl'] {
      --font-display: 'Cairo', sans-serif;
      --font-sans: 'Cairo', sans-serif;
  }
  ```
- `resources/js/app.jsx` : à chaque navigation Inertia (événement
  `router.on('navigate')` ou équivalent), synchronise
  `document.documentElement.lang` / `.dir` avec `page.props.locale` — le
  `<html>` initial vient de Blade (premier chargement complet), mais une
  navigation SPA ne re-rend pas le document, donc un changement de langue en
  cours de session doit être répercuté manuellement.
- Dans les fichiers du périmètre (voir section 6), remplacement des classes
  Tailwind physiques (`pl-`, `pr-`, `ml-`, `mr-`, `left-`, `right-`,
  `text-left`, `text-right`) par leurs équivalents logiques (`ps-`, `pe-`,
  `ms-`, `me-`, `start-`, `end-`, `text-start`, `text-end`) — fait au fil de
  la réécriture de ces écrans pour le nouveau design, pas une passe séparée.

### 5. Composants de design

- Nouveau composant partagé `Components/Patient/ChecklistItem.jsx` :
  icône (carré arrondi coloré, ~44px) + titre court + case à cocher/bouton
  toggle. Remplace le rendu actuel des items du protocole sur le Dashboard et
  la page Protocole.
- Icône choisie **par pilier** (`mouvement` / `nutrition`), pas par exercice
  individuel — un titre de protocole est du texte libre saisi par le
  praticien, non mappable de façon fiable à une icône précise. Une consigne
  de vitalité a sa propre icône générique (ex. lune/cœur). Mapping simple en
  dur (3-4 entrées), via `lucide-react` (déjà une dépendance) — pas de
  nouvelle librairie d'icônes.
- Style A appliqué : cartes blanches (`bg-white`, `shadow-forest/25`
  existant), plus d'espace, cibles tactiles ≥ 44px, cases à cocher plus
  grandes. Palette et rayon (`--radius: 14px`) inchangés.
- Sélecteur de langue : petit toggle "FR / عربي" dans le pied de la sidebar
  patient (`Components/Patient/Sidebar.jsx`) et dans l'en-tête de la page de
  connexion (`Pages/Auth/Login.jsx`) — soumet vers `POST /langue`.

### 6. Fichiers concernés (périmètre patient)

Backend :
- `app/Enums/Locale.php` (nouveau)
- migration `add_locale_to_users_table`
- `app/Http/Middleware/SetLocale.php` (nouveau)
- `app/Http/Controllers/LocaleController.php` (nouveau) + route `POST /langue`
- `app/Http/Middleware/HandleInertiaRequests.php`
- `app/Http/Controllers/AuthController.php`
- `app/Http/Controllers/Patient/DashboardController.php`
- `app/Http/Controllers/Patient/CheckInController.php`
- `app/Http/Controllers/Patient/MessageController.php`
- `app/Http/Controllers/Patient/ProtocolLogController.php`
- `app/Http/Requests/StorePatientRequest.php` (défaut `locale = ar` à la
  création si non fourni)
- `app/Models/User.php` (cast `locale`)
- `database/factories/UserFactory.php`
- `lang/fr.json`, `lang/ar.json` (nouveaux)
- `config/app.php` / `.env.example` (`APP_FALLBACK_LOCALE=fr`, cohérence —
  actuellement `en` dans `.env.example` alors que `render.yaml` a déjà `fr`)

Frontend :
- `resources/js/i18n.js` (nouveau)
- `resources/js/app.jsx`
- `resources/views/app.blade.php`
- `resources/css/app.css`
- `resources/js/Layouts/PatientLayout.jsx`
- `resources/js/Components/Patient/Sidebar.jsx`
- `resources/js/Components/Patient/ChecklistItem.jsx` (nouveau)
- `resources/js/Pages/Auth/Login.jsx`
- `resources/js/Pages/Patient/Dashboard.jsx`
- `resources/js/Pages/Patient/Protocole/Index.jsx`
- `resources/js/Pages/Patient/CheckIn/Index.jsx`
- `resources/js/Pages/Patient/Messages/Index.jsx`

Hors périmètre de ce sous-projet (traités plus tard) : tout
`Components/Praticien/*`, `Pages/Praticien/*`, `Layouts/PraticienLayout.jsx`,
`Pages/Public/Accueil.jsx`, `Components/LoginModal.jsx` et
`Components/ParcoursModal.jsx` s'ils ne sont utilisés que par la page
publique (à vérifier pendant le plan).

## Contenu des traductions

Les traductions derja (`lang/ar.json`) et le français simplifié
(`lang/fr.json`) seront rédigés pendant l'implémentation, phrase par phrase,
pour chaque écran du périmètre.

**Point ouvert, non bloquant** : ces traductions derja sont rédigées par un
assistant IA non-locuteur natif. Elles seront grammaticalement correctes et
d'un tunisien standard écrit, mais devraient être relues par un locuteur natif
(le praticien ou un membre de son équipe) avant qu'un vrai patient ne les
voie. Ça n'empêche pas de construire et livrer l'infrastructure.

## Tests

- `tests/Feature/LocaleTest.php` (nouveau) :
  - un invité qui `POST /langue` avec `ar` reçoit ensuite des props Inertia
    avec `locale.current === 'ar'` et `locale.direction === 'rtl'` ;
  - un patient connecté qui change de langue voit son changement persisté en
    base (`users.locale`) et restitué à la requête suivante ;
  - la validation rejette une valeur hors enum.
- Pas de test automatisé du rendu visuel/RTL — vérification manuelle en
  navigateur (LTR et RTL) sur chaque écran du périmètre.

## Hors scope (explicitement, pour ce sous-projet)

- Espace praticien, page publique — sous-projets 2 et 3.
- Synthèse vocale / lecture audio.
- Auto-hébergement des polices (on garde le CDN Google Fonts, cohérent avec
  l'existant).
- Détection automatique d'icône par titre d'exercice (mapping reste au
  niveau du pilier).
