# FitHealth — modèle de données

Référence unique du modèle. Toute migration, tout modèle Eloquent et toute
requête doivent s'y conformer. En cas de contradiction avec du code existant,
c'est ce document qui fait foi — signale-le-moi plutôt que de diverger.

---

## Vue d'ensemble

Le produit relie **un praticien** (médecin naturopathe et coach) à **ses
patients** entre les consultations. Le cycle métier tient en cinq temps :

1. Le praticien crée un **protocole** pour un patient, composé de **lignes**
   réparties sur deux piliers : `mouvement` et `nutrition`.
2. Le patient consulte son protocole du jour et **coche** ce qu'il réalise —
   chaque coche produit un **log**.
3. En parallèle, le praticien tient à jour les **consignes de vitalité** du
   patient — des recommandations de vie quotidienne, indépendantes de tout
   protocole (voir `vitalite_items`).
4. Chaque semaine, le patient soumet un **check-in** : quatre scores subjectifs,
   son auto-évaluation d'observance, éventuellement son poids.
5. Les deux échangent par **messages**.

**Pourquoi la vitalité est sortie du protocole.** `mouvement` et `nutrition`
appartiennent à un protocole précis : ils sont versionnés, datés, remplacés
quand le praticien active un nouveau protocole. Les consignes de vitalité
(hygiène de vie, sommeil, gestion du stress...) ne suivent pas ce cycle — elles
sont attachées au **patient** directement, survivent au changement de
protocole, et n'ont pas de notion de jour ou de séries. Les modéliser dans
`protocol_items` aurait forcé une fausse dépendance à un protocole.

Distinction fondamentale à ne jamais confondre :

| Table | Nature | Question à laquelle elle répond |
|---|---|---|
| `protocol_items` | prescription | qu'est-ce qui **devait** être fait ? |
| `protocol_logs` | réalisation | qu'est-ce qui **a** été fait ? |
| `check_ins` | ressenti | comment le patient **se sent** ? |

`protocol_logs` mesure le comportement, `check_ins` mesure l'état. L'écart entre
l'observance calculée et l'observance déclarée est une information clinique — ne
les fusionne jamais.

---

## Conventions générales

- Clés primaires en `id` auto-incrémenté, clés étrangères en `<modele>_id`.
- Toutes les valeurs à choix fermé utilisent des **enums PHP backed** dans
  `app/Enums/`, castées sur le modèle. Jamais de chaîne libre, jamais de
  constante de classe.
- Toute colonne facultative est explicitement `->nullable()`. Le tableau des
  attributs ci-dessous indique « oui » ou « non » pour chaque colonne.
- `casts()` déclaré sur chaque modèle : dates en `date` ou `datetime`, booléens
  en `boolean`, décimaux en `decimal:2`, JSON en `array`, enums en classe.
- Suppression : `onDelete('cascade')` partout où l'enfant n'a aucun sens sans
  son parent (items, logs, check-ins, messages). Aucun soft delete dans ce
  périmètre.
- Timestamps `created_at` / `updated_at` sur toutes les tables.

---

## `users` — praticien et patients

Une seule table pour les deux rôles. Ce n'est pas un raccourci : `Auth::attempt()`
interroge une table unique, et la messagerie relie deux `users` sans se soucier
de leur rôle.

| Colonne | Type | Null | Rôle |
|---|---|---|---|
| `name` | string | non | nom affiché |
| `email` | string unique | non | identifiant de connexion |
| `password` | string | non | hashé |
| `role` | enum `praticien`, `patient` | non | décide de la redirection et du middleware |
| `phone` | string | oui | contact |
| `practitioner_id` | FK → `users.id` | oui | qui suit ce patient — **patients uniquement** |
| `birth_date` | date | oui | patients uniquement, sert à calculer l'âge |
| `sex` | enum `femme`, `homme` | oui | patients uniquement, entre dans les besoins nutritionnels |
| `goal` | string | oui | objectif en une phrase, affiché en tête de fiche |
| `height_cm` | smallint non signé | oui | **stable** chez l'adulte, ne varie pas |
| `initial_weight` | decimal(5,2) | oui | poids de départ, sert de **référence** aux variations |
| `medical_background` | text | oui | antécédents, allergies, intolérances |
| `current_treatments` | text | oui | traitements en cours |

Les deux derniers champs comptent : un naturopathe doit savoir ce que prend déjà
le patient avant de conseiller quoi que ce soit.

**Pourquoi `height_cm` ici et le poids courant ailleurs.** La taille est stable,
elle appartient à l'identité. Le poids évolue, et c'est justement son évolution
qui intéresse le praticien : une colonne `weight` écrasée à chaque mise à jour
détruirait l'historique. Le poids courant vit donc dans `check_ins`.

