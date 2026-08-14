# Site public — i18n/RTL + simplification du contenu — design

Date : 2026-08-14
Sous-projet 3 sur 3 (voir `docs/superpowers/specs/2026-08-12-patient-i18n-rtl-redesign-design.md`,
section "Décomposition en sous-projets").

## Contexte

Sous-projets 1 et 2 ont traité l'espace patient et l'espace praticien. Ce
dernier sous-projet traite la page vitrine publique (`Public/Accueil.jsx`,
~968 lignes) et ses 3 modals (`LoginModal.jsx`, `ParcoursModal.jsx`,
`PlanInterestModal.jsx`) — la porte d'entrée du site pour un visiteur qui ne
connaît pas encore FitHealth.

Deux différences structurelles par rapport aux sous-projets précédents :

1. **La page utilise des styles inline (`style={{...}}`)**, pas des classes
   Tailwind — c'est une page marketing autonome, pas un écran de
   l'application interne. Le mécanisme RTL des sous-projets 1/2 (classes
   Tailwind logiques `ps-`/`pe-`/`start-`/`end-`) ne s'applique donc pas
   telle quelle ici.
2. **Le contenu est du texte marketing long (paragraphes, FAQ, fiches
   formules)**, pas des libellés d'interface courts — la traduction est un
   travail éditorial, pas seulement mécanique.

