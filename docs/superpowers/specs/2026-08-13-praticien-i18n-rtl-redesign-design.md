# Espace praticien — i18n/RTL + refonte visuelle — design

Date : 2026-08-13
Sous-projet 2 sur 3 (voir `docs/superpowers/specs/2026-08-12-patient-i18n-rtl-redesign-design.md`,
section "Décomposition en sous-projets").

## Contexte

Sous-projet 1 a posé toute l'infrastructure bilingue/RTL (enum `Locale`,
middleware `SetLocale`, route `POST /langue`, dictionnaires
`lang/fr.json`/`lang/ar.json`, hook `useTranslation()`, composant
`LanguageSwitcher`, tokens de police RTL, classes Tailwind logiques) et
l'a appliquée à l'espace patient. Ce sous-projet applique le même
traitement à l'espace praticien : 5 pages, 11 composants (dont 3 graphiques
Chart.js), ~2 160 lignes — environ le double du périmètre patient.

Contrairement à l'espace patient, l'espace praticien est aujourd'hui
utilisé uniquement en français (aucun sélecteur de langue n'y est exposé),
par un praticien francophone. Décision prise pendant le brainstorming :
traiter cet espace en bilingue complet dès maintenant (voir "Décisions"),
plutôt que de limiter ce sous-projet à la refonte visuelle — l'équipe du
praticien (assistant·e, collègue) pourrait elle aussi avoir besoin de la
derja, et l'infrastructure est déjà en place.

## Décisions prises pendant le brainstorming

- **Bilingue complet**, comme le sous-projet 1 : toutes les chaînes de
  l'espace praticien passent par `__()`/`t()`, `lang/ar.json` reçoit les
  entrées manquantes, `LanguageSwitcher` est ajouté à la sidebar
  praticien (comme sur la sidebar patient).
- **Refonte visuelle adaptée par type d'écran**, pas un pattern unique :
  - Écrans déjà organisés en cartes/listes (dashboard, liste patients) :
    ajustements Style A (espacement, cartes blanches, rayon `14px`) —
    pas de reconstruction, ces écrans sont déjà proches du pattern cible.
  - Formulaires denses (protocoles, templates) : restent des formulaires,
    habillage Style A sur le chrome (modals, boutons, espacement), pas de
    conversion en icône+carte.
  - Le pattern icône-first `ChecklistItem` (sous-projet 1) n'est **pas**
    dupliqué ici — il est spécifique aux listes de consignes patient et ne
    correspond à aucun écran praticien.
- **Graphiques (Chart.js) toujours en LTR**, quelle que soit la langue du
  document : l'axe temporel garde son sens de lecture naturel
  gauche→droite (convention courante même dans les tableaux de bord
  arabophones — inverser une courbe de tendance serait déroutant, et
  Chart.js ne le supporte pas nativement). Seuls les libellés, légendes et
  tooltips sont traduits ; l'option `textDirection`/alignement de Chart.js
  peut aligner le texte des tooltips à droite en RTL sans toucher au tracé.

## Architecture

Aucune nouvelle pièce d'infrastructure : ce sous-projet consomme
intégralement ce que le sous-projet 1 a posé (voir son spec, section
"Architecture", pour le détail du middleware, de la route, du format des
dictionnaires et du hook `useTranslation()`). Le travail ici est un passage
de traduction + habillage visuel sur des écrans existants.

### 1. Backend — passage des chaînes en dur par `__()`

Contrôleurs concernés :
- `app/Http/Controllers/Praticien/DashboardController.php`
- `app/Http/Controllers/Praticien/PatientsController.php` — y compris
  `pillarsLabel()`, `daysLabel()` et la constante privée `DAY_LABELS`
  (actuellement du français en dur, indépendant de `WeekPlanBuilder`).
  Traduire ces méthodes referme au passage un scénario relevé par une revue
  de code sur le sous-projet 1 (page praticien affichée à moitié traduite
  si `locale=ar` sur un compte praticien) — sans qu'aucun garde-fou de rôle
  supplémentaire ne soit nécessaire sur `POST /langue`, puisque la page sera
  désormais entièrement traduite plutôt que partiellement.
- `app/Http/Controllers/Praticien/MessageController.php`
- `app/Http/Controllers/Praticien/ProtocolController.php`
- `app/Http/Controllers/Praticien/ProtocolItemController.php`
- `app/Http/Controllers/Praticien/ProtocolTemplatesController.php`
- `app/Http/Controllers/Praticien/VitaliteItemController.php`
- `app/Services/WeekPlanBuilder.php` — déjà `__()`-driven depuis le
  sous-projet 1 (partagé patient/praticien) ; vérifier la couverture
  complète, pas de nouveau travail attendu a priori.

`app/Http/Controllers/LocaleController.php` : **inchangé**. Pas de
restriction de rôle ajoutée — puisque l'espace praticien devient
entièrement traduit, un praticien en `locale=ar` obtient une page cohérente
de bout en bout.

### 2. Frontend — shell et navigation

- `resources/js/Components/Praticien/Sidebar.jsx` : ajout de
  `useTranslation()` + `<LanguageSwitcher tone="dark" />` (même
  emplacement que sur la sidebar patient), traduction des 5 libellés de nav
  + "Se déconnecter". Correction du même bug RTL latent que celui corrigé
  aujourd'hui sur la sidebar patient lors de la fusion avec `origin/master`
  (menu mobile) : `left-0`/`-translate-x-full` physiques →
  `start-0`/`-translate-x-full rtl:translate-x-full` logiques, `ml-2` →
  `ms-2`. Titre de marque harmonisé sur "FitHealth" (au lieu de "Doctor
  Panel"), cohérent avec la sidebar patient et la page de connexion.
- `resources/js/Layouts/PraticienLayout.jsx` : vérification des classes de
  padding (probable non-changement, comme `PatientLayout.jsx` au
  sous-projet 1).
- `resources/js/Pages/Praticien/Placeholder.jsx` (page `/praticien/reglages`) :
  traduction des quelques chaînes qu'elle contient.
- Document HTML, police Cairo, synchronisation `dir`/`lang` à la
  navigation : déjà globaux depuis le sous-projet 1 (Task 5), rien à
  refaire — un praticien en `locale=ar` hérite déjà du bon `dir` et de la
  bonne police dès ce sous-projet démarré.

### 3. Frontend — écrans, traitement par type

- `resources/js/Pages/Praticien/Dashboard.jsx` (`StatCard`/`ChartCard`) :
  structure de cartes conservée, traduction des libellés, légendes et
  tooltips des 3 graphiques (`Charts/GrowthChart.jsx`,
  `ObservanceChart.jsx`, `TierBreakdownChart.jsx`) passés par `t()` côté
  props construites en JS ou par `__()` côté backend selon l'origine de la
  donnée ; tracé toujours LTR (voir "Décisions").
- `resources/js/Pages/Praticien/Patients/Index.jsx` +
  `Components/Praticien/PatientCard.jsx` : déjà organisés en liste de
  cartes (pas de tableau) — passage de traduction + classes logiques sur
  les filtres, libellés de palier d'observance, états vides, bouton
  "Nouveau patient".
- `resources/js/Pages/Praticien/Patients/Show.jsx` (397 lignes) : la plus
  grosse page du périmètre — réutilise `WeekPlanBuilder` (déjà traduit) ;
  traduire l'en-tête patient, l'historique de check-in, la section
  vitalité, les boutons d'action. Découpée en 2-3 tâches dans le plan
  d'implémentation du fait de sa taille.
- `resources/js/Pages/Praticien/Protocoles/Index.jsx` +
  `Components/Praticien/AssignProtocolModal.jsx`/`AddItemModal.jsx`/
  `TemplateFormModal.jsx` (304 lignes pour ce dernier) : écrans de
  formulaire — traduction des libellés/placeholders, habillage Style A sur
  le chrome des modals (espacement, rayon), sans conversion en
  icône+carte.
- `resources/js/Pages/Praticien/Messages/Index.jsx` : même traitement que
  la messagerie patient au sous-projet 1 (positionnement sticky mobile déjà
  en place depuis la fusion d'aujourd'hui).
- `Components/Praticien/ConfirmModal.jsx`, `AddPatientModal.jsx`,
  `AddVitaliteItemModal.jsx` : traduction des chaînes.
- `Components/Praticien/ObservanceBar.jsx` : barre de progression
  horizontale — vérifier explicitement pendant l'implémentation si le sens
  de remplissage doit être traité en logique (`start`/`end`) plutôt que
  physique, plutôt que de supposer que non.

### 4. Traductions

Ajouts à `lang/ar.json` uniquement (`lang/fr.json` reste `{}`, la clé
française fait office de valeur par défaut — même convention que le
sous-projet 1). Nouveau vocabulaire : navigation praticien, filtres et
paliers d'observance, libellés de formulaire (protocoles, templates,
patient), légendes/tooltips de graphiques, états vides, libellés de
modals. Même réserve déjà documentée au sous-projet 1 : traductions
rédigées par un assistant IA non-locuteur natif, à faire relire avant tout
usage réel.

## Tests

Même approche que le sous-projet 1 (`tests/Feature/LocaleTest.php`) :
extension de la suite (nouveau fichier `PraticienLocaleTest.php` ou ajout
à `LocaleTest.php`) avec :
- props Inertia correctes (`locale`, `translations`) sur les pages
  praticien quand `locale=ar` sur le compte praticien ;
- non-régression : les pages praticien restent en français/LTR par défaut
  (`locale=fr`), y compris la page fiche patient qui réutilise
  `WeekPlanBuilder`.

Pas de test automatisé du rendu visuel/RTL (identique au sous-projet 1) —
vérification manuelle en navigateur (LTR et FR, puis RTL et AR) sur chaque
écran du périmètre, plus `npm run build` (0 erreur) et `php artisan test`
(suite complète) comme portes de sortie finales.

## Fichiers concernés

Backend :
- Les 6 contrôleurs `Praticien/*` listés en section "Architecture / 1"
- `app/Services/WeekPlanBuilder.php` (vérification)
- `lang/ar.json`

Frontend :
- `resources/js/Components/Praticien/*` (11 fichiers)
- `resources/js/Pages/Praticien/*` (5 fichiers, dont `Patients/Show.jsx`
  et `Protocoles/Index.jsx` découpés en plusieurs tâches)
- `resources/js/Layouts/PraticienLayout.jsx`

## Hors scope (explicitement, pour ce sous-projet)

- `Pages/Public/Accueil.jsx`, `Components/LoginModal.jsx`,
  `Components/ParcoursModal.jsx` (si utilisés uniquement par la page
  publique) — sous-projet 3.
- `Components/PlanInterestModal.jsx` — composant arrivé via la fusion avec
  `origin/master` (fonctionnalité indépendante, sans rapport avec i18n/RTL),
  hors périmètre des 3 sous-projets définis au sous-projet 1. Traité
  séparément si besoin.
- Aucune nouvelle dépendance npm/composer (identique au sous-projet 1).
- Aucun garde-fou de rôle ajouté sur `POST /langue` (voir section
  "Architecture / 1" — devenu sans objet, la page praticien étant
  désormais traduite intégralement).