### Relations

```php
// Le praticien qui suit ce patient
public function practitioner(): BelongsTo {
    return $this->belongsTo(User::class, 'practitioner_id');
}

// Les patients suivis par ce praticien
public function patients(): HasMany {
    return $this->hasMany(User::class, 'practitioner_id');
}

public function protocols(): HasMany;        // patient → ses protocoles
public function checkIns(): HasMany;         // patient → ses check-ins
public function vitaliteItems(): HasMany;    // patient → ses consignes de vitalité
public function sentMessages(): HasMany;     // sender_id
public function receivedMessages(): HasMany; // recipient_id
```

### Scopes

Comme les deux rôles cohabitent, `where('role', ...)` reviendrait partout. Deux
scopes suffisent à l'éviter :

```php
public function scopeRolePatient(Builder $query): Builder
{
    return $query->where('role', Role::Patient);
}

public function scopeRolePraticien(Builder $query): Builder
{
    return $query->where('role', Role::Praticien);
}
```

Appel : `User::rolePatient()->count()`, `$query->rolePraticien()`.

**Nommage volontairement distinct de la relation `patients()`.** Un scope nommé
`scopePatients` se résoudrait au même nom que la relation `patients(): HasMany`
(un praticien vers ses patients). Cette collision casse l'appel idiomatique
`User::patients()` : PHP trouve la méthode d'instance déclarée et tente de
l'appeler statiquement, ce qui échoue avant même que la magie de scope
d'Eloquent n'intervienne. `rolePatient` / `rolePraticien` évitent le problème à
la source.

Leur intérêt n'est pas cosmétique : une requête où le filtre de rôle a été oublié
fait apparaître le praticien dans sa propre liste de patients. Le scope rend
l'oubli impossible et centralise la définition si un rôle est ajouté plus tard.

### Attributs calculés

Ne stocke **jamais** ces valeurs — elles se désynchroniseraient.

```php
// Poids courant : dernier check-in pesé, sinon le poids initial
public function getCurrentWeightAttribute(): ?float;

// Variation depuis le départ
public function getWeightChangeAttribute(): ?float;   // current - initial

// IMC, calculé depuis height_cm et le poids courant
public function getBmiAttribute(): ?float;

// Âge, depuis birth_date
public function getAgeAttribute(): ?int;
```

### Règles

- `practitioner_id`, `birth_date`, `height_cm`, `initial_weight`, `goal` sont
  nuls pour un praticien. Aucune validation ne doit les exiger sur ce rôle.
- Un patient a toujours un `practitioner_id`. C'est le pivot de toute
  l'autorisation.

---

## `protocols` — l'assignation

L'enveloppe : un praticien assigne un accompagnement à un patient à partir d'une
date. Ne contient aucun contenu, seulement le cadre.

| Colonne | Type | Null | Rôle |
|---|---|---|---|
| `patient_id` | FK → `users.id` | non | destinataire |
| `practitioner_id` | FK → `users.id` | non | prescripteur |
| `title` | string | non | ex. « Reprise en douceur — phase 1 » |
| `starts_on` | date | non | point de départ, permet de calculer la semaine en cours |
| `status` | enum `brouillon`, `actif`, `archive` | non | cycle de vie |

**`practitioner_id` est volontairement redondant** — il serait retrouvable via
`patient.practitioner_id`. On le duplique pour éviter une jointure sur chaque
requête et pour conserver la trace du prescripteur si le patient change un jour
de praticien.

### Règles

- Un patient peut avoir plusieurs protocoles dans le temps, mais **un seul en
  statut `actif`**. Activer un protocole archive le précédent.
- `brouillon` est invisible du patient. Seul un protocole `actif` s'affiche dans
  son espace.
- `starts_on` sert au calcul « semaine N » : `starts_on->diffInWeeks(today) + 1`.

---

## `protocol_items` — le contenu prescrit

Les lignes du protocole, réparties sur les deux piliers.

| Colonne | Type | Null | Rôle |
|---|---|---|---|
| `protocol_id` | FK | non | parent |
| `pillar` | enum `mouvement`, `nutrition` | non | pilote l'affichage en deux sections, côte à côte |
| `day_of_week` | tinyint 1-7 | **oui** | jour concerné ; `null` = consigne permanente |
| `title` | string | non | ex. « Marche rapide 30 min », « Assiette anti-inflammatoire au déjeuner » |
| `sets` | smallint | oui | séries — mouvement uniquement |
| `reps` | string | oui | répétitions — **chaîne**, pas entier |
| `notes` | text | oui | consigne d'exécution, précisions |
| `position` | smallint | non | ordre d'affichage dans la journée |

Trois points à ne pas manquer :