À la relecture finale du sous-projet 2, le plan avait promis un "habillage
visuel Style A" jamais traduit en tâches concrètes. Décision explicite ici :
**pas de refonte visuelle générale** pour ce sous-projet — la page a déjà
sa propre identité visuelle cohérente (palette de marque forest/sage/
cream/sand/terracotta déjà utilisée partout, esthétique marketing
volontairement différente de l'app interne). En revanche, le brainstorming
a fait émerger un besoin réel et plus ciblé : simplifier certains passages
au ton clinique et renforcer l'appel à l'action des formules — voir
"Simplification du contenu" ci-dessous.

## Décisions prises pendant le brainstorming

- **RTL via propriétés CSS logiques dans les styles inline**, pas de
  passage à Tailwind : `left`/`right`/`marginLeft`/`paddingRight`/
  `textAlign: 'left'` deviennent `insetInlineStart`/`insetInlineEnd`/
  `marginInlineStart`/`paddingInlineEnd`/`textAlign: 'start'`, etc. Ces
  propriétés sont nativement supportées par tous les navigateurs modernes
  et se résolvent automatiquement selon l'attribut `dir` du document —
  aucune logique JS conditionnelle nécessaire. Diff minimal, cohérent avec
  le pattern existant de la page (pas de réécriture en classes Tailwind).
- **Traduction complète** de tout le contenu (nav, hero, profils, piliers,
  étapes, praticien, formules, FAQ, pied de page) — même réserve que les
  sous-projets 1 et 2 (traductions derja rédigées par un assistant IA
  non-locuteur natif, à faire relire avant usage réel — cette réserve est
  d'autant plus importante ici que c'est du texte public à fort trafic, pas
  une interface interne).
- **`PlanInterestModal.jsx` inclus dans le périmètre** — traduit et
  mis en miroir RTL comme `LoginModal`/`ParcoursModal`, bien qu'il soit
  arrivé par la fusion du travail d'un collaborateur ("dexieme commit"),
  indépendamment des 3 sous-projets i18n. Rationale : il est rendu depuis
  `Accueil.jsx` et donc atteignable dans n'importe quelle locale/direction
  — le laisser hors périmètre produirait un formulaire entièrement français
  et LTR flottant au milieu d'une page arabe RTL, une incohérence plus
  visible que de laisser un écran entier non traduit.
- **Aucune nouvelle infrastructure** — réutilisation intégrale de
  `App\Enums\Locale`, `SetLocale`, `POST /langue`,
  `HandleInertiaRequests::share()`, `useTranslation()`, `LanguageSwitcher`.
  La route publique (`/`) est accessible sans compte : ce sous-projet
  exerce donc principalement le chemin invité (session) déjà posé au
  sous-projet 1, pas le chemin compte.
- **`<LanguageSwitcher>`** ajouté à la barre de navigation, à côté du
  bouton "Connexion" (desktop et mobile).

## Simplification du contenu (périmètre restreint, décidé explicitement)

Deux changements de contenu, ciblés et validés un par un pendant le
brainstorming — pas une réécriture générale de la page :

### 1. Section "Le praticien" — ton clinique adouci

Le titre `"Médecin avant tout, coach ensuite"` reste inchangé (déjà simple,
sert d'ancrage de crédibilité). Le paragraphe change :

- Avant : *"Je suis médecin, formé à la naturopathie et au coaching en
  activité physique adaptée. Cette double approche me permet d'allier la
  rigueur médicale à un accompagnement humain, sur la durée — sans
  promesse de résultat chiffré, avec une exigence de sécurité avant tout."*
- Après : *"Je suis médecin, formé aussi à la naturopathie et au coaching
  sportif. Cette double casquette me permet de vous accompagner
  sérieusement, mais simplement — sans jargon, à votre rythme."*

**Explicitement hors périmètre** (proposé pendant le brainstorming, non
retenu) : le contenu de `ParcoursModal.jsx` (timeline de carrière médicale),
le vocabulaire des piliers Mouvement/Vitalité ("métabolisme",
"surentraînement"), et les avertissements médicaux de la FAQ (ne remplace
pas le médecin traitant, non remboursé) — ces derniers ressemblent à des
clauses de responsabilité légitimes pour la page publique d'un médecin et
ne sont pas touchés par ce sous-projet.

### 2. Cartes de formules — CTA et accroches

Les 3 cartes se terminaient toutes par le même bouton passif "En savoir
plus". Nouvelles accroches (`tagline`) et libellés de bouton, un par
formule :

| Formule | Accroche avant | Accroche après | Bouton avant | Bouton après |
|---|---|---|---|---|
| Consultation ponctuelle | "Pour un bilan ciblé ou une question précise." | "Une réponse claire à votre situation, en un seul échange." | "En savoir plus" | "Réserver mon bilan" |
| Suivi 1 mois | "Pour amorcer un changement en profondeur." | "Le déclic pour changer, avec un vrai suivi derrière vous." | "En savoir plus" | "Commencer mon suivi" |
| Suivi 3 mois | "Pour un accompagnement dans la durée." | "Le temps qu'il faut pour que ça tienne, vraiment." | "En savoir plus" | "Choisir cette formule" |

Les listes de fonctionnalités (`features`) de chaque carte restent
inchangées (déjà concrètes, pas "scientifiques"). Le comportement du
bouton ne change pas : il ouvre toujours `PlanInterestModal` avec
`plan.title` — pas de paiement en ligne, donc les nouveaux libellés
("Réserver", "Commencer", "Choisir") restent honnêtes vis-à-vis de ce qui
se passe réellement au clic (ouverture d'un formulaire de contact, pas une
transaction).

**Explicitement hors périmètre** (proposé, non retenu) : témoignages
clients, réduction du nombre de formules, urgence/rareté artificielle
("places limitées").

## Architecture technique

### 1. Backend

Aucun changement de contrôleur nécessaire : la route `/` rend
`Public/Accueil` sans props dynamiques aujourd'hui
(`Route::get('/', fn () => Inertia::render('Public/Accueil'))`). Tout le
contenu de la page est du texte statique dans le composant React — la
traduction est donc entièrement frontend, via `t()`, à l'exception d'aucun
libellé backend à traduire dans ce sous-projet (contrairement aux
sous-projets 1/2 où des contrôleurs construisaient des libellés dynamiques
comme des dates ou des statuts).

### 2. Frontend — traduction

- `resources/js/i18n.js`, `useTranslation()` réutilisés tels quels.
- Convention identique aux sous-projets précédents : la clé de traduction
  **est** la phrase française (déjà simplifiée/révisée ci-dessus pour les
  2 passages concernés). Les tableaux de données du composant
  (`NAV_LINKS`, `PROFILES`, `PILLARS`, `STEPS_RAW`, `PLAN_DEFS`, `FAQ_RAW`,
  `HERO_INDICATORS`, `SPACE_BENEFITS`) deviennent des fonctions `xxx(t)`
  retournant les données avec libellés déjà traduits, suivant exactement
  le pattern déjà utilisé au sous-projet 2 (`filters(t)`, `tierLabels(t)`,
  `tabs(t)`, `scoreLabels(t)`, `days(t)`) — pas un nouveau pattern à
  inventer.
- Nouvelles clés dans `lang/ar.json` uniquement (`lang/fr.json` reste `{}`).
  Volume important (page longue) — écrites par écran/section dans le plan
  d'implémentation, pas listées exhaustivement ici (suit la même approche
  que le sous-projet 2 : un dictionnaire complet en amont des tâches
  d'écran, construit à partir du texte réel de chaque section).

### 3. Frontend — RTL (propriétés CSS logiques)

Table de correspondance appliquée partout dans `Accueil.jsx`,
`LoginModal.jsx`, `ParcoursModal.jsx`, `PlanInterestModal.jsx` :

| Physique (existant) | Logique (cible) |
|---|---|
| `left` / `right` (positionnement absolu) | `insetInlineStart` / `insetInlineEnd` |
| `marginLeft` / `marginRight` | `marginInlineStart` / `marginInlineEnd` |
| `paddingLeft` / `paddingRight` | `paddingInlineStart` / `paddingInlineEnd` |
| `borderLeft` / `borderRight` | `borderInlineStart` / `borderInlineEnd` |
| `textAlign: 'left'` / `'right'` | `textAlign: 'start'` / `'end'` |
| `borderTopLeftRadius`, etc. (rares) | laissé tel quel — arrondi non directionnel dans cette page (pas de cas identifié à ce stade ; à vérifier au fil de l'implémentation) |

Le `flexDirection`/`gridTemplateColumns` de la page ne changent pas : les
sections en grille à 2 colonnes (hero, praticien) restent visuellement
symétriques dans les deux sens de lecture sans intervention — seul l'ordre
de lecture du texte à l'intérieur change avec `dir`, ce que les navigateurs
gèrent nativement pour du texte en flux normal.

### 4. Document HTML, police, sélecteur de langue

Déjà globaux depuis le sous-projet 1 (`app.blade.php`, `app.jsx`,
police Cairo sous `[dir='rtl']`) — rien à refaire. Ajout de
`<LanguageSwitcher tone="light">` (même variante que la page de connexion
patient) dans la nav de `Accueil.jsx`, desktop et mobile.

### 5. Fichiers concernés

Frontend :
- `resources/js/Pages/Public/Accueil.jsx`
- `resources/js/Components/LoginModal.jsx`
- `resources/js/Components/ParcoursModal.jsx`
- `resources/js/Components/PlanInterestModal.jsx`

Backend :
- Aucun changement de contrôleur (voir "Architecture / 1").
- `lang/ar.json` (nouvelles entrées).

## Tests

- Aucun contrôleur ne change ⇒ pas de nouveau test PHPUnit spécifique à ce
  sous-projet portant sur des données dynamiques (rien de comparable aux
  tests de libellés de jour/pilier des sous-projets 1/2). Un seul test
  backend ajouté : `tests/Feature/LocaleTest.php` (ou nouveau fichier)
  vérifie que `GET /` avec `session(['locale' => 'ar'])` renvoie bien
  `dir="rtl"`/`lang="ar"` — ce test existe déjà en réalité depuis le
  sous-projet 1 (`test_le_document_html_est_en_rtl_en_derja`, sur `GET /`)
  : vérifier qu'il passe toujours, ne pas le dupliquer.
- Pas de test automatisé du contenu traduit ou du rendu RTL visuel — même
  approche que les sous-projets précédents : `npm run build` (0 erreur) +
  vérification manuelle au navigateur (LTR et RTL) sur la page complète et
  les 3 modals.

## Hors scope (explicitement, pour ce sous-projet)

- Refonte visuelle générale de la page (voir "Contexte" — décision
  explicite de ne pas la faire).
- `ParcoursModal.jsx` : contenu (timeline de carrière) inchangé — traduit
  et RTL-mirroré, mais pas réécrit.
- FAQ : avertissements médicaux/légaux inchangés — traduits, pas réécrits.
- Vocabulaire des piliers Mouvement/Vitalité : traduit tel quel, pas
  simplifié davantage que la traduction elle-même ne le fait naturellement.
- Témoignages clients, réduction du nombre de formules, urgence/rareté
  artificielle sur les formules (proposés pendant le brainstorming, non
  retenus).
- Audio/synthèse vocale (déjà hors scope depuis le sous-projet 1).