- **`day_of_week` nullable est intentionnel.** Une consigne nutrition du type
  « préparer les repas de la semaine » peut n'avoir aucun jour précis : elle
  vaut tous les jours. `null` signifie « permanent », et l'affichage doit la
  faire apparaître chaque jour.
- **`reps` est une chaîne.** Un praticien écrit « 12 », mais aussi « 30 s »,
  « 8-10 » ou « jusqu'à fatigue ». Un entier casserait ces cas.
- **`position` est obligatoire.** Sans elle, l'ordre dépend de l'insertion, ce
  que SQL ne garantit pas.

`sets` et `reps` sont systématiquement nuls sur les items `nutrition` — ils
n'ont pas de sens. L'interface ne doit pas les afficher pour ce pilier.

**Ne rattache jamais une consigne de vitalité ici**, même si elle ressemble à
une consigne quotidienne de nutrition. La distinction est structurelle : si
c'est daté ou lié au protocole courant → `protocol_items` (pillar
`nutrition`). Si c'est une habitude de vie permanente du patient,
indépendante du protocole → `vitalite_items`.

---

## `protocol_logs` — la réalisation

Ce que le patient a effectivement fait. Une ligne par item et par jour.

| Colonne | Type | Null | Rôle |
|---|---|---|---|
| `protocol_item_id` | FK | non | item concerné |
| `patient_id` | FK → `users.id` | non | dénormalisé, voir plus bas |
| `logged_on` | date | non | jour de réalisation |
| `completed` | boolean | non | coché ou non |
| `actual_reps` | smallint | oui | ce qui a réellement été fait |
| `actual_weight` | decimal(5,2) | oui | charge réellement utilisée |

**Contrainte d'unicité obligatoire sur `(protocol_item_id, logged_on)`.** Un
même item revient chaque semaine et produit un log par occurrence ; sans cette
contrainte, un double clic crée deux lignes et fausse le taux d'observance.
L'écriture se fait donc **toujours** en `updateOrCreate`, jamais en `create`.

**`patient_id` est dénormalisé** — il serait retrouvable via
`item → protocol → patient`. Le dashboard calcule l'observance de chaque patient
à chaque chargement : cette colonne économise deux jointures sur la requête la
plus fréquente de l'application.

`actual_reps` et `actual_weight` restent nuls quand le patient se contente de
cocher sans saisir de valeurs. C'est le cas majoritaire, ne les rends pas
obligatoires.

### Calcul de l'observance

C'est cette table qui alimente la barre sauge du dashboard :

```
observance 7 jours = logs completed sur la période ÷ items attendus sur la période
```

Les items attendus se comptent depuis `protocol_items` : les items datés selon
leur `day_of_week`, les items permanents (`day_of_week` null) une fois par jour.

---

## `vitalite_items` — les consignes de vitalité

Les recommandations de vie quotidienne du patient, indépendantes de tout
protocole.

| Colonne | Type | Null | Rôle |
|---|---|---|---|
| `patient_id` | FK → `users.id` | non | à qui s'applique la consigne |
| `text` | string | non | la consigne elle-même, ex. « Se coucher avant 23h » |

**Pas de `protocol_id`, pas de `day_of_week`, pas de `position`.** Ces
consignes ne sont pas versionnées avec un protocole et n'ont pas de notion de
jour — elles sont permanentes par nature, tant que le praticien ne les retire
pas. Voir la section Vue d'ensemble pour la justification de cette séparation
d'avec `protocol_items`.

`onDelete('cascade')` sur `patient_id` : ces consignes n'ont aucun sens sans
le patient auquel elles appartiennent.

---

## `check_ins` — le ressenti et les mesures

Le pendant subjectif des logs, soumis chaque semaine par le patient.

| Colonne | Type | Null | Rôle |
|---|---|---|---|
| `patient_id` | FK → `users.id` | non | auteur |
| `submitted_at` | datetime | non | horodatage précis |
| `energy` | tinyint 1-10 | non | score |
| `sleep` | tinyint 1-10 | non | score |
| `digestion` | tinyint 1-10 | non | score |
| `mood` | tinyint 1-10 | non | score |
| `adherence` | enum `totalement`, `partiellement`, `peu` | non | auto-évaluation |
| `weight` | decimal(5,2) | **oui** | pesée du jour |
| `waist_cm` | smallint | **oui** | tour de taille |
| `note` | text | oui | message libre au praticien |

Les quatre scores sont **les mêmes axes que le bilan de vitalité du site
public** : le visiteur passe le quiz, devient patient, et retrouve les mêmes
indicateurs. Cette continuité est un argument commercial, ne la casse pas en
renommant les champs.

**`weight` et `waist_cm` sont facultatifs, et doivent le rester.** Imposer une
pesée hebdomadaire à quelqu'un qui consulte pour de la fatigue chronique serait
contre-productif. Le tour de taille est souvent plus parlant que le poids pour
un praticien orienté santé métabolique : il continue d'évoluer quand la balance
stagne.

`submitted_at` est un **datetime**, pas une date : c'est lui qui alimente
l'affichage « il y a 3 jours » et la détection du retard.

### Règle d'alerte

Un patient est en **check-in en retard** si son dernier `submitted_at` remonte à
plus de 10 jours, ou s'il n'en a aucun alors que son protocole est actif depuis
plus de 10 jours. C'est cet état qui déclenche la pastille terracotta du
dashboard.

---

## `messages` — le fil de discussion

Volontairement plat : **pas de table `conversations`**. Dans ce produit une
conversation n'existe qu'entre un praticien et son patient, la paire
`sender_id` / `recipient_id` suffit à la reconstituer.

| Colonne | Type | Null | Rôle |
|---|---|---|---|
| `sender_id` | FK → `users.id` | non | expéditeur |
| `recipient_id` | FK → `users.id` | non | destinataire |
| `body` | text | non | contenu |
| `read_at` | datetime | **oui** | `null` = non lu, date = lu à ce moment |

`read_at` porte deux informations à lui seul — n'ajoute pas de booléen `is_read`
à côté.

Une table `conversations` ne deviendrait nécessaire qu'avec des groupes ou des
pièces jointes, tous deux hors périmètre.

---

## `protocol_templates` — les modèles

Les protocoles pré-faits proposés dans le constructeur.

| Colonne | Type | Null | Rôle |
|---|---|---|---|
| `title` | string | non | nom du modèle |
| `description` | text | oui | à qui il s'adresse |
| `payload` | json | non | items pré-remplis |

**`payload` est en JSON, pas en table relationnelle.** Un modèle n'est pas un
protocole : c'est une recette à copier. Quand le praticien l'applique, on lit le
JSON et on crée de vrais `protocol_items` rattachés au protocole du patient.
Modéliser les modèles en relationnel dupliquerait toute la structure de
`protocol_items` sans bénéfice.

Structure attendue du payload :

```json
{
  "items": [
    { "pillar": "mouvement", "day_of_week": 1, "title": "…", "sets": 3, "reps": "12", "notes": "…", "position": 1 },
    { "pillar": "nutrition", "day_of_week": null, "title": "…", "notes": "…", "position": 1 }
  ]
}
```

Un template ne contient que des items `mouvement`/`nutrition` — jamais de
consignes de vitalité, puisque celles-ci ne sont pas liées à un protocole (voir
`vitalite_items`).

---

## Index

Chacun correspond à une requête réelle de l'interface. Ils sont obligatoires,
même s'ils ne se voient pas sur 6 patients de démo.

| Table | Index | Requête servie |
|---|---|---|
| `protocol_logs` | `(patient_id, logged_on)` | barre d'observance, calculée pour **chaque** patient du dashboard |
| `check_ins` | `(patient_id, submitted_at)` | dernier check-in et détection du retard |
| `messages` | `(sender_id, recipient_id)` | chargement d'un fil |
| `protocol_items` | `(protocol_id, day_of_week)` | affichage du jour côté patient |
| `protocols` | `(patient_id, status)` | récupération du protocole actif |

Sans le premier, le dashboard d'un cabinet à 80 patients balaye toute la table à
chaque chargement.

---

## Isolation des données

C'est une application de santé. La règle prime sur toute autre considération.

- Un praticien n'accède **qu'à ses propres patients** et à tout ce qui en
  dépend : leurs protocoles, logs, check-ins, consignes de vitalité, messages.
- Un patient n'accède **qu'à ses propres données** et à sa conversation avec
  son praticien.
- Aucune requête ne doit pouvoir traverser cette frontière, y compris via un
  identifiant manipulé dans l'URL.

L'implémentation passe par des Policies Laravel, pas par des `where` dispersés
dans les contrôleurs. Écris un test qui vérifie qu'un praticien A reçoit bien un
403 en demandant un patient du praticien B.

---

## À ne jamais faire

- Stocker l'IMC, l'âge, le poids courant ou la variation de poids : ce sont des
  valeurs dérivées, calculées à l'affichage.
- Écraser une colonne `weight` sur `users` : l'historique est le produit.
- Créer un log en `create` au lieu de `updateOrCreate`.
- Fusionner `protocol_items` et `protocol_logs`, ou `protocol_logs` et
  `check_ins`.
- Rendre `day_of_week` obligatoire : les consignes permanentes deviendraient
  impossibles.
- Typer `reps` en entier.
- Ajouter des tables hors de ce document sans validation préalable.
